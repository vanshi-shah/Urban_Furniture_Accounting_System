const OrderService = require("../services/order.service");
const { prisma } = require("../lib/prisma");

exports.createOrder = async (req, res, next) => {
  try {
    const order = await OrderService.createOrder(req.user.companyId, req.body);
    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
};

exports.confirmOrder = async (req, res, next) => {
  try {
    const order = await OrderService.confirmOrder(req.user.companyId, req.params.id);
    res.json({ success: true, order });
  } catch (error) {
    if (error.message.includes("Cannot confirm order") || error.message.includes("DRAFT")) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
};

exports.listOrders = async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      where: { companyId: req.user.companyId },
      include: { contact: true, lines: true, journalEntry: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(orders);
  } catch (error) {
    next(error);
  }
};
