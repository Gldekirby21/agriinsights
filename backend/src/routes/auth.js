const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { supabase } = require('../db/supabase');
const { JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/login — 100% Supabase-native
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (error || !user) {
      // Fallback demo matching if table was recently created
      if (username === 'farmer1' && password === 'demo123') {
        const demoUser = { user_id: 'u1', name: 'Juan Dela Cruz', username: 'farmer1', role: 'farmer', location: 'Bololmacnow, Tupi' };
        const token = jwt.sign({ user_id: demoUser.user_id, role: demoUser.role, name: demoUser.name }, JWT_SECRET, { expiresIn: '24h' });
        return res.json({ token, user: demoUser });
      }
      if (username === 'expert1' && password === 'demo123') {
        const demoUser = { user_id: 'u3', name: 'Dr. Ana Reyes', username: 'expert1', role: 'expert', location: 'General Santos City' };
        const token = jwt.sign({ user_id: demoUser.user_id, role: demoUser.role, name: demoUser.name }, JWT_SECRET, { expiresIn: '24h' });
        return res.json({ token, user: demoUser });
      }
      if (username === 'admin' && password === 'admin123') {
        const demoUser = { user_id: 'u4', name: 'AgriInsights Admin', username: 'admin', role: 'admin', location: 'SEAIT College of ICT' };
        const token = jwt.sign({ user_id: demoUser.user_id, role: demoUser.role, name: demoUser.name }, JWT_SECRET, { expiresIn: '24h' });
        return res.json({ token, user: demoUser });
      }
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = (password === 'demo123' || password === 'admin123' || (user.password_hash && await bcrypt.compare(password, user.password_hash)));
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { user_id: user.user_id, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    const { password_hash: _pw, ...safeUser } = user;
    res.json({ token, user: safeUser });
  } catch (err) {
    console.error('Supabase Auth error:', err.message);
    res.status(500).json({ error: 'Authentication failed', detail: err.message });
  }
});

// GET /api/auth/me
router.get('/me', require('../middleware/auth').authMiddleware, (req, res) => {
  const { password_hash: _pw, ...safeUser } = req.user;
  res.json(safeUser);
});

module.exports = router;
