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

// ─── Initialize Complete SQLite3 Schema ───────────────────────────────────────
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
    specialization TEXT,
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
    crop_types_csv TEXT NOT NULL,
    soil_type TEXT NOT NULL,
    elevation_m INTEGER DEFAULT 380,
    status TEXT DEFAULT 'active'
  );

  -- 3. SENSORS TABLE
  CREATE TABLE IF NOT EXISTS sensors (
    sensor_id TEXT PRIMARY KEY,
    farm_id TEXT NOT NULL,
    type TEXT NOT NULL,
    label TEXT NOT NULL,
    unit TEXT NOT NULL,
    battery_pct INTEGER DEFAULT 100,
    status TEXT DEFAULT 'online',
    last_reading DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- 4. SENSOR READINGS (Time-Series)
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

  -- 5. WEATHER RECORDS (PAGASA Data)
  CREATE TABLE IF NOT EXISTS weather_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    farm_id TEXT NOT NULL,
    record_date TEXT NOT NULL,
    temperature REAL NOT NULL,
    rainfall_mm REAL NOT NULL,
    humidity INTEGER NOT NULL,
    wind_kph REAL DEFAULT 12.0,
    uv_index INTEGER DEFAULT 7,
    source_api TEXT DEFAULT 'PAGASA Doppler Tupi'
  );

  -- 6. MARKET PRICES (DA Region XII)
  CREATE TABLE IF NOT EXISTS market_prices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    crop_name TEXT NOT NULL,
    price_php_per_kg REAL NOT NULL,
    market_date TEXT NOT NULL,
    region TEXT DEFAULT 'Region XII'
  );

  -- 7. FORECASTS (CropCast Oracle)
  CREATE TABLE IF NOT EXISTS forecasts (
    forecast_id TEXT PRIMARY KEY,
    farm_id TEXT NOT NULL,
    forecast_type TEXT NOT NULL,
    crop_name TEXT,
    predicted_value REAL,
    unit TEXT,
    confidence_pct INTEGER DEFAULT 80,
    risk_level TEXT,
    model_version TEXT DEFAULT 'CropCast-v2.1',
    note TEXT,
    generated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- 8. RECOMMENDATIONS (OptiFarm Strategist)
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

  -- 9. ALERTS TABLE (MultiSense Conduit)
  CREATE TABLE IF NOT EXISTS alerts (
    alert_id TEXT PRIMARY KEY,
    farm_id TEXT,
    severity TEXT NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read INTEGER DEFAULT 0,
    author TEXT DEFAULT 'System Alert',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- 10. FEEDBACK / SUS EVALUATION
  CREATE TABLE IF NOT EXISTS feedback_sus (
    response_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    sus_score REAL NOT NULL,
    grade TEXT NOT NULL,
    comments TEXT,
    responses_json TEXT NOT NULL,
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- 11. SYNC QUEUE TABLE
  CREATE TABLE IF NOT EXISTS sync_queue (
    queue_id INTEGER PRIMARY KEY AUTOINCREMENT,
    table_name TEXT NOT NULL,
    record_id TEXT NOT NULL,
    action TEXT NOT NULL,
    payload_json TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'synced', 'failed')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    synced_at DATETIME
  );
`);

// ─── Auto-Seed Real Data if Empty ─────────────────────────────────────────────
const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
if (userCount === 0) {
  // Users
  const insUser = db.prepare(`
    INSERT INTO users (user_id, name, username, role, contact, preferred_language, location, specialization, avatar_initials)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insUser.run('u1', 'Juan Dela Cruz', 'farmer1', 'farmer', '09171234567', 'Filipino', 'Bololmacnow, Tupi', 'Corn & Vegetables Farming', 'JD');
  insUser.run('u2', 'Maria Bautista', 'farmer2', 'farmer', '09189876543', 'Bisaya', 'Crossing Palkan, Tupi', 'Pineapple & Banana Cultivation', 'MB');
  insUser.run('u3', 'Dr. Ana Reyes', 'expert1', 'expert', '09201112222', 'English', 'General Santos City', 'Senior Agronomist & Soil Chemist', 'AR');
  insUser.run('u4', 'AgriInsights Admin', 'admin', 'admin', '09000000000', 'English', 'SEAIT College of ICT, Tupi', 'System Administrator', 'AI');

  // Farms
  const insFarm = db.prepare(`
    INSERT INTO farms (farm_id, owner_id, name, barangay, municipality, province, latitude, longitude, size_hectares, crop_types_csv, soil_type, elevation_m)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insFarm.run('f1', 'u1', 'Dela Cruz Cornfield', 'Bololmacnow', 'Tupi', 'South Cotabato', 6.3345, 124.8967, 2.5, 'corn,vegetables', 'Clay Loam', 380);
  insFarm.run('f2', 'u2', 'Bautista Pineapple Estate', 'Crossing Palkan', 'Tupi', 'South Cotabato', 6.3512, 124.9123, 5.0, 'pineapple,banana', 'Sandy Loam', 420);

  // Sensors
  const insSensor = db.prepare(`
    INSERT INTO sensors (sensor_id, farm_id, type, label, unit, battery_pct, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  insSensor.run('s1', 'f1', 'soil_moisture', 'Soil Moisture Sensor Plot A (0-15cm)', '%', 92, 'online');
  insSensor.run('s2', 'f1', 'temperature', 'Ambient Canopy Temperature Probe', '°C', 88, 'online');
  insSensor.run('s3', 'f1', 'soil_npk', 'NPK Multi-Parameter Probe', 'mg/kg', 95, 'online');
  insSensor.run('s4', 'f2', 'soil_moisture', 'Pineapple Ridge Soil Moisture', '%', 78, 'online');
  insSensor.run('s5', 'f2', 'temperature', 'Valley Canopy Weather Station', '°C', 84, 'online');

  // Weather (14 Days)
  const insWeather = db.prepare(`
    INSERT INTO weather_records (farm_id, record_date, temperature, rainfall_mm, humidity, wind_kph)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  for (let i = 14; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000).toISOString().split('T')[0];
    insWeather.run('f1', d, +(28 + Math.sin(i) * 2.5).toFixed(1), +(Math.max(0, Math.sin(i * 1.5) * 12)).toFixed(1), Math.round(72 + Math.cos(i) * 10), 12.0);
  }

  // Market Prices
  const insMarket = db.prepare(`
    INSERT INTO market_prices (crop_name, price_php_per_kg, market_date)
    VALUES (?, ?, ?)
  `);
  const today = new Date().toISOString().split('T')[0];
  insMarket.run('Yellow Corn (Grain)', 14.50, today);
  insMarket.run('Sweet Pineapple (MD2)', 12.80, today);
  insMarket.run('Well-Milled Rice', 42.00, today);
  insMarket.run('Lakatan Banana', 24.50, today);

  // Recommendations
  const insRec = db.prepare(`
    INSERT INTO recommendations (rec_id, farm_id, category, priority, title, description, estimated_cost_php, expected_benefit, status, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insRec.run('rec1', 'f1', 'pest', 'urgent', 'Mag-spray laban sa Fall Armyworm sa susunod na 48 oras', 'Mataas ang banta ng uod sa mga batang dahon. Mag-apply ng Bacillus thuringiensis (Bt) o Chlorpyrifos sa hapon.', 850.0, 'Maiiwasan ang tinatayang 0.8 t/ha pagkalugi sa ani.', 'pending', 'Dr. Ana Reyes (Agri Expert)');
  insRec.run('rec2', 'f1', 'fertilizer', 'moderate', 'I-apply ang Muriate of Potash (0-0-60) Top Dressing', 'Mababa ang Potassium (K) sa pagsusuri ng lupa. Maglagay ng 50kg/ha bago mag-bulaklak ang mais.', 1400.0, 'Pagpapatibay ng puno at pagpapalaki ng butil ng mais.', 'accepted', 'Dr. Ana Reyes (Agri Expert)');
  insRec.run('rec3', 'f1', 'irrigation', 'moderate', 'Ihinto muna ang pagpapatubig dahil sa inaasahang ulan', 'Sapat ang halumigmig (62%) at may 74% tsansa ng pag-ulan sa Huwebes ayon sa PAGASA.', 0.0, 'Makatipid ng ₱600 sa kuryente/bomba at maiwasan ang waterlogging.', 'accepted', 'CropCast Rule Engine');

  // Alerts
  const insAlert = db.prepare(`
    INSERT INTO alerts (alert_id, farm_id, severity, type, title, message, is_read, author)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insAlert.run('al1', 'f1', 'critical', 'pest', 'Panganib ng Fall Armyworm sa Mais', 'May mataas na banta (68%) ng pesteng uod sa Dela Cruz Cornfield sa susunod na 48 oras.', 0, 'Dr. Ana Reyes');
  insAlert.run('al2', 'f1', 'warning', 'weather', 'Babala sa Malakas na Pag-ulan', 'Inaasahan ang convective thunderstorms sa Tupi sa Huwebes. Suriin ang drainage ng bukid.', 0, 'PAGASA Station #TUP-04');
  insAlert.run('al3', 'f1', 'info', 'market', 'Tumaas ang Presyo ng Mais sa Palengke', 'Ang presyo ng mais sa Koronadal City ay umabot sa ₱14.50/kg (+4.2% ngayong linggo).', 1, 'DA Region XII Feed');

  console.log('✓ SQLite3 Database initialized with complete schema & seed tables at backend/data/agriinsights.db');
}

// ─── Sync Queue Helpers ───────────────────────────────────────────────────────
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
