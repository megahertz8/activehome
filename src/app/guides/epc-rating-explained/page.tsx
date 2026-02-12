import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "EPC Rating Explained: What Your Home's Energy Score Means",
  description: "Understand EPC ratings A-G, how they're calculated using SAP methodology, annual energy costs by rating band, and why EPC matters for selling, renting, mortgages, and MEES regulations.",
  openGraph: {
    title: "EPC Rating Explained: What Your Home's Energy Score Means",
    description: "Complete guide to understanding EPC ratings, costs, and their impact on your home's value and energy bills.",
    url: "https://evolvinghome.ai/guides/epc-rating-explained",
    siteName: "Evolving Home",
    type: "website",
  },
  alternates: {
    canonical: "https://evolvinghome.ai/guides/epc-rating-explained",
  },
  other: {
    "article:author": "Evolving Home Team",
    "article:published_time": "2026-02-12T00:00:00.000Z",
    "article:section": "Energy Efficiency",
  },
};

const epcBands = [
  {
    band: "A",
    description: "Exceptionally energy efficient",
    color: "text-green-600",
    bgColor: "bg-green-100",
    costRange: "£800-£1,200",
    savings: "Up to £2,000+ vs average home",
  },
  {
    band: "B",
    description: "Very energy efficient",
    color: "text-green-500",
    bgColor: "bg-green-50",
    costRange: "£1,000-£1,400",
    savings: "£1,000-£1,500 vs average home",
  },
  {
    band: "C",
    description: "Energy efficient",
    color: "text-lime-600",
    bgColor: "bg-lime-50",
    costRange: "£1,300-£1,700",
    savings: "£500-£1,000 vs average home",
  },
  {
    band: "D",
    description: "Average energy efficiency",
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    costRange: "£1,600-£2,100",
    savings: "Baseline - typical UK home",
  },
  {
    band: "E",
    description: "Below average energy efficiency",
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    costRange: "£2,000-£2,500",
    savings: "£400-£900 more than average",
  },
  {
    band: "F",
    description: "Poor energy efficiency",
    color: "text-red-500",
    bgColor: "bg-red-50",
    costRange: "£2,400-£2,900",
    savings: "£800-£1,300 more than average",
  },
  {
    band: "G",
    description: "Very poor energy efficiency",
    color: "text-red-700",
    bgColor: "bg-red-100",
    costRange: "£2,800-£3,500+",
    savings: "£1,200-£2,000+ more than average",
  },
];

