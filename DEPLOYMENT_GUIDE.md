# AgriInsights — Hybrid Database & Public Cloud Deployment Manual

**Project:** AgriInsights: Integrating Multi-Modal Analytics for Data-Driven Farmer Assistance  
**Institution:** South East Asian Institute of Technology, Inc. (SEAIT) · College of ICT · IT ELEC 4

---

## 🏛️ Part 1: Hybrid Database Architecture (Offline SQLite3 + Cloud Supabase)

### Why this architecture is ideal for Tupi, South Cotabato:
In agricultural areas with intermittent or zero cellular connectivity, AgriInsights uses an **Offline-First Edge-to-Cloud Sync pattern**:

```
┌─────────────────────────────────────────────────────────┐
│                 OFFLINE / SA BUKID                      │
│                                                         │
│   [IoT Sensors / Local Node]                            │
│              │                                          │
│              ▼                                          │
│   [SQLite3 Embedded Database]                           │
│   File: backend/data/agriinsights.db                    │
│   (Zero setup, works with NO internet)                  │
└────────────────────────────┬────────────────────────────┘
                             │
                  Kapag may Internet Signal
               (Auto-Sync / Trigger Push API)
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│                 ONLINE / CLOUD                          │
│                                                         │
│   [Supabase PostgreSQL + PostGIS Cloud Database]        │
│   (Shared Data Warehouse for Experts, Panelists & Web)  │
└─────────────────────────────────────────────────────────┘
```

### 1. Initializing Supabase Cloud Database (1-Click SQL Script)
1. Mag-register o mag-login sa **[supabase.com](https://supabase.com)** (Libre).
2. Mag-create ng bagong project (piliin ang region: *Singapore*).
3. Sa kaliwang menu ng Supabase, pumunta sa **SQL Editor** (`New Query`).
4. Buksan ang file na: `backend/supabase_schema.sql`.
5. I-copy lahat ng laman ng `supabase_schema.sql`, i-paste sa Supabase SQL Editor, at i-click ang **RUN**.
6. Awtomatikong malilikha ang lahat ng 10 tables (`users`, `farms`, `sensors`, `sensor_readings`, `weather_records`, `forecasts`, `recommendations`, `alerts`, `feedback_sus`, `sync_queue`) kasama ang seed data!

### 2. Pag-connect ng Backend sa Supabase
Kunin ang iyong credentials mula sa Supabase (`Project Settings -> API`):
- `Project URL` (e.g. `https://xyzproject.supabase.co`)
- `anon public key` (e.g. `eyJhbGciOi...`)

Ilagay ang mga ito sa iyong `backend/.env` file:
```env
PORT=5000
JWT_SECRET=agriinsights_super_secret_jwt_key_2026_seait
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key-here
```

---

## 🚀 Part 2: Public Production Deployment (Zero-Cost Free Tier)

Para maging live sa internet at ma-access ng publiko at panelists sa kanilang cellphone o browser:

### Step 1: I-push ang Proyekto sa GitHub
Naka-initialize na ang Git repository sa iyong local folder. Patakbuhin lamang ang sumusunod sa terminal:

```bash
# 1. Gumawa ng bagong repository sa github.com (hal. "agriinsights")
# 2. I-link at i-push:
git remote add origin https://github.com/YOUR_USERNAME/agriinsights.git
git branch -M main
git push -u origin main
```

---

### Step 2: I-Deploy ang Backend API sa Render.com
1. Pumunta sa **[render.com](https://render.com)** at mag-sign in gamit ang GitHub.
2. Piliin ang **"New -> Web Service"** at piliin ang iyong `agriinsights` repository.
3. Ilagay ang sumusunod na settings:
   - **Name:** `agriinsights-api`
   - **Root Directory:** `backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
4. Sa **Environment Variables**:
   - `PORT` = `5000`
   - `JWT_SECRET` = `agriinsights_super_secret_jwt_key_2026_seait`
   - `SUPABASE_URL` = *(iyong Supabase URL)*
   - `SUPABASE_KEY` = *(iyong Supabase Key)*
5. I-click ang **"Create Web Service"**.
6. Makukuha mo ang iyong Live Backend URL, halimbawa:  
   👉 **`https://agriinsights-api.onrender.com`**

---

### Step 3: I-Deploy ang Frontend sa Vercel (1-Click Deploy)
1. Pumunta sa **[vercel.com](https://vercel.com)** at mag-login gamit ang GitHub.
2. I-click ang **"Add New Project"** at piliin ang `agriinsights` repository.
3. Sa project configuration:
   - **Framework Preset:** `Next.js`
   - **Root Directory:** I-click ang Edit at piliin ang `frontend`
4. Sa **Environment Variables**:
   - `NEXT_PUBLIC_API_URL` = `https://agriinsights-api.onrender.com` *(iyong live backend URL mula sa Step 2)*
5. I-click ang **"Deploy"**!

Sa loob ng 1–2 minuto, bibigyan ka ng Vercel ng pampublikong URL tulad ng:  
👉 **`https://agriinsights.vercel.app`** *(Accessible sa kahit anong device saan mang sulok ng mundo!)*

---

## 🛠️ Summary of Created Files

| File | Purpose |
|---|---|
| `backend/supabase_schema.sql` | 1-Click PostgreSQL + PostGIS schema para sa Supabase Cloud |
| `backend/src/db/sqlite.js` | Local embedded SQLite3 offline database at WAL manager |
| `backend/src/db/supabase.js` | Supabase Cloud Client at Offline-to-Cloud sync queue gateway |
| `backend/src/routes/sync.js` | REST API endpoints para sa `/api/sync/status` at `/api/sync/trigger` |
| `render.yaml` | Render Blueprint configuration para sa automated backend deployment |
| `frontend/vercel.json` | Vercel production build configuration |
| `.gitignore` | Git ignore configuration na pumipigil sa pag-upload ng secret keys o local `.db` files |
