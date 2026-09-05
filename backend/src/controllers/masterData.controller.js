const { prisma } = require("../lib/prisma");

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
        data: { ...req.body, companyId: req.user.companyId }
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
        data: req.body
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

module.exports = {
  contact: makeCrud("contact"),
  product: makeCrud("product"),
  account: makeCrud("account"),
  journal: makeCrud("journal"),
  analyticAccount: makeCrud("analyticAccount")
};
