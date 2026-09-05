const { Router } = require("express");
const { requireAuth, requireRoles } = require("../middleware/auth");
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

// ADMIN + ACCOUNTANT can do everything with orders
const accountingAccess = requireRoles("ADMIN", "ACCOUNTANT");
// All authenticated roles (ADMIN, ACCOUNTANT, USER) can view orders and pay
// but the controller will scope results based on role
const allRoles = requireRoles("ADMIN", "ACCOUNTANT", "USER");

router.get("/next-sequence", accountingAccess, getNextSequence);
router.post("/check-budget", accountingAccess, checkBudget);

// Create / confirm / bill → ADMIN + ACCOUNTANT only
router.post("/", accountingAccess, createOrder);
router.post("/:id/confirm", accountingAccess, confirmOrder);
router.post("/:id/create-bill", accountingAccess, createBillFromPO);

// Pay → all roles (USER can pay their own invoice)
router.post("/:id/pay", allRoles, recordPayment);

// List → all roles (controller scopes for USER)
router.get("/", allRoles, listOrders);

// Get single order → all roles (controller scopes for USER)
router.get("/:id", allRoles, getOrderById);

module.exports = router;
