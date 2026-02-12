const express = require('express');
const Database = require('better-sqlite3');
const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const app = express();
const port = 8888;

// Read env
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envLines = envContent.split('\n');
const env = {};
envLines.forEach(line => {
  if (line.includes('=')) {
    const [key, ...val] = line.split('=');
    env[key.trim()] = val.join('=').trim();
  }
});
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// EPC DB
const epcDbPath = '/Users/eranhertz/Developer/evolving-home/data/epc.db';
const db = new Database(epcDbPath, { readonly: true });

app.use(express.static('public'));

// Helper for timed fetch
async function timedFetch(url, timeout = 2000) {
  const start = Date.now();
  try {
    const res = await fetch(url, { timeout });
    const time = Date.now() - start;
    return { status: res.status, time };
  } catch (e) {
    return { status: 'error', error: e.message, time: Date.now() - start };
  }
}

// API endpoints
app.get('/api/overview', async (req, res) => {
  try {
    // EPC Records
    const epcCount = db.prepare('SELECT COUNT(*) as count FROM certificates').get().count;

    // Waitlist Signups (total + recent 7 days)
    let waitlistTotal = 'Service key needed';
    let recentSignups = [];
    if (env.SUPABASE_SERVICE_ROLE_KEY) {
      const { data: total } = await supabase.from('waitlist').select('id', { count: 'exact' });
      waitlistTotal = total.length;
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const { data: recent } = await supabase.from('waitlist').select('email, country, created_at').gte('created_at', sevenDaysAgo.toISOString()).order('created_at', { ascending: false });
      recentSignups = recent.slice(0, 10);
    }

    // Research Docs
    const researchPath = '/Users/eranhertz/.openclaw/workspace/projects/active-home/research/';
    const researchCount = execSync(`find "${researchPath}" -type f | wc -l`, { encoding: 'utf8' }).trim();

    // Domain Status
    const domainRes = await timedFetch('https://evolvinghome.ai');
    const domainStatus = domainRes.status === 200 ? '🟢 Online' : `🔴 ${domainRes.status}`;

    // Git Status
    const gitLogs = execSync('git -C /Users/eranhertz/Developer/evolving-home log --oneline -5', { encoding: 'utf8' }).trim().split('\n');

    res.json({
      epcRecords: epcCount,
      waitlistSignups: { total: waitlistTotal, recent: recentSignups },
      researchDocs: parseInt(researchCount),
      domainStatus,
      gitStatus: gitLogs
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/health', async (req, res) => {
  const checks = {};
  // EPC DB
  try {
    db.prepare("SELECT * FROM certificates WHERE postcode = 'SW1A 1AA' LIMIT 1").get();
    checks.epcDatabase = '🟢 Online';
  } catch (e) {
    checks.epcDatabase = `🔴 Down: ${e.message}`;
  }
  // Octopus Energy
  const octo = await timedFetch('https://api.octopus.energy/v1/products/');
  checks.octopusEnergy = octo.status === 200 ? '🟢 Online' : (octo.time > 2000 ? '🟡 Slow' : '🔴 Down');
  // PVGIS
  const pvgis = await timedFetch('https://re.jrc.ec.europa.eu/api/v5_3/PVcalc?lat=51.5&lon=-0.1&peakpower=1&loss=14&outputformat=json');
  checks.pvgisApi = pvgis.status === 200 ? '🟢 Online' : (pvgis.time > 2000 ? '🟡 Slow' : '🔴 Down');
  // Supabase
  try {
    await supabase.from('waitlist').select('id').limit(1);
    checks.supabase = '🟢 Online';
  } catch (e) {
    checks.supabase = `🔴 Down: ${e.message}`;
  }
  // Cloudflare Pages (evolvinghome.ai)
  const cf = await timedFetch('https://evolvinghome.ai');
  checks.cloudflarePages = cf.status === 200 ? '🟢 Online' : (cf.time > 2000 ? '🟡 Slow' : '🔴 Down');
  // Overpass API (OSM)
  const overpass = await timedFetch('https://overpass-api.de/api/status');
  checks.overpassApi = overpass.status === 200 ? '🟢 Online' : (overpass.time > 2000 ? '🟡 Slow' : '🔴 Down');

  res.json(checks);
});

app.get('/api/waitlist', async (req, res) => {
  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    return res.json({ error: 'Service key needed for waitlist data' });
  }
  try {
    const { data: all } = await supabase.from('waitlist').select('email, country, created_at');
    const total = all.length;
    const byCountry = {};
    all.forEach(row => {
      byCountry[row.country] = (byCountry[row.country] || 0) + 1;
    });
    const recent = all.slice(-10);
    const dailyTrend = {};
    all.forEach(row => {
      const date = new Date(row.created_at).toISOString().split('T')[0];
      dailyTrend[date] = (dailyTrend[date] || 0) + 1;
    });
    const last7 = Object.entries(dailyTrend).sort((a,b)=>a[0].localeCompare(b[0])).slice(-7);
    res.json({ total, byCountry, recent, dailyTrend: last7 });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/epc-stats', (req, res) => {
  try {
    const total = db.prepare('SELECT COUNT(*) as count FROM certificates').get().count;
    const byRating = {};
    const ratings = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
    ratings.forEach(r => {
      const count = db.prepare('SELECT COUNT(*) as count FROM certificates WHERE current_energy_rating = ?').get(r).count;
      byRating[r] = count;
    });
    const byRegion = db.prepare('SELECT local_authority, COUNT(*) as count FROM certificates GROUP BY local_authority ORDER BY count DESC LIMIT 10').all();
    res.json({ total, byRating, byRegion });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/pipeline', (req, res) => {
  const status = {};
  // UK EPC
  status.ukEpc = '✅ 17.7M records';
  // France DPE
  const francePath = '/Users/eranhertz/Developer/evolving-home/data/france/dpe_logement_202103.sql';
  if (fs.existsSync(francePath)) {
    const size = fs.statSync(francePath).size;
    status.franceDpe = `${(size / 1024 / 1024 / 1024).toFixed(2)} GB`;
  } else {
    status.franceDpe = 'Not found';
  }
  // US RECS
  const usPath = '/Users/eranhertz/Developer/evolving-home/data/us/recs2020_public_v7.csv';
  if (fs.existsSync(usPath)) {
    const size = fs.statSync(usPath).size;
    status.usRecs = `${(size / 1024 / 1024 / 1024).toFixed(2)} GB`;
  } else {
    status.usRecs = 'Not found';
  }
  // Netherlands
  status.netherlands = '⏳ Waiting for API key';
  // OSM Building Geometry
  status.osmBuildingGeometry = '✅ Built, testing';
  // France DPE import
  status.franceDpeImport = '✅ Data imported';
  // Netherlands EP-Online
  status.netherlandsEpOnline = '⏳ Waiting for API access';
  // Share card mockups
  status.shareCardMockups = '✅ Completed';
  // A/B test
  status.abTest = '✅ Live on landing page';
  res.json(status);
});

app.get('/api/codebase', (req, res) => {
  try {
    const files = execSync('find src -name \'*.ts\' -o -name \'*.tsx\' | wc -l', { cwd: path.join(__dirname, '..'), encoding: 'utf8' }).trim();
    const lines = execSync('find src -name \'*.ts\' -o -name \'*.tsx\' | xargs wc -l | tail -1 | awk \'{print $1}\'', { cwd: path.join(__dirname, '..'), encoding: 'utf8' }).trim();
    const lastModified = execSync('find src -name \'*.ts\' -o -name \'*.tsx\' -printf \'%T@ %p\n\' | sort -n | tail -5 | cut -d\' \' -f2-', { cwd: path.join(__dirname, '..'), encoding: 'utf8' }).trim().split('\n');
    res.json({ files: parseInt(files), lines: parseInt(lines), lastModified });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/checklist', (req, res) => {
  const checklist = {
    'Domain registered (evolvinghome.ai)': true,
    'Next.js scaffolded': true,
    '17.7M EPC records in SQLite': true,
    'EPC API route handler': true,
    'Landing page live': true,
    'Waitlist on Supabase': true,
    'Geo-adaptive content': true,
    'OpenBEM integration': true,
    'Octopus Energy integration': true,
    'PVGIS/PVWatts integration': true,
    'Wire integrations into score page': false,
    'OSM Building Geometry integration': true,
    'France DPE import': true,
    'Netherlands EP-Online import': false,
    'Share card component': true,
    'A/B test on landing page': true,
    'Supabase Auth (SSO)': false,
    'Production DB solution': false,
    'Deploy full app': false
  };
  res.json(checklist);
});

app.get('/api/building-intelligence', (req, res) => {
  const capabilities = {
    osmBuildingGeometry: '✅ Built, testing',
    description: 'Integrates OpenStreetMap data for building geometries, enabling accurate energy modeling and visualization.',
    features: ['Building footprint extraction', 'Height estimation', 'Material inference', 'Integration with EPC data']
  };
  res.json(capabilities);
});

app.listen(port, () => {
  console.log(`Dashboard server running on port ${port}`);
});