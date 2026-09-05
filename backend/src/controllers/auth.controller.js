const { prisma } = require("../lib/prisma");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, companyName } = req.body;
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Create company, user, and default chart of accounts in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const company = await tx.company.create({
        data: { name: companyName || `${name}'s Company` }
      });
      
      const user = await tx.user.create({
        data: {
          name,
          email,
          passwordHash,
          companyId: company.id
        }
      });

      // Seed standard Chart of Accounts for the company
      const defaultAccounts = [
        { code: "1000", name: "Cash on Hand", type: "ASSET" },
        { code: "1010", name: "Bank Account", type: "ASSET" },
        { code: "1200", name: "Accounts Receivable", type: "ASSET" },
        { code: "2100", name: "Accounts Payable", type: "LIABILITY" },
        { code: "3000", name: "Owner's Equity", type: "EQUITY" },
        { code: "4000", name: "Sales Revenue", type: "INCOME" },
        { code: "5000", name: "Cost of Goods Sold", type: "EXPENSE" },
      ];

      for (const acc of defaultAccounts) {
        await tx.account.create({
          data: {
            ...acc,
            companyId: company.id
          }
        });
      }

      // Seed standard Journals
      const defaultJournals = [
        { code: "CSH", name: "Cash Journal", type: "CASH" },
        { code: "BNK", name: "Bank Journal", type: "BANK" },
        { code: "SAL", name: "Sales Journal", type: "SALES" },
        { code: "PUR", name: "Purchases Journal", type: "PURCHASES" },
        { code: "GEN", name: "General Operations", type: "GENERAL" },
      ];

      for (const jnl of defaultJournals) {
        await tx.journal.create({
          data: {
            ...jnl,
            companyId: company.id
          }
        });
      }
      
      return { user, company };
    });

    const token = jwt.sign(
      { userId: result.user.id, id: result.user.id, companyId: result.user.companyId, role: result.user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );
    
    res.status(201).json({
      success: true,
      token,
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role,
        companyId: result.user.companyId
      }
    });
  } catch (error) {
    if (error.code === 'P2002') return res.status(400).json({ error: "Email already exists" });
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) return res.status(401).json({ error: "Invalid credentials" });
    
    const token = jwt.sign(
      { userId: user.id, id: user.id, companyId: user.companyId, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );
    
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyId: user.companyId
      }
    });
  } catch (error) {
    next(error);
  }
};
