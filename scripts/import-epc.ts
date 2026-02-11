#!/usr/bin/env npx tsx
/**
 * Import UK EPC CSV data (347 local authority files) into SQLite.
 *
 * Usage:
 *   npx tsx scripts/import-epc.ts data/raw
 *
 * Expects directory structure:
 *   data/raw/domestic-XXXXX-Name/certificates.csv
 */

import Database from "better-sqlite3";
import { createReadStream, readdirSync, statSync, existsSync } from "fs";
import { createInterface } from "readline";
import { resolve, join } from "path";

const rawDir = process.argv[2] || resolve(__dirname, "../data/raw");
if (!existsSync(rawDir)) {
  console.error(`Directory not found: ${rawDir}`);
  process.exit(1);
}

const dbPath = resolve(__dirname, "../data/epc.db");
console.log(`Output: ${dbPath}`);

// Remove old DB
try { require("fs").unlinkSync(dbPath); } catch {}

const db = new Database(dbPath);
db.pragma("journal_mode = OFF");
db.pragma("synchronous = OFF");
db.pragma("cache_size = -2000000");
db.pragma("temp_store = MEMORY");

console.log("Creating table...");
db.exec(`
  CREATE TABLE certificates (
    lmk_key TEXT PRIMARY KEY,
    address TEXT,
    postcode TEXT,
    current_energy_rating TEXT,
    potential_energy_rating TEXT,
    current_energy_efficiency INTEGER,
    potential_energy_efficiency INTEGER,
    property_type TEXT,
    built_form TEXT,
    total_floor_area REAL,
    energy_consumption_current REAL,
    co2_emissions_current REAL,
    heating_cost_current REAL,
    hot_water_cost_current REAL,
    lighting_cost_current REAL,
    heating_cost_potential REAL,
    hot_water_cost_potential REAL,
    lighting_cost_potential REAL,
    walls_description TEXT,
    roof_description TEXT,
    floor_description TEXT,
    windows_description TEXT,
    mainheat_description TEXT,
    main_fuel TEXT,
    lodgement_date TEXT,
    constituency TEXT,
    local_authority TEXT
  );
`);

const insert = db.prepare(`
  INSERT OR REPLACE INTO certificates VALUES (
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
  )
`);

const insertMany = db.transaction((rows: Record<string, string | number>[]) => {
  for (const r of rows) insert.run(r);
});

// Find all certificate CSV files
const dirs = readdirSync(rawDir).filter((d) => {
  const p = join(rawDir, d);
  return statSync(p).isDirectory() && existsSync(join(p, "certificates.csv"));
});

console.log(`Found ${dirs.length} local authority directories`);

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

async function processFile(csvPath: string): Promise<number> {
  return new Promise((resolve) => {
    let headers: string[] = [];
    let headerMap: Record<string, number> = {};
    let batch: Record<string, string | number>[] = [];
    let count = 0;
    const BATCH_SIZE = 50000;

    const rl = createInterface({
      input: createReadStream(csvPath, { encoding: "utf-8" }),
      crlfDelay: Infinity,
    });

    rl.on("line", (line) => {
      if (headers.length === 0) {
        headers = parseCsvLine(line).map((h) => h.replace(/^"|"$/g, ""));
        headers.forEach((h, i) => (headerMap[h] = i));
        return;
      }

      const cols = parseCsvLine(line);
      const get = (key: string) => (cols[headerMap[key]] || "").replace(/^"|"$/g, "");

      // Combine ADDRESS1 + ADDRESS2 + ADDRESS3
      const addr = [get("ADDRESS1"), get("ADDRESS2"), get("ADDRESS3")]
        .filter(Boolean)
        .join(", ");

      batch.push({
        lmk_key: get("LMK_KEY"),
        address: addr,
        postcode: get("POSTCODE"),
        current_energy_rating: get("CURRENT_ENERGY_RATING"),
        potential_energy_rating: get("POTENTIAL_ENERGY_RATING"),
        current_energy_efficiency: Number(get("CURRENT_ENERGY_EFFICIENCY")) || 0,
        potential_energy_efficiency: Number(get("POTENTIAL_ENERGY_EFFICIENCY")) || 0,
        property_type: get("PROPERTY_TYPE"),
        built_form: get("BUILT_FORM"),
        total_floor_area: Number(get("TOTAL_FLOOR_AREA")) || 0,
        energy_consumption_current: Number(get("ENERGY_CONSUMPTION_CURRENT")) || 0,
        co2_emissions_current: Number(get("CO2_EMISSIONS_CURRENT")) || 0,
        heating_cost_current: Number(get("HEATING_COST_CURRENT")) || 0,
        hot_water_cost_current: Number(get("HOT_WATER_COST_CURRENT")) || 0,
        lighting_cost_current: Number(get("LIGHTING_COST_CURRENT")) || 0,
        heating_cost_potential: Number(get("HEATING_COST_POTENTIAL")) || 0,
        hot_water_cost_potential: Number(get("HOT_WATER_COST_POTENTIAL")) || 0,
        lighting_cost_potential: Number(get("LIGHTING_COST_POTENTIAL")) || 0,
        walls_description: get("WALLS_DESCRIPTION"),
        roof_description: get("ROOF_DESCRIPTION"),
        floor_description: get("FLOOR_DESCRIPTION"),
        windows_description: get("WINDOWS_DESCRIPTION"),
        mainheat_description: get("MAINHEAT_DESCRIPTION"),
        main_fuel: get("MAIN_FUEL"),
        lodgement_date: get("LODGEMENT_DATE"),
        constituency: get("CONSTITUENCY"),
        local_authority: get("LOCAL_AUTHORITY"),
      });

      count++;
      if (batch.length >= BATCH_SIZE) {
        insertMany(batch);
        batch = [];
      }
    });

    rl.on("close", () => {
      if (batch.length > 0) insertMany(batch);
      resolve(count);
    });
  });
}

async function main() {
  let totalRecords = 0;
  const startTime = Date.now();

  for (let i = 0; i < dirs.length; i++) {
    const csvPath = join(rawDir, dirs[i], "certificates.csv");
    const count = await processFile(csvPath);
    totalRecords += count;
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
    process.stdout.write(
      `\r[${i + 1}/${dirs.length}] ${dirs[i].replace("domestic-", "").substring(10)} — ${count.toLocaleString()} records (total: ${totalRecords.toLocaleString()}, ${elapsed}s)`
    );
  }

  console.log(`\n\nCreating indexes...`);
  db.exec(`
    CREATE INDEX idx_postcode ON certificates(postcode);
    CREATE INDEX idx_rating ON certificates(current_energy_rating);
    CREATE INDEX idx_local_authority ON certificates(local_authority);
    CREATE INDEX idx_lodgement ON certificates(lodgement_date);
  `);

  const dbSize = (statSync(dbPath).size / 1024 / 1024 / 1024).toFixed(2);
  const elapsed = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
  console.log(`\n✅ Done! ${totalRecords.toLocaleString()} certificates imported in ${elapsed} minutes`);
  console.log(`📦 DB size: ${dbSize} GB at ${dbPath}`);

  db.close();
}

main();
