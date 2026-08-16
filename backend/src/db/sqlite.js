/**
 * AgriInsights Local Offline Database (SQLite3)
 * Provides zero-latency, embedded local storage for offline edge operations
 * Storage: backend/data/agriinsights.db
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'agriinsights.db');
const db = new Database(dbPath);

// Enable WAL mode for high concurrency
db.pragma('journal_mode = WAL');

// ─── Initialize Local Schema ──────────────────────────────────────────────────
db.exec(`
  -- 1. USERS TABLE
  CREATE TABLE IF NOT EXISTS users (
    user_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    role TEXT CHECK (role IN ('farmer', 'expert', 'admin')) DEFAULT 'farmer',
    contact TEXT,
    preferred_language TEXT DEFAULT 'Filipino',
    location TEXT DEFAULT 'Tupi, South Cotabato',
    avatar_initials TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- 2. FARMS TABLE
  CREATE TABLE IF NOT EXISTS farms (
    farm_id TEXT PRIMARY KEY,
    owner_id TEXT,
    name TEXT NOT NULL,
    barangay TEXT NOT NULL,
    municipality TEXT DEFAULT 'Tupi',
    province TEXT DEFAULT 'South Cotabato',
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    size_hectares REAL NOT NULL,
    soil_type TEXT NOT NULL,
    status TEXT DEFAULT 'active'
  );

  -- 3. SENSOR READINGS (Time-Series Local Buffer)
  CREATE TABLE IF NOT EXISTS sensor_readings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    farm_id TEXT NOT NULL,
    sensor_id TEXT NOT NULL,
    sensor_type TEXT NOT NULL,
    value REAL NOT NULL,
    unit TEXT NOT NULL,
    recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    sync_status TEXT DEFAULT 'pending' CHECK (sync_status IN ('pending', 'synced'))
  );

  -- 4. RECOMMENDATIONS (Prescriptive Storage)
  CREATE TABLE IF NOT EXISTS recommendations (
    rec_id TEXT PRIMARY KEY,
    farm_id TEXT NOT NULL,
    category TEXT NOT NULL,
    priority TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    estimated_cost_php REAL DEFAULT 0,
    expected_benefit TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_by TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- 5. ALERTS TABLE
  CREATE TABLE IF NOT EXISTS alerts (
    alert_id TEXT PRIMARY KEY,
    farm_id TEXT,
    severity TEXT NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- 6. SYNC QUEUE TABLE (Tracks changes to sync to Supabase)
  CREATE TABLE IF NOT EXISTS sync_queue (
    queue_id INTEGER PRIMARY KEY AUTOINCREMENT,
    table_name TEXT NOT NULL,
    record_id TEXT NOT NULL,
    action TEXT NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
    payload_json TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'synced', 'failed')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    synced_at DATETIME
  );
`);

// ─── Initial Seed if Empty ────────────────────────────────────────────────────
const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
if (userCount === 0) {
  const insertUser = db.prepare(`
    INSERT INTO users (user_id, name, username, role, contact, preferred_language, location, avatar_initials)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertUser.run('u1', 'Juan Dela Cruz', 'farmer1', 'farmer', '09171234567', 'Filipino', 'Bololmacnow, Tupi', 'JD');
  insertUser.run('u2', 'Maria Bautista', 'farmer2', 'farmer', '09189876543', 'Filipino', 'Crossing Palkan, Tupi', 'MB');
  insertUser.run('u3', 'Dr. Ana Reyes', 'expert1', 'expert', '09201112222', 'English', 'General Santos City', 'AR');
  insertUser.run('u4', 'AgriInsights Admin', 'admin', 'admin', '09000000000', 'English', 'SEAIT, Tupi', 'AI');

  const insertFarm = db.prepare(`
    INSERT INTO farms (farm_id, owner_id, name, barangay, municipality, province, latitude, longitude, size_hectares, soil_type)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertFarm.run('f1', 'u1', 'Dela Cruz Cornfield', 'Bololmacnow', 'Tupi', 'South Cotabato', 6.3345, 124.8967, 2.5, 'Clay Loam');
  insertFarm.run('f2', 'u2', 'Bautista Pineapple Estate', 'Crossing Palkan', 'Tupi', 'South Cotabato', 6.3512, 124.9123, 5.0, 'Sandy Loam');

  console.log('✓ SQLite3 Database initialized and seeded at backend/data/agriinsights.db');
}

// ─── Helper Functions ─────────────────────────────────────────────────────────
function queueChange(tableName, recordId, action, payload) {
  const stmt = db.prepare(`
    INSERT INTO sync_queue (table_name, record_id, action, payload_json, status)
    VALUES (?, ?, ?, ?, 'pending')
  `);
  return stmt.run(tableName, recordId, action, JSON.stringify(payload));
}

function getPendingSyncCount() {
  return db.prepare("SELECT COUNT(*) as count FROM sync_queue WHERE status = 'pending'").get().count;
}

function getPendingSyncQueue() {
  return db.prepare("SELECT * FROM sync_queue WHERE status = 'pending' ORDER BY queue_id ASC LIMIT 100").all();
}

function markQueueSynced(queueId) {
  return db.prepare("UPDATE sync_queue SET status = 'synced', synced_at = CURRENT_TIMESTAMP WHERE queue_id = ?").run(queueId);
}

module.exports = {
  db,
  queueChange,
  getPendingSyncCount,
  getPendingSyncQueue,
  markQueueSynced,
};
