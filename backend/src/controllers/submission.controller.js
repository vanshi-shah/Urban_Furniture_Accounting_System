const { prisma } = require("../lib/prisma");
const { createSubmissionSchema, updateStatusSchema } = require("../schemas/submission.schema");
const { getIO } = require("../socket");

async function listSubmissions(req, res, next) {
  try {
    const ownerId = req.user.id || req.user.userId;
    const companyId = req.user.companyId;
    const isAdmin = req.user.role === "ADMIN";
    const submissions = await prisma.submission.findMany({
      where: {
        companyId,
        ...(isAdmin ? {} : { ownerId })
      },
      orderBy: { createdAt: "desc" },
      include: { owner: { select: { name: true } } },
    });
    res.json(submissions);
  } catch (error) {
    next(error);
  }
}

async function createSubmission(req, res, next) {
  try {
    const ownerId = req.user.id || req.user.userId;
    const companyId = req.user.companyId;
    const data = createSubmissionSchema.parse(req.body);
    const submission = await prisma.submission.create({
      data: {
        ...data,
        ownerId,
        companyId
      },
    });
    try {
      getIO().emit("submission:created", submission);
    } catch (e) {
      // socket emission failure shouldn't fail HTTP request
    }
    res.status(201).json(submission);
  } catch (error) {
    next(error);
  }
}

// Admin-only: moderate a submission (approve/reject)
async function updateSubmissionStatus(req, res, next) {
  try {
    const { status } = updateStatusSchema.parse(req.body);
    const submission = await prisma.submission.update({
      where: { id: req.params.id },
      data: { status },
    });
    try {
      getIO().emit("submission:updated", submission);
    } catch (e) {
      // socket emission failure shouldn't fail HTTP request
    }
    res.json(submission);
  } catch (error) {
    next(error);
  }
}

module.exports = { listSubmissions, createSubmission, updateSubmissionStatus };
