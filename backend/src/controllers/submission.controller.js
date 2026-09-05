const { prisma } = require("../lib/prisma");
const { createSubmissionSchema, updateStatusSchema } = require("../schemas/submission.schema");
const { getIO } = require("../socket");

async function listSubmissions(req, res, next) {
  try {
    const ownerId = req.user.id || req.user.userId;
    const companyId = req.user.companyId;
    const isAdmin = req.user.role === "ADMIN";
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip  = (page - 1) * limit;
    const where = { companyId, ...(isAdmin ? {} : { ownerId }) };
    const [submissions, total] = await Promise.all([
      prisma.submission.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { owner: { select: { name: true } } },
      }),
      prisma.submission.count({ where })
    ]);
    res.json({ data: submissions, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
}

async function createSubmission(req, res, next) {
  try {
    const ownerId = req.user.id || req.user.userId;
    const companyId = req.user.companyId;
    const data = createSubmissionSchema.parse({
      description: "No description provided",
      ...req.body
    });
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
