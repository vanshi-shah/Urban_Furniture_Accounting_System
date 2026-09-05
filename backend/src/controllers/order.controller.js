const OrderService = require("../services/order.service");
const { prisma } = require("../lib/prisma");

exports.getNextSequence = async (req, res, next) => {
  try {
    const type = req.query.type || "PURCHASE_ORDER";
    const sequence = await OrderService.getNextSequence(req.user.companyId, type);
    res.json({ sequence });
  } catch (error) {
    next(error);
  }
};

exports.createOrder = async (req, res, next) => {
  try {
    const order = await OrderService.createOrder(req.user.companyId, req.body);
    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
};

exports.createBillFromPO = async (req, res, next) => {
  try {
    const bill = await OrderService.createBillFromPO(req.user.companyId, req.params.id);
    res.status(201).json(bill);
  } catch (error) {
    next(error);
  }
};

exports.confirmOrder = async (req, res, next) => {
  try {
    const result = await OrderService.confirmOrder(req.user.companyId, req.params.id);
    res.json({ success: true, order: result });
  } catch (error) {
    if (error.message.includes("Cannot confirm order") || error.message.includes("DRAFT")) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
};

exports.recordPayment = async (req, res, next) => {
  try {
    // USER role can only pay CUSTOMER_INVOICE orders that belong to their company
    if (req.user.role === "USER") {
      const order = await prisma.order.findUnique({
        where: { id: req.params.id },
      });
      if (!order || order.companyId !== req.user.companyId) {
        return res.status(404).json({ success: false, error: "Order not found" });
      }
      if (order.type !== "CUSTOMER_INVOICE") {
        return res.status(403).json({
          success: false,
          error: "Forbidden: You can only pay customer invoices"
        });
      }
    }

    const result = await OrderService.recordPayment(req.user.companyId, req.params.id, req.body);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

exports.checkBudget = async (req, res, next) => {
  try {
    const result = await OrderService.checkBudgetExceeded(req.user.companyId, req.body.lines);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.getOrderById = async (req, res, next) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        lines: {
          include: {
            product: true,
            account: true,
            analyticAccount: true
          }
        },
        contact: true,
        sourceOrder: true,
        childOrders: true,
        journalEntry: {
          include: {
            lines: {
              include: {
                account: true,
                contact: true
              }
            }
          }
        },
        payments: true
      }
    });

    if (!order || order.companyId !== req.user.companyId) {
      return res.status(404).json({ error: "Order not found" });
    }

    // USER role can only see CUSTOMER_INVOICE orders
    if (req.user.role === "USER" && order.type !== "CUSTOMER_INVOICE") {
      return res.status(403).json({
        success: false,
        error: "Forbidden: You can only view customer invoices"
      });
    }

    res.json(order);
  } catch (error) {
    next(error);
  }
};

exports.listOrders = async (req, res, next) => {
  try {
    const { type } = req.query;
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip  = (page - 1) * limit;

    const whereClause = { companyId: req.user.companyId };

    // USER role can only see CUSTOMER_INVOICE orders
    if (req.user.role === "USER") {
      whereClause.type = "CUSTOMER_INVOICE";
    } else if (type) {
      whereClause.type = type;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: whereClause,
        skip,
        take: limit,
        include: {
          contact: true,
          lines: {
            include: {
              product: true,
              account: true,
              analyticAccount: true
            }
          },
          sourceOrder: true,
          journalEntry: {
            include: {
              lines: {
                include: {
                  account: true,
                  contact: true
                }
              }
            }
          },
          payments: true
        },
        orderBy: { createdAt: "desc" }
      }),
      prisma.order.count({ where: whereClause })
    ]);

    res.json({ data: orders, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
};
