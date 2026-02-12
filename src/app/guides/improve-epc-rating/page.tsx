import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "How to Improve Your EPC Rating: Top 10 Cost-Effective Improvements",
  description: "Ranked list of energy efficiency improvements with costs, annual savings, EPC rating boosts, and payback periods. From loft insulation to heat pumps.",
  openGraph: {
    title: "How to Improve Your EPC Rating: Top 10 Cost-Effective Improvements",
    description: "Data-driven guide to the most effective ways to boost your home's energy efficiency rating and reduce bills.",
    url: "https://evolvinghome.ai/guides/improve-epc-rating",
    siteName: "Evolving Home",
    type: "website",
  },
  alternates: {
    canonical: "https://evolvinghome.ai/guides/improve-epc-rating",
  },
  other: {
    "article:author": "Evolving Home Team",
    "article:published_time": "2026-02-12T00:00:00.000Z",
    "article:section": "Energy Efficiency",
  },
};

const improvements = [
  {
    rank: 1,
    name: "Loft Insulation",
    description: "Adding or upgrading insulation in your loft space",
    cost: "£300-£600",
    annualSavings: "£150-£300",
    epcImprovement: "+1-2 bands",
    paybackPeriod: "1-3 years",
    co2Savings: "0.5-1 tonne/year",
    icon: "🏠",
  },
  {
    rank: 2,
    name: "Cavity Wall Insulation",
    description: "Filling gaps in external cavity walls with insulating material",
    cost: "£500-£1,000",
    annualSavings: "£150-£250",
    epcImprovement: "+1 band",
    paybackPeriod: "2-5 years",
    co2Savings: "0.4-0.8 tonne/year",
    icon: "🧱",
  },
  {
    rank: 3,
    name: "LED Lighting Upgrade",
    description: "Replacing all incandescent and halogen bulbs with LED equivalents",
    cost: "£100-£300",
    annualSavings: "£50-£100",
    epcImprovement: "+0.5-1 band",
    paybackPeriod: "1-3 years",
    co2Savings: "0.1-0.2 tonne/year",
    icon: "💡",
  },
  {
    rank: 4,
    name: "Smart Thermostat",
    description: "Installing a programmable or smart heating control system",
    cost: "£150-£400",
    annualSavings: "£80-£150",
    epcImprovement: "+0.5-1 band",
    paybackPeriod: "1-3 years",
    co2Savings: "0.2-0.4 tonne/year",
    icon: "🌡️",
  },
  {
    rank: 5,
    name: "Draught Proofing",
    description: "Sealing gaps around doors, windows, and other openings",
    cost: "£100-£300",
    annualSavings: "£50-£100",
    epcImprovement: "+0.5 band",
    paybackPeriod: "1-3 years",
    co2Savings: "0.1-0.3 tonne/year",
    icon: "🚪",
  },
  {
    rank: 6,
    name: "Floor Insulation",
    description: "Insulating floors, especially ground floors and suspended floors",
    cost: "£800-£1,500",
    annualSavings: "£100-£200",
    epcImprovement: "+1 band",
    paybackPeriod: "4-8 years",
    co2Savings: "0.3-0.6 tonne/year",
    icon: "🏢",
  },
  {
    rank: 7,
    name: "Double Glazing",
    description: "Replacing single-glazed windows with energy-efficient double glazing",
    cost: "£3,000-£6,000",
    annualSavings: "£200-£400",
    epcImprovement: "+1 band",
    paybackPeriod: "8-15 years",
    co2Savings: "0.5-1 tonne/year",
    icon: "🪟",
  },
  {
    rank: 8,
    name: "Boiler Upgrade",
    description: "Replacing old boiler with a modern condensing boiler",
    cost: "£800-£1,500",
    annualSavings: "£150-£300",
    epcImprovement: "+1-2 bands",
    paybackPeriod: "3-7 years",
    co2Savings: "0.8-1.5 tonne/year",
    icon: "🔥",
  },
  {
    rank: 9,
    name: "Air Source Heat Pump",
    description: "Installing an air source heat pump to replace or supplement heating",
    cost: "£7,000-£12,000",
    annualSavings: "£400-£800",
    epcImprovement: "+2-3 bands",
    paybackPeriod: "9-20 years",
    co2Savings: "1-2 tonne/year",
    icon: "⚡",
  },
  {
    rank: 10,
    name: "Solar PV Panels",
    description: "Installing solar photovoltaic panels on your roof",
    cost: "£5,000-£8,000",
    annualSavings: "£300-£600",
    epcImprovement: "+1-2 bands",
    paybackPeriod: "8-15 years",
    co2Savings: "0.8-1.5 tonne/year",
    icon: "☀️",
  },
];

