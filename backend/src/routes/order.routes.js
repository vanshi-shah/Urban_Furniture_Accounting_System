const { Router } = require("express");
const { requireAuth } = require("../middleware/auth");
const { 
  createOrder, 
  confirmOrder, 
  listOrders, 
  getNextSequence, 
  createBillFromPO, 
  recordPayment, 
  checkBudget,
  getOrderById 
} = require("../controllers/order.controller");

const router = Router();
router.use(requireAuth);

router.get("/next-sequence", getNextSequence);
router.post("/check-budget", checkBudget);
router.post("/", createOrder);
router.get("/:id", getOrderById);
router.post("/:id/confirm", confirmOrder);
router.post("/:id/create-bill", createBillFromPO);
router.post("/:id/pay", recordPayment);
router.get("/", listOrders);

module.exports = router;
