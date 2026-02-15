"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/AuthProvider";
import { Home as HomeIcon, TrendingUp, Zap, Share2, Calendar } from "lucide-react";
import { Home, ScoreHistoryEntry, Improvement } from "@/lib/types";
import { getAllECMs, PaybackData } from "@/lib/roi-calculator";

export default function HomePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const homeId = params.id as string;

  const [home, setHome] = useState<Home | null>(null);
  const [scoreHistory, setScoreHistory] = useState<ScoreHistoryEntry[]>([]);
  const [improvements, setImprovements] = useState<Improvement[]>([]);
  const [recommendations, setRecommendations] = useState<PaybackData[]>([]);
  const [isOwner, setIsOwner] = useState(false);
  const [ownerName, setOwnerName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!homeId) return;

    const fetchHome = async () => {
      try {
        const res = await fetch(`/api/homes/${homeId}`);
        if (!res.ok) throw new Error("Failed to fetch home");

        const data = await res.json();
        setHome(data.home);
        setScoreHistory(data.scoreHistory || []);
        setImprovements(data.improvements || []);
        setIsOwner(data.isOwner || false);
        setOwnerName(data.ownerName);

        // Fetch recommendations
        if (data.home.postcode) {
          const ecms = await getAllECMs(data.home.postcode);
          setRecommendations(ecms.slice(0, 3)); // Top 3
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchHome();
  }, [homeId]);

  if (loading) {
    return (
      <main className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your home...</p>
        </div>
      </main>
    );
  }

  if (!home) {
    return (
      <main className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Home not found</h1>
          <Button onClick={() => router.push("/")}>Go Home</Button>
        </div>
      </main>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    if (score >= 40) return "text-orange-500";
    return "text-red-500";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "bg-green-500/10";
    if (score >= 60) return "bg-yellow-500/10";
    if (score >= 40) return "bg-orange-500/10";
    return "bg-red-500/10";
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  const handleShare = () => {
    const shareText = `My home scores ${home.score}/100 on Evolving Home! 🏠 https://evolvinghome.vercel.app`;
    if (navigator.share) {
      navigator.share({ text: shareText });
    } else {
      navigator.clipboard.writeText(shareText);
      alert("Share text copied to clipboard!");
    }
  };

  // Generate biography
  const biography = `This ${home.property_type?.toLowerCase() || "property"} ${
    home.year_built ? `was built around ${home.year_built}` : "has a rich history"
  }. It currently has ${home.walls_description?.toLowerCase() || "walls"}, ${
    home.windows_description?.toLowerCase() || "windows"
  }, and ${home.heating_description?.toLowerCase() || "heating"}. ${
    home.epc_rating
      ? `Its EPC rating is ${home.epc_rating}${
          home.epc_potential ? ` with a potential of ${home.epc_potential}` : ""
        }.`
      : ""
  } ${
    improvements.length > 0
      ? `Since being claimed, ${improvements.length} improvement${
          improvements.length > 1 ? "s have" : " has"
        } been made.`
      : ""
  }`;

  return (
    <main className="min-h-screen py-20 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Hero */}
        <Card className="p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <HomeIcon className="w-8 h-8 text-primary" />
                <h1 className="text-3xl font-bold">{home.address}</h1>
              </div>
              <p className="text-muted-foreground">
                {home.property_type}
                {home.year_built && ` • Built ${home.year_built}`}
                {home.total_floor_area && ` • ${Math.round(home.total_floor_area)}m²`}
              </p>
              {ownerName && home.claimed_at && (
                <p className="text-sm text-muted-foreground mt-2">
                  Claimed by {ownerName} on {formatDate(home.claimed_at)}
                </p>
              )}
            </div>

            {/* Score gauge */}
            <div className="flex flex-col items-center">
              <div
                className={`w-32 h-32 rounded-full flex items-center justify-center ${getScoreBgColor(
                  home.score
                )}`}
              >
                <div className="text-center">
                  <div className={`text-4xl font-bold ${getScoreColor(home.score)}`}>
                    {home.score}
                  </div>
                  <div className="text-xs text-muted-foreground">/100</div>
                </div>
              </div>
              {home.epc_rating && (
                <Badge variant="outline" className="mt-3">
                  EPC {home.epc_rating}
                </Badge>
              )}
            </div>
          </div>

          {/* Share button */}
          <div className="mt-6 pt-6 border-t">
            <Button
              variant="outline"
              onClick={handleShare}
              className="w-full md:w-auto"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share your home's score
            </Button>
          </div>
        </Card>

        {/* Score Timeline */}
        {scoreHistory.length > 0 && (
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Score Timeline
            </h2>
            <div className="space-y-3">
              {scoreHistory.map((entry, i) => (
                <div
                  key={entry.id}
                  className="flex items-center gap-4 pb-3 border-b last:border-0"
                >
                  <div className="flex-shrink-0">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${getScoreBgColor(
                        entry.score
                      )}`}
                    >
                      <span className={`font-bold ${getScoreColor(entry.score)}`}>
                        {entry.score}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium capitalize">
                      {entry.reason.replace(/_/g, " ")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(entry.created_at)}
                    </p>
                  </div>
                  {i > 0 && (
                    <div className="text-sm font-medium">
                      {entry.score > scoreHistory[i - 1].score ? (
                        <span className="text-green-500">
                          +{entry.score - scoreHistory[i - 1].score}
                        </span>
                      ) : entry.score < scoreHistory[i - 1].score ? (
                        <span className="text-red-500">
                          {entry.score - scoreHistory[i - 1].score}
                        </span>
                      ) : null}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Home Biography */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Home Biography</h2>
          <p className="text-muted-foreground leading-relaxed">{biography}</p>
        </Card>

        {/* What's Next */}
        {recommendations.length > 0 && (
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5" />
              What's Next
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Top 3 recommended improvements for your home based on ROI
            </p>
            <div className="space-y-4">
              {recommendations.map((rec) => (
                <Card key={rec.systemType} className="p-4 border-l-4 border-l-primary">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {rec.emoji && <span className="text-2xl">{rec.emoji}</span>}
                        <h3 className="font-bold">{rec.description}</h3>
                      </div>
                      <div className="text-sm space-y-1">
                        <p>
                          <span className="text-muted-foreground">Cost:</span>{" "}
                          <span className="font-medium">
                            £{rec.initialCost.toLocaleString()}
                          </span>
                          {rec.grantAmount && (
                            <span className="text-green-500 ml-2">
                              (£{rec.grantAmount.toLocaleString()} grant available)
                            </span>
                          )}
                        </p>
                        <p>
                          <span className="text-muted-foreground">Saves:</span>{" "}
                          <span className="font-medium">
                            £{rec.annualSavings}/year
                          </span>
                        </p>
                        <p>
                          <span className="text-muted-foreground">Payback:</span>{" "}
                          <span className="font-medium">
                            {rec.paybackYears} years
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        )}

        {/* Improvement Log */}
        {improvements.length > 0 && (
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Improvement Log
            </h2>
            <div className="space-y-4">
              {improvements.map((imp) => (
                <Card key={imp.id} className="p-4 bg-muted/30">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-bold">{imp.title}</h3>
                      {imp.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {imp.description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-4 mt-3 text-sm">
                        {imp.completed_at && (
                          <span className="text-muted-foreground">
                            {formatDate(imp.completed_at)}
                          </span>
                        )}
                        {imp.cost && (
                          <span>
                            <span className="text-muted-foreground">Cost:</span>{" "}
                            £{imp.cost.toLocaleString()}
                          </span>
                        )}
                        {imp.grant_amount && (
                          <span className="text-green-500">
                            Grant: £{imp.grant_amount.toLocaleString()}
                          </span>
                        )}
                        {imp.score_before !== null && imp.score_after !== null && (
                          <span className="font-medium">
                            Score: {imp.score_before} → {imp.score_after} (+
                            {imp.score_after - imp.score_before})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        )}

        {/* Owner actions */}
        {isOwner && (
          <Card className="p-6 bg-primary/5 border-primary">
            <p className="text-sm text-muted-foreground mb-4">
              You're the guardian of this home. Log improvements to track your impact.
            </p>
            <Button onClick={() => alert("Log improvement UI coming soon!")}>
              Log an Improvement
            </Button>
          </Card>
        )}
      </div>
    </main>
  );
}
