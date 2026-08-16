/**
 * AgriInsights Mock Data
 * Simulates farm, sensor, weather, market, and user data for Tupi, South Cotabato
 */

const bcrypt = require('bcryptjs');

// ─── USERS ───────────────────────────────────────────────────────────────────
const users = [
  {
    user_id: 'u1',
    name: 'Juan Dela Cruz',
    username: 'farmer1',
    password: bcrypt.hashSync('demo123', 10),
    role: 'farmer',
    contact: '09171234567',
    preferred_language: 'Filipino',
    farm_ids: ['f1'],
    avatar_initials: 'JD',
    location: 'Tupi, South Cotabato',
  },
  {
    user_id: 'u2',
    name: 'Maria Bautista',
    username: 'farmer2',
    password: bcrypt.hashSync('demo123', 10),
    role: 'farmer',
    contact: '09189876543',
    preferred_language: 'Filipino',
    farm_ids: ['f2'],
    avatar_initials: 'MB',
    location: 'Tupi, South Cotabato',
  },
  {
    user_id: 'u3',
    name: 'Dr. Ana Reyes',
    username: 'expert1',
    password: bcrypt.hashSync('demo123', 10),
    role: 'expert',
    contact: '09201112222',
    preferred_language: 'English',
    farm_ids: [],
    avatar_initials: 'AR',
    location: 'General Santos City',
    specialization: 'Crop Science & Soil Management',
  },
  {
    user_id: 'u4',
    name: 'AgriInsights Admin',
    username: 'admin',
    password: bcrypt.hashSync('admin123', 10),
    role: 'admin',
    contact: '09000000000',
    preferred_language: 'English',
    farm_ids: [],
    avatar_initials: 'AI',
    location: 'USTP, Tupi',
  },
];

// ─── FARMS ────────────────────────────────────────────────────────────────────
const farms = [
  {
    farm_id: 'f1',
    owner_id: 'u1',
    name: 'Dela Cruz Cornfield',
    location: { lat: 6.3345, lng: 124.8967, barangay: 'Bololmacnow', municipality: 'Tupi', province: 'South Cotabato' },
    size: 2.5,
    size_unit: 'hectares',
    crop_types: ['corn', 'vegetables'],
    soil_type: 'Clay Loam',
    elevation_m: 380,
    sensors: ['s1', 's2', 's3'],
    established: '2018-03-15',
    status: 'active',
  },
  {
    farm_id: 'f2',
    owner_id: 'u2',
    name: 'Bautista Pineapple Estate',
    location: { lat: 6.3512, lng: 124.9123, barangay: 'Crossing Palkan', municipality: 'Tupi', province: 'South Cotabato' },
    size: 5.0,
    size_unit: 'hectares',
    crop_types: ['pineapple', 'banana'],
    soil_type: 'Sandy Loam',
    elevation_m: 420,
    sensors: ['s4', 's5'],
    established: '2015-07-20',
    status: 'active',
  },
];

// ─── SENSORS ─────────────────────────────────────────────────────────────────
const sensors = [
  { sensor_id: 's1', farm_id: 'f1', type: 'soil_moisture', unit: '%', label: 'Soil Moisture Sensor A' },
  { sensor_id: 's2', farm_id: 'f1', type: 'temperature', unit: '°C', label: 'Ambient Temp Sensor' },
  { sensor_id: 's3', farm_id: 'f1', type: 'soil_npk', unit: 'mg/kg', label: 'NPK Composite Sensor' },
  { sensor_id: 's4', farm_id: 'f2', type: 'soil_moisture', unit: '%', label: 'Soil Moisture Sensor B' },
  { sensor_id: 's5', farm_id: 'f2', type: 'temperature', unit: '°C', label: 'Ambient Temp Sensor B' },
];

// ─── TIME-SERIES GENERATOR ────────────────────────────────────────────────────
function generateDays(n = 30) {
  const days = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
}

function rand(min, max, decimals = 1) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function generateWeatherSeries(days) {
  return days.map((date) => ({
    date,
    temperature: rand(26.5, 32.0),
    rainfall_mm: rand(0, 18, 1),
    humidity: rand(68, 90, 0),
    wind_kph: rand(8, 22, 1),
    uv_index: rand(5, 11, 0),
  }));
}

function generateSoilSeries(days) {
  let moisture = 55;
  return days.map((date) => {
    moisture = Math.max(30, Math.min(85, moisture + rand(-4, 4)));
    return {
      date,
      moisture: parseFloat(moisture.toFixed(1)),
      nitrogen: rand(28, 55, 0),
      phosphorus: rand(18, 42, 0),
      potassium: rand(22, 60, 0),
      ph: rand(5.8, 7.2, 1),
      temperature: rand(24, 29, 1),
    };
  });
}

