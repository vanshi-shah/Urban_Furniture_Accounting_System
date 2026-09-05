const { Router } = require("express");
const { requireAuth, requireRoles } = require("../middleware/auth");
const { getTrialBalance, getProfitAndLoss, getBalanceSheet } = require("../controllers/report.controller");

const router = Router();
router.use(requireAuth);

// Reports are restricted to ADMIN and ACCOUNTANT only
const reportAccess = requireRoles("ADMIN", "ACCOUNTANT");

router.get("/trial-balance", reportAccess, getTrialBalance);
router.get("/profit-and-loss", reportAccess, getProfitAndLoss);
router.get("/balance-sheet", reportAccess, getBalanceSheet);

module.exports = router;
