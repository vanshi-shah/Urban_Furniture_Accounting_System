const { prisma } = require("../lib/prisma");

exports.getBudgets = async (req, res, next) => {
  try {
    const budgets = await prisma.budget.findMany({
      where: { companyId: req.user.companyId },
      include: {
        lines: {
          include: { analyticAccount: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Compute achieved amount dynamically
    const enrichedBudgets = await Promise.all(budgets.map(async (budget) => {
      const enrichedLines = await Promise.all(budget.lines.map(async (line) => {
        const pastLines = await prisma.journalEntryLine.aggregate({
          where: {
            analyticAccountId: line.analyticAccountId,
            journalEntry: {
              status: 'POSTED',
              date: { gte: budget.startDate, lte: budget.endDate }
            }
          },
          _sum: { debit: true }
        });
        const achieved = pastLines._sum.debit || 0;
        return { ...line, achievedAmount: achieved };
      }));
      return { ...budget, lines: enrichedLines };
    }));

    res.json(enrichedBudgets);
  } catch (error) { next(error); }
};

exports.createBudget = async (req, res, next) => {
  try {
    const { name, startDate, endDate, responsible, lines } = req.body;
    
    const budget = await prisma.budget.create({
      data: {
        name,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        responsible,
        companyId: req.user.companyId,
        status: 'DRAFT',
        lines: {
          create: lines.map(line => ({
            analyticAccountId: line.analyticAccountId,
            committedAmount: Number(line.committedAmount) || 0
          }))
        }
      },
      include: { lines: true }
    });
    res.status(201).json(budget);
  } catch (error) { next(error); }
};

exports.confirmBudget = async (req, res, next) => {
  try {
    const budget = await prisma.budget.update({
      where: { id: req.params.id, companyId: req.user.companyId },
      data: { status: 'CONFIRMED' }
    });
    res.json(budget);
  } catch (error) { next(error); }
};

exports.reviseBudget = async (req, res, next) => {
  try {
    const { revisedWith, lines } = req.body;
    
    // Update budget and lines
    const budget = await prisma.budget.update({
      where: { id: req.params.id, companyId: req.user.companyId },
      data: { 
        status: 'REVISED',
        revisedWith,
      }
    });

    // Update lines individually (assuming lines contain id and new amount)
    for (const line of lines) {
      if (line.id) {
        await prisma.budgetLine.update({
          where: { id: line.id },
          data: { committedAmount: Number(line.committedAmount) || 0 }
        });
      }
    }

    res.json(budget);
  } catch (error) { next(error); }
};

exports.cancelBudget = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Fetch budget with lines
    const budget = await prisma.budget.findUnique({
      where: { id, companyId: req.user.companyId },
      include: { lines: true }
    });

    if (!budget) return res.status(404).json({ error: "Budget not found" });

    // Explicitly update committed amount to equal achieved amount
    for (const line of budget.lines) {
      const pastLines = await prisma.journalEntryLine.aggregate({
        where: {
          analyticAccountId: line.analyticAccountId,
          journalEntry: {
            status: 'POSTED',
            date: { gte: budget.startDate, lte: budget.endDate }
          }
        },
        _sum: { debit: true }
      });
      const achieved = pastLines._sum.debit || 0;

      await prisma.budgetLine.update({
        where: { id: line.id },
        data: { committedAmount: achieved }
      });
    }

    const cancelledBudget = await prisma.budget.update({
      where: { id },
      data: { status: 'CANCELLED' }
    });

    res.json(cancelledBudget);
  } catch (error) { next(error); }
};

exports.completeBudget = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const budget = await prisma.budget.findUnique({
      where: { id, companyId: req.user.companyId },
      include: { lines: true }
    });

    if (!budget) return res.status(404).json({ error: "Budget not found" });

    let totalCommitted = 0;
    let totalAchieved = 0;

    for (const line of budget.lines) {
      totalCommitted += line.committedAmount;
      const pastLines = await prisma.journalEntryLine.aggregate({
        where: {
          analyticAccountId: line.analyticAccountId,
          journalEntry: {
            status: 'POSTED',
            date: { gte: budget.startDate, lte: budget.endDate }
          }
        },
        _sum: { debit: true }
      });
      totalAchieved += (pastLines._sum.debit || 0);
    }

    const completedBudget = await prisma.budget.update({
      where: { id },
      data: { status: 'DONE' }
    });

    const isOver = totalAchieved > totalCommitted;
    const diff = Math.abs(totalCommitted - totalAchieved);
    const statusText = totalAchieved === totalCommitted ? "Neutral" : (isOver ? "Loss (Over Budget)" : "Profit (Under Budget)");

    res.json({
      budget: completedBudget,
      summary: {
        totalCommitted,
        totalAchieved,
        statusText,
        difference: diff
      }
    });
  } catch (error) { next(error); }
};
