const ReportService = require("../services/report.service");

exports.getTrialBalance = async (req, res, next) => {
  try {
    const { asOfDate } = req.query;
    const report = await ReportService.getTrialBalance(req.user.companyId, asOfDate);
    res.json(report);
  } catch (error) {
    next(error);
  }
};

exports.getProfitAndLoss = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const report = await ReportService.getProfitAndLoss(req.user.companyId, startDate, endDate);
    res.json(report);
  } catch (error) {
    next(error);
  }
};

exports.getBalanceSheet = async (req, res, next) => {
  try {
    const { asOfDate } = req.query;
    const report = await ReportService.getBalanceSheet(req.user.companyId, asOfDate);
    res.json(report);
  } catch (error) {
    next(error);
  }
};
