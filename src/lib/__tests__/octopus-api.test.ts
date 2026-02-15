import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import {
  getProducts,
  getTariffRates,
  getStandingCharges,
  getAgileOutgoingTariffs,
  getCosyOctopusRates,
  getStandardVariableRates
} from '../octopus-api';

// Mock fetch globally
const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>;
global.fetch = mockFetch;

// Mock Supabase
jest.mock('../supabase-server', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          eq: jest.fn(() => ({
            eq: jest.fn(() => ({
              eq: jest.fn(() => ({
                gte: jest.fn(() => ({
                  order: jest.fn(() => ({
                    limit: jest.fn(() => ({
                      single: jest.fn(() => Promise.resolve({ data: null, error: null }))
                    }))
                  }))
                }))
              }))
            }))
          }))
        }))
      })),
      upsert: jest.fn(() => Promise.resolve({ error: null }))
    }))
  }
}));

describe('Octopus API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getProducts', () => {
    it('should fetch products successfully', async () => {
      const mockProducts = [
        {
          code: 'VAR-22-11-01',
          full_name: 'Variable November 2022 v1',
          display_name: 'Variable',
          is_variable: true,
          brand: 'OCTOPUS_ENERGY'
        }
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockProducts)
      } as Response);

      const products = await getProducts();

      expect(mockFetch).toHaveBeenCalledWith('https://api.octopus.energy/v1/products/');
      expect(products).toEqual(mockProducts);
    });

    it('should throw error on failed fetch', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500
      } as Response);

      await expect(getProducts()).rejects.toThrow('Failed to fetch products: 500');
    });
  });

  describe('getTariffRates', () => {
    it('should fetch tariff rates and cache them', async () => {
      const mockRates = [
        {
          value_inc_vat: 0.1234,
          value_exc_vat: 0.1028,
          valid_from: '2024-01-01T00:00:00Z',
          valid_to: '2024-01-02T00:00:00Z'
        }
      ];

      const mockResponse = {
        results: mockRates,
        valid_from: '2024-01-01T00:00:00Z',
        valid_to: '2024-01-02T00:00:00Z'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      } as Response);

      const rates = await getTariffRates('VAR-22-11-01', 'E-1R-VAR-22-11-01-J', 'SW1A', 'standard-unit-rates');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.octopus.energy/v1/products/VAR-22-11-01/electricity-tariffs/E-1R-VAR-22-11-01-J/standard-unit-rates/?period=PT30M'
      );
      expect(rates).toEqual(mockRates);
    });

    it('should return cached data if available', async () => {
      const mockCachedData = {
        data: [
          {
            value_inc_vat: 0.1234,
            valid_from: '2024-01-01T00:00:00Z',
            valid_to: '2024-01-02T00:00:00Z'
          }
        ]
      };

      // Mock the Supabase query to return cached data
      const { supabase } = require('../supabase-server');
      supabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            eq: jest.fn(() => ({
              eq: jest.fn(() => ({
                eq: jest.fn(() => ({
                  gte: jest.fn(() => ({
                    order: jest.fn(() => ({
                      limit: jest.fn(() => ({
                        single: jest.fn(() => Promise.resolve({ data: mockCachedData, error: null }))
                      }))
                    }))
                  }))
                }))
              }))
            }))
          }))
        }))
      });

      const rates = await getTariffRates('VAR-22-11-01', 'E-1R-VAR-22-11-01-J', 'SW1A');

      expect(mockFetch).not.toHaveBeenCalled();
      expect(rates).toEqual(mockCachedData.data);
    });

    it('should fallback to cached data if API fails', async () => {
      const mockCachedData = {
        data: [
          {
            value_inc_vat: 0.1234,
            valid_from: '2024-01-01T00:00:00Z',
            valid_to: '2024-01-02T00:00:00Z'
          }
        ]
      };

      // Mock API failure
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500
      } as Response);

      // Mock cached data available
      const { supabase } = require('../supabase-server');
      supabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            eq: jest.fn(() => ({
              eq: jest.fn(() => ({
                eq: jest.fn(() => ({
                  gte: jest.fn(() => ({
                    order: jest.fn(() => ({
                      limit: jest.fn(() => ({
                        single: jest.fn(() => Promise.resolve({ data: mockCachedData, error: null }))
                      }))
                    }))
                  }))
                }))
              }))
            }))
          }))
        }))
      });

      const rates = await getTariffRates('VAR-22-11-01', 'E-1R-VAR-22-11-01-J', 'SW1A');

      expect(rates).toEqual(mockCachedData.data);
    });
  });

  describe('getAgileOutgoingTariffs', () => {
    it('should fetch Agile Outgoing tariffs', async () => {
      const mockRates = [
        {
          value_inc_vat: 0.15,
          valid_from: '2024-01-01T00:00:00Z',
          valid_to: '2024-01-01T00:30:00Z'
        }
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ results: mockRates, valid_from: '2024-01-01T00:00:00Z', valid_to: '2024-01-02T00:00:00Z' })
      } as Response);

      const rates = await getAgileOutgoingTariffs('SW1A');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.octopus.energy/v1/products/AGILE-OUTGOING-19-05-13/electricity-tariffs/E-1R-AGILE-OUTGOING-19-05-13-J/export-tariffs/?period=PT30M'
      );
      expect(rates).toEqual(mockRates);
    });
  });

  describe('getCosyOctopusRates', () => {
    it('should fetch Cosy Octopus rates', async () => {
      const mockUnitRates = [{ value_inc_vat: 0.1234 }];
      const mockStandingCharges = [{ value_inc_vat: 0.0123 }];

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ results: mockUnitRates, valid_from: '2024-01-01T00:00:00Z', valid_to: '2024-01-02T00:00:00Z' })
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ results: mockStandingCharges, valid_from: '2024-01-01T00:00:00Z', valid_to: '2024-01-02T00:00:00Z' })
        } as Response);

      const rates = await getCosyOctopusRates('SW1A');

      expect(rates.unitRates).toEqual(mockUnitRates);
      expect(rates.standingCharges).toEqual(mockStandingCharges);
    });
  });

  describe('getStandardVariableRates', () => {
    it('should fetch Standard Variable rates', async () => {
      const mockUnitRates = [{ value_inc_vat: 0.1234 }];
      const mockStandingCharges = [{ value_inc_vat: 0.0123 }];

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ results: mockUnitRates, valid_from: '2024-01-01T00:00:00Z', valid_to: '2024-01-02T00:00:00Z' })
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ results: mockStandingCharges, valid_from: '2024-01-01T00:00:00Z', valid_to: '2024-01-02T00:00:00Z' })
        } as Response);

      const rates = await getStandardVariableRates('SW1A');

      expect(rates.unitRates).toEqual(mockUnitRates);
      expect(rates.standingCharges).toEqual(mockStandingCharges);
    });
  });
});