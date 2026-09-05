const { Router } = require("express");
const { requireAuth } = require("../middleware/auth");
const { getTrialBalance, getProfitAndLoss, getBalanceSheet } = require("../controllers/report.controller");

const router = Router();
router.use(requireAuth);

router.get("/trial-balance", getTrialBalance);
router.get("/profit-and-loss", getProfitAndLoss);
router.get("/balance-sheet", getBalanceSheet);

module.exports = router;
