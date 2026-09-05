const { Router } = require("express");
const { requireAuth, requireRoles } = require("../middleware/auth");
const { createEntry, postEntry, getLedger, getAccountBalance } = require("../controllers/accounting.controller");

const router = Router();
router.use(requireAuth);

// Only ADMIN and ACCOUNTANT can create/view journal entries and balances
const accountingAccess = requireRoles("ADMIN", "ACCOUNTANT");

router.post("/entries", accountingAccess, createEntry);
router.post("/entries/:id/post", accountingAccess, postEntry);
router.get("/entries", accountingAccess, getLedger);
router.get("/accounts/:id/balance", accountingAccess, getAccountBalance);

module.exports = router;
