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
      const data = await prisma[modelName].update({
        where: { id: req.params.id, companyId: req.user.companyId },
        data: req.body
      });
      res.json(data);
    } catch (error) { next(error); }
  },
  remove: async (req, res, next) => {
    try {
      await prisma[modelName].delete({
        where: { id: req.params.id, companyId: req.user.companyId }
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
