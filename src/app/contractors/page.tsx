'use client';

import { useState } from 'react';
import { getAffiliatesByCategory } from '@/data/affiliates';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const categories = [
  { id: 'insulation', name: 'Insulation' },
  { id: 'solar', name: 'Solar' },
  { id: 'heat-pumps', name: 'Heat Pumps' },
];

export default function ContractorsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const displayCategories = selectedCategory ? [selectedCategory] : categories.map(c => c.id);

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <h1 className="text-4xl font-bold text-foreground">
            Find Vetted Contractors
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Connect with trusted UK contractors for your home upgrades
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          <Button
            variant={selectedCategory === null ? 'default' : 'outline'}
            onClick={() => setSelectedCategory(null)}
          >
            All Categories
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.id ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.name}
            </Button>
          ))}
        </div>

        {/* Contractors by Category */}
        {displayCategories.map((categoryId) => {
          const affiliates = getAffiliatesByCategory(categoryId);
          const categoryName = categories.find(c => c.id === categoryId)?.name || categoryId;

          return (
            <div key={categoryId} className="mb-16">
              <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
                {categoryName} Contractors
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {affiliates.map((affiliate) => {
                  const trackingUrl = `/api/track-click?aff=${affiliate.id}-${categoryId}`;
                  
                  return (
                    <Card
                      key={affiliate.id}
                      className="border-border hover:border-primary transition-all group"
                    >
                      <CardContent className="pt-6 flex flex-col items-center text-center space-y-4">
                        <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                          <img
                            src={affiliate.logo}
                            alt={affiliate.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-lg font-semibold text-foreground">
                            {affiliate.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {affiliate.description}
                          </p>
                        </div>
                        <Button
                          asChild
                          className="w-full mt-auto"
                        >
                          <a
                            href={trackingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Get Quotes
                          </a>
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
