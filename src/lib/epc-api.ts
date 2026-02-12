import { EPCRecord } from "./epc-local";

// EPC API configuration
const EPC_API_BASE = "https://epc.opendatacommunities.org/api/v1";
const EPC_API_EMAIL = process.env.EPC_API_EMAIL || "hertze@gmail.com";
const EPC_API_TOKEN = process.env.EPC_API_TOKEN;

if (!EPC_API_TOKEN) {
  console.warn("EPC_API_TOKEN not set — live API queries will fail, falling back to local DB");
}

// Basic auth: base64(email:apikey)
const AUTH_TOKEN = Buffer.from(`${EPC_API_EMAIL}:${EPC_API_TOKEN || ""}`).toString("base64");

// Rate limiting: simple delay between requests
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 100; // 100ms between requests

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1s

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function makeRequest(url: string, retries = MAX_RETRIES): Promise<any> {
  // Rate limiting
  const now = Date.now();
  const timeSinceLast = now - lastRequestTime;
  if (timeSinceLast < MIN_REQUEST_INTERVAL) {
    await delay(MIN_REQUEST_INTERVAL - timeSinceLast);
  }
  lastRequestTime = Date.now();

  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        Authorization: `Basic ${AUTH_TOKEN}`,
      },
    });

    if (response.status === 429) {
      // Rate limited
      if (retries > 0) {
        await delay(RETRY_DELAY * (MAX_RETRIES - retries + 1));
        return makeRequest(url, retries - 1);
      }
      throw new Error("Rate limited after retries");
    }

    if (!response.ok) {
      if (response.status >= 500 && retries > 0) {
        // Server error, retry
        await delay(RETRY_DELAY * (MAX_RETRIES - retries + 1));
        return makeRequest(url, retries - 1);
      }
      throw new Error(`EPC API ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    if (retries > 0 && (error as Error).message.includes("fetch")) {
      // Network error, retry
      await delay(RETRY_DELAY * (MAX_RETRIES - retries + 1));
      return makeRequest(url, retries - 1);
    }
    throw error;
  }
}

// Search by postcode - returns list of addresses with LMK keys
export async function searchByPostcode(postcode: string): Promise<{ lmk: string; address: string }[]> {
  const normalized = postcode.trim().toUpperCase().replace(/\s+/g, " ");
  const url = `${EPC_API_BASE}/domestic/search?postcode=${encodeURIComponent(normalized)}&size=5000`;

  const data = await makeRequest(url);
  const rows = data.rows || [];

  // Deduplicate by address, keep latest by lodgement date
  const seen = new Map<string, { lmk: string; lodgement_date: string }>();
  for (const row of rows) {
    const address = row.address;
    const lodgement = row["lodgement-date"] || "";
    if (!seen.has(address) || lodgement > seen.get(address)!.lodgement_date) {
      seen.set(address, { lmk: row["lmk-key"], lodgement_date: lodgement });
    }
  }

  return Array.from(seen.entries())
    .map(([address, { lmk }]) => ({ address, lmk }))
    .sort((a, b) => a.address.localeCompare(b.address));
}

// Search by UPRN - returns single result
export async function searchByUPRN(uprn: string): Promise<{ lmk: string; address: string } | null> {
  const url = `${EPC_API_BASE}/domestic/search?uprn=${encodeURIComponent(uprn)}&size=1`;

  const data = await makeRequest(url);
  const rows = data.rows || [];

  if (rows.length === 0) return null;

  const row = rows[0];
  return { lmk: row["lmk-key"], address: row.address };
}

// Get full certificate by LMK key
export async function getCertificate(lmk: string): Promise<EPCRecord | null> {
  const url = `${EPC_API_BASE}/domestic/certificate/${encodeURIComponent(lmk)}`;

  const data = await makeRequest(url);

  if (!data) return null;

  // Map API response to EPCRecord format
  return {
    lmk_key: data["lmk-key"] || "",
    address: data.address || "",
    postcode: data.postcode || "",
    current_energy_rating: data["current-energy-rating"] || "",
    potential_energy_rating: data["potential-energy-rating"] || "",
    current_energy_efficiency: parseInt(data["current-energy-efficiency"]) || 0,
    potential_energy_efficiency: parseInt(data["potential-energy-efficiency"]) || 0,
    property_type: data["property-type"] || "",
    built_form: data["built-form"] || "",
    total_floor_area: parseFloat(data["total-floor-area"]) || 0,
    heating_cost_current: parseFloat(data["heating-cost-current"]) || 0,
    hot_water_cost_current: parseFloat(data["hot-water-cost-current"]) || 0,
    lighting_cost_current: parseFloat(data["lighting-cost-current"]) || 0,
    heating_cost_potential: parseFloat(data["heating-cost-potential"]) || 0,
    hot_water_cost_potential: parseFloat(data["hot-water-cost-potential"]) || 0,
    lighting_cost_potential: parseFloat(data["lighting-cost-potential"]) || 0,
    walls_description: data["walls-description"] || "",
    roof_description: data["roof-description"] || "",
    floor_description: data["floor-description"] || "",
    windows_description: data["windows-description"] || "",
    mainheat_description: data["mainheat-description"] || "",
    main_fuel: data["main-fuel"] || "",
    lodgement_date: data["lodgement-date"] || "",
    local_authority: data["local-authority"] || "",
  };
}