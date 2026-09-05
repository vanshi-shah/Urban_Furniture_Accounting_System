const jwt = require('jsonwebtoken');

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Unauthorized: Missing or invalid token' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = {
      ...payload,
      id: payload.userId || payload.id,
      userId: payload.userId || payload.id
    };
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Unauthorized: Token expired or invalid' });
  }
}

/**
 * requireRoles(...roles)
 * Allows one or more roles. ADMIN always passes.
 * Usage: requireRoles('ADMIN', 'ACCOUNTANT')
 */
function requireRoles(...roles) {
  return function (req, res, next) {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized: No user found' });
    }

    const userRole = req.user.role;

    // ADMIN always has full access
    if (userRole === 'ADMIN') return next();

    if (!roles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        error: `Forbidden: Access restricted to ${roles.join(', ')} role(s)`
      });
    }

    next();
  };
}

/**
 * requireRole(role) — backward-compatible single-role check.
 * ADMIN always passes.
 */
function requireRole(role) {
  return requireRoles(role);
}

module.exports = { requireAuth, requireRole, requireRoles };
