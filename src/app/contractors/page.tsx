import { Suspense } from 'react'
import { getAffiliatesByCategory } from '@/data/affiliates'

const categories = ['insulation', 'solar', 'heat-pumps']

function ContractorCard({ affiliate, category }: { affiliate: any, category: string }) {
  const trackingUrl = `/api/track-click?aff=${affiliate.id}-${category}`

  return (
    <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center text-center">
      <img src={affiliate.logo} alt={affiliate.name} className="w-16 h-16 mb-4" />
      <h3 className="text-lg font-semibold text-gray-800 mb-2">{affiliate.name}</h3>
      <p className="text-gray-600 mb-4">{affiliate.description}</p>
      <a
        href={trackingUrl}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
        target="_blank"
        rel="noopener noreferrer"
      >
        Get Quotes
      </a>
    </div>
  )
}

function ContractorsContent({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const rec = typeof searchParams.rec === 'string' ? searchParams.rec : ''
  const type = typeof searchParams.type === 'string' ? searchParams.type : ''

  const filterCategory = rec || type || ''

  const displayCategories = filterCategory ? [filterCategory] : categories

  return (
    <div className="min-h-screen bg-green-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Find Vetted Contractors</h1>
        <p className="text-center text-gray-600 mb-8">Connect with trusted UK contractors for your home upgrades.</p>

        {!filterCategory && (
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {categories.map(cat => (
              <a
                key={cat}
                href={`?type=${cat}`}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1).replace('-', ' ')}
              </a>
            ))}
          </div>
        )}

        {displayCategories.map(category => {
          const affiliates = getAffiliatesByCategory(category)
          return (
            <div key={category} className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
                {category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')} Contractors
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {affiliates.map(aff => (
                  <ContractorCard key={aff.id} affiliate={aff} category={category} />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function ContractorsPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ContractorsContent searchParams={searchParams} />
    </Suspense>
  )
}