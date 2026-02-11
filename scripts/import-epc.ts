#!/usr/bin/env npx tsx
/**
 * Import UK EPC CSV data into SQLite for fast local lookups.
 *
 * Usage:
 *   npx tsx scripts/import-epc.ts /path/to/epc-certificates.csv
 *
 * The CSV can be downloaded from https://epc.opendatacommunities.org/domestic/search
 * (click "Download" → all results as CSV).
 *
 * Creates/overwrites: data/epc.db (~2-3GB for full UK dataset)
 */

import Database from "better-sqlite3";
import { createReadStream } from "fs";
import { createInterface } from "readline";
import { resolve } from "path";

const csvPath = process.argv[2];
if (!csvPath) {
  console.error("Usage: npx tsx scripts/import-epc.ts <path-to-csv>");
  process.exit(1);
}

const dbPath = resolve(__dirname, "../data/epc.db");
const db = new Database(dbPath);

// Optimize for bulk insert
db.pragma("journal_mode = WAL");
db.pragma("synchronous = OFF");
db.pragma("cache_size = -2000000"); // 2GB cache

console.log("Creating tables...");
db.exec(`
  DROP TABLE IF EXISTS certificates;
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
    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
  )
`);

const insertMany = db.transaction((rows: string[][]) => {
  for (const r of rows) {
    insert.run(...r);
  }
});

// Map CSV headers to our columns
const COLUMN_MAP: Record<string, number> = {};
let headersParsed = false;
let batch: string[][] = [];
let total = 0;
const BATCH_SIZE = 50000;

const FIELDS = [
  "LMK_KEY", "ADDRESS", "POSTCODE",
  "CURRENT_ENERGY_RATING", "POTENTIAL_ENERGY_RATING",
  "CURRENT_ENERGY_EFFICIENCY", "POTENTIAL_ENERGY_EFFICIENCY",
  "PROPERTY_TYPE", "BUILT_FORM", "TOTAL_FLOOR_AREA",
  "ENERGY_CONSUMPTION_CURRENT", "CO2_EMISSIONS_CURRENT",
  "HEATING_COST_CURRENT", "HOT_WATER_COST_CURRENT", "LIGHTING_COST_CURRENT",
  "HEATING_COST_POTENTIAL", "HOT_WATER_COST_POTENTIAL", "LIGHTING_COST_POTENTIAL",
  "WALLS_DESCRIPTION", "ROOF_DESCRIPTION", "FLOOR_DESCRIPTION",
  "WINDOWS_DESCRIPTION", "MAINHEAT_DESCRIPTION", "MAIN_FUEL",
  "LODGEMENT_DATE", "CONSTITUENCY", "LOCAL_AUTHORITY",
];

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

const rl = createInterface({
  input: createReadStream(csvPath, { encoding: "utf-8" }),
  crlfDelay: Infinity,
});

rl.on("line", (line) => {
  if (!headersParsed) {
    const headers = parseCsvLine(line).map((h) => h.replace(/^"|"$/g, "").toUpperCase().replace(/-/g, "_"));
    for (let i = 0; i < headers.length; i++) {
      COLUMN_MAP[headers[i]] = i;
    }
    headersParsed = true;
    return;
  }

  const cols = parseCsvLine(line);
  const row = FIELDS.map((f) => {
    const idx = COLUMN_MAP[f];
    return idx !== undefined ? (cols[idx] || "") : "";
  });

  batch.push(row);
  total++;

  if (batch.length >= BATCH_SIZE) {
    insertMany(batch);
    batch = [];
    process.stdout.write(`\rImported ${total.toLocaleString()} records...`);
  }
});

rl.on("close", () => {
  if (batch.length > 0) {
    insertMany(batch);
  }

  console.log(`\n\nCreating indexes...`);
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_postcode ON certificates(postcode);
    CREATE INDEX IF NOT EXISTS idx_address ON certificates(address);
    CREATE INDEX IF NOT EXISTS idx_rating ON certificates(current_energy_rating);
    CREATE INDEX IF NOT EXISTS idx_local_authority ON certificates(local_authority);
    CREATE INDEX IF NOT EXISTS idx_lodgement ON certificates(lodgement_date);
  `);

  console.log(`\nDone! Imported ${total.toLocaleString()} certificates into ${dbPath}`);
  console.log(`DB size: ${(require("fs").statSync(dbPath).size / 1024 / 1024).toFixed(0)} MB`);

  db.close();
});
