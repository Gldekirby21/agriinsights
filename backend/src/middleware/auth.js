const jwt = require('jsonwebtoken');
const { supabase } = require('../db/supabase');

const JWT_SECRET = process.env.JWT_SECRET || 'agriinsights_super_secret_jwt_key_2026_seait';

async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Query directly from Supabase users table
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', decoded.user_id)
      .single();

    if (error || !user) {
      // Fallback in case of temporary network latency or demo payload
      req.user = {
        user_id: decoded.user_id,
        role: decoded.role || 'farmer',
        name: decoded.name || 'User',
      };
    } else {
      req.user = user;
    }

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
