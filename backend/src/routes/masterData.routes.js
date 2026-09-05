const { Router } = require("express");
const { requireAuth } = require("../middleware/auth");
const { contact, product, account, journal, analyticAccount } = require("../controllers/masterData.controller");

const router = Router();
router.use(requireAuth);

router.get("/contacts", contact.list);
router.post("/contacts", contact.create);
router.put("/contacts/:id", contact.update);
router.delete("/contacts/:id", contact.remove);

router.get("/products", product.list);
router.post("/products", product.create);
router.put("/products/:id", product.update);
router.delete("/products/:id", product.remove);

router.get("/accounts", account.list);
router.post("/accounts", account.create);
router.put("/accounts/:id", account.update);
router.delete("/accounts/:id", account.remove);

router.get("/journals", journal.list);
router.post("/journals", journal.create);
router.put("/journals/:id", journal.update);
router.delete("/journals/:id", journal.remove);

router.get("/analytic-accounts", analyticAccount.list);
router.post("/analytic-accounts", analyticAccount.create);
router.put("/analytic-accounts/:id", analyticAccount.update);
router.delete("/analytic-accounts/:id", analyticAccount.remove);

module.exports = router;