function generateMarketSeries(days) {
  let cornPrice = 13.5;
  let pinePrice = 10.0;
  let ricePrice = 50.0;
  return days.map((date) => {
    cornPrice = Math.max(11, Math.min(17, cornPrice + rand(-0.4, 0.4)));
    pinePrice = Math.max(8, Math.min(15, pinePrice + rand(-0.3, 0.3)));
    ricePrice = Math.max(46, Math.min(58, ricePrice + rand(-0.5, 0.5)));
    return {
      date,
      corn_php_per_kg: parseFloat(cornPrice.toFixed(2)),
      pineapple_php_per_kg: parseFloat(pinePrice.toFixed(2)),
      rice_php_per_kg: parseFloat(ricePrice.toFixed(2)),
      banana_php_per_kg: rand(6.5, 11.0),
    };
  });
}

const DAYS = generateDays(30);
const weatherSeries = generateWeatherSeries(DAYS);
const soilSeriesFarm1 = generateSoilSeries(DAYS);
const soilSeriesFarm2 = generateSoilSeries(DAYS);
const marketSeries = generateMarketSeries(DAYS);

// ─── FORECASTS ────────────────────────────────────────────────────────────────
const forecasts = [
  {
    forecast_id: 'fc1',
    farm_id: 'f1',
    type: 'yield',
    crop: 'Corn',
    value: 4.2,
    unit: 'tons/hectare',
    confidence: 82,
    model_version: 'CropCast-v2.1',
    date_generated: new Date().toISOString(),
    trend: 'up',
    note: 'Slightly above seasonal average. Optimal planting density maintained.',
  },
  {
    forecast_id: 'fc2',
    farm_id: 'f1',
    type: 'pest',
    pest: 'Fall Armyworm',
    risk_score: 68,
    risk_level: 'moderate',
    model_version: 'CropCast-v2.1',
    date_generated: new Date().toISOString(),
    note: 'Elevated humidity and temperature create favorable conditions in the next 7 days.',
  },
  {
    forecast_id: 'fc3',
    farm_id: 'f1',
    type: 'weather_impact',
    event: 'Heavy Rainfall',
    probability: 74,
    expected_date: (() => { const d = new Date(); d.setDate(d.getDate() + 3); return d.toISOString().split('T')[0]; })(),
    impact: 'Potential waterlogging in low-lying plots. Drainage check recommended.',
    model_version: 'CropCast-v2.1',
    date_generated: new Date().toISOString(),
  },
  {
    forecast_id: 'fc4',
    farm_id: 'f2',
    type: 'yield',
    crop: 'Pineapple',
    value: 38.5,
    unit: 'tons/hectare',
    confidence: 88,
    model_version: 'CropCast-v2.1',
    date_generated: new Date().toISOString(),
    trend: 'stable',
    note: 'Consistent with last harvest. Fruit quality indicator optimal.',
  },
];

// ─── RECOMMENDATIONS ──────────────────────────────────────────────────────────
const recommendations = [
  {
    rec_id: 'r1',
    farm_id: 'f1',
    category: 'pest',
    priority: 'urgent',
    title: 'Apply Fall Armyworm Treatment',
    description: 'Soil moisture and temperature readings indicate high armyworm risk. Apply chlorpyrifos or Bacillus thuringiensis (Bt) spray in the next 48 hours, focusing on early-whorl corn plants.',
    estimated_cost_php: 850,
    expected_benefit: 'Prevent estimated 15–20% yield loss (~0.8 tons/ha)',
    status: 'pending',
    date_generated: new Date().toISOString(),
    icon: 'bug',
  },
  {
    rec_id: 'r2',
    farm_id: 'f1',
    category: 'irrigation',
    priority: 'moderate',
    title: 'Reduce Irrigation Frequency',
    description: 'Current soil moisture levels (62%) are above optimal threshold for corn at this growth stage (55%). Reduce irrigation by 30% for the next 5 days to prevent root rot.',
    estimated_cost_php: 0,
    expected_benefit: 'Save ~1,200 liters of water and reduce disease pressure',
    status: 'accepted',
    date_generated: new Date().toISOString(),
    icon: 'droplets',
  },
  {
    rec_id: 'r3',
    farm_id: 'f1',
    category: 'fertilizer',
    priority: 'moderate',
    title: 'Potassium Top-Dressing Needed',
    description: 'Soil NPK readings show potassium at 28 mg/kg — below the 35 mg/kg target for mid-season corn. Apply 50 kg/ha of muriate of potash (0-0-60) within the week.',
    estimated_cost_php: 1200,
    expected_benefit: 'Improve grain filling and stalk strength, reducing lodging risk',
    status: 'pending',
    date_generated: new Date().toISOString(),
    icon: 'flask',
  },
  {
    rec_id: 'r4',
    farm_id: 'f1',
    category: 'planting',
    priority: 'low',
    title: 'Consider Intercropping with Legumes',
    description: 'Based on soil nitrogen depletion trends, intercropping corn with mungbean or peanut in the next season can naturally replenish soil nitrogen, reducing fertilizer cost.',
    estimated_cost_php: 300,
    expected_benefit: 'Reduce nitrogen fertilizer cost by ~₱2,000/ha next season',
    status: 'pending',
    date_generated: new Date().toISOString(),
    icon: 'sprout',
  },
  {
    rec_id: 'r5',
    farm_id: 'f2',
    category: 'irrigation',
    priority: 'low',
    title: 'Optimize Drip Irrigation Schedule',
    description: 'Market weather forecast shows 74% chance of significant rainfall in 3 days. Suspend irrigation until after the rain event to conserve resources.',
    estimated_cost_php: 0,
    expected_benefit: 'Save ~3,000 liters of water from the next irrigation cycle',
    status: 'pending',
    date_generated: new Date().toISOString(),
    icon: 'droplets',
  },
];

