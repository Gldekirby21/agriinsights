-- ==============================================================================
-- AgriInsights: Integrating Multi-Modal Analytics for Data-Driven Farmer Assistance
-- Institution: South East Asian Institute of Technology, Inc. (SEAIT)
-- College of Information and Communication Technology
-- Target Pilot: Tupi, South Cotabato
-- ==============================================================================

-- 1. Enable PostGIS Extension for Geospatial Farm Plotting
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. USERS TABLE (Role-Based Access: farmer, expert, admin)
CREATE TABLE IF NOT EXISTS users (
    user_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT,
    role TEXT CHECK (role IN ('farmer', 'expert', 'admin')) DEFAULT 'farmer',
    contact TEXT,
    preferred_language TEXT DEFAULT 'Filipino',
    location TEXT DEFAULT 'Tupi, South Cotabato',
    specialization TEXT,
    avatar_initials TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. FARMS TABLE (Geospatial metadata for pilot farms)
CREATE TABLE IF NOT EXISTS farms (
    farm_id TEXT PRIMARY KEY,
    owner_id TEXT REFERENCES users(user_id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    barangay TEXT NOT NULL,
    municipality TEXT DEFAULT 'Tupi',
    province TEXT DEFAULT 'South Cotabato',
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    size_hectares NUMERIC(5,2) NOT NULL,
    crop_types TEXT[] DEFAULT ARRAY['corn', 'vegetables'],
    soil_type TEXT NOT NULL,
    elevation_m INTEGER DEFAULT 380,
    status TEXT DEFAULT 'active',
    established_date DATE DEFAULT '2020-01-01',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. SENSORS TABLE (IoT Nodes in Farm Plots)
CREATE TABLE IF NOT EXISTS sensors (
    sensor_id TEXT PRIMARY KEY,
    farm_id TEXT REFERENCES farms(farm_id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    label TEXT NOT NULL,
    unit TEXT NOT NULL,
    battery_pct INTEGER DEFAULT 100,
    status TEXT DEFAULT 'online',
    last_reading TIMESTAMPTZ DEFAULT NOW()
);

-- 5. SENSOR READINGS (Time-Series Data Layer)
CREATE TABLE IF NOT EXISTS sensor_readings (
    reading_id BIGSERIAL PRIMARY KEY,
    farm_id TEXT REFERENCES farms(farm_id) ON DELETE CASCADE,
    sensor_id TEXT REFERENCES sensors(sensor_id) ON DELETE CASCADE,
    sensor_type TEXT NOT NULL,
    value DOUBLE PRECISION NOT NULL,
    unit TEXT NOT NULL,
    recorded_at TIMESTAMPTZ DEFAULT NOW(),
    sync_status TEXT DEFAULT 'synced'
);

-- 6. WEATHER RECORDS (PAGASA Doppler Station Feed)
CREATE TABLE IF NOT EXISTS weather_records (
    record_id BIGSERIAL PRIMARY KEY,
    farm_id TEXT REFERENCES farms(farm_id) ON DELETE CASCADE,
    record_date DATE NOT NULL,
    temperature DOUBLE PRECISION NOT NULL,
    rainfall_mm DOUBLE PRECISION NOT NULL,
    humidity INTEGER NOT NULL,
    wind_kph DOUBLE PRECISION DEFAULT 12.0,
    uv_index INTEGER DEFAULT 7,
    source_api TEXT DEFAULT 'PAGASA Doppler Tupi',
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. MARKET COMMODITY PRICES (DA Region XII)
CREATE TABLE IF NOT EXISTS market_prices (
    price_id BIGSERIAL PRIMARY KEY,
    crop_name TEXT NOT NULL,
    price_php_per_kg NUMERIC(6,2) NOT NULL,
    region TEXT DEFAULT 'Region XII (SOCCSKSARGEN)',
    market_date DATE NOT NULL,
    source_feed TEXT DEFAULT 'DA Region XII Daily Agribusiness Feed',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. CROPCAST ORACLE FORECASTS (Predictive Machine Learning)
CREATE TABLE IF NOT EXISTS forecasts (
    forecast_id TEXT PRIMARY KEY,
    farm_id TEXT REFERENCES farms(farm_id) ON DELETE CASCADE,
    forecast_type TEXT NOT NULL,
    crop_name TEXT,
    predicted_value NUMERIC(6,2),
    unit TEXT,
    confidence_pct INTEGER DEFAULT 80,
    risk_level TEXT,
    model_version TEXT DEFAULT 'CropCast-v2.1',
    note TEXT,
    generated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. OPTIFARM STRATEGIST RECOMMENDATIONS (Prescriptive Analytics)
CREATE TABLE IF NOT EXISTS recommendations (
    rec_id TEXT PRIMARY KEY,
    farm_id TEXT REFERENCES farms(farm_id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    priority TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    estimated_cost_php NUMERIC(8,2) DEFAULT 0,
    expected_benefit TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. MULTISENSE CONDUIT ALERTS & BROADCASTS
CREATE TABLE IF NOT EXISTS alerts (
    alert_id TEXT PRIMARY KEY,
    farm_id TEXT,
    severity TEXT NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    author TEXT DEFAULT 'System Alert',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. SYSTEM USABILITY SCALE (SUS) EVALUATION
CREATE TABLE IF NOT EXISTS feedback_sus (
    response_id TEXT PRIMARY KEY,
    user_id TEXT,
    sus_score NUMERIC(5,2) NOT NULL,
    grade TEXT NOT NULL,
    comments TEXT,
    responses_json JSONB NOT NULL,
    submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- DISABLE ROW LEVEL SECURITY (RLS) FOR APPLICATION ACCESS
-- ==============================================================================
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE farms DISABLE ROW LEVEL SECURITY;
ALTER TABLE sensors DISABLE ROW LEVEL SECURITY;
ALTER TABLE sensor_readings DISABLE ROW LEVEL SECURITY;
ALTER TABLE weather_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE market_prices DISABLE ROW LEVEL SECURITY;
ALTER TABLE forecasts DISABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations DISABLE ROW LEVEL SECURITY;
ALTER TABLE alerts DISABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_sus DISABLE ROW LEVEL SECURITY;
