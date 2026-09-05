const { prisma } = require("../lib/prisma");

class AccountingService {
  static isBalanced(lines) {
    const totalDebit = lines.reduce((sum, line) => sum + (line.debit || 0), 0);
    const totalCredit = lines.reduce((sum, line) => sum + (line.credit || 0), 0);
    return Math.abs(totalDebit - totalCredit) < 0.001;
  }

  static async createEntry(companyId, entryData) {
    const { date, reference, journalId, lines } = entryData;
    if (!lines || lines.length === 0) throw new Error("A journal entry must have at least one line");

    return await prisma.journalEntry.create({
      data: {
        companyId,
        date: date ? new Date(date) : new Date(),
        reference,
        journalId,
        status: "DRAFT",
        lines: {
          create: lines.map(line => ({
            companyId,
            accountId: line.accountId,
            description: line.description,
            debit: line.debit || 0,
            credit: line.credit || 0,
            contactId: line.contactId,
            analyticAccountId: line.analyticAccountId
          }))
        }
      },
      include: { lines: true }
    });
  }

  static async postEntry(companyId, entryId) {
    const entry = await prisma.journalEntry.findUnique({
      where: { id: entryId },
      include: { lines: true }
    });

    if (!entry) throw new Error("Entry not found");
    if (entry.companyId !== companyId) throw new Error("Unauthorized");
    if (entry.status === "POSTED") throw new Error("Entry is already posted");
    if (!this.isBalanced(entry.lines)) throw new Error("Cannot post entry: Debits and Credits do not balance");

    return prisma.journalEntry.update({
      where: { id: entryId },
      data: { status: "POSTED" },
      include: { lines: true }
    });
  }

  static async getAccountBalance(companyId, accountId) {
    const account = await prisma.account.findUnique({ where: { id: accountId } });
    if (!account || account.companyId !== companyId) throw new Error("Account not found");

    const lines = await prisma.journalEntryLine.findMany({
      where: { accountId, companyId, journalEntry: { status: "POSTED" } }
    });

    const totalDebit = lines.reduce((sum, line) => sum + line.debit, 0);
    const totalCredit = lines.reduce((sum, line) => sum + line.credit, 0);

    let balance = ["ASSET", "EXPENSE"].includes(account.type) 
      ? totalDebit - totalCredit 
      : totalCredit - totalDebit;

    return { accountId, accountName: account.name, type: account.type, totalDebit, totalCredit, balance };
  }
}

module.exports = AccountingService;
