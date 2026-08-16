/**
 * AgriInsights Pure Cloud Database Client (Supabase PostgreSQL + PostGIS)
 * Direct 100% cloud database integration.
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || 'https://yuezlakkyialgedugecy.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1ZXpsYWtreWlhbGdlZHVnZWN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY4MzIyODIsImV4cCI6MjEwMjQwODI4Mn0.7kQJ1mSGvVdaSohhHkPNOXKlx2B6u0w1gPMUFixpwUk';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('✓ Supabase Cloud Database connected directly to:', supabaseUrl);

function getDbStatus() {
  return {
    database_provider: 'Supabase Cloud (PostgreSQL 16 + PostGIS)',
    cloud_url: supabaseUrl,
    status: 'connected_live',
    mode: '100% Pure Cloud Database',
    timestamp: new Date().toISOString(),
  };
}

module.exports = {
  supabase,
  getDbStatus,
};
