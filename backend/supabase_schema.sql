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
    password_hash TEXT NOT NULL,
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
    crop_types TEXT[] NOT NULL,
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
    type TEXT NOT NULL, -- soil_moisture, temperature, soil_npk
    label TEXT NOT NULL,
    unit TEXT NOT NULL,
    battery_pct INTEGER DEFAULT 100,
    status TEXT DEFAULT 'online',
    last_reading TIMESTAMPTZ DEFAULT NOW()
);

-- 5. SENSOR READINGS (Time-Series Data Layer)
CREATE TABLE IF NOT EXISTS sensor_readings (
    id BIGSERIAL PRIMARY KEY,
    farm_id TEXT REFERENCES farms(farm_id) ON DELETE CASCADE,
    sensor_id TEXT REFERENCES sensors(sensor_id) ON DELETE CASCADE,
    sensor_type TEXT NOT NULL,
    value NUMERIC(8,2) NOT NULL,
    unit TEXT NOT NULL,
    recorded_at TIMESTAMPTZ DEFAULT NOW(),
    sync_status TEXT DEFAULT 'synced' CHECK (sync_status IN ('pending', 'synced'))
);
CREATE INDEX IF NOT EXISTS idx_sensor_readings_farm_time ON sensor_readings(farm_id, recorded_at DESC);

-- 6. WEATHER RECORDS (PAGASA Data Layer)
CREATE TABLE IF NOT EXISTS weather_records (
    id BIGSERIAL PRIMARY KEY,
    farm_id TEXT REFERENCES farms(farm_id) ON DELETE CASCADE,
    record_date DATE NOT NULL,
    temperature NUMERIC(4,1) NOT NULL,
    rainfall_mm NUMERIC(5,1) NOT NULL,
    humidity INTEGER NOT NULL,
    wind_kph NUMERIC(4,1) DEFAULT 12.0,
    uv_index INTEGER DEFAULT 7,
    source_api TEXT DEFAULT 'PAGASA Doppler Tupi',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_weather_farm_date ON weather_records(farm_id, record_date DESC);

-- 7. MARKET COMMODITY PRICES (DA Region XII)
CREATE TABLE IF NOT EXISTS market_prices (
    id BIGSERIAL PRIMARY KEY,
    crop_name TEXT NOT NULL,
    price_php_per_kg NUMERIC(6,2) NOT NULL,
    region TEXT DEFAULT 'Region XII (SOCCSKSARGEN)',
    market_date DATE NOT NULL,
    source_feed TEXT DEFAULT 'DA Region XII Feed',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. PREDICTIONS & FORECASTS (CropCast Oracle)
CREATE TABLE IF NOT EXISTS forecasts (
    forecast_id TEXT PRIMARY KEY,
    farm_id TEXT REFERENCES farms(farm_id) ON DELETE CASCADE,
    forecast_type TEXT NOT NULL, -- yield, pest, weather_impact
    crop_name TEXT,
    predicted_value NUMERIC(6,2),
    unit TEXT,
    confidence_pct INTEGER DEFAULT 80,
    risk_level TEXT,
    model_version TEXT DEFAULT 'CropCast-v2.1',
    note TEXT,
    generated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. PRESCRIPTIVE RECOMMENDATIONS (OptiFarm Strategist)
CREATE TABLE IF NOT EXISTS recommendations (
    rec_id TEXT PRIMARY KEY,
    farm_id TEXT REFERENCES farms(farm_id) ON DELETE CASCADE,
    category TEXT NOT NULL, -- fertilizer, pest, irrigation, planting
    priority TEXT NOT NULL CHECK (priority IN ('urgent', 'moderate', 'low')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    estimated_cost_php NUMERIC(8,2) DEFAULT 0,
    expected_benefit TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'ignored')),
    created_by TEXT DEFAULT 'CropCast Rule Engine',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. ALERTS & BROADCAST MESSAGES (MultiSense Conduit)
CREATE TABLE IF NOT EXISTS alerts (
    alert_id TEXT PRIMARY KEY,
    farm_id TEXT REFERENCES farms(farm_id) ON DELETE CASCADE,
    severity TEXT NOT NULL CHECK (severity IN ('critical', 'warning', 'info', 'success', 'broadcast')),
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    author TEXT DEFAULT 'System Alert',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. FEEDBACK / SUS EVALUATION RESPONSES (Brooke 1996 SUS)
CREATE TABLE IF NOT EXISTS feedback_sus (
    response_id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(user_id) ON DELETE CASCADE,
    sus_score NUMERIC(5,2) NOT NULL,
    grade TEXT NOT NULL,
    comments TEXT,
    responses_json JSONB NOT NULL,
    submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- INITIAL SEED DATA FOR PILOT (Tupi, South Cotabato)
-- ==============================================================================

-- Seed Users (Passwords: farmer1/demo123, expert1/demo123, admin/admin123)
INSERT INTO users (user_id, name, username, password_hash, role, contact, preferred_language, location, avatar_initials)
VALUES
('u1', 'Juan Dela Cruz', 'farmer1', '$2a$10$wN9P3JqCvyxO2BwG2nZpOuqW.bZ3j9f5gqPZ.jYq5tO9d6C.K2WKe', 'farmer', '09171234567', 'Filipino', 'Tupi, South Cotabato', 'JD'),
('u2', 'Maria Bautista', 'farmer2', '$2a$10$wN9P3JqCvyxO2BwG2nZpOuqW.bZ3j9f5gqPZ.jYq5tO9d6C.K2WKe', 'farmer', '09189876543', 'Filipino', 'Tupi, South Cotabato', 'MB'),
('u3', 'Dr. Ana Reyes', 'expert1', '$2a$10$wN9P3JqCvyxO2BwG2nZpOuqW.bZ3j9f5gqPZ.jYq5tO9d6C.K2WKe', 'expert', '09201112222', 'English', 'General Santos City', 'AR'),
('u4', 'AgriInsights Admin', 'admin', '$2a$10$iM8jJ9mQ0YhV6xR5uC.LPeA6c1u9oR2k7h5X.vY.tO9d6C.K2WKe', 'admin', '09000000000', 'English', 'SEAIT, Tupi', 'AI')
ON CONFLICT (user_id) DO NOTHING;

-- Seed Farms
INSERT INTO farms (farm_id, owner_id, name, barangay, municipality, province, latitude, longitude, size_hectares, crop_types, soil_type, elevation_m)
VALUES
('f1', 'u1', 'Dela Cruz Cornfield', 'Bololmacnow', 'Tupi', 'South Cotabato', 6.3345, 124.8967, 2.50, ARRAY['corn', 'vegetables'], 'Clay Loam', 380),
('f2', 'u2', 'Bautista Pineapple Estate', 'Crossing Palkan', 'Tupi', 'South Cotabato', 6.3512, 124.9123, 5.00, ARRAY['pineapple', 'banana'], 'Sandy Loam', 420)
ON CONFLICT (farm_id) DO NOTHING;
