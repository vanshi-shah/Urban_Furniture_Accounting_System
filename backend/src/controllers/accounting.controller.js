const AccountingService = require("../services/accounting.service");
const { prisma } = require("../lib/prisma");

exports.createEntry = async (req, res, next) => {
  try {
    const entry = await AccountingService.createEntry(req.user.companyId, req.body);
    res.status(201).json(entry);
  } catch (error) { next(error); }
};

exports.postEntry = async (req, res, next) => {
  try {
    const entry = await AccountingService.postEntry(req.user.companyId, req.params.id);
    res.json({ success: true, entry });
  } catch (error) {
    if (error.message.includes("balance")) return res.status(400).json({ error: error.message });
    next(error);
  }
};

exports.getLedger = async (req, res, next) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip  = (page - 1) * limit;
    const where = { companyId: req.user.companyId };
    const [entries, total] = await Promise.all([
      prisma.journalEntry.findMany({
        where,
        skip,
        take: limit,
        include: {
          lines: {
            include: {
              account: true,
              contact: true,
              analyticAccount: true,
            },
          },
          journal: true,
        },
        orderBy: { date: 'desc' }
      }),
      prisma.journalEntry.count({ where })
    ]);
    res.json({ data: entries, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) { next(error); }
};

exports.getAccountBalance = async (req, res, next) => {
  try {
    const balance = await AccountingService.getAccountBalance(req.user.companyId, req.params.id);
    res.json(balance);
  } catch (error) {
    if (error.message.includes("not found")) return res.status(404).json({ error: error.message });
    next(error);
  }
};
