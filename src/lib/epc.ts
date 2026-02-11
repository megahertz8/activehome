// UK EPC API Integration
// Docs: https://epc.opendatacommunities.org/docs/api

const EPC_BASE_URL = "https://epc.opendatacommunities.org/api/v1";

export interface EPCResult {
  address: string;
  postcode: string;
  "current-energy-rating": string;
  "potential-energy-rating": string;
  "current-energy-efficiency": string;
  "potential-energy-efficiency": string;
  "property-type": string;
  "built-form": string;
  "total-floor-area": string;
  "energy-consumption-current": string;
  "co2-emissions-current": string;
  "heating-cost-current": string;
  "hot-water-cost-current": string;
  "lighting-cost-current": string;
  "heating-cost-potential": string;
  "hot-water-cost-potential": string;
  "lighting-cost-potential": string;
  "walls-description": string;
  "roof-description": string;
  "floor-description": string;
  "windows-description": string;
  "mainheat-description": string;
  "main-fuel": string;
  "lodgement-date": string;
  "lmk-key": string;
}

export async function searchByPostcode(postcode: string): Promise<EPCResult[]> {
  const token = process.env.EPC_API_TOKEN;
  
  const res = await fetch(
    `${EPC_BASE_URL}/domestic/search?postcode=${encodeURIComponent(postcode)}&size=50`,
    {
      headers: {
        Accept: "application/json",
        Authorization: `Basic ${token}`,
      },
      next: { revalidate: 86400 }, // Cache for 24h
    }
  );

  if (!res.ok) {
    throw new Error(`EPC API error: ${res.status}`);
  }

  const data = await res.json();
  return data.rows || [];
}

// Calculate annual savings from current to potential rating
export function calculateSavings(epc: EPCResult): {
  currentCost: number;
  potentialCost: number;
  annualSavings: number;
  twentyYearSavings: number;
} {
  const currentCost =
    Number(epc["heating-cost-current"] || 0) +
    Number(epc["hot-water-cost-current"] || 0) +
    Number(epc["lighting-cost-current"] || 0);

  const potentialCost =
    Number(epc["heating-cost-potential"] || 0) +
    Number(epc["hot-water-cost-potential"] || 0) +
    Number(epc["lighting-cost-potential"] || 0);

  const annualSavings = currentCost - potentialCost;

  // Compound with 3.5% annual energy price increase
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

// EPC rating to color
export function ratingColor(rating: string): string {
  const colors: Record<string, string> = {
    A: "#00c781",
    B: "#19b459",
    C: "#8dce46",
    D: "#ffd500",
    E: "#fcaa65",
    F: "#ef8023",
    G: "#e9153b",
  };
  return colors[rating?.toUpperCase()] || "#8b949e";
}

// UK grant eligibility (simplified)
export function checkGrantEligibility(epc: EPCResult): {
  scheme: string;
  amount: string;
  description: string;
}[] {
  const rating = epc["current-energy-rating"]?.toUpperCase();
  const grants = [];

  // BUS - available to all
  if (epc["mainheat-description"]?.toLowerCase().includes("boiler") || 
      epc["main-fuel"]?.toLowerCase().includes("gas")) {
    grants.push({
      scheme: "Boiler Upgrade Scheme (BUS)",
      amount: "£7,500",
      description: "Grant towards replacing your gas boiler with an air source heat pump",
    });
  }

  // ECO4 / GBIS - for lower rated homes
  if (["D", "E", "F", "G"].includes(rating)) {
    grants.push({
      scheme: "ECO4 / Great British Insulation Scheme",
      amount: "Up to £20,000",
      description: "Insulation and heating upgrades for eligible households (income-dependent)",
    });
  }

  // HUG2 - off gas grid
  if (!epc["main-fuel"]?.toLowerCase().includes("gas")) {
    grants.push({
      scheme: "Home Upgrade Grant (HUG2)",
      amount: "Up to £38,000",
      description: "For off-gas-grid homes — covers insulation, heat pumps, solar PV",
    });
  }

  return grants;
}
