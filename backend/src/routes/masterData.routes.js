const { Router } = require("express");
const { requireAuth, requireRoles } = require("../middleware/auth");
const { contact, product, account, journal, analyticAccount, productCategory } = require("../controllers/masterData.controller");

const router = Router();
router.use(requireAuth);

// ADMIN + ACCOUNTANT can manage master data (create/read/update/delete)
const accountingAccess = requireRoles("ADMIN", "ACCOUNTANT");

router.get("/contacts", accountingAccess, contact.list);
router.post("/contacts", accountingAccess, contact.create);
router.put("/contacts/:id", accountingAccess, contact.update);
router.delete("/contacts/:id", accountingAccess, contact.remove);

router.get("/products", accountingAccess, product.list);
router.post("/products", accountingAccess, product.create);
router.put("/products/:id", accountingAccess, product.update);
router.delete("/products/:id", accountingAccess, product.remove);

router.get("/accounts", accountingAccess, account.list);
router.post("/accounts", accountingAccess, account.create);
router.put("/accounts/:id", accountingAccess, account.update);
router.delete("/accounts/:id", accountingAccess, account.remove);

router.get("/journals", accountingAccess, journal.list);
router.post("/journals", accountingAccess, journal.create);
router.put("/journals/:id", accountingAccess, journal.update);
router.delete("/journals/:id", accountingAccess, journal.remove);

router.get("/analytic-accounts", accountingAccess, analyticAccount.list);
router.post("/analytic-accounts", accountingAccess, analyticAccount.create);
router.put("/analytic-accounts/:id", accountingAccess, analyticAccount.update);
router.delete("/analytic-accounts/:id", accountingAccess, analyticAccount.remove);

router.get("/product-categories", accountingAccess, productCategory.list);
router.post("/product-categories", accountingAccess, productCategory.create);
router.put("/product-categories/:id", accountingAccess, productCategory.update);
router.delete("/product-categories/:id", accountingAccess, productCategory.remove);

module.exports = router;
