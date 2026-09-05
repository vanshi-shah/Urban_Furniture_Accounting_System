const { Router } = require("express");
const { requireAuth } = require("../middleware/auth");
const { createEntry, postEntry, getLedger, getAccountBalance } = require("../controllers/accounting.controller");

const router = Router();
router.use(requireAuth);

router.post("/entries", createEntry);
router.post("/entries/:id/post", postEntry);
router.get("/entries", getLedger);
router.get("/accounts/:id/balance", getAccountBalance);

module.exports = router;
