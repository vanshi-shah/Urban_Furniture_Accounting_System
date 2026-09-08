const { prisma } = require("../lib/prisma");

exports.getStats = async (req, res, next) => {
  try {
    const { companyId } = req.user;

    // 1. Monthly Financials (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    // Get POSTED journal entry lines for INCOME and EXPENSE (specifically COGS if possible)
    const lines = await prisma.journalEntryLine.findMany({
      where: {
        companyId,
        journalEntry: {
          status: "POSTED",
          date: { gte: sixMonthsAgo }
        },
        account: {
          type: { in: ['INCOME', 'EXPENSE'] }
        }
      },
      include: {
        journalEntry: true,
        account: true
      }
    });

    const monthlyData = {};
    lines.forEach(line => {
      const month = line.journalEntry.date.toLocaleString('default', { month: 'short' });
      if (!monthlyData[month]) {
        monthlyData[month] = { month, revenue: 0, cogs: 0, profit: 0 };
      }
      if (line.account.type === 'INCOME') {
        monthlyData[month].revenue += (line.credit - line.debit);
      } else if (line.account.type === 'EXPENSE') {
        // Assume all expenses are COGS for the high-level chart
        monthlyData[month].cogs += (line.debit - line.credit);
      }
    });

    Object.values(monthlyData).forEach(m => {
      m.profit = m.revenue - m.cogs;
    });

    // Sort by actual month order
    const monthsOrder = [];
    for (let i = 0; i < 6; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      monthsOrder.push(d.toLocaleString('default', { month: 'short' }));
    }

    const monthlyFinancials = monthsOrder.map(m => monthlyData[m] || { month: m, revenue: 0, cogs: 0, profit: 0 });

    // 2. Category Distribution
    const orderLines = await prisma.orderLine.findMany({
      where: {
        companyId,
        order: {
          type: 'CUSTOMER_INVOICE',
          status: { in: ['CONFIRMED'] }
        }
      },
      include: {
        product: true
      }
    });

    const catData = {};
    orderLines.forEach(ol => {
      const cat = ol.product?.category || "Uncategorized";
      if (!catData[cat]) catData[cat] = 0;
      catData[cat] += ol.subtotal;
    });

    const categoryDistribution = Object.keys(catData).map(name => ({
      name,
      value: catData[name]
    })).sort((a, b) => b.value - a.value).slice(0, 5);

    // 3. Recent Transactions
    const recentOrders = await prisma.order.findMany({
      where: { companyId },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { contact: true, lines: true }
    });

    const recentTransactions = recentOrders.map(o => ({
      id: o.orderNumber,
      contact: o.contact?.name || "Unknown",
      type: o.type,
      item: o.lines.length > 0 ? o.lines[0].description + (o.lines.length > 1 ? ` (+${o.lines.length - 1} more)` : '') : "No items",
      amount: o.totalAmount,
      status: o.status,
      date: o.date.toLocaleDateString(),
      debit: "-",
      credit: "-"
    }));

    if (recentTransactions.length < 5) {
      const recentJE = await prisma.journalEntry.findMany({
        where: { companyId },
        take: 5 - recentTransactions.length,
        orderBy: { createdAt: 'desc' },
        include: { lines: { include: { account: true } } }
      });

      recentJE.forEach(je => {
        const debitLine = je.lines.find(l => l.debit > 0);
        const creditLine = je.lines.find(l => l.credit > 0);
        recentTransactions.push({
          id: je.reference || je.id.substring(0, 8),
          contact: "General Journal",
          type: "JOURNAL_ENTRY",
          item: je.reference || "Manual Entry",
          amount: debitLine ? debitLine.debit : 0,
          status: je.status,
          date: je.date.toLocaleDateString(),
          debit: debitLine ? `${debitLine.account.code} ${debitLine.account.name}` : "-",
          credit: creditLine ? `${creditLine.account.code} ${creditLine.account.name}` : "-"
        });
      });
    }

    res.json({
      monthlyFinancials,
      categoryDistribution,
      recentTransactions
    });

  } catch (error) {
    next(error);
  }
};
