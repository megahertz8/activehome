import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import TableOfContents from "@/components/TableOfContents";

export const metadata: Metadata = {
  title: "Energy Guides | Evolving Home",
  description: "Expert guides on home energy efficiency, EPC ratings, solar panels, and UK energy grants. Improve your home's energy score and save money.",
};

export default function GuidesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-primary">
              Evolving Home
            </Link>
            <Link href="/guides">
              <Button variant="ghost">All Guides</Button>
            </Link>
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Table of Contents */}
          <aside className="lg:col-span-1">
            <div className="sticky top-8">
              <h3 className="font-semibold mb-4 text-foreground">Table of Contents</h3>
              <TableOfContents />
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3 prose prose-invert max-w-none">
            {children}
          </main>
        </div>
      </div>

      {/* Footer CTA */}
      <footer className="border-t border-border mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-4 text-foreground">
              Ready to improve your home's energy efficiency?
            </h3>
            <p className="text-muted-foreground mb-6">
              Get your free energy score and personalised improvement plan in 30 seconds.
            </p>
            <Link href="/">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                Check Your Home's Rating
              </Button>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}