export default function EPCRatingExplainedPage() {
  return (
    <div className="prose prose-invert max-w-none">
      <div className="mb-8">
        <nav className="text-sm text-muted-foreground mb-4">
          <Link href="/" className="hover:text-primary">Home</Link> /
          <Link href="/guides" className="hover:text-primary"> Guides</Link> /
          <span className="text-foreground"> EPC Rating Explained</span>
        </nav>
        <p className="text-sm text-muted-foreground">Last updated: February 12, 2026 | By Evolving Home Team</p>
      </div>

      <h1>EPC Rating Explained: What Your Home's Energy Score Means</h1>

      <p className="lead">
        An Energy Performance Certificate (EPC) gives your home an energy efficiency rating from A to G.
        Understanding what these ratings mean, how they're calculated, and their impact on your energy bills
        and home value is crucial for any homeowner.
      </p>

      <h2>What Do EPC Ratings A-G Mean?</h2>

      <p>
        EPC ratings are displayed as a simple color-coded scale where A is the most energy efficient
        and G is the least. The rating considers factors like insulation, heating systems, and overall
        energy use.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 my-8">
        {epcBands.map((band) => (
          <div key={band.band} className={`p-4 rounded-lg border ${band.bgColor}`}>
            <div className={`text-2xl font-bold ${band.color} mb-2`}>{band.band}</div>
            <h3 className="font-semibold mb-1">{band.description}</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Annual energy cost: {band.costRange}
            </p>
            <p className="text-xs">{band.savings}</p>
          </div>
        ))}
      </div>

      <p className="text-sm text-muted-foreground">
        *Based on average 3-bed semi-detached home. Costs include gas and electricity.
        Source: UK Government energy consumption data, adjusted for 2026 prices.
      </p>

      <h2>How EPC Ratings Are Calculated</h2>

      <p>
        EPC ratings use the Standard Assessment Procedure (SAP), a government-approved methodology
        that calculates a home's energy efficiency based on:
      </p>

      <ul>
        <li><strong>Fabric efficiency:</strong> Walls, roof, floor, windows, and doors</li>
        <li><strong>Heating systems:</strong> Boiler efficiency, radiators, and controls</li>
        <li><strong>Hot water:</strong> Cylinder insulation and delivery systems</li>
        <li><strong>Lighting:</strong> Use of energy-efficient bulbs</li>
        <li><strong>Renewables:</strong> Solar panels, heat pumps, or other green energy sources</li>
      </ul>

      <p>
        The SAP calculation produces an energy efficiency score from 1-100, which maps to the A-G bands:
      </p>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-border my-4">
          <thead>
            <tr className="bg-muted">
              <th className="border border-border p-2 text-left">EPC Band</th>
              <th className="border border-border p-2 text-left">SAP Score Range</th>
              <th className="border border-border p-2 text-left">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr><td className="border border-border p-2">A</td><td className="border border-border p-2">92-100</td><td className="border border-border p-2">Exceptionally efficient</td></tr>
            <tr><td className="border border-border p-2">B</td><td className="border border-border p-2">81-91</td><td className="border border-border p-2">Very efficient</td></tr>
            <tr><td className="border border-border p-2">C</td><td className="border border-border p-2">69-80</td><td className="border border-border p-2">Efficient</td></tr>
            <tr><td className="border border-border p-2">D</td><td className="border border-border p-2">55-68</td><td className="border border-border p-2">Average</td></tr>
            <tr><td className="border border-border p-2">E</td><td className="border border-border p-2">39-54</td><td className="border border-border p-2">Below average</td></tr>
            <tr><td className="border border-border p-2">F</td><td className="border border-border p-2">21-38</td><td className="border border-border p-2">Poor</td></tr>
            <tr><td className="border border-border p-2">G</td><td className="border border-border p-2">1-20</td><td className="border border-border p-2">Very poor</td></tr>
          </tbody>
        </table>
      </div>

      <h2>Annual Energy Costs by EPC Rating</h2>

      <p>
        Your EPC rating directly impacts your energy bills. Here's a breakdown of typical annual
        energy costs for different home types and ratings:
      </p>

      <h3>3-Bed Semi-Detached Home (Most Common)</h3>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-border my-4">
          <thead>
            <tr className="bg-muted">
              <th className="border border-border p-2 text-left">EPC Rating</th>
              <th className="border border-border p-2 text-left">Annual Cost</th>
              <th className="border border-border p-2 text-left">Monthly Cost</th>
              <th className="border border-border p-2 text-left">vs Average (D)</th>
            </tr>
          </thead>
          <tbody>
            <tr><td className="border border-border p-2 font-semibold text-green-600">A</td><td className="border border-border p-2">£950</td><td className="border border-border p-2">£79</td><td className="border border-border p-2 text-green-600">-£1,050</td></tr>
            <tr><td className="border border-border p-2 font-semibold text-green-500">B</td><td className="border border-border p-2">£1,150</td><td className="border border-border p-2">£96</td><td className="border border-border p-2 text-green-600">-£850</td></tr>
            <tr><td className="border border-border p-2 font-semibold text-lime-600">C</td><td className="border border-border p-2">£1,450</td><td className="border border-border p-2">£121</td><td className="border border-border p-2 text-green-600">-£550</td></tr>
            <tr><td className="border border-border p-2 font-semibold text-yellow-600">D</td><td className="border border-border p-2">£2,000</td><td className="border border-border p-2">£167</td><td className="border border-border p-2">-</td></tr>
            <tr><td className="border border-border p-2 font-semibold text-orange-600">E</td><td className="border border-border p-2">£2,350</td><td className="border border-border p-2">£196</td><td className="border border-border p-2 text-red-600">+£350</td></tr>
            <tr><td className="border border-border p-2 font-semibold text-red-500">F</td><td className="border border-border p-2">£2,700</td><td className="border border-border p-2">£225</td><td className="border border-border p-2 text-red-600">+£700</td></tr>
            <tr><td className="border border-border p-2 font-semibold text-red-700">G</td><td className="border border-border p-2">£3,200</td><td className="border border-border p-2">£267</td><td className="border border-border p-2 text-red-600">+£1,200</td></tr>
          </tbody>
        </table>
      </div>

      <p className="text-sm text-muted-foreground">
        Based on Ofgem energy price cap (Jan 2026) and UK Government EPC data.
        Actual costs vary by location, usage, and energy supplier.
      </p>

      <h2>Why EPC Ratings Matter</h2>

      <h3>Selling Your Home</h3>
      <p>
        Buyers increasingly prioritize energy efficiency. Properties with higher EPC ratings
        sell faster and for more money. Research shows EPC C+ homes can command 5-10% premium.
      </p>

      <h3>Renting Out</h3>
      <p>
        From 2028, landlords must ensure rented properties meet minimum EPC standards (E or above).
        F and G rated homes will need improvements before renting.
      </p>

      <h3>Mortgages and Financing</h3>
      <p>
        Some lenders offer better rates for energy-efficient homes. Green mortgages may provide
        lower interest rates or higher loan-to-value ratios for A-C rated properties.
      </p>

      <h3>Minimum Energy Efficiency Standards (MEES)</h3>
      <p>
        MEES regulations require commercial landlords to ensure properties meet minimum EPC standards.
        Non-compliant properties cannot be let. Similar standards may extend to domestic lets.
      </p>

      <h3>Environmental Impact</h3>
      <p>
        Better EPC ratings mean lower carbon emissions. An A-rated home produces roughly half
        the CO2 of a G-rated home, helping combat climate change.
      </p>

      <div className="bg-primary/10 border border-primary/20 rounded-lg p-6 my-8">
        <h3 className="text-xl font-semibold mb-4 text-primary">Check Your Home's EPC Rating Instantly</h3>
        <p className="mb-4">
          Get your home's energy score, see potential savings, and discover improvement recommendations
          tailored to your property. Free, private, and based on official UK EPC data.
        </p>
        <Link href="/">
          <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
            Check Your Rating Now
          </Button>
        </Link>
      </div>

      <h2>Related Guides</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/guides/improve-epc-rating" className="block p-4 border border-border rounded-lg hover:border-primary/50 transition-colors">
          <h3 className="font-semibold text-primary mb-2">How to Improve Your EPC Rating</h3>
          <p className="text-sm text-muted-foreground">Top 10 cost-effective improvements ranked by payback period and energy savings.</p>
        </Link>
        <Link href="/guides/uk-energy-grants-2026" className="block p-4 border border-border rounded-lg hover:border-primary/50 transition-colors">
          <h3 className="font-semibold text-primary mb-2">UK Energy Grants 2026</h3>
          <p className="text-sm text-muted-foreground">Free insulation, boiler upgrades, and local authority funding available now.</p>
        </Link>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": "EPC Rating Explained: What Your Home's Energy Score Means",
            "description": "Understand EPC ratings A-G, how they're calculated using SAP methodology, annual energy costs by rating band, and why EPC matters for selling, renting, mortgages, and MEES regulations.",
            "author": {
              "@type": "Organization",
              "name": "Evolving Home Team"
            },
            "publisher": {
              "@type": "Organization",
              "name": "Evolving Home"
            },
            "datePublished": "2026-02-12",
            "dateModified": "2026-02-12",
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": "https://evolvinghome.ai/guides/epc-rating-explained"
            },
            "articleSection": "Energy Efficiency",
            "keywords": "EPC rating, energy performance certificate, home energy efficiency, SAP calculation, UK energy costs",
            "about": [
              {
                "@type": "Thing",
                "name": "Energy Performance Certificate"
              },
              {
                "@type": "Thing",
                "name": "Home Energy Efficiency"
              }
            ]
          })
        }}
      />
    </div>
  );
}