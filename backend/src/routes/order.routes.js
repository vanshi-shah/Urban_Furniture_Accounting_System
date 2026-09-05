const { Router } = require("express");
const { requireAuth } = require("../middleware/auth");
const { createOrder, confirmOrder, listOrders } = require("../controllers/order.controller");

const router = Router();
router.use(requireAuth);

router.post("/", createOrder);
router.post("/:id/confirm", confirmOrder);
router.get("/", listOrders);

module.exports = router;
