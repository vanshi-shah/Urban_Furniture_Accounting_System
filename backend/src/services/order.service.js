const { prisma } = require("../lib/prisma");
const AccountingService = require("./accounting.service");

class OrderService {
  static async getNextSequence(companyId, type) {
    const currentYear = new Date().getFullYear();
    if (type === "PURCHASE_ORDER") {
      const lastPO = await prisma.order.findFirst({
        where: { companyId, type: "PURCHASE_ORDER" },
        orderBy: { createdAt: "desc" }
      });
      if (!lastPO || !lastPO.orderNumber) return "PO0001";
      const match = lastPO.orderNumber.match(/^PO(\d+)$/i);
      if (match) {
        const nextNum = parseInt(match[1], 10) + 1;
        return `PO${String(nextNum).padStart(4, "0")}`;
      }
      return `PO0001`;
    } else if (type === "VENDOR_BILL") {
      const lastBill = await prisma.order.findFirst({
        where: { companyId, type: "VENDOR_BILL" },
        orderBy: { createdAt: "desc" }
      });
      if (!lastBill || !lastBill.orderNumber) return `BILL/${currentYear}/0001`;
      const match = lastBill.orderNumber.match(/BILL\/\d+\/(\d+)/i);
      if (match) {
        const nextNum = parseInt(match[1], 10) + 1;
        return `BILL/${currentYear}/${String(nextNum).padStart(4, "0")}`;
      }
      return `BILL/${currentYear}/0001`;
    } else {
      const count = await prisma.order.count({ where: { companyId, type } });
      return `ORD/${currentYear}/${String(count + 1).padStart(4, "0")}`;
    }
  }

  static async checkBudgetExceeded(companyId, lines) {
    if (!lines || lines.length === 0) return { exceedsBudget: false, message: "" };

    for (const line of lines) {
      if (line.analyticAccountId) {
        const analytic = await prisma.analyticAccount.findUnique({
          where: { id: line.analyticAccountId }
        });
        if (analytic && analytic.budgetLimit && analytic.budgetLimit > 0) {
          // Check actual posted lines for this analytic account
          const actuals = await prisma.journalEntryLine.aggregate({
            where: {
              analyticAccountId: line.analyticAccountId,
              companyId,
              journalEntry: { status: "POSTED" }
            },
            _sum: { debit: true }
          });
          const currentSpent = actuals._sum.debit || 0;
          const lineTotal = (line.quantity || 1) * (line.unitPrice || 0);
          if (currentSpent + lineTotal > analytic.budgetLimit) {
            return {
              exceedsBudget: true,
              analyticName: analytic.name,
              budgetLimit: analytic.budgetLimit,
              currentSpent,
              enteredAmount: lineTotal,
              message: "The entered amount is higher than the remaining budget amount for this budget line. Consider adjusting the value or revise the budget."
            };
          }
        }
      }
    }
    return { exceedsBudget: false, message: "" };
  }

  static async createOrder(companyId, data) {
    const { 
      orderNumber, 
      reference,
      date, 
      dueDate, 
      type = "PURCHASE_ORDER", 
      contactId, 
      lines,
      sourceOrderId 
    } = data;
    
    if (!lines || lines.length === 0) throw new Error("Order must have at least one line item");

    const totalAmount = lines.reduce((acc, line) => acc + (Number(line.quantity) * Number(line.unitPrice)), 0);
    const finalOrderNumber = orderNumber || (await this.getNextSequence(companyId, type));

    const budgetWarning = await this.checkBudgetExceeded(companyId, lines);

    const order = await prisma.order.create({
      data: {
        companyId,
        orderNumber: finalOrderNumber,
        reference: reference || null,
        date: date ? new Date(date) : new Date(),
        dueDate: dueDate ? new Date(dueDate) : null,
        type,
        contactId,
        status: "DRAFT",
        totalAmount,
        paidCash: 0,
        paidBank: 0,
        amountDue: totalAmount,
        sourceOrderId: sourceOrderId || null,
        lines: {
          create: lines.map(line => ({
            companyId,
            productId: line.productId || null,
            description: line.description || "",
            quantity: Number(line.quantity) || 1,
            unitPrice: Number(line.unitPrice) || 0,
            subtotal: (Number(line.quantity) || 1) * (Number(line.unitPrice) || 0),
            accountId: line.accountId || null,
            analyticAccountId: line.analyticAccountId || null
          }))
        }
      },
      include: { 
        lines: { 
          include: { 
            product: true, 
            account: true, 
            analyticAccount: true 
          } 
        },
        contact: true,
        sourceOrder: true
      }
    });

    return { ...order, budgetWarning };
  }

