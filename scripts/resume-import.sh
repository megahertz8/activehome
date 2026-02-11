#!/bin/bash
# Resume EPC import from directory 84 onward
cd /Users/eranhertz/Developer/evolving-home

node -e "
const Database = require('better-sqlite3');
const { createReadStream, readdirSync, statSync, existsSync } = require('fs');
const { createInterface } = require('readline');
const { join } = require('path');

const rawDir = 'data/raw';
const db = new Database('data/epc.db');
db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');
db.pragma('cache_size = -1000000');

const insert = db.prepare(\`INSERT OR IGNORE INTO certificates VALUES (
  @lmk_key, @address, @postcode,
  @current_energy_rating, @potential_energy_rating,
  @current_energy_efficiency, @potential_energy_efficiency,
  @property_type, @built_form, @total_floor_area,
  @energy_consumption_current, @co2_emissions_current,
  @heating_cost_current, @hot_water_cost_current, @lighting_cost_current,
  @heating_cost_potential, @hot_water_cost_potential, @lighting_cost_potential,
  @walls_description, @roof_description, @floor_description,
  @windows_description, @mainheat_description, @main_fuel,
  @lodgement_date, @constituency, @local_authority
)\`);

const insertMany = db.transaction((rows) => { for (const r of rows) insert.run(r); });

const dirs = readdirSync(rawDir)
  .filter(d => statSync(join(rawDir, d)).isDirectory() && existsSync(join(rawDir, d, 'certificates.csv')))
  .sort();

// Skip already imported (first 83)
const startIdx = 83;
console.log('Resuming from directory', startIdx + 1, 'of', dirs.length);

function parseCsvLine(line) {
  const result = []; let current = ''; let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '\"') inQ = !inQ;
    else if (ch === ',' && !inQ) { result.push(current); current = ''; }
    else current += ch;
  }
  result.push(current);
  return result;
}

async function processFile(csvPath) {
  return new Promise((resolve) => {
    let headers = [], headerMap = {}, batch = [], count = 0;
    const rl = createInterface({ input: createReadStream(csvPath, {encoding:'utf-8'}), crlfDelay: Infinity });
    rl.on('line', (line) => {
      if (!headers.length) { headers = parseCsvLine(line).map(h=>h.replace(/^\"|\"$/g,'')); headers.forEach((h,i)=>(headerMap[h]=i)); return; }
      const cols = parseCsvLine(line);
      const get = (key) => (cols[headerMap[key]]||'').replace(/^\"|\"$/g,'');
      const addr = [get('ADDRESS1'),get('ADDRESS2'),get('ADDRESS3')].filter(Boolean).join(', ');
      batch.push({
        lmk_key:get('LMK_KEY'), address:addr, postcode:get('POSTCODE'),
        current_energy_rating:get('CURRENT_ENERGY_RATING'), potential_energy_rating:get('POTENTIAL_ENERGY_RATING'),
        current_energy_efficiency:Number(get('CURRENT_ENERGY_EFFICIENCY'))||0, potential_energy_efficiency:Number(get('POTENTIAL_ENERGY_EFFICIENCY'))||0,
        property_type:get('PROPERTY_TYPE'), built_form:get('BUILT_FORM'), total_floor_area:Number(get('TOTAL_FLOOR_AREA'))||0,
        energy_consumption_current:Number(get('ENERGY_CONSUMPTION_CURRENT'))||0, co2_emissions_current:Number(get('CO2_EMISSIONS_CURRENT'))||0,
        heating_cost_current:Number(get('HEATING_COST_CURRENT'))||0, hot_water_cost_current:Number(get('HOT_WATER_COST_CURRENT'))||0,
        lighting_cost_current:Number(get('LIGHTING_COST_CURRENT'))||0, heating_cost_potential:Number(get('HEATING_COST_POTENTIAL'))||0,
        hot_water_cost_potential:Number(get('HOT_WATER_COST_POTENTIAL'))||0, lighting_cost_potential:Number(get('LIGHTING_COST_POTENTIAL'))||0,
        walls_description:get('WALLS_DESCRIPTION'), roof_description:get('ROOF_DESCRIPTION'),
        floor_description:get('FLOOR_DESCRIPTION'), windows_description:get('WINDOWS_DESCRIPTION'),
        mainheat_description:get('MAINHEAT_DESCRIPTION'), main_fuel:get('MAIN_FUEL'),
        lodgement_date:get('LODGEMENT_DATE'), constituency:get('CONSTITUENCY'), local_authority:get('LOCAL_AUTHORITY'),
      });
      count++;
      if (batch.length >= 50000) { insertMany(batch); batch = []; }
    });
    rl.on('close', () => { if (batch.length) insertMany(batch); resolve(count); });
  });
}

async function main() {
  let total = 7827413;
  const start = Date.now();
  for (let i = startIdx; i < dirs.length; i++) {
    const csvPath = join(rawDir, dirs[i], 'certificates.csv');
    const count = await processFile(csvPath);
    total += count;
    const elapsed = ((Date.now()-start)/1000).toFixed(0);
    process.stdout.write('\r[' + (i+1) + '/' + dirs.length + '] ' + dirs[i].substring(18,40) + ' — ' + total.toLocaleString() + ' total (' + elapsed + 's)');
  }
  console.log('\n\nTotal records:', total.toLocaleString());
  
  // Check if indexes exist
  const idxCheck = db.prepare(\"SELECT name FROM sqlite_master WHERE type='index' AND name='idx_postcode'\").get();
  if (!idxCheck) {
    console.log('Creating indexes...');
    db.exec('CREATE INDEX idx_postcode ON certificates(postcode)');
    db.exec('CREATE INDEX idx_rating ON certificates(current_energy_rating)');
    db.exec('CREATE INDEX idx_local_authority ON certificates(local_authority)');
    db.exec('CREATE INDEX idx_lodgement ON certificates(lodgement_date)');
    console.log('Indexes created!');
  }
  
  const dbSize = (require('fs').statSync('data/epc.db').size/1024/1024/1024).toFixed(2);
  console.log('DB size:', dbSize, 'GB');
  db.close();
}
main();
"
