const jwt = require('jsonwebtoken');
const { users } = require('../data/mockData');

const JWT_SECRET = process.env.JWT_SECRET || 'agriinsights_secret_2026_seait';

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = users.find((u) => u.user_id === decoded.user_id);
    if (!user) return res.status(401).json({ error: 'User not found' });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      return res.status(403).json({ error: 'Access forbidden: insufficient role' });
    }
    next();
  };
}

module.exports = { authMiddleware, requireRole, JWT_SECRET };
