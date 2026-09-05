const { prisma } = require("../lib/prisma");

class ReportService {
  /**
   * Generates a Trial Balance
   * Calculates the total debits and credits for all accounts to ensure they balance.
   */
  static async getTrialBalance(companyId, asOfDate) {
    const whereClause = {
      companyId,
      journalEntry: {
        status: "POSTED" // Only include posted entries
      }
    };
    
    if (asOfDate) {
      whereClause.journalEntry.date = { lte: new Date(asOfDate) };
    }

    const lines = await prisma.journalEntryLine.groupBy({
      by: ['accountId'],
      _sum: {
        debit: true,
        credit: true
      },
      where: whereClause
    });

    const accounts = await prisma.account.findMany({
      where: { companyId },
      select: { id: true, code: true, name: true, type: true }
    });

    const accountMap = accounts.reduce((map, acc) => {
      map[acc.id] = acc;
      return map;
    }, {});

    let totalDebit = 0;
    let totalCredit = 0;

    const balances = lines.map(line => {
      const debit = line._sum.debit || 0;
      const credit = line._sum.credit || 0;
      
      totalDebit += debit;
      totalCredit += credit;

      const account = accountMap[line.accountId];
      let balance = 0;
      
      // Calculate normal balance based on account type
      if (['ASSET', 'EXPENSE'].includes(account.type)) {
        balance = debit - credit;
      } else {
        balance = credit - debit;
      }

      return {
        accountId: account.id,
        code: account.code,
        name: account.name,
        type: account.type,
        debit,
        credit,
        balance
      };
    }).filter(b => b.debit > 0 || b.credit > 0);

    return {
      asOfDate: asOfDate || new Date(),
      totalDebit,
      totalCredit,
      isBalanced: totalDebit === totalCredit,
      balances: balances.sort((a, b) => a.code.localeCompare(b.code))
    };
  }

  /**
   * Generates a Profit & Loss Statement (Income Statement)
   * Displays Revenues vs Expenses over a specific time period.
   */
  static async getProfitAndLoss(companyId, startDate, endDate) {
    const whereClause = {
      companyId,
      journalEntry: {
        status: "POSTED",
        date: {}
      },
      account: {
        type: { in: ['INCOME', 'EXPENSE'] }
      }
    };

    if (startDate) whereClause.journalEntry.date.gte = new Date(startDate);
    if (endDate) whereClause.journalEntry.date.lte = new Date(endDate);
    if (!startDate && !endDate) delete whereClause.journalEntry.date;

    const lines = await prisma.journalEntryLine.groupBy({
      by: ['accountId'],
      _sum: { debit: true, credit: true },
      where: whereClause
    });

    const accounts = await prisma.account.findMany({
      where: { companyId, type: { in: ['INCOME', 'EXPENSE'] } }
    });
    const accountMap = accounts.reduce((m, a) => { m[a.id] = a; return m; }, {});

    let totalIncome = 0;
    let totalExpense = 0;

    const details = lines.map(line => {
      const debit = line._sum.debit || 0;
      const credit = line._sum.credit || 0;
      const account = accountMap[line.accountId];
      
      let balance = 0;
      if (account.type === 'INCOME') {
        balance = credit - debit;
        totalIncome += balance;
      } else if (account.type === 'EXPENSE') {
        balance = debit - credit;
        totalExpense += balance;
      }

      return {
        code: account.code,
        name: account.name,
        type: account.type,
        balance
      };
    });

    const netProfit = totalIncome - totalExpense;

    return {
      startDate,
      endDate: endDate || new Date(),
      totalIncome,
      totalExpense,
      netProfit,
      details: {
        income: details.filter(d => d.type === 'INCOME'),
        expenses: details.filter(d => d.type === 'EXPENSE')
      }
    };
  }

  /**
   * Generates a Balance Sheet
   * Displays Assets, Liabilities, and Equity at a specific point in time.
   */
  static async getBalanceSheet(companyId, asOfDate) {
    // A balance sheet is essentially the trial balance filtered for Asset, Liability, Equity
    // plus the net profit (Retained Earnings) from the P&L.
    
    const trialBalance = await this.getTrialBalance(companyId, asOfDate);
    
    let totalAssets = 0;
    let totalLiabilities = 0;
    let totalEquity = 0;
    let retainedEarnings = 0;

    const assets = [];
    const liabilities = [];
    const equity = [];

    for (const b of trialBalance.balances) {
      if (b.type === 'ASSET') {
        assets.push(b);
        totalAssets += b.balance;
      } else if (b.type === 'LIABILITY') {
        liabilities.push(b);
        totalLiabilities += b.balance;
      } else if (b.type === 'EQUITY') {
        equity.push(b);
        totalEquity += b.balance;
      } else if (['INCOME', 'EXPENSE'].includes(b.type)) {
        // Any income/expense accounts rolling up into retained earnings
        retainedEarnings += b.type === 'INCOME' ? b.balance : -b.balance;
      }
    }

    // Add retained earnings to total equity
    totalEquity += retainedEarnings;
    equity.push({
      code: 'RE',
      name: 'Retained Earnings (Calculated)',
      type: 'EQUITY',
      balance: retainedEarnings
    });

    return {
      asOfDate: trialBalance.asOfDate,
      totalAssets,
      totalLiabilities,
      totalEquity,
      totalLiabilitiesAndEquity: totalLiabilities + totalEquity,
      isBalanced: totalAssets === (totalLiabilities + totalEquity),
      details: {
        assets,
        liabilities,
        equity
      }
    };
  }
}

module.exports = ReportService;
