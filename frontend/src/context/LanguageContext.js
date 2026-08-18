'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const dictionary = {
  en: {
    // Topbar & Nav
    location: 'Tupi, South Cotabato',
    switch_language: 'Switch to Tagalog',
    farmer_view: '🌽 FARMER VIEW',
    expert_view: '🔬 AGRI EXPERT VIEW',
    admin_view: '⚙️ ADMIN CONTROL',
    farmer_role: 'Farmer',
    expert_role: 'Agri Expert',
    admin_role: 'System Admin',
    sign_out: 'Sign Out',
    section_main: 'Main Overview',
    section_modules: 'Farm Intelligence Modules',
    section_manage: 'Management & Audits',

    // Nav Items
    nav_overview: 'My Farm Overview',
    nav_nexus: 'Sensor Connectivity',
    nav_pulse: 'Soil & Weather Diagnostics',
    nav_oracle: 'Crop & Pest Forecasts',
    nav_strategist: 'Prescriptive Actions',
    nav_conduit: 'Alerts & Messages',
    nav_farm: 'Farm Plot Profile',
    nav_farmers: 'Farmer Directory',
    nav_feedback: 'SUS Usability Survey',

    // Overview Page
    overview_title: 'My Farm Overview',
    overview_subtitle: 'Status and Summary for Dela Cruz Cornfield, Tupi, South Cotabato',
    current_temp: 'Current Temp',
    rainfall_30d: '30-Day Rainfall',
    soil_moisture: 'Soil Moisture',
    yield_forecast: 'Yield Forecast',
    pest_risk: 'Pest Risk',
    pending_actions: 'Pending Actions',
    confidence: 'confidence',
    moderate_high: 'Moderate-High',
    urgent: 'urgent',
    temp_trend_14d: 'Temperature — 14 Days',
    yield_trend_14d: 'Yield Forecast — 14 Days',
    recent_alerts: 'Recent Alerts',
    priority_action: 'Priority Action',
    view_all: 'View All',
    all_recs: 'All Recommendations',

    // AgriVision Pulse
    pulse_title: 'Soil & Weather Diagnostics',
    pulse_subtitle: 'Real-time multi-modal telemetry and environmental logs for Tupi pilot farms',
    soil_sensors: 'Soil Sensors Status',
    npk_status: 'NPK Nutrient Balance',
    pagasa_weather: 'PAGASA Doppler Weather Feed',
    market_prices: 'DA Region XII Commodity Prices',

    // CropCast Oracle
    oracle_title: 'Crop Yield & Pest Outbreak Forecasts',
    oracle_subtitle: 'Machine learning predictive models and risk projections for pilot crops',
    ml_confidence: 'Model Confidence Score',
    what_if_sim: 'Run What-If Weather Simulation',

    // OptiFarm Strategist
    strategist_title: 'Prescriptive Action Plans',
    strategist_subtitle: 'Data-driven agronomic recommendations to maximize crop productivity',
    accept_plan: 'Accept Plan',
    decline_plan: 'Decline',
    mark_completed: 'Mark Completed',
    estimated_cost: 'Est. Cost',
    expected_benefit: 'Expected Benefit',

    // MultiSense Conduit
    conduit_title: 'Farm Advisories & Multi-Modal Alerts',
    conduit_subtitle: 'Multi-modal broadcasting via Visual, Voice Audio, and SMS alerts',
    play_audio: 'Listen to Voice Audio Report',
    speaking: 'Speaking Audio...',
    filter_all: 'All Alerts',
    filter_critical: 'Critical Only',

    // SUS Feedback
    sus_title: 'System Usability Scale (SUS) Evaluation',
    sus_subtitle: 'Standardized usability survey to assess farmer and expert user experience',
    submit_sus: 'Submit SUS Evaluation',
  },

  tl: {
    // Topbar & Nav
    location: 'Tupi, Timog Cotabato',
    switch_language: 'Lumipat sa English',
    farmer_view: '🌽 TINGIN NG MAGSASAKA',
    expert_view: '🔬 TINGIN NG EKSPERTO',
    admin_view: '⚙️ KONTROL NG ADMIN',
    farmer_role: 'Magsasaka',
    expert_role: 'Eksperto sa Agrikultura',
    admin_role: 'Tagapangasiwa ng Sistema',
    sign_out: 'Mag-logout',
    section_main: 'Pangunahin',
    section_modules: 'Mga Modyul ng Bukid',
    section_manage: 'Pamamahala at Pagsusuri',

    // Nav Items
    nav_overview: 'Aking Bukid (Overview)',
    nav_nexus: 'Koneksyon sa Sensors',
    nav_pulse: 'Kalagayan ng Lupa & Ulan',
    nav_oracle: 'Pagtantiya sa Ani & Peste',
    nav_strategist: 'Mga Payo at Hakbang',
    nav_conduit: 'Mga Alerto at Mensahe',
    nav_farm: 'Profile ng Aking Lupa',
    nav_farmers: 'Direktoryo ng Magsasaka',
    nav_feedback: 'Pagsusuri / Feedback (SUS)',

    // Overview Page
    overview_title: 'Aking Bukid (Overview)',
    overview_subtitle: 'Katayuan at Buod ng Dela Cruz Cornfield, Tupi, Timog Cotabato',
    current_temp: 'Kasalukuyang Init',
    rainfall_30d: 'Ulan sa 30 Araw',
    soil_moisture: 'Basa ng Lupa',
    yield_forecast: 'Tantiya sa Ani',
    pest_risk: 'Banta ng Peste',
    pending_actions: 'Mga Hakbang na Gagawin',
    confidence: 'kumpiyansa',
    moderate_high: 'Katamtaman-Mataas',
    urgent: 'kagyat',
    temp_trend_14d: 'Temperatura sa Nakaraang 14 Araw',
    yield_trend_14d: 'Pagtantiya sa Ani sa 14 Araw',
    recent_alerts: 'Mga Bagong Alerto',
    priority_action: 'Pangunahing Hakbang',
    view_all: 'Tingnan Lahat',
    all_recs: 'Lahat ng Payo',

    // AgriVision Pulse
    pulse_title: 'Kalagayan ng Lupa & Ulan',
    pulse_subtitle: 'Real-time telemetry at tala ng panahon sa mga pilot farm sa Tupi',
    soil_sensors: 'Katayuan ng Soil Sensors',
    npk_status: 'Balanse ng Sustansya (NPK)',
    pagasa_weather: 'PAGASA Doppler Weather Feed',
    market_prices: 'DA Region XII Presyo sa Palengke',

    // CropCast Oracle
    oracle_title: 'Pagtantiya sa Ani & Peste',
    oracle_subtitle: 'Machine learning predictive models at pagsusuri ng panganib sa tanim',
    ml_confidence: 'Marka ng Kumpiyansa ng Modelo',
    what_if_sim: 'Magpatakbo ng What-If Simulation',

    // OptiFarm Strategist
    strategist_title: 'Mga Payo at Hakbang sa Bukid',
    strategist_subtitle: 'Matalinong payo sa pagpapataba, patubig, at pagsugpo sa peste',
    accept_plan: 'Tanggapin ang Plano',
    decline_plan: 'Tanggihan',
    mark_completed: 'Markahan Bilang Tapos',
    estimated_cost: 'Tantiyang Gastos',
    expected_benefit: 'Inaasahang Pakinabang',

    // MultiSense Conduit
    conduit_title: 'Mga Alerto at Mensahe sa Bukid',
    conduit_subtitle: 'Multi-modal na paghahatid ng balita sa Visual, Boses, at SMS',
    play_audio: 'Pakinggan ang Audio Report',
    speaking: 'Nagsasalita ang Boses...',
    filter_all: 'Lahat ng Alerto',
    filter_critical: 'Kritikal Lamang',

    // SUS Feedback
    sus_title: 'Pagsusuri ng Sistema (SUS Usability Scale)',
    sus_subtitle: 'Pamantayang sarbey para sukatin ang dali ng paggamit ng mga magsasaka',
    submit_sus: 'Isumite ang Pagsusuri',
  },
};

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState('tl');

  useEffect(() => {
    const saved = localStorage.getItem('agri_lang');
    if (saved && (saved === 'en' || saved === 'tl')) {
      setLangState(saved);
    }
  }, []);

  function setLang(newLang) {
    setLangState(newLang);
    localStorage.setItem('agri_lang', newLang);
  }

  function toggleLang() {
    const next = lang === 'tl' ? 'en' : 'tl';
    setLang(next);
  }

  function t(key, fallback = '') {
    return dictionary[lang]?.[key] || dictionary.tl?.[key] || fallback || key;
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    return {
      lang: 'tl',
      setLang: () => {},
      toggleLang: () => {},
      t: (k) => dictionary.tl[k] || k,
    };
  }
  return ctx;
}
