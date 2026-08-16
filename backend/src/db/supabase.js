/**
 * AgriInsights Cloud Supabase Client & 2-Way Sync Engine
 * Enables bi-directional data flow:
 * 1. PUSH: Local SQLite3 changes -> Supabase Cloud
 * 2. PULL: Supabase Cloud updates -> Local SQLite3
 */

const { createClient } = require('@supabase/supabase-js');
const { db, getPendingSyncQueue, markQueueSynced, getPendingSyncCount } = require('./sqlite');

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';

let supabase = null;
let isCloudConfigured = false;

if (supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project')) {
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
 * 1. PUSH: Uploads pending local SQLite3 records to Supabase Cloud
 */
async function pushLocalToCloud() {
  const pendingCount = getPendingSyncCount();
  if (!isCloudConfigured || !supabase) {
    return { success: true, pushed: 0, pending: pendingCount, mode: 'local_offline' };
  }

  const queue = getPendingSyncQueue();
  let pushed = 0;

  for (const item of queue) {
    try {
      const payload = JSON.parse(item.payload_json);
      const { data, error } = await supabase.from(item.table_name).upsert(payload);
      if (!error) {
        markQueueSynced(item.queue_id);
        pushed++;
      } else {
        console.error(`Push sync error on ${item.table_name}:`, error.message);
      }
    } catch (e) {
      console.error('Queue parse error:', e.message);
    }
  }

  return { success: true, pushed, pending: getPendingSyncCount() };
}

/**
 * 2. PULL: Downloads latest cloud records from Supabase into local SQLite3
 */
async function pullCloudToLocal() {
  if (!isCloudConfigured || !supabase) {
    return { success: true, pulled: 0, mode: 'local_offline' };
  }

  let pulledCount = 0;

  try {
    // Pull Users
    const { data: users } = await supabase.from('users').select('*');
    if (users?.length) {
      const stmt = db.prepare(`
        INSERT INTO users (user_id, name, username, role, contact, preferred_language, location, avatar_initials)
        VALUES (@user_id, @name, @username, @role, @contact, @preferred_language, @location, @avatar_initials)
        ON CONFLICT(user_id) DO UPDATE SET
          name = excluded.name,
          contact = excluded.contact,
          preferred_language = excluded.preferred_language,
          location = excluded.location
      `);
      for (const u of users) { stmt.run(u); pulledCount++; }
    }

    // Pull Farms
    const { data: farms } = await supabase.from('farms').select('*');
    if (farms?.length) {
      const stmt = db.prepare(`
        INSERT INTO farms (farm_id, owner_id, name, barangay, municipality, province, latitude, longitude, size_hectares, soil_type, status)
        VALUES (@farm_id, @owner_id, @name, @barangay, @municipality, @province, @latitude, @longitude, @size_hectares, @soil_type, @status)
        ON CONFLICT(farm_id) DO UPDATE SET
          name = excluded.name,
          soil_type = excluded.soil_type,
          status = excluded.status
      `);
      for (const f of farms) { stmt.run(f); pulledCount++; }
    }

    // Pull Recommendations
    const { data: recs } = await supabase.from('recommendations').select('*');
    if (recs?.length) {
      const stmt = db.prepare(`
        INSERT INTO recommendations (rec_id, farm_id, category, priority, title, description, estimated_cost_php, expected_benefit, status, created_by)
        VALUES (@rec_id, @farm_id, @category, @priority, @title, @description, @estimated_cost_php, @expected_benefit, @status, @created_by)
        ON CONFLICT(rec_id) DO UPDATE SET
          status = excluded.status,
          title = excluded.title,
          description = excluded.description
      `);
      for (const r of recs) { stmt.run(r); pulledCount++; }
    }

    // Pull Alerts
    const { data: alerts } = await supabase.from('alerts').select('*');
    if (alerts?.length) {
      const stmt = db.prepare(`
        INSERT INTO alerts (alert_id, farm_id, severity, type, title, message, is_read)
        VALUES (@alert_id, @farm_id, @severity, @type, @title, @message, @is_read)
        ON CONFLICT(alert_id) DO UPDATE SET
          is_read = excluded.is_read
      `);
      for (const a of alerts) {
        stmt.run({ ...a, is_read: a.is_read ? 1 : 0 });
        pulledCount++;
      }
    }
  } catch (err) {
    console.error('Pull sync error:', err.message);
  }

  return { success: true, pulled: pulledCount };
}

/**
 * 3. TWO-WAY SYNC: Full bi-directional sync (Push local changes + Pull cloud updates)
 */
async function twoWaySync() {
  const pushRes = await pushLocalToCloud();
  const pullRes = await pullCloudToLocal();

  return {
    success: true,
    mode: isCloudConfigured ? 'cloud_supabase_hybrid' : 'local_sqlite_offline',
    pushed_records: pushRes.pushed,
    pulled_records: pullRes.pulled,
    remaining_pending: getPendingSyncCount(),
    synced_at: new Date().toISOString(),
    message: isCloudConfigured
      ? `Two-Way Sync complete: Pushed ${pushRes.pushed} records to Supabase, Pulled ${pullRes.pulled} records to local SQLite3.`
      : 'Operating in Local SQLite3 Mode. Configure SUPABASE_URL to sync with Cloud.',
  };
}

function getSyncStatus() {
  return {
    is_cloud_connected: isCloudConfigured,
    cloud_provider: 'Supabase (PostgreSQL + PostGIS)',
    cloud_url: isCloudConfigured ? supabaseUrl.replace(/(https:\/\/)([^.]+)(.*)/, '$1$2***$3') : 'Not Configured',
    offline_database: 'SQLite3 (Embedded WAL)',
    database_file: 'backend/data/agriinsights.db',
    pending_sync_queue: getPendingSyncCount(),
    sync_mode: isCloudConfigured ? 'Hybrid 2-Way Sync (Cloud ⇄ Local)' : 'Local Offline-First Mode',
    last_checked: new Date().toISOString(),
  };
}

module.exports = {
  supabase,
  isCloudConfigured,
  pushLocalToCloud,
  pullCloudToLocal,
  twoWaySync,
  getSyncStatus,
};
