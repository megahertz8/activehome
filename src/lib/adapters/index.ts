import { CountryAdapter, CountryInfo } from './types';
import { UKAdapter } from './gb';
import { FranceAdapter } from './fr';
import { NetherlandsAdapter } from './nl';
import { AustraliaAdapter } from './au';
import { LiteAdapter } from './lite';

// Adapter registry
const adapters = new Map<string, CountryAdapter>();

// Initialize adapters
adapters.set('GB', new UKAdapter());
adapters.set('FR', new FranceAdapter());
adapters.set('NL', new NetherlandsAdapter());
adapters.set('AU', new AustraliaAdapter());

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

  // Dutch postcode (4 digits + 2 letters)
  if (/^\d{4}[A-Z]{2}$/i.test(cleaned)) {
    return 'NL';
  }

  // Australian postcode (4 digits, 0200-9999 range)
  if (/^\d{4}$/.test(cleaned) && parseInt(cleaned) >= 200) {
    return 'AU';
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

  // Israeli postcode (7 digits)
  if (/^\d{7}$/.test(cleaned)) {
    return 'IL';
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