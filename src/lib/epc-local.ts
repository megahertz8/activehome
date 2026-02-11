import { resolve } from "path";

const DB_PATH = resolve(process.cwd(), "data/epc.db");

let db: import("better-sqlite3").Database | null = null;

function getDb(): import("better-sqlite3").Database {
  if (!db) {
    // Dynamic require to avoid loading native module during compilation
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Database = require("better-sqlite3");
    db = new Database(DB_PATH, { readonly: true });
    (db as import("better-sqlite3").Database).pragma("journal_mode = WAL");
    (db as import("better-sqlite3").Database).pragma("cache_size = -50000"); // 50MB read cache
  }
  return db as import("better-sqlite3").Database;
}

export interface EPCRecord {
  lmk_key: string;
  address: string;
  postcode: string;
  current_energy_rating: string;
  potential_energy_rating: string;
  current_energy_efficiency: number;
  potential_energy_efficiency: number;
  property_type: string;
  built_form: string;
  total_floor_area: number;
  heating_cost_current: number;
  hot_water_cost_current: number;
  lighting_cost_current: number;
  heating_cost_potential: number;
  hot_water_cost_potential: number;
  lighting_cost_potential: number;
  walls_description: string;
  roof_description: string;
  floor_description: string;
  windows_description: string;
  mainheat_description: string;
  main_fuel: string;
  lodgement_date: string;
  local_authority: string;
}

export function searchByPostcode(postcode: string): EPCRecord[] {
  const d = getDb();
  const normalized = postcode.trim().toUpperCase().replace(/\s+/g, " ");
  return d.prepare(
    `SELECT * FROM certificates WHERE postcode = ? ORDER BY lodgement_date DESC`
  ).all(normalized) as EPCRecord[];
}

export function getByAddress(postcode: string, address: string): EPCRecord | undefined {
  const d = getDb();
  const normalized = postcode.trim().toUpperCase().replace(/\s+/g, " ");
  return d.prepare(
    `SELECT * FROM certificates WHERE postcode = ? AND address = ? ORDER BY lodgement_date DESC LIMIT 1`
  ).get(normalized, address) as EPCRecord | undefined;
}

// Neighborhood stats for comparison — uses exact postcode only (fast indexed lookup)
export function getPostcodeStats(postcode: string): {
  avgEfficiency: number;
  totalHomes: number;
  ratingDistribution: Record<string, number>;
} {
  const d = getDb();
  const normalized = postcode.trim().toUpperCase().replace(/\s+/g, " ");

  const stats = d.prepare(`
    SELECT 
      current_energy_rating as rating,
      COUNT(*) as count,
      AVG(current_energy_efficiency) as avg_eff
    FROM certificates 
    WHERE postcode = ?
    GROUP BY current_energy_rating
  `).all(normalized) as { rating: string; count: number; avg_eff: number }[];

  const distribution: Record<string, number> = {};
  let totalHomes = 0;
  let sumEff = 0;

  for (const row of stats) {
    distribution[row.rating] = row.count;
    totalHomes += row.count;
    sumEff += row.avg_eff * row.count;
  }

  return {
    avgEfficiency: totalHomes > 0 ? Math.round(sumEff / totalHomes) : 0,
    totalHomes,
    ratingDistribution: distribution,
  };
}

export function calculateSavings(epc: EPCRecord) {
  const currentCost = (epc.heating_cost_current || 0) + (epc.hot_water_cost_current || 0) + (epc.lighting_cost_current || 0);
  const potentialCost = (epc.heating_cost_potential || 0) + (epc.hot_water_cost_potential || 0) + (epc.lighting_cost_potential || 0);
  const annualSavings = currentCost - potentialCost;

  let twentyYearSavings = 0;
  for (let y = 1; y <= 20; y++) {
    twentyYearSavings += annualSavings * Math.pow(1.035, y);
  }

  return {
    currentCost: Math.round(currentCost),
    potentialCost: Math.round(potentialCost),
    annualSavings: Math.round(annualSavings),
    twentyYearSavings: Math.round(twentyYearSavings),
  };
}

export function checkGrants(epc: EPCRecord) {
  const grants = [];
  const rating = epc.current_energy_rating?.toUpperCase();
  const fuel = (epc.main_fuel || "").toLowerCase();
  const heating = (epc.mainheat_description || "").toLowerCase();

  if (heating.includes("boiler") || fuel.includes("gas")) {
    grants.push({
      scheme: "Boiler Upgrade Scheme (BUS)",
      amount: "£7,500",
      description: "Grant towards replacing your gas boiler with an air source heat pump",
    });
  }

  if (["D", "E", "F", "G"].includes(rating)) {
    grants.push({
      scheme: "ECO4 / Great British Insulation Scheme",
      amount: "Up to £20,000",
      description: "Insulation and heating upgrades for eligible households",
    });
  }

  if (!fuel.includes("gas")) {
    grants.push({
      scheme: "Home Upgrade Grant (HUG2)",
      amount: "Up to £38,000",
      description: "For off-gas-grid homes — insulation, heat pumps, solar PV",
    });
  }

  return grants;
}
