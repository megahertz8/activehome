/**
 * Maps UK postcode prefixes to Octopus Energy electricity regions (A-P).
 * Based on distribution network operator areas.
 */
export function getRegionFromPostcode(postcode: string): string {
  const prefix = postcode.split(' ')[0].toUpperCase().substring(0, 2);
  const map: Record<string, string> = {
    'AB': 'P', 'AL': 'J', 'B': 'M', 'BA': 'L', 'BB': 'G', 'BD': 'M', 'BH': 'H',
    'BL': 'G', 'BN': 'J', 'BR': 'J', 'BS': 'L', 'CA': 'G', 'CB': 'A', 'CF': 'K',
    'CH': 'D', 'CM': 'A', 'CO': 'A', 'CR': 'J', 'CT': 'J', 'CV': 'M', 'CW': 'G',
    'DA': 'J', 'DE': 'M', 'DG': 'P', 'DH': 'F', 'DL': 'F', 'DN': 'M', 'DT': 'L',
    'DY': 'M', 'E': 'C', 'EC': 'C', 'EH': 'P', 'EN': 'J', 'EX': 'L', 'FK': 'P',
    'FY': 'G', 'G': 'P', 'GL': 'L', 'GU': 'H', 'HA': 'J', 'HD': 'M', 'HG': 'M',
    'HP': 'H', 'HR': 'J', 'HS': 'P', 'HU': 'M', 'HX': 'M', 'IG': 'C', 'IP': 'A',
    'IV': 'P', 'KA': 'P', 'KT': 'J', 'KW': 'P', 'KY': 'P', 'L': 'G', 'LA': 'G',
    'LD': 'K', 'LE': 'M', 'LL': 'K', 'LN': 'A', 'LS': 'M', 'LU': 'J', 'M': 'G',
    'ME': 'J', 'MK': 'A', 'ML': 'P', 'N': 'C', 'NE': 'F', 'NG': 'M', 'NN': 'A',
    'NP': 'K', 'NR': 'A', 'NW': 'C', 'OL': 'G', 'OX': 'H', 'PA': 'P', 'PE': 'A',
    'PH': 'P', 'PL': 'L', 'PO': 'H', 'PR': 'G', 'RG': 'H', 'RH': 'J', 'RM': 'C',
    'S': 'M', 'SA': 'K', 'SE': 'C', 'SG': 'J', 'SK': 'G', 'SL': 'H', 'SM': 'J',
    'SN': 'H', 'SO': 'H', 'SP': 'L', 'SR': 'H', 'SS': 'A', 'ST': 'M', 'SW': 'C',
    'SY': 'K', 'TA': 'M', 'TD': 'P', 'TF': 'M', 'TN': 'J', 'TQ': 'L', 'TR': 'L',
    'TS': 'F', 'TW': 'J', 'UB': 'J', 'W': 'C', 'WA': 'D', 'WC': 'C', 'WD': 'J',
    'WF': 'M', 'WN': 'G', 'WR': 'M', 'WS': 'M', 'WV': 'M', 'YO': 'M', 'ZE': 'P'
  };
  return map[prefix] || 'C'; // Default to London region if not found
}