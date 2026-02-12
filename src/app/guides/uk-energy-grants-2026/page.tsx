import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "UK Energy Grants 2026: Free Insulation, Boiler Upgrades & More",
  description: "Complete guide to UK energy grants in 2026: BUS (£7,500 for heat pumps), ECO4 (free insulation), Great British Insulation Scheme, and local authority funding. Check eligibility and apply.",
  openGraph: {
    title: "UK Energy Grants 2026: Free Insulation, Boiler Upgrades & More",
    description: "Don't pay for energy efficiency improvements. Discover all available UK government grants and schemes for 2026.",
    url: "https://evolvinghome.ai/guides/uk-energy-grants-2026",
    siteName: "Evolving Home",
    type: "website",
  },
  alternates: {
    canonical: "https://evolvinghome.ai/guides/uk-energy-grants-2026",
  },
  other: {
    "article:author": "Evolving Home Team",
    "article:published_time": "2026-02-12T00:00:00.000Z",
    "article:section": "Energy Efficiency",
  },
};

const grants = [
  {
    name: "Boiler Upgrade Scheme (BUS)",
    description: "Government-funded scheme providing £7,500 towards heat pump installations",
    amount: "£7,500",
    eligible: "Homeowners, private landlords",
    requirements: "EPC D or below, off-gas properties prioritized",
    deadline: "Ongoing until 2028",
    icon: "🔥",
  },
  {
    name: "ECO4 Insulation Scheme",
    description: "Free insulation for eligible low-income and vulnerable households",
    amount: "Up to £8,000 (fully funded)",
    eligible: "Low-income households, vulnerable people, social housing",
    requirements: "Priority given to EPC F/G ratings, fuel poverty indicators",
    deadline: "Ongoing",
    icon: "🏠",
  },
  {
    name: "Great British Insulation Scheme",
    description: "Free loft and cavity wall insulation for hard-to-treat homes",
    amount: "Fully funded",
    eligible: "Homeowners, social housing",
    requirements: "Hard-to-treat properties, EPC D or below",
    deadline: "Ongoing",
    icon: "🛡️",
  },
  {
    name: "Home Upgrade Grant",
    description: "£8,000 towards energy efficiency improvements",
    amount: "£8,000",
    eligible: "Homeowners, private landlords",
    requirements: "EPC D or below, focus on whole-house retrofits",
    deadline: "2027",
    icon: "⚡",
  },
  {
    name: "Local Authority Grants",
    description: "Additional funding from local councils and authorities",
    amount: "£500-£5,000",
    eligible: "Varies by local authority",
    requirements: "Local residency, income criteria may apply",
    deadline: "Varies",
    icon: "🏛️",
  },
];

const eligibilityCriteria = [
  "Household income below certain thresholds",
  "EPC rating of D or below (some schemes)",
  "Vulnerable groups (disabled, elderly, families with children)",
  "Off-gas properties (for heat pumps)",
  "Social housing tenants",
  "Properties in fuel poverty areas",
];

