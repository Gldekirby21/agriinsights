/**
 * AgriInsights Cloud Supabase Client & Sync Gateway
 * Connects to Supabase PostgreSQL in the cloud and synchronizes offline SQLite records
 */

const { createClient } = require('@supabase/supabase-js');
const { getPendingSyncQueue, markQueueSynced, getPendingSyncCount } = require('./sqlite');

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';

let supabase = null;
let isCloudConfigured = false;

if (supabaseUrl && supabaseKey && supabaseUrl !== 'https://your-project.supabase.co') {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    isCloudConfigured = true;
    console.log('✓ Supabase Cloud Client connected to:', supabaseUrl);
  } catch (err) {
    console.warn('⚠️ Supabase connection warning:', err.message);
  }
} else {
  console.log('ℹ️ Supabase not configured in .env. Operating in Local Offline-First Mode (SQLite3).');
}

/**
 * Synchronize pending SQLite queue to Supabase Cloud
 */
async function syncOfflineQueueToSupabase() {
  const pendingCount = getPendingSyncCount();

  if (!isCloudConfigured || !supabase) {
    return {
      success: true,
      mode: 'offline_local_simulated',
      message: 'Operating in Local SQLite3 Mode. Add SUPABASE_URL and SUPABASE_KEY in .env to enable Cloud Sync.',
      pending_records: pendingCount,
      synced_records: 0,
      timestamp: new Date().toISOString(),
    };
  }

  const queue = getPendingSyncQueue();
  let synced = 0;

  for (const item of queue) {
    try {
      const payload = JSON.parse(item.payload_json);
      const { data, error } = await supabase.from(item.table_name).upsert(payload);
      if (!error) {
        markQueueSynced(item.queue_id);
        synced++;
      } else {
        console.error(`Sync error on ${item.table_name}:`, error.message);
      }
    } catch (e) {
      console.error('Queue parse error:', e.message);
    }
  }

  return {
    success: true,
    mode: 'cloud_supabase_synced',
    message: `Successfully synchronized ${synced} records to Supabase Cloud.`,
    synced_records: synced,
    remaining_pending: getPendingSyncCount(),
    timestamp: new Date().toISOString(),
  };
}

function getSyncStatus() {
  return {
    is_cloud_connected: isCloudConfigured,
    cloud_provider: 'Supabase (PostgreSQL + PostGIS)',
    offline_database: 'SQLite3 (Embedded WAL)',
    database_file: 'backend/data/agriinsights.db',
    pending_sync_queue: getPendingSyncCount(),
    sync_mode: isCloudConfigured ? 'Hybrid Cloud + Edge Offline' : 'Local Offline-First Mode',
    last_checked: new Date().toISOString(),
  };
}

module.exports = {
  supabase,
  isCloudConfigured,
  syncOfflineQueueToSupabase,
  getSyncStatus,
};
