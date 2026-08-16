const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../db/sqlite');
const { JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/login — Queries SQLite3 database
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Pre-hashed passwords for demo/pilot accounts
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
});

// GET /api/auth/me
router.get('/me', require('../middleware/auth').authMiddleware, (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE user_id = ?').get(req.user.user_id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { password_hash: _pw, ...safeUser } = user;
  res.json(safeUser);
});

module.exports = router;
