import { Affiliate } from './affiliates';

export const affiliatesAu: Affiliate[] = [
  {
    id: 'hipages',
    name: 'hipages',
    logo: 'https://via.placeholder.com/64x64?text=hipages',
    description: 'Australia\'s leading tradesperson marketplace for home improvements.',
    categories: ['general'],
    affiliateLink: 'https://www.hipages.com.au/',
    priority: 1,
  },
  {
    id: 'solarquotes',
    name: 'SolarQuotes.com.au',
    logo: 'https://via.placeholder.com/64x64?text=SolarQuotes',
    description: 'Specialist solar quotes and installations across Australia.',
    categories: ['solar'],
    affiliateLink: 'https://www.solarquotes.com.au/',
    priority: 2,
  },
  {
    id: 'oneflare',
    name: 'Oneflare',
    logo: 'https://via.placeholder.com/64x64?text=Oneflare',
    description: 'Trades marketplace connecting homeowners with verified professionals.',
    categories: ['general', 'insulation', 'heat-pumps'],
    affiliateLink: 'https://www.oneflare.com.au/',
    priority: 3,
  },
];

export function getAffiliatesAuByCategory(category: string): Affiliate[] {
  return affiliatesAu
    .filter(aff => aff.categories.includes(category))
    .sort((a, b) => a.priority - b.priority);
}
