"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface UpgradeRecommendation {
  type: 'wall_insulation' | 'roof_insulation' | 'floor_insulation' | 'window_upgrade' | 'ventilation_upgrade';
  description: string;
  cost_estimate: number;
  savings_kwh_year: number;
  payback_years: number;
}

interface RoadmapProps {
  recommendations: UpgradeRecommendation[];
}

const ECM_EMOJI: Record<string, string> = {
  'wall_insulation': '🧱',
  'roof_insulation': '🏠',
  'floor_insulation': '⬇️',
  'window_upgrade': '🪟',
  'ventilation_upgrade': '💨',
};

const ECM_NAME: Record<string, string> = {
  'wall_insulation': 'Wall Insulation',
  'roof_insulation': 'Roof Insulation',
  'floor_insulation': 'Floor Insulation',
  'window_upgrade': 'Window Upgrade',
  'ventilation_upgrade': 'Ventilation Upgrade',
};

export default function Roadmap({ recommendations }: RoadmapProps) {
  // Group recommendations by phase
  const phase1 = recommendations.filter(r => r.payback_years < 2);
  const phase2 = recommendations.filter(r => r.payback_years >= 2 && r.payback_years < 5);
  const phase3 = recommendations.filter(r => r.payback_years >= 5);

  const renderPhase = (
    phase: UpgradeRecommendation[],
    title: string,
    description: string,
    color: string,
    bgColor: string
  ) => {
    if (phase.length === 0) return null;

    const totalCost = phase.reduce((sum, r) => sum + r.cost_estimate, 0);
    const totalSavings = phase.reduce((sum, r) => sum + (r.savings_kwh_year * 0.08), 0); // £0.08/kWh

    return (
      <Card className={`border-${color}-500/20 bg-${color}-500/5`}>
        <CardHeader>
          <CardTitle className={`text-lg text-${color}-400`}>
            {title}
          </CardTitle>
          <p className="text-sm text-muted-foreground">{description}</p>
        </CardHeader>
        <CardContent className="space-y-3">
          {phase.map((rec, i) => (
            <div
              key={i}
              className="flex items-start justify-between p-3 rounded-lg bg-background/50"
            >
              <div className="flex gap-3 flex-1">
                <div className="text-2xl">{ECM_EMOJI[rec.type] || '🔧'}</div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground mb-1">
                    {ECM_NAME[rec.type] || rec.type}
                  </h4>
                  <p className="text-xs text-muted-foreground mb-2">
                    {rec.description}
                  </p>
                  <div className="flex gap-4 text-xs">
                    <span>Cost: £{rec.cost_estimate.toLocaleString()}</span>
                    <span className={`text-${color}-400`}>
                      Saves: £{Math.round(rec.savings_kwh_year * 0.08)}/yr
                    </span>
                    <span>Payback: {rec.payback_years.toFixed(1)}yr</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div className="pt-2 border-t border-border">
            <div className="flex justify-between text-sm font-semibold">
              <span>Phase Total:</span>
              <span>
                £{totalCost.toLocaleString()} investment
                <span className={`text-${color}-400 ml-2`}>
                  → £{Math.round(totalSavings)}/yr savings
                </span>
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (recommendations.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            No upgrade recommendations available. Your home is already well optimized!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Your Phased Upgrade Roadmap
        </h2>
        <p className="text-muted-foreground">
          Prioritized by payback period — tackle quick wins first!
        </p>
      </div>

      {renderPhase(
        phase1,
        "Phase 1: Quick Wins",
        "Fast payback, low investment — start here for immediate impact",
        "green",
        "green"
      )}

      {renderPhase(
        phase2,
        "Phase 2: Medium Term",
        "Moderate investment with solid returns over 2-5 years",
        "yellow",
        "yellow"
      )}

      {renderPhase(
        phase3,
        "Phase 3: Major Retrofit",
        "Higher investment, longer payback — consider grants and financing",
        "blue",
        "blue"
      )}

      {/* Total Summary */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Complete Roadmap Investment
            </p>
            <p className="text-3xl font-bold text-foreground mb-1">
              £{recommendations.reduce((sum, r) => sum + r.cost_estimate, 0).toLocaleString()}
            </p>
            <p className="text-sm text-primary">
              Total Annual Savings: £
              {Math.round(
                recommendations.reduce((sum, r) => sum + r.savings_kwh_year * 0.08, 0)
              ).toLocaleString()}
              /year
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Average payback:{" "}
              {(
                recommendations.reduce((sum, r) => sum + r.cost_estimate, 0) /
                recommendations.reduce((sum, r) => sum + r.savings_kwh_year * 0.08, 0)
              ).toFixed(1)}{" "}
              years
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
