import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Are Solar Panels Worth It in the UK? Costs, Savings & Payback",
  description: "UK solar generation data, typical costs (£5-8k for 4kW), export rates, regional payback periods, and battery storage analysis. Is solar worth it in 2026?",
  openGraph: {
    title: "Are Solar Panels Worth It in the UK? Costs, Savings & Payback",
    description: "Data-driven analysis of solar panel costs, savings, and payback periods across UK regions. Includes battery storage and export tariffs.",
    url: "https://evolvinghome.ai/guides/solar-panels-uk",
    siteName: "Evolving Home",
    type: "website",
  },
  alternates: {
    canonical: "https://evolvinghome.ai/guides/solar-panels-uk",
  },
  other: {
    "article:author": "Evolving Home Team",
    "article:published_time": "2026-02-12T00:00:00.000Z",
    "article:section": "Energy Efficiency",
  },
};

const regionalData = [
  {
    region: "South West England",
    sunshineHours: "1,600-1,800",
    annualGeneration: "3,200-3,600 kWh",
    paybackPeriod: "8-10 years",
    savings20Years: "£15,000-£20,000",
  },
  {
    region: "South East England",
    sunshineHours: "1,500-1,700",
    annualGeneration: "3,000-3,400 kWh",
    paybackPeriod: "9-11 years",
    savings20Years: "£13,000-£18,000",
  },
  {
    region: "East Anglia",
    sunshineHours: "1,400-1,600",
    annualGeneration: "2,800-3,200 kWh",
    paybackPeriod: "10-12 years",
    savings20Years: "£12,000-£16,000",
  },
  {
    region: "London & Home Counties",
    sunshineHours: "1,300-1,500",
    annualGeneration: "2,600-3,000 kWh",
    paybackPeriod: "11-13 years",
    savings20Years: "£11,000-£15,000",
  },
  {
    region: "West Midlands",
    sunshineHours: "1,200-1,400",
    annualGeneration: "2,400-2,800 kWh",
    paybackPeriod: "12-14 years",
    savings20Years: "£10,000-£14,000",
  },
  {
    region: "North England",
    sunshineHours: "1,100-1,300",
    annualGeneration: "2,200-2,600 kWh",
    paybackPeriod: "13-15 years",
    savings20Years: "£9,000-£13,000",
  },
  {
    region: "Scotland",
    sunshineHours: "1,000-1,200",
    annualGeneration: "2,000-2,400 kWh",
    paybackPeriod: "14-16 years",
    savings20Years: "£8,000-£12,000",
  },
];