// ─── ALERTS ──────────────────────────────────────────────────────────────────
const alerts = [
  {
    alert_id: 'a1',
    farm_id: 'f1',
    severity: 'critical',
    type: 'pest',
    title: 'High Pest Risk Detected',
    message: 'Fall Armyworm outbreak probability has reached 68% at Dela Cruz Cornfield. Immediate action recommended.',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    read: false,
  },
  {
    alert_id: 'a2',
    farm_id: 'f1',
    severity: 'warning',
    type: 'weather',
    title: 'Heavy Rainfall Incoming',
    message: 'PAGASA data forecasts 74% probability of heavy rain (>25mm) in 3 days. Check drainage systems.',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    read: false,
  },
  {
    alert_id: 'a3',
    farm_id: 'f1',
    severity: 'info',
    type: 'market',
    title: 'Corn Price Up 4.2%',
    message: 'Regional corn price rose to ₱14.20/kg this week — highest in 30 days. Consider accelerating harvest of ready plots.',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    read: true,
  },
  {
    alert_id: 'a4',
    farm_id: 'f2',
    severity: 'info',
    type: 'system',
    title: 'Sensor S4 Battery Low',
    message: 'Soil moisture sensor S4 at Bautista Pineapple Estate is at 12% battery. Replace or recharge within 24 hours.',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    read: true,
  },
  {
    alert_id: 'a5',
    farm_id: 'f1',
    severity: 'success',
    type: 'system',
    title: 'Yield Forecast Updated',
    message: 'CropCast Oracle updated corn yield forecast to 4.2 tons/ha with 82% confidence based on latest soil and weather data.',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    read: true,
  },
];

// ─── DATA SOURCES STATUS ──────────────────────────────────────────────────────
const dataSources = [
  { id: 'ds1', name: 'PAGASA Weather API', type: 'weather', status: 'connected', last_sync: new Date(Date.now() - 15 * 60 * 1000).toISOString(), records_today: 288, icon: 'cloud-sun' },
  { id: 'ds2', name: 'IoT Soil Sensors (5)', type: 'sensor', status: 'connected', last_sync: new Date(Date.now() - 5 * 60 * 1000).toISOString(), records_today: 1440, icon: 'cpu' },
  { id: 'ds3', name: 'DA Region XII Market Feed', type: 'market', status: 'connected', last_sync: new Date(Date.now() - 60 * 60 * 1000).toISOString(), records_today: 24, icon: 'trending-up' },
  { id: 'ds4', name: 'Sentinel-2 Satellite (ESA)', type: 'satellite', status: 'partial', last_sync: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), records_today: 2, icon: 'satellite' },
  { id: 'ds5', name: 'PhilRice Soil DB', type: 'reference', status: 'connected', last_sync: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), records_today: 0, icon: 'database' },
];

// ─── FEEDBACK / SUS ───────────────────────────────────────────────────────────
const susQuestions = [
  { id: 'q1', text: 'I think that I would like to use this system frequently.' },
  { id: 'q2', text: 'I found the system unnecessarily complex.' },
  { id: 'q3', text: 'I thought the system was easy to use.' },
  { id: 'q4', text: 'I think that I would need the support of a technical person to use this system.' },
  { id: 'q5', text: 'I found the various functions in this system were well integrated.' },
  { id: 'q6', text: 'I thought there was too much inconsistency in this system.' },
  { id: 'q7', text: 'I would imagine that most people would learn to use this system very quickly.' },
  { id: 'q8', text: 'I found the system very cumbersome to use.' },
  { id: 'q9', text: 'I felt very confident using the system.' },
  { id: 'q10', text: 'I needed to learn a lot of things before I could get going with this system.' },
];

const feedbackResponses = [];

module.exports = {
  users,
  farms,
  sensors,
  weatherSeries,
  soilSeriesFarm1,
  soilSeriesFarm2,
  marketSeries,
  forecasts,
  recommendations,
  alerts,
  dataSources,
  susQuestions,
  feedbackResponses,
  DAYS,
};