export default function UKEnergyGrants2026Page() {
  return (
    <div className="prose prose-invert max-w-none">
      <div className="mb-8">
        <nav className="text-sm text-muted-foreground mb-4">
          <Link href="/" className="hover:text-primary">Home</Link> /
          <Link href="/guides" className="hover:text-primary"> Guides</Link> /
          <span className="text-foreground"> UK Energy Grants 2026</span>
        </nav>
        <p className="text-sm text-muted-foreground">Last updated: February 12, 2026 | By Evolving Home Team</p>
      </div>

      <h1>UK Energy Grants 2026: Free Insulation, Boiler Upgrades & More</h1>

      <p className="lead">
        Don't pay thousands for energy efficiency improvements. The UK government offers
        numerous grants and schemes in 2026 that can fund your home upgrades, from free insulation
        to £7,500 towards heat pumps.
      </p>

      <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-6 my-8">
        <h3 className="text-lg font-semibold mb-2 text-green-400">💰 Potential Savings</h3>
        <p>
          Government grants can cover up to 100% of costs for qualifying improvements,
          saving you £5,000-£15,000 on energy efficiency upgrades.
        </p>
      </div>

      <h2>Major Energy Grant Schemes for 2026</h2>

      <div className="space-y-6">
        {grants.map((grant, index) => (
          <div key={index} className="border border-border rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="text-3xl">{grant.icon}</div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">{grant.name}</h3>
                <p className="text-muted-foreground mb-4">{grant.description}</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Grant Amount</div>
                    <div className="font-semibold text-green-600">{grant.amount}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Eligible For</div>
                    <div className="font-semibold">{grant.eligible}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Requirements</div>
                    <div className="font-semibold text-sm">{grant.requirements}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Deadline</div>
                    <div className="font-semibold">{grant.deadline}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <h2>Eligibility Criteria</h2>

      <p>
        Most energy grants have similar eligibility requirements. You may qualify if you meet
        one or more of these criteria:
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
        {eligibilityCriteria.map((criteria, index) => (
          <div key={index} className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg">
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            <span className="text-sm">{criteria}</span>
          </div>
        ))}
      </div>

      <h2>How to Apply for Energy Grants</h2>

      <h3>Step 1: Check Your Eligibility</h3>
      <p>
        Use our free eligibility checker to see which grants you qualify for based on your
        income, property details, and current energy efficiency.
      </p>

      <h3>Step 2: Get a Quote</h3>
      <p>
        Contact approved installers who can assess your property and provide grant-funded quotes.
        Look for TrustMark or MCS accredited contractors.
      </p>

      <h3>Step 3: Submit Application</h3>
      <p>
        Most schemes require installer-led applications. Your chosen contractor will handle
        the paperwork and ensure compliance with grant requirements.
      </p>

      <h3>Step 4: Installation and Payment</h3>
      <p>
        Once approved, the work is carried out and the grant is paid directly to the installer,
        meaning you pay nothing (or reduced amounts) for qualifying improvements.
      </p>

      <h2>Popular Grant-Funded Improvements</h2>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-border my-4">
          <thead>
            <tr className="bg-muted">
              <th className="border border-border p-3 text-left">Improvement</th>
              <th className="border border-border p-3 text-left">Typical Cost</th>
              <th className="border border-border p-3 text-left">Grant Coverage</th>
              <th className="border border-border p-3 text-left">Your Cost</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-border p-3">Loft Insulation</td>
              <td className="border border-border p-3">£500</td>
              <td className="border border-border p-3">100%</td>
              <td className="border border-border p-3 text-green-600">£0</td>
            </tr>
            <tr>
              <td className="border border-border p-3">Cavity Wall Insulation</td>
              <td className="border border-border p-3">£800</td>
              <td className="border border-border p-3">100%</td>
              <td className="border border-border p-3 text-green-600">£0</td>
            </tr>
            <tr>
              <td className="border border-border p-3">Air Source Heat Pump</td>
              <td className="border border-border p-3">£10,000</td>
              <td className="border border-border p-3">£7,500 (BUS)</td>
              <td className="border border-border p-3">£2,500</td>
            </tr>
            <tr>
              <td className="border border-border p-3">Solar PV Panels</td>
              <td className="border border-border p-3">£6,000</td>
              <td className="border border-border p-3">Up to £2,500</td>
              <td className="border border-border p-3">£3,500</td>
            </tr>
            <tr>
              <td className="border border-border p-3">Double Glazing</td>
              <td className="border border-border p-3">£4,000</td>
              <td className="border border-border p-3">£1,000-£2,000</td>
              <td className="border border-border p-3">£2,000-£3,000</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>Common Grant Mistakes to Avoid</h2>

      <ul>
        <li><strong>Not checking eligibility first:</strong> Apply for grants you don't qualify for</li>
        <li><strong>Using non-approved installers:</strong> Only MCS accredited contractors can access grants</li>
        <li><strong>Rushing installations:</strong> Ensure proper surveys and quotes before committing</li>
        <li><strong>Missing deadlines:</strong> Some grants have limited funding and close early</li>
        <li><strong>Not claiming all available funding:</strong> Combine multiple grants where possible</li>
      </ul>

      <h2>Local Authority Grants</h2>

      <p>
        In addition to national schemes, many local authorities offer supplementary grants:
      </p>

      <ul>
        <li><strong>London Boroughs:</strong> Additional £500-£1,000 for qualifying improvements</li>
        <li><strong>Northern Powerhouse:</strong> Extra funding for energy efficiency in northern regions</li>
        <li><strong>Rural areas:</strong> Specific grants for off-gas properties in countryside locations</li>
        <li><strong>Historic buildings:</strong> Specialized funding for period properties</li>
      </ul>

      <p>
        Check your local council website or contact them directly to see available programs.
      </p>

      <h2>Future Changes (2026-2028)</h2>

      <p>
        The government has announced plans to expand grant funding:
      </p>

      <ul>
        <li><strong>Increased BUS funding:</strong> More money for heat pump installations</li>
        <li><strong>Expanded ECO4:</strong> More households eligible for free insulation</li>
        <li><strong>New green mortgage incentives:</strong> Lower rates for energy-efficient homes</li>
        <li><strong>Mandatory EPC improvements:</strong> Required for property sales from 2028</li>
      </ul>

      <div className="bg-primary/10 border border-primary/20 rounded-lg p-6 my-8">
        <h3 className="text-xl font-semibold mb-4 text-primary">We'll Match You With Grants You Qualify For</h3>
        <p className="mb-4">
          Get your free energy assessment and we'll show you exactly which grants and schemes
          you can access, including local authority funding and combined programs.
        </p>
        <Link href="/">
          <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
            Check Grant Eligibility
          </Button>
        </Link>
      </div>

      <h2>Frequently Asked Questions</h2>

      <h3>Do I have to pay anything for grant-funded work?</h3>
      <p>
        For fully-funded schemes like ECO4, you pay nothing. For part-funded schemes like BUS,
        you pay the difference between the grant amount and total cost.
      </p>

      <h3>How long does the application process take?</h3>
      <p>
        Most applications take 2-4 weeks for approval, depending on the scheme and your circumstances.
      </p>

      <h3>Can landlords claim energy grants?</h3>
      <p>
        Yes, private landlords can claim many grants, especially BUS and insulation schemes.
        Some grants require landlord accreditation.
      </p>

      <h3>What if my property is leasehold?</h3>
      <p>
        Leaseholders can usually claim grants, but may need freeholder permission for external work.
        Check your lease agreement.
      </p>

      <h2>Related Guides</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/guides/improve-epc-rating" className="block p-4 border border-border rounded-lg hover:border-primary/50 transition-colors">
          <h3 className="font-semibold text-primary mb-2">Improve Your EPC Rating</h3>
          <p className="text-sm text-muted-foreground">Top 10 cost-effective energy efficiency improvements.</p>
        </Link>
        <Link href="/guides/solar-panels-uk" className="block p-4 border border-border rounded-lg hover:border-primary/50 transition-colors">
          <h3 className="font-semibold text-primary mb-2">Solar Panels in the UK</h3>
          <p className="text-sm text-muted-foreground">Costs, savings, and payback periods for UK solar installations.</p>
        </Link>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": "UK Energy Grants 2026: Free Insulation, Boiler Upgrades & More",
            "description": "Complete guide to UK energy grants in 2026: BUS (£7,500 for heat pumps), ECO4 (free insulation), Great British Insulation Scheme, and local authority funding.",
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
              "@id": "https://evolvinghome.ai/guides/uk-energy-grants-2026"
            },
            "articleSection": "Energy Efficiency",
            "keywords": "UK energy grants, BUS scheme, ECO4, free insulation, heat pump grants, government funding",
            "about": [
              {
                "@type": "Thing",
                "name": "Energy Efficiency Grants"
              },
              {
                "@type": "Thing",
                "name": "Government Funding"
              }
            ]
          })
        }}
      />
    </div>
  );
}