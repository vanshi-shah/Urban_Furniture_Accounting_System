const { Router } = require("express");
const { requireAuth } = require("../middleware/auth");
const dashboardController = require("../controllers/dashboard.controller");

const router = Router();

router.use(requireAuth);

router.get("/stats", dashboardController.getStats);

module.exports = router;
