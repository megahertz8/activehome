import { CountryAdapter, CountryInfo } from './types';
import { UKAdapter } from './gb';
import { FranceAdapter } from './fr';
import { LiteAdapter } from './lite';

// Adapter registry
const adapters = new Map<string, CountryAdapter>();

// Initialize adapters
adapters.set('GB', new UKAdapter());
adapters.set('FR', new FranceAdapter());

export function getAdapter(countryCode: string): CountryAdapter {
  const adapter = adapters.get(countryCode.toUpperCase());
  if (adapter) {
    return adapter;
  }
  // Fallback to lite adapter for unsupported countries
  return new LiteAdapter(countryCode);
}

export function detectCountry(postcode: string, request?: Request): string {
  const cleaned = postcode.trim().replace(/\s+/g, '');

  // UK postcode pattern
  if (/^[A-Z]{1,2}\d[A-Z\d]?\d[A-Z]{2}$/i.test(cleaned)) {
    return 'GB';
  }

  // French postcode (5 digits)
  if (/^\d{5}$/.test(cleaned)) {
    return 'FR';
  }

  // Try to detect from request headers (geo-IP)
  if (request) {
    const ipCountry = request.headers.get('CF-IPCountry') ||
                     request.headers.get('X-Forwarded-For-Country') ||
                     request.headers.get('X-Country-Code');
    if (ipCountry && ipCountry.length === 2) {
      return ipCountry.toUpperCase();
    }
  }

  // Default to GB for backward compatibility
  return 'GB';
}

export function isLiteMode(countryCode: string): boolean {
  return !adapters.has(countryCode.toUpperCase());
}

export function getSupportedCountries(): CountryInfo[] {
  return Array.from(adapters.values()).map(adapter => ({
    code: adapter.countryCode,
    name: adapter.countryName,
    currency: adapter.currency,
    locale: adapter.locale
  }));
}

// Default export for convenience
export default adapters;