  static async createBillFromPO(companyId, poId) {
    const po = await prisma.order.findUnique({
      where: { id: poId },
      include: { lines: { include: { product: true, analyticAccount: true } }, contact: true }
    });

    if (!po) throw new Error("Purchase Order not found");
    if (po.companyId !== companyId) throw new Error("Unauthorized");

    const billNumber = await this.getNextSequence(companyId, "VENDOR_BILL");
    
    // Default Purchase Account (5000 - Cost of Goods Sold / Purchase)
    const purchaseAccount = await prisma.account.findFirst({
      where: { companyId, code: "5000" }
    }) || await prisma.account.findFirst({
      where: { companyId, type: "EXPENSE" }
    });

    const lines = po.lines.map(line => ({
      productId: line.productId,
      description: line.description || `From PO ${po.orderNumber}`,
      quantity: line.quantity,
      unitPrice: line.unitPrice,
      accountId: purchaseAccount ? purchaseAccount.id : null,
      analyticAccountId: line.analyticAccountId
    }));

    return await this.createOrder(companyId, {
      type: "VENDOR_BILL",
      orderNumber: billNumber,
      reference: `REF-${po.orderNumber}`,
      date: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 days
      contactId: po.contactId,
      sourceOrderId: po.id,
      lines
    });
  }

