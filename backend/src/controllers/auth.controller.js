const { prisma } = require("../lib/prisma");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, companyName } = req.body;
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Create company and user in a transaction
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
      
      return { user, company };
    });
    
    res.status(201).json({ success: true, user: result.user });
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
      { userId: user.id, companyId: user.companyId, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, companyId: user.companyId } });
  } catch (error) {
    next(error);
  }
};
