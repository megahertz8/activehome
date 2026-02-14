import { supabase } from './supabase-server';

const BASE_URL = 'https://api.octopus.energy/v1';

export interface OctopusProduct {
  code: string;
  full_name: string;
  display_name: string;
  description: string;
  is_variable: boolean;
  is_green: boolean;
  is_tracker: boolean;
  is_prepay: boolean;
  is_business: boolean;
  is_restricted: boolean;
  term?: number;
  brand: string;
  available_from: string;
  available_to?: string;
  tariffs_active_at: string;
  tariffs: {
    [key: string]: {
      electricity?: {
        [key: string]: {
          code: string;
          standing_charge_inc_vat: number;
          online_discount_inc_vat?: number;
          dual_fuel_discount_inc_vat?: number;
          exit_fees_inc_vat?: number;
          links: {
            [key: string]: string;
          };
        };
      };
      gas?: {
        [key: string]: {
          code: string;
          standing_charge_inc_vat: number;
          links: {
            [key: string]: string;
          };
        };
      };
    };
  };
}

export interface TariffRate {
  value_inc_vat: number;
  value_exc_vat: number;
  valid_from: string;
  valid_to: string;
  payment_method?: string;
}

export interface TariffStandingCharge {
  value_inc_vat: number;
  value_exc_vat: number;
  valid_from: string;
  valid_to: string;
  payment_method?: string;
}

export interface CachedTariff {
  id: number;
  postcode: string;
  product_code: string;
  tariff_code: string;
  tariff_type: string;
  rate_type: string;
  data: any;
  valid_from: string;
  valid_to: string;
  fetched_at: string;
}

// Cache duration: 24 hours
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000;

export async function getProducts(): Promise<OctopusProduct[]> {
  try {
    const response = await fetch(`${BASE_URL}/products/`);
    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching Octopus products:', error);
    throw error;
  }
}

export async function getTariffRates(
  productCode: string,
  tariffCode: string,
  postcode: string,
  rateType: 'standard-unit-rates' | 'standing-charges' | 'export-tariffs' = 'standard-unit-rates'
): Promise<TariffRate[]> {
  // Check cache first
  const cached = await getCachedTariff(postcode, productCode, tariffCode, 'electricity', rateType);
  if (cached) {
    return cached.data as TariffRate[];
  }

  try {
    const response = await fetch(
      `${BASE_URL}/products/${productCode}/electricity-tariffs/${tariffCode}/${rateType}/?period=PT30M`
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch tariff rates: ${response.status}`);
    }
    const data = await response.json();
    const rates = data.results || [];

    // Cache the data
    await cacheTariffData(postcode, productCode, tariffCode, 'electricity', rateType, rates, data.valid_from, data.valid_to);

    return rates;
  } catch (error) {
    console.error('Error fetching tariff rates:', error);
    // Try to return cached data even if expired as fallback
    if (cached) {
      return cached.data as TariffRate[];
    }
    throw error;
  }
}

export async function getStandingCharges(
  productCode: string,
  tariffCode: string,
  postcode: string
): Promise<TariffStandingCharge[]> {
  return getTariffRates(productCode, tariffCode, postcode, 'standing-charges') as Promise<TariffStandingCharge[]>;
}

export async function getExportTariffs(
  productCode: string,
  tariffCode: string,
  postcode: string
): Promise<TariffRate[]> {
  return getTariffRates(productCode, tariffCode, postcode, 'export-tariffs');
}

export async function getAgileOutgoingTariffs(postcode: string): Promise<TariffRate[]> {
  // Agile Outgoing Octopus product
  const productCode = 'AGILE-OUTGOING-19-05-13';
  const tariffCode = 'E-1R-AGILE-OUTGOING-19-05-13-J';
  return getExportTariffs(productCode, tariffCode, postcode);
}

export async function getCosyOctopusRates(postcode: string): Promise<{ unitRates: TariffRate[], standingCharges: TariffStandingCharge[] }> {
  // Cosy Octopus product
  const productCode = 'COSY-OCTOPUS-12M-24-02-06';
  const tariffCode = 'E-1R-COSY-OCTOPUS-12M-24-02-06-J';

  const [unitRates, standingCharges] = await Promise.all([
    getTariffRates(productCode, tariffCode, postcode),
    getStandingCharges(productCode, tariffCode, postcode)
  ]);

  return { unitRates, standingCharges };
}

export async function getStandardVariableRates(postcode: string): Promise<{ unitRates: TariffRate[], standingCharges: TariffStandingCharge[] }> {
  // Standard Variable product
  const productCode = 'VAR-22-11-01';
  const tariffCode = 'E-1R-VAR-22-11-01-J';

  const [unitRates, standingCharges] = await Promise.all([
    getTariffRates(productCode, tariffCode, postcode),
    getStandingCharges(productCode, tariffCode, postcode)
  ]);

  return { unitRates, standingCharges };
}

async function getCachedTariff(
  postcode: string,
  productCode: string,
  tariffCode: string,
  tariffType: string,
  rateType: string
): Promise<CachedTariff | null> {
  const { data, error } = await supabase
    .from('octopus_tariffs')
    .select('*')
    .eq('postcode', postcode)
    .eq('product_code', productCode)
    .eq('tariff_code', tariffCode)
    .eq('tariff_type', tariffType)
    .eq('rate_type', rateType)
    .gte('fetched_at', new Date(Date.now() - CACHE_DURATION_MS).toISOString())
    .order('fetched_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

async function cacheTariffData(
  postcode: string,
  productCode: string,
  tariffCode: string,
  tariffType: string,
  rateType: string,
  data: any,
  validFrom: string,
  validTo: string
): Promise<void> {
  const { error } = await supabase
    .from('octopus_tariffs')
    .upsert({
      postcode,
      product_code: productCode,
      tariff_code: tariffCode,
      tariff_type: tariffType,
      rate_type: rateType,
      data,
      valid_from: validFrom,
      valid_to: validTo,
    }, {
      onConflict: 'postcode,product_code,tariff_code,rate_type'
    });

  if (error) {
    console.error('Error caching tariff data:', error);
  }
}