export default function SolarPanelsUKPage() {
  return (
    <div className="prose prose-invert max-w-none">
      <div className="mb-8">
        <nav className="text-sm text-muted-foreground mb-4">
          <Link href="/" className="hover:text-primary">Home</Link> /
          <Link href="/guides" className="hover:text-primary"> Guides</Link> /
          <span className="text-foreground"> Solar Panels UK</span>
        </nav>
        <p className="text-sm text-muted-foreground">Last updated: February 12, 2026 | By Evolving Home Team</p>
      </div>

      <h1>Are Solar Panels Worth It in the UK? Costs, Savings & Payback</h1>

      <p className="lead">
        Solar panels can save UK homeowners £300-£600 per year on energy bills and pay for themselves
        in 8-16 years depending on location. With rising electricity costs and government incentives,
        now is a good time to consider solar PV installation.
      </p>

      <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-6 my-8">
        <h3 className="text-lg font-semibold mb-2 text-yellow-400">⚡ Key Finding</h3>
        <p>
          A typical 4kW solar system in the South West generates enough electricity to power an average
          UK home, with payback periods of 8-10 years and 20+ years of free electricity thereafter.
        </p>
      </div>

      <h2>Solar Generation in the UK</h2>

      <p>
        Contrary to popular belief, the UK gets enough sunlight for solar to be viable. According to
        PVGIS data (European Commission's solar irradiance database), UK solar generation varies by region:
      </p>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-border my-4">
          <thead>
            <tr className="bg-muted">
              <th className="border border-border p-3 text-left">Region</th>
              <th className="border border-border p-3 text-left">Sunshine Hours/Year</th>
              <th className="border border-border p-3 text-left">4kW System Generation</th>
              <th className="border border-border p-3 text-left">Payback Period</th>
              <th className="border border-border p-3 text-left">20-Year Savings</th>
            </tr>
          </thead>
          <tbody>
            {regionalData.map((region, index) => (
              <tr key={index}>
                <td className="border border-border p-3 font-semibold">{region.region}</td>
                <td className="border border-border p-3">{region.sunshineHours}</td>
                <td className="border border-border p-3">{region.annualGeneration}</td>
                <td className="border border-border p-3">{region.paybackPeriod}</td>
                <td className="border border-border p-3 text-green-600">{region.savings20Years}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-sm text-muted-foreground">
        Based on PVGIS data, 2026 electricity prices, and Smart Export Guarantee rates.
        Actual generation depends on roof orientation, shading, and system efficiency.
      </p>

      <h2>Typical Solar Panel Costs (2026)</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
        <div className="border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">Small System (2kW)</h3>
          <div className="text-2xl font-bold text-primary mb-2">£3,000-£4,000</div>
          <p className="text-sm text-muted-foreground">8-12 panels, suitable for small homes or flats</p>
          <p className="text-sm mt-2">Annual generation: 1,800-2,200 kWh</p>
        </div>

        <div className="border border-border rounded-lg p-6 bg-primary/5 border-primary/20">
          <h3 className="text-lg font-semibold mb-2">Standard System (4kW)</h3>
          <div className="text-2xl font-bold text-primary mb-2">£5,000-£7,000</div>
          <p className="text-sm text-muted-foreground">16-20 panels, most popular size</p>
          <p className="text-sm mt-2">Annual generation: 2,800-3,600 kWh</p>
        </div>

        <div className="border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">Large System (6kW+)</h3>
          <div className="text-2xl font-bold text-primary mb-2">£8,000-£12,000</div>
          <p className="text-sm text-muted-foreground">24+ panels, for larger homes or export focus</p>
          <p className="text-sm mt-2">Annual generation: 4,000-5,500 kWh</p>
        </div>
      </div>

      <p>
        Costs include panels, inverter, installation, and VAT. Prices vary by installer and location.
        MCS accredited installers required for government schemes.
      </p>

      <h2>Financial Benefits</h2>

      <h3>Electricity Bill Savings</h3>
      <p>
        Solar panels reduce your electricity bills by generating your own power. At current UK rates
        (around 27p/kWh), a 4kW system saves £800-£1,000 annually.
      </p>

      <h3>Smart Export Guarantee (SEG)</h3>
      <p>
        Since 2022, UK households can earn money by exporting excess solar power to the grid.
        Current rates: 10-15p/kWh depending on supplier.
      </p>

      <p>
        For a 4kW system, this adds £150-£300 annual income from exported electricity.
      </p>

      <h3>Government Incentives</h3>
      <ul>
        <li><strong>Smart Export Guarantee:</strong> 10-15p/kWh for exported power</li>
        <li><strong>VAT reduction:</strong> 5% on installation (was 0% until 2026)</li>
        <li><strong>Possible grants:</strong> Local authority funding in some areas</li>
        <li><strong>EPC boost:</strong> +1-2 bands, increasing property value</li>
      </ul>

      <h2>Payback Period Calculation</h2>

      <p>
        Payback period = Total cost ÷ Annual savings + export income
      </p>

      <div className="bg-muted p-4 rounded-lg my-6">
        <h4 className="font-semibold mb-2">Example: 4kW System in South West (£6,000 installed)</h4>
        <ul className="text-sm space-y-1">
          <li>Annual electricity savings: £900 (3,300 kWh × 27p/kWh)</li>
          <li>Annual export income: £250 (1,700 kWh exported × 15p/kWh)</li>
          <li>Total annual benefit: £1,150</li>
          <li>Payback period: 6,000 ÷ 1,150 = 5.2 years</li>
        </ul>
        <p className="text-sm mt-2 text-muted-foreground">
          *Assumes 55% self-consumption, 45% export. Actual figures vary.
        </p>
      </div>

      <h2>Battery Storage Worth It?</h2>

      <p>
        Battery storage increases self-consumption from 30-50% to 70-90%, reducing grid reliance
        and maximizing savings. However, batteries add £5,000-£10,000 to installation costs.
      </p>

      <h3>Pros of Battery Storage:</h3>
      <ul>
        <li>Higher self-consumption (use more of your solar power)</li>
        <li>Energy independence during outages</li>
        <li>Reduced export (but you earn less from SEG)</li>
        <li>EPC rating boost (renewables improve ratings)</li>
      </ul>

      <h3>Cons:</h3>
      <ul>
        <li>Increased upfront cost (£8,000-£15,000 total for system + battery)</li>
        <li>Longer payback period (12-18 years vs 8-10 without)</li>
        <li>Additional maintenance and replacement costs</li>
      </ul>

      <p>
        <strong>Recommendation:</strong> Batteries make sense if you want energy independence or have
        high evening energy use. For most households, solar-only systems provide better financial returns.
      </p>

      <h2>Installation Considerations</h2>

      <h3>Roof Suitability</h3>
      <ul>
        <li><strong>South-facing roofs:</strong> Best orientation (generate 20-30% more)</li>
        <li><strong>Roof pitch:</strong> 30-40° ideal, but most roofs work</li>
        <li><strong>Shading:</strong> Trees or nearby buildings reduce output by 10-50%</li>
        <li><strong>Roof type:</strong> Tiles, slates, or flat roofs all suitable</li>
      </ul>

      <h3>Planning Permission</h3>
      <p>
        Most domestic solar installations don't need planning permission in the UK, but check:
      </p>

      <ul>
        <li>Listed buildings may need consent</li>
        <li>Conservation areas may have restrictions</li>
        <li>Flat roofs may need different considerations</li>
      </ul>

      <h3>System Components</h3>
      <ul>
        <li><strong>Panels:</strong> Monocrystalline (most efficient, 15-20 year warranty)</li>
        <li><strong>Inverter:</strong> Converts DC to AC power (10 year warranty typical)</li>
        <li><strong>Mounting:</strong> Secure fixing to roof structure</li>
        <li><strong>Metering:</strong> Export meter required for SEG payments</li>
      </ul>

      <h2>Maintenance and Warranty</h2>

      <p>
        Solar systems require minimal maintenance but regular checks are recommended:
      </p>

      <ul>
        <li><strong>Annual inspection:</strong> Check panels and connections</li>
        <li><strong>Cleaning:</strong> Rain usually sufficient, occasional manual clean if needed</li>
        <li><strong>Inverter replacement:</strong> Every 10-15 years (£800-£1,500)</li>
        <li><strong>Panel degradation:</strong> 0.5-1% annual power loss (still 80% output after 25 years)</li>
      </ul>

      <h2>Return on Investment</h2>

      <p>
        Over 25 years, a £6,000 solar system typically provides:
      </p>

      <ul>
        <li>£18,000-£25,000 in electricity bill savings</li>
        <li>£3,000-£5,000 in export income (SEG)</li>
        <li>5-10% increase in property value</li>
        <li>Reduced carbon emissions (2-3 tonnes CO2 per year)</li>
      </ul>

      <p>
        Total ROI: 300-400% over system lifetime.
      </p>

      <h2>Is Solar Worth It in 2026?</h2>

      <p>
        <strong>Yes, for most UK homeowners:</strong>
      </p>

      <ul>
        <li>Rising electricity costs make solar more valuable</li>
        <li>Technology improvements increase efficiency</li>
        <li>Government support through SEG</li>
        <li>Environmental benefits and energy independence</li>
        <li>Property value increase</li>
      </ul>

      <p>
        <strong>Less suitable if:</strong>
      </p>

      <ul>
        <li>You plan to move within 5-7 years</li>
        <li>Your roof has significant shading</li>
        <li>You have very low electricity usage</li>
        <li>Installation costs are prohibitive</li>
      </ul>

      <div className="bg-primary/10 border border-primary/20 rounded-lg p-6 my-8">
        <h3 className="text-xl font-semibold mb-4 text-primary">See Your Home's Solar Potential</h3>
        <p className="mb-4">
          Get a free solar assessment for your property, including generation estimates,
          payback calculations, and installer quotes tailored to your roof and energy usage.
        </p>
        <Link href="/">
          <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
            Check Solar Potential
          </Button>
        </Link>
      </div>

      <h2>Next Steps</h2>

      <ol>
        <li><strong>Check roof suitability:</strong> South-facing, minimal shading</li>
        <li><strong>Get multiple quotes:</strong> MCS accredited installers only</li>
        <li><strong>Consider battery storage:</strong> If energy independence is priority</li>
        <li><strong>Check SEG rates:</strong> Compare suppliers for best export payments</li>
        <li><strong>Plan for future:</strong> Consider EV charging integration</li>
      </ol>

      <h2>Related Guides</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/guides/improve-epc-rating" className="block p-4 border border-border rounded-lg hover:border-primary/50 transition-colors">
          <h3 className="font-semibold text-primary mb-2">Improve Your EPC Rating</h3>
          <p className="text-sm text-muted-foreground">Top 10 energy efficiency improvements including solar panels.</p>
        </Link>
        <Link href="/guides/uk-energy-grants-2026" className="block p-4 border border-border rounded-lg hover:border-primary/50 transition-colors">
          <h3 className="font-semibold text-primary mb-2">UK Energy Grants 2026</h3>
          <p className="text-sm text-muted-foreground">Government funding that can reduce solar installation costs.</p>
        </Link>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": "Are Solar Panels Worth It in the UK? Costs, Savings & Payback",
            "description": "UK solar generation data, typical costs (£5-8k for 4kW), export rates, regional payback periods, and battery storage analysis.",
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
              "@id": "https://evolvinghome.ai/guides/solar-panels-uk"
            },
            "articleSection": "Energy Efficiency",
            "keywords": "solar panels UK, solar PV costs, solar payback period, Smart Export Guarantee, solar battery storage",
            "about": [
              {
                "@type": "Thing",
                "name": "Solar Energy"
              },
              {
                "@type": "Thing",
                "name": "Photovoltaic Systems"
              }
            ]
          })
        }}
      />
    </div>
  );
}