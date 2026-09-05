const { Router } = require("express");
const { requireAuth, requireRoles } = require("../middleware/auth");
const {
  listSubmissions,
  createSubmission,
  updateSubmissionStatus,
} = require("../controllers/submission.controller");

const router = Router();
router.use(requireAuth);

// All authenticated users can list and create submissions
router.get("/", listSubmissions);
router.post("/", createSubmission);

// Only ADMIN can approve/reject submission status
router.patch("/:id/status", requireRoles("ADMIN"), updateSubmissionStatus);

module.exports = router;
