const { prisma } = require("../lib/prisma");
const AccountingService = require("./accounting.service");

class OrderService {
  static async createOrder(companyId, data) {
    const { orderNumber, type, contactId, lines } = data;
    
    if (!lines || lines.length === 0) throw new Error("Order must have lines");

    const totalAmount = lines.reduce((acc, line) => acc + (line.quantity * line.unitPrice), 0);
    
    return await prisma.order.create({
      data: {
        companyId,
        orderNumber,
        type,
        contactId,
        status: "DRAFT",
        totalAmount,
        lines: {
          create: lines.map(line => ({
            companyId,
            productId: line.productId,
            description: line.description,
            quantity: line.quantity,
            unitPrice: line.unitPrice,
            subtotal: line.quantity * line.unitPrice
          }))
        }
      },
      include: { lines: true }
    });
  }
  
  static async confirmOrder(companyId, orderId) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { lines: true, contact: true }
    });
    
    if (!order) throw new Error("Order not found");
    if (order.companyId !== companyId) throw new Error("Unauthorized");
    if (order.status !== "DRAFT") throw new Error("Order is not in DRAFT state");
    
    let debitAccountCode, creditAccountCode, journalCode;
    
    if (order.type === "CUSTOMER_INVOICE") {
      debitAccountCode = "1200"; // Accounts Receivable
      creditAccountCode = "4000"; // Sales Revenue
      journalCode = "SAL"; // Sales Journal
    } else if (order.type === "VENDOR_BILL") {
      debitAccountCode = "5000"; // Cost of Goods Sold / Expense
      creditAccountCode = "2100"; // Accounts Payable
      journalCode = "PUR"; // Purchases Journal
    } else {
      throw new Error("Invalid order type");
    }
    
    const debitAccount = await prisma.account.findUnique({ where: { code_companyId: { code: debitAccountCode, companyId } } });
    const creditAccount = await prisma.account.findUnique({ where: { code_companyId: { code: creditAccountCode, companyId } } });
    const journal = await prisma.journal.findUnique({ where: { code_companyId: { code: journalCode, companyId } } });
    
    if (!debitAccount || !creditAccount || !journal) {
      throw new Error("Cannot confirm order: Missing default accounting settings for AR/AP and Revenue/Expense");
    }
    
    const entryData = {
      date: new Date(),
      reference: order.orderNumber,
      journalId: journal.id,
      lines: [
        {
          accountId: debitAccount.id,
          description: `Order ${order.orderNumber} - ${order.contact.name}`,
          debit: order.totalAmount,
          credit: 0,
          contactId: order.contactId
        },
        {
          accountId: creditAccount.id,
          description: `Order ${order.orderNumber} - Revenue/Expense`,
          debit: 0,
          credit: order.totalAmount,
          contactId: order.contactId
        }
      ]
    };
    
    // Generate Accounting Entry via the Phase 3 Service
    const draftEntry = await AccountingService.createEntry(companyId, entryData);
    await AccountingService.postEntry(companyId, draftEntry.id);
    
    // Mark order as confirmed and attach the ledger entry
    return await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "CONFIRMED",
        journalEntryId: draftEntry.id
      },
      include: { lines: true, journalEntry: true }
    });
  }
}

module.exports = OrderService;