  static async confirmOrder(companyId, orderId) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { 
        lines: { 
          include: { 
            product: true, 
            account: true, 
            analyticAccount: true 
          } 
        }, 
        contact: true 
      }
    });
    
    if (!order) throw new Error("Order not found");
    if (order.companyId !== companyId) throw new Error("Unauthorized");
    if (order.status !== "DRAFT") throw new Error("Order is not in DRAFT state");

    const budgetWarning = await this.checkBudgetExceeded(companyId, order.lines);

    // If it's a PURCHASE_ORDER, confirming marks it confirmed without generating a ledger entry yet
    if (order.type === "PURCHASE_ORDER") {
      const updatedPO = await prisma.order.update({
        where: { id: orderId },
        data: { status: "CONFIRMED" },
        include: { lines: { include: { product: true, account: true, analyticAccount: true } }, contact: true }
      });
      return { ...updatedPO, budgetWarning };
    }

    // For VENDOR_BILL or CUSTOMER_INVOICE: Generate double-entry Journal Entry
    let debitAccountCode, creditAccountCode, journalCode;
    
    if (order.type === "CUSTOMER_INVOICE") {
      debitAccountCode = "1200"; // Accounts Receivable
      creditAccountCode = "4000"; // Sales Revenue
      journalCode = "SAL"; // Sales Journal
    } else if (order.type === "VENDOR_BILL") {
      debitAccountCode = "5000"; // Cost of Goods Sold / Purchase Expense
      creditAccountCode = "2100"; // Creditor / Accounts Payable
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

    // Prepare line entries
    // For Vendor Bill, debit the purchase account and credit the creditor account
    const firstLine = order.lines[0];
    const analyticAccountId = firstLine ? firstLine.analyticAccountId : null;

    const entryData = {
      date: order.date || new Date(),
      reference: order.orderNumber,
      journalId: journal.id,
      lines: [
        {
          accountId: (firstLine && firstLine.accountId) ? firstLine.accountId : debitAccount.id,
          description: `Vendor Bill ${order.orderNumber} - ${order.contact.name}`,
          debit: order.totalAmount,
          credit: 0,
          contactId: order.contactId,
          analyticAccountId
        },
        {
          accountId: creditAccount.id,
          description: `Creditor a/c - ${order.contact.name}`,
          debit: 0,
          credit: order.totalAmount,
          contactId: order.contactId
        }
      ]
    };
    
    // Create and post balanced Journal Entry
    const draftEntry = await AccountingService.createEntry(companyId, entryData);
    await AccountingService.postEntry(companyId, draftEntry.id);
    
    // Mark order as confirmed and attach the ledger entry
    const confirmedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "CONFIRMED",
        journalEntryId: draftEntry.id
      },
      include: { 
        lines: { include: { product: true, account: true, analyticAccount: true } }, 
        journalEntry: { include: { lines: { include: { account: true, contact: true } } } },
        contact: true,
        sourceOrder: true
      }
    });

    return { ...confirmedOrder, budgetWarning };
  }

  static async recordPayment(companyId, orderId, paymentData) {
    const { amount, method = "CASH", date } = paymentData;
    const paymentAmount = Number(amount);

    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      throw new Error("Payment amount must be greater than zero");
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { contact: true }
    });

    if (!order) throw new Error("Order not found");
    if (order.companyId !== companyId) throw new Error("Unauthorized");

    const currentPaidCash = order.paidCash || 0;
    const currentPaidBank = order.paidBank || 0;

    let newPaidCash = currentPaidCash;
    let newPaidBank = currentPaidBank;

    if (method.toUpperCase() === "CASH") {
      newPaidCash += paymentAmount;
    } else {
      newPaidBank += paymentAmount;
    }

    const totalPaid = newPaidCash + newPaidBank;
    const newAmountDue = Math.max(0, order.totalAmount - totalPaid);

    // Generate Journal Entry for payment:
    // Debit: Accounts Payable / Creditor (2100)
    // Credit: Cash (1000) or Bank (1010)
    const apAccount = await prisma.account.findUnique({ where: { code_companyId: { code: "2100", companyId } } });
    const paymentAccountCode = method.toUpperCase() === "CASH" ? "1000" : "1010";
    const paymentAccount = await prisma.account.findUnique({ where: { code_companyId: { code: paymentAccountCode, companyId } } });
    const journalCode = method.toUpperCase() === "CASH" ? "CSH" : "BNK";
    const journal = await prisma.journal.findUnique({ where: { code_companyId: { code: journalCode, companyId } } });

    let paymentEntry = null;
    if (apAccount && paymentAccount && journal) {
      const entryData = {
        date: date ? new Date(date) : new Date(),
        reference: `PAY-${order.orderNumber}`,
        journalId: journal.id,
        lines: [
          {
            accountId: apAccount.id,
            description: `Payment against ${order.orderNumber} - ${order.contact.name}`,
            debit: paymentAmount,
            credit: 0,
            contactId: order.contactId
          },
          {
            accountId: paymentAccount.id,
            description: `Paid via ${method.toUpperCase()} for ${order.orderNumber}`,
            debit: 0,
            credit: paymentAmount,
            contactId: order.contactId
          }
        ]
      };

      paymentEntry = await AccountingService.createEntry(companyId, entryData);
      await AccountingService.postEntry(companyId, paymentEntry.id);
    }

    // Create payment record
    const paymentCount = await prisma.payment.count({ where: { companyId } });
    const paymentNumber = `PAY/${new Date().getFullYear()}/${String(paymentCount + 1).padStart(4, "0")}`;

    const payment = await prisma.payment.create({
      data: {
        companyId,
        paymentNumber,
        paymentType: "SEND",
        method: method.toUpperCase() === "CASH" ? "CASH" : "BANK",
        status: "POSTED",
        amount: paymentAmount,
        date: date ? new Date(date) : new Date(),
        contactId: order.contactId,
        orderId: order.id,
        journalEntryId: paymentEntry ? paymentEntry.id : null
      }
    });

    // Update order with paid amounts and amountDue
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        paidCash: newPaidCash,
        paidBank: newPaidBank,
        amountDue: newAmountDue
      },
      include: {
        lines: { include: { product: true, account: true, analyticAccount: true } },
        contact: true,
        journalEntry: true,
        sourceOrder: true,
        payments: true
      }
    });

    return { order: updatedOrder, payment };
  }
}

module.exports = OrderService;