export default function ImproveEPCRatingsPage() {
  return (
    <div className="prose prose-invert max-w-none">
      <div className="mb-8">
        <nav className="text-sm text-muted-foreground mb-4">
          <Link href="/" className="hover:text-primary">Home</Link> /
          <Link href="/guides" className="hover:text-primary"> Guides</Link> /
          <span className="text-foreground"> Improve EPC Rating</span>
        </nav>
        <p className="text-sm text-muted-foreground">Last updated: February 12, 2026 | By Evolving Home Team</p>
      </div>

      <h1>How to Improve Your EPC Rating: Top 10 Cost-Effective Improvements</h1>

      <p className="lead">
        Want to boost your home's energy efficiency and reduce energy bills? Here's our data-driven
        ranking of the most effective improvements, ranked by cost-effectiveness and potential EPC rating gains.
      </p>

      <div className="bg-primary/10 border border-primary/20 rounded-lg p-6 my-8">
        <h3 className="text-lg font-semibold mb-2 text-primary">💡 Key Insight</h3>
        <p>
          The most cost-effective improvements typically involve insulation and simple upgrades,
          while major system changes like heat pumps offer bigger savings but longer payback periods.
        </p>
      </div>

      <h2>Methodology</h2>

      <p>
        Our ranking considers:
      </p>

      <ul>
        <li><strong>Payback period:</strong> How quickly you recoup the investment</li>
        <li><strong>EPC improvement:</strong> Potential rating band increases</li>
        <li><strong>Annual savings:</strong> Typical energy bill reductions</li>
        <li><strong>Cost range:</strong> Average UK installation costs (2026)</li>
        <li><strong>Eligibility for grants:</strong> Available government funding</li>
      </ul>

      <p className="text-sm text-muted-foreground">
        Data based on Energy Saving Trust research, government EPC calculations, and installer quotes.
        Actual results vary by home type, current rating, and local conditions.
      </p>

      <h2>Top 10 Energy Efficiency Improvements</h2>

      <div className="space-y-8">
        {improvements.map((improvement) => (
          <div key={improvement.rank} className="border border-border rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="text-3xl">{improvement.icon}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold">
                    #{improvement.rank}
                  </span>
                  <h3 className="text-xl font-semibold">{improvement.name}</h3>
                </div>

                <p className="text-muted-foreground mb-4">{improvement.description}</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Cost</div>
                    <div className="font-semibold">{improvement.cost}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Annual Savings</div>
                    <div className="font-semibold text-green-600">{improvement.annualSavings}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">EPC Improvement</div>
                    <div className="font-semibold text-primary">{improvement.epcImprovement}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Payback Period</div>
                    <div className="font-semibold">{improvement.paybackPeriod}</div>
                  </div>
                </div>

                <div className="text-sm text-muted-foreground">
                  CO2 savings: {improvement.co2Savings} | Grant eligible: {improvement.rank <= 8 ? 'Yes' : 'Partial'}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <h2>Detailed Analysis by Improvement</h2>

      <h3>1. Loft Insulation - The Best Bang for Your Buck</h3>
      <p>
        Loft insulation is often the cheapest and most effective improvement you can make.
        Most UK homes have inadequate loft insulation (should be 270mm minimum).
        Adding or topping up can improve your EPC by 1-2 bands and pay for itself in 1-3 years.
      </p>

      <h3>2. Cavity Wall Insulation - Quick Wins</h3>
      <p>
        If your home has cavity walls (built 1920-1980s), filling the cavity with insulating foam
        is relatively inexpensive and effective. Check if your walls are already insulated first.
      </p>

      <h3>3. LED Lighting - Simple and Immediate</h3>
      <p>
        LED bulbs use 75% less energy than incandescent bulbs and last 25x longer.
        Replace all bulbs in your home for quick savings and a small EPC boost.
      </p>

      <h3>4. Smart Thermostat - Intelligent Heating</h3>
      <p>
        Modern thermostats learn your habits and optimize heating schedules.
        Models like Nest or Hive can reduce heating costs by 10-20% through better control.
      </p>

      <h3>5. Draught Proofing - Seal the Gaps</h3>
      <p>
        Sealing gaps around doors, windows, and pipes prevents heat loss.
        Use brush strips, foam fillers, and letterbox brushes for comprehensive sealing.
      </p>

      <h3>6. Floor Insulation - Often Overlooked</h3>
      <p>
        Ground floor insulation prevents heat loss through concrete floors.
        Suspended floor insulation fills the void beneath wooden floors.
      </p>

      <h3>7. Double Glazing - Major Investment</h3>
      <p>
        Modern double glazing reduces heat loss through windows by 50-70%.
        While expensive, it significantly improves comfort and reduces condensation.
      </p>

      <h3>8. Boiler Upgrade - System Efficiency</h3>
      <p>
        Modern condensing boilers are 85-90% efficient vs 60-70% for old models.
        Consider a system boiler for better hot water performance.
      </p>

      <h3>9. Heat Pumps - Future-Proof Heating</h3>
      <p>
        Air source heat pumps provide heating and hot water using electricity.
        Highly efficient but require good insulation and possibly electrical upgrades.
      </p>

      <h3>10. Solar PV - Generate Your Own Power</h3>
      <p>
        Solar panels generate electricity from sunlight, reducing your grid reliance.
        Battery storage can increase self-consumption and EPC benefits.
      </p>

      <h2>Government Grants and Funding</h2>

      <p>
        Many improvements qualify for government grants:</p>

      <ul>
        <li><strong>BUS (Boiler Upgrade Scheme):</strong> £7,500 towards heat pumps</li>
        <li><strong>ECO4:</strong> Free insulation for eligible households</li>
        <li><strong>Great British Insulation Scheme:</strong> Free loft and cavity wall insulation</li>
        <li><strong>Local authority grants:</strong> Additional funding in some areas</li>
      </ul>

      <div className="bg-primary/10 border border-primary/20 rounded-lg p-6 my-8">
        <h3 className="text-xl font-semibold mb-4 text-primary">See Exactly What YOUR Home Needs</h3>
        <p className="mb-4">
          Get a personalized improvement plan with costs, savings, grant eligibility,
          and exact EPC rating improvements for your specific property.
        </p>
        <Link href="/">
          <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
            Get Your Free Plan
          </Button>
        </Link>
      </div>

      <h2>Factors Affecting Results</h2>

      <p>
        The effectiveness of improvements depends on:
      </p>

      <ul>
        <li><strong>Current EPC rating:</strong> Bigger gains from lower-rated homes</li>
        <li><strong>Home type:</strong> Detached houses have more surface area to insulate</li>
        <li><strong>Local climate:</strong> Colder areas see bigger savings</li>
        <li><strong>Usage patterns:</strong> Full-time residents benefit more than holiday homes</li>
        <li><strong>Installation quality:</strong> Professional installation ensures optimal performance</li>
      </ul>

      <h2>Next Steps</h2>

      <ol>
        <li><strong>Get your current EPC:</strong> Check your rating and potential improvements</li>
        <li><strong>Prioritize quick wins:</strong> Start with insulation and simple upgrades</li>
        <li><strong>Check grant eligibility:</strong> See what funding is available</li>
        <li><strong>Get quotes:</strong> Compare multiple installers for best prices</li>
        <li><strong>Plan for the future:</strong> Consider renewable technologies for long-term benefits</li>
      </ol>

      <h2>Related Guides</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/guides/epc-rating-explained" className="block p-4 border border-border rounded-lg hover:border-primary/50 transition-colors">
          <h3 className="font-semibold text-primary mb-2">EPC Rating Explained</h3>
          <p className="text-sm text-muted-foreground">What EPC ratings A-G mean and how they're calculated.</p>
        </Link>
        <Link href="/guides/uk-energy-grants-2026" className="block p-4 border border-border rounded-lg hover:border-primary/50 transition-colors">
          <h3 className="font-semibold text-primary mb-2">UK Energy Grants 2026</h3>
          <p className="text-sm text-muted-foreground">Free insulation, boiler upgrades, and funding available now.</p>
        </Link>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": "How to Improve Your EPC Rating: Top 10 Cost-Effective Improvements",
            "description": "Ranked list of energy efficiency improvements with costs, annual savings, EPC rating boosts, and payback periods. From loft insulation to heat pumps.",
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
              "@id": "https://evolvinghome.ai/guides/improve-epc-rating"
            },
            "articleSection": "Energy Efficiency",
            "keywords": "EPC improvement, energy efficiency upgrades, home insulation, heat pumps, solar panels, energy savings",
            "about": [
              {
                "@type": "Thing",
                "name": "Home Energy Efficiency"
              },
              {
                "@type": "Thing",
                "name": "Energy Performance Certificate"
              }
            ]
          })
        }}
      />
    </div>
  );
}