const { prisma } = require("../lib/prisma");

// Strip fields that must never be set via the generic CRUD routes.
// Password changes MUST go through auth controller (bcrypt hashing).
// companyId is always injected from the JWT, never from the client body.
const BLOCKED_FIELDS = ["passwordHash", "companyId", "id", "createdAt", "updatedAt"];
const sanitizeBody = (body) => {
  const safe = { ...body };
  for (const field of BLOCKED_FIELDS) delete safe[field];
  return safe;
};

const makeCrud = (modelName) => ({
  list: async (req, res, next) => {
    try {
      const data = await prisma[modelName].findMany({ where: { companyId: req.user.companyId } });
      res.json(data);
    } catch (error) { next(error); }
  },
  create: async (req, res, next) => {
    try {
      const data = await prisma[modelName].create({
        data: { ...sanitizeBody(req.body), companyId: req.user.companyId }
      });
      res.status(201).json(data);
    } catch (error) { next(error); }
  },
  update: async (req, res, next) => {
    try {
      const existing = await prisma[modelName].findFirst({
        where: { id: req.params.id, companyId: req.user.companyId }
      });
      if (!existing) {
        return res.status(404).json({ error: "Record not found" });
      }
      const data = await prisma[modelName].update({
        where: { id: req.params.id },
        data: sanitizeBody(req.body)
      });
      res.json(data);
    } catch (error) { next(error); }
  },
  remove: async (req, res, next) => {
    try {
      const existing = await prisma[modelName].findFirst({
        where: { id: req.params.id, companyId: req.user.companyId }
      });
      if (!existing) {
        return res.status(404).json({ error: "Record not found" });
      }
      await prisma[modelName].delete({
        where: { id: req.params.id }
      });
      res.json({ success: true });
    } catch (error) { next(error); }
  }
});

const productCrud = makeCrud("product");

module.exports = {
  contact: makeCrud("contact"),
  product: {
    list: productCrud.list,
    create: async (req, res, next) => {
      try {
        const { name, price } = req.body;
        if (!name || (typeof name === 'string' && name.trim() === "")) {
          return res.status(400).json({ error: "Product name is required" });
        }
        if (price !== undefined && (isNaN(price) || Number(price) < 0)) {
           return res.status(400).json({ error: "Price must be a valid positive number" });
        }

        const data = await prisma.product.create({
          data: { ...sanitizeBody(req.body), companyId: req.user.companyId }
        });
        res.status(201).json(data);
      } catch (error) { next(error); }
    },
    update: async (req, res, next) => {
      try {
        const { name, price } = req.body;
        if (name !== undefined && (typeof name !== 'string' || name.trim() === "")) {
          return res.status(400).json({ error: "Product name cannot be empty" });
        }
        if (price !== undefined && (isNaN(price) || Number(price) < 0)) {
           return res.status(400).json({ error: "Price must be a valid positive number" });
        }

        const existing = await prisma.product.findFirst({
          where: { id: req.params.id, companyId: req.user.companyId }
        });
        if (!existing) {
          return res.status(404).json({ error: "Record not found" });
        }
        const data = await prisma.product.update({
          where: { id: req.params.id },
          data: sanitizeBody(req.body)
        });
        res.json(data);
      } catch (error) { next(error); }
    },
    remove: productCrud.remove
  },
  account: makeCrud("account"),
  journal: makeCrud("journal"),
  analyticAccount: makeCrud("analyticAccount")
};
