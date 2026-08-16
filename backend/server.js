require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Initialize Pure Supabase Cloud Client
require('./src/db/supabase');

const authRoutes      = require('./src/routes/auth');
const nexusRoutes     = require('./src/routes/nexus');
const pulseRoutes     = require('./src/routes/pulse');
const oracleRoutes    = require('./src/routes/oracle');
const strategistRoutes= require('./src/routes/strategist');
const conduitRoutes   = require('./src/routes/conduit');
const farmerRoutes    = require('./src/routes/farmers');
const feedbackRoutes  = require('./src/routes/feedback');
const syncRoutes      = require('./src/routes/sync');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({ origin: '*' }));
app.use(express.json());

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'AgriInsights API',
    version: '1.0.0',
    institution: 'South East Asian Institute of Technology, Inc. (SEAIT)',
    database_mode: '100% Pure Supabase Cloud (PostgreSQL 16 + PostGIS)',
    cloud_connected: true,
    timestamp: new Date().toISOString(),
  });
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth',        authRoutes);
app.use('/api/nexus',       nexusRoutes);
app.use('/api/pulse',       pulseRoutes);
app.use('/api/oracle',      oracleRoutes);
app.use('/api/strategist',  strategistRoutes);
app.use('/api/conduit',     conduitRoutes);
app.use('/api/farmers',     farmerRoutes);
app.use('/api/feedback',    feedbackRoutes);
app.use('/api/sync',        syncRoutes);

// ─── 404 handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// ─── Error handler ────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error', detail: err.message });
});

app.listen(PORT, () => {
  console.log(`\n🌾 AgriInsights API running on http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health`);
  console.log(`   Database: 100% Supabase Cloud Connected (PostgreSQL 16)`);
  console.log(`\n   Demo accounts:`);
  console.log(`     farmer1 / demo123  (Farmer role)`);
  console.log(`     expert1 / demo123  (Expert role)`);
  console.log(`     admin   / admin123 (Admin role)\n`);
});
