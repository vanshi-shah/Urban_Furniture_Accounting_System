const { Router } = require("express");
const { register, login, me, forgotPassword } = require("../controllers/auth.controller");
const { requireAuth } = require("../middleware/auth");

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", requireAuth, me);
router.post("/forgot-password", forgotPassword);

module.exports = router;
