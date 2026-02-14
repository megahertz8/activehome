export interface Affiliate {
  id: string;
  name: string;
  logo: string; // URL or path
  description: string;
  categories: string[]; // 'insulation', 'solar', 'heat-pumps'
  affiliateLink: string; // Base link
  priority: number; // Lower number higher priority
}

export const affiliates: Affiliate[] = [
  {
    id: 'bark',
    name: 'Bark',
    logo: 'https://via.placeholder.com/64x64?text=Bark',
    description: 'Connect with vetted local contractors for home improvements.',
    categories: ['insulation', 'solar', 'heat-pumps'],
    affiliateLink: 'https://www.bark.com/en/gb/',
    priority: 1,
  },
  {
    id: 'rated-people',
    name: 'Rated People',
    logo: 'https://via.placeholder.com/64x64?text=Rated+People',
    description: 'Find trusted tradespeople with customer reviews.',
    categories: ['insulation', 'solar', 'heat-pumps'],
    affiliateLink: 'https://www.ratedpeople.com/',
    priority: 2,
  },
  // Add more if needed
]

// Function to get affiliates by category
export function getAffiliatesByCategory(category: string): Affiliate[] {
  return affiliates
    .filter(aff => aff.categories.includes(category))
    .sort((a, b) => a.priority - b.priority)
}

// Get affiliate link for tracking
export function getTrackingLink(affiliateId: string, category: string): string {
  const aff = affiliates.find(a => a.id === affiliateId)
  if (!aff) return ''
  // Add UTM or something
  const url = new URL(aff.affiliateLink)
  url.searchParams.set('utm_source', 'evolvinghome')
  url.searchParams.set('utm_medium', 'affiliate')
  url.searchParams.set('utm_campaign', `contractors-${category}`)
  return url.toString()
}