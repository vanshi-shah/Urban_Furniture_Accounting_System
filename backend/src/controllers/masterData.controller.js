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

const handleError = (error, res, next) => {
  if (error.code === 'P2002') {
    return res.status(400).json({ error: "A record with this unique field already exists." });
  }
  next(error);
};

const makeCrud = (modelName) => ({
  list: async (req, res, next) => {
    try {
      const data = await prisma[modelName].findMany({ where: { companyId: req.user.companyId } });
      res.json(data);
    } catch (error) { handleError(error, res, next); }
  },
  create: async (req, res, next) => {
    try {
      const data = await prisma[modelName].create({
        data: { ...sanitizeBody(req.body), companyId: req.user.companyId }
      });
      res.status(201).json(data);
    } catch (error) { handleError(error, res, next); }
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
    } catch (error) { handleError(error, res, next); }
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
    } catch (error) { handleError(error, res, next); }
  }
});

const productCrud = makeCrud("product");

module.exports = {
  contact: makeCrud("contact"),
  product: {
    list: productCrud.list,
    create: async (req, res, next) => {
      try {
        const { name, type, category, salesPrice, cost, sku, description, imageUrl } = req.body;
        if (!name || (typeof name === 'string' && name.trim() === "")) {
          return res.status(400).json({ error: "Product name is required" });
        }
        if (salesPrice !== undefined && (isNaN(salesPrice) || Number(salesPrice) < 0)) {
           return res.status(400).json({ error: "Sales Price must be a valid positive number" });
        }
        if (cost !== undefined && (isNaN(cost) || Number(cost) < 0)) {
           return res.status(400).json({ error: "Cost must be a valid positive number" });
        }

        const productData = {
          name,
          type,
          category,
          salesPrice: salesPrice !== undefined ? Number(salesPrice) : undefined,
          cost: cost !== undefined ? Number(cost) : undefined,
          sku,
          description,
          imageUrl,
          companyId: req.user.companyId
        };
        const data = await prisma.product.create({
          data: productData
        });
        res.status(201).json(data);
      } catch (error) { next(error); }
    },
    update: async (req, res, next) => {
      try {
        const { name, type, category, salesPrice, cost, sku, description, imageUrl } = req.body;
        if (name !== undefined && (typeof name !== 'string' || name.trim() === "")) {
          return res.status(400).json({ error: "Product name cannot be empty" });
        }
        if (salesPrice !== undefined && (isNaN(salesPrice) || Number(salesPrice) < 0)) {
           return res.status(400).json({ error: "Sales Price must be a valid positive number" });
        }
        if (cost !== undefined && (isNaN(cost) || Number(cost) < 0)) {
           return res.status(400).json({ error: "Cost must be a valid positive number" });
        }

        const existing = await prisma.product.findFirst({
          where: { id: req.params.id, companyId: req.user.companyId }
        });
        if (!existing) {
          return res.status(404).json({ error: "Record not found" });
        }
        const data = await prisma.product.update({
          where: { id: req.params.id },
          data: {
            ...(name !== undefined && { name }),
            ...(type !== undefined && { type }),
            ...(category !== undefined && { category }),
            ...(salesPrice !== undefined && { salesPrice: Number(salesPrice) }),
            ...(cost !== undefined && { cost: Number(cost) }),
            ...(sku !== undefined && { sku }),
            ...(description !== undefined && { description }),
            ...(imageUrl !== undefined && { imageUrl })
          }
        });
        res.json(data);
      } catch (error) { next(error); }
    },
    remove: productCrud.remove
  },
  account: makeCrud("account"),
  journal: {
    list: async (req, res, next) => {
      try {
        const data = await prisma.journal.findMany({ 
          where: { companyId: req.user.companyId },
          include: { defaultAccount: true }
        });
        res.json(data);
      } catch (error) { handleError(error, res, next); }
    },
    create: async (req, res, next) => {
      try {
        const { name, code, type } = req.body;
        
        if (!name || (typeof name === 'string' && name.trim() === "")) {
          return res.status(400).json({ error: "Journal name is required" });
        }
        if (!code || (typeof code === 'string' && code.trim() === "")) {
          return res.status(400).json({ error: "Journal code is required" });
        }
        
        const validTypes = ["BANK", "CASH", "SALES", "PURCHASES", "GENERAL"];
        if (!type || !validTypes.includes(type)) {
          return res.status(400).json({ error: `Invalid journal type. Must be one of: ${validTypes.join(", ")}` });
        }

        const data = await prisma.journal.create({
          data: { ...sanitizeBody(req.body), companyId: req.user.companyId }
        });
        res.status(201).json(data);
      } catch (error) { next(error); }
    },
    update: async (req, res, next) => {
      try {
        const { name, code, type } = req.body;
        
        if (name !== undefined && (typeof name !== 'string' || name.trim() === "")) {
          return res.status(400).json({ error: "Journal name cannot be empty" });
        }
        if (code !== undefined && (typeof code !== 'string' || code.trim() === "")) {
          return res.status(400).json({ error: "Journal code cannot be empty" });
        }
        
        const validTypes = ["BANK", "CASH", "SALES", "PURCHASES", "GENERAL"];
        if (type !== undefined && !validTypes.includes(type)) {
          return res.status(400).json({ error: `Invalid journal type. Must be one of: ${validTypes.join(", ")}` });
        }

        const existing = await prisma.journal.findFirst({
          where: { id: req.params.id, companyId: req.user.companyId }
        });
        if (!existing) {
          return res.status(404).json({ error: "Record not found" });
        }
        const data = await prisma.journal.update({
          where: { id: req.params.id },
          data: sanitizeBody(req.body)
        });
        res.json(data);
      } catch (error) { next(error); }
    },
    remove: makeCrud("journal").remove
  },
  analyticAccount: makeCrud("analyticAccount")
};
