const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { weatherSeries, soilSeriesFarm1, soilSeriesFarm2, marketSeries } = require('../data/mockData');

const router = express.Router();

// GET /api/pulse/descriptive — descriptive analytics
router.get('/descriptive', authMiddleware, (req, res) => {
  const farmId = req.query.farm_id || 'f1';
  const soilSeries = farmId === 'f2' ? soilSeriesFarm2 : soilSeriesFarm1;
  const latest = soilSeries[soilSeries.length - 1];
  const latestWeather = weatherSeries[weatherSeries.length - 1];

  const avgTemp = (weatherSeries.reduce((s, d) => s + d.temperature, 0) / weatherSeries.length).toFixed(1);
  const totalRain = weatherSeries.reduce((s, d) => s + d.rainfall_mm, 0).toFixed(1);
  const avgMoisture = (soilSeries.reduce((s, d) => s + d.moisture, 0) / soilSeries.length).toFixed(1);

  res.json({
    farm_id: farmId,
    summary: {
      avg_temperature_30d: parseFloat(avgTemp),
      total_rainfall_30d_mm: parseFloat(totalRain),
      avg_soil_moisture_30d: parseFloat(avgMoisture),
      current_npk: { N: latest.nitrogen, P: latest.phosphorus, K: latest.potassium },
      current_ph: latest.ph,
      data_points_analyzed: weatherSeries.length * 3 + soilSeries.length,
    },
    weather_series: weatherSeries,
    soil_series: soilSeries,
    market_series: marketSeries,
    latest_weather: latestWeather,
    latest_soil: latest,
  });
});

// GET /api/pulse/compare — multi-farm comparison for Expert
router.get('/compare', authMiddleware, (req, res) => {
  const comparison = weatherSeries.slice(-14).map((w, idx) => {
    const s1 = soilSeriesFarm1[soilSeriesFarm1.length - 14 + idx] || {};
    const s2 = soilSeriesFarm2[soilSeriesFarm2.length - 14 + idx] || {};
    return {
      date: w.date,
      farm1_moisture: s1.moisture || 55,
      farm2_moisture: s2.moisture || 52,
      farm1_ph: s1.ph || 6.2,
      farm2_ph: s2.ph || 6.5,
      farm1_nitrogen: s1.nitrogen || 35,
      farm2_nitrogen: s2.nitrogen || 42,
      tupi_regional_baseline_moisture: 58.0,
      temperature: w.temperature,
      rainfall: w.rainfall_mm,
    };
  });

  res.json({
    farms: [
      { farm_id: 'f1', name: 'Dela Cruz Cornfield', owner: 'Juan Dela Cruz', crop: 'Corn', soil_type: 'Clay Loam' },
      { farm_id: 'f2', name: 'Bautista Pineapple Estate', owner: 'Maria Bautista', crop: 'Pineapple', soil_type: 'Sandy Loam' },
    ],
    timeline: comparison,
    benchmarks: {
      tupi_corn_optimal_ph: '6.0 - 6.8',
      tupi_pineapple_optimal_ph: '4.5 - 5.5',
      regional_avg_rainfall_mm: 142.5,
    },
  });
});

module.exports = router;
