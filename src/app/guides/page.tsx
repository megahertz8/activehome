import { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Energy Efficiency Guides | Evolving Home",
  description: "Comprehensive guides on EPC ratings, energy improvements, solar panels, and UK energy grants. Improve your home's energy efficiency and save money.",
  openGraph: {
    title: "Energy Efficiency Guides | Evolving Home",
    description: "Expert guides to help you understand and improve your home's energy efficiency.",
    url: "https://evolvinghome.ai/guides",
    siteName: "Evolving Home",
    type: "website",
  },
  alternates: {
    canonical: "https://evolvinghome.ai/guides",
  },
};

const guides = [
  {
    slug: "epc-rating-explained",
    title: "EPC Rating Explained: What Your Home's Energy Score Means",
    description: "Understand EPC ratings A-G, how they're calculated, annual costs, and why they matter for selling, renting, and mortgages.",
    thumbnail: "/images/guides/epc-rating.jpg",
    readTime: "8 min read",
  },
  {
    slug: "improve-epc-rating",
    title: "How to Improve Your EPC Rating: Top 10 Cost-Effective Improvements",
    description: "Ranked list of energy efficiency improvements with costs, savings, payback periods, and EPC rating boosts.",
    thumbnail: "/images/guides/improve-epc.jpg",
    readTime: "12 min read",
  },
  {
    slug: "uk-energy-grants-2026",
    title: "UK Energy Grants 2026: Free Insulation, Boiler Upgrades & More",
    description: "Complete guide to BUS, ECO4, Great British Insulation Scheme, and local grants. Check eligibility and apply.",
    thumbnail: "/images/guides/grants-2026.jpg",
    readTime: "10 min read",
  },
  {
    slug: "solar-panels-uk",
    title: "Are Solar Panels Worth It in the UK? Costs, Savings & Payback",
    description: "UK solar generation data, typical costs, export rates, regional payback periods, and battery storage analysis.",
    thumbnail: "/images/guides/solar-uk.jpg",
    readTime: "15 min read",
  },
];

export default function GuidesPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-primary">
              Evolving Home
            </Link>
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-4 text-foreground">
            Energy Efficiency Guides
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Expert, data-driven guides to help you understand and improve your home's energy efficiency.
            All information is based on real UK statistics and government data.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {guides.map((guide) => (
              <Card key={guide.slug} className="bg-card border-border hover:border-primary/50 transition-colors">
                <CardHeader>
                  <CardTitle className="text-lg text-foreground hover:text-primary">
                    <Link href={`/guides/${guide.slug}`}>
                      {guide.title}
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    {guide.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {guide.readTime}
                    </span>
                    <Link href={`/guides/${guide.slug}`}>
                      <span className="text-primary hover:underline">Read Guide →</span>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-16 text-center">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">
              Ready to Get Your Home's Energy Score?
            </h2>
            <p className="text-muted-foreground mb-6">
              See your EPC rating, potential savings, and personalised improvement recommendations.
            </p>
            <Link href="/">
              <button className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-lg font-semibold transition-colors">
                Check Your Rating Free
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}