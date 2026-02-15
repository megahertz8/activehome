'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase-client';
import { calculatePayback, SystemType, PaybackData } from '@/lib/roi-calculator';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
  }
}

const trackEvent = (eventName: string, params?: Record<string, unknown>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params);
  }
};

export default function ROICalculator() {
  const [step, setStep] = useState(1);
  const [postcode, setPostcode] = useState('');
  const [systemType, setSystemType] = useState<SystemType | null>(null);
  const [paybackData, setPaybackData] = useState<PaybackData | null>(null);
  const [loading, setLoading] = useState(false);
  const [premiumInterest, setPremiumInterest] = useState(false);

  useEffect(() => {
    trackEvent('roi_start');
  }, []);

  const handlePostcodeSubmit = () => {
    // UK postcode validation - accept partial postcodes
    if (postcode.length >= 3 && postcode.length <= 8) {
      trackEvent('roi_postcode_entered', { postcode });
      setStep(2);
    }
  };

  const handleSystemSelect = async (type: SystemType) => {
    setSystemType(type);
    setLoading(true);
    trackEvent('roi_system_selected', { system_type: type });

    try {
      const data = await calculatePayback(postcode, type);
      setPaybackData(data);
      trackEvent('roi_calculated', {
        system_type: type,
        payback_years: data.paybackYears,
        annual_savings: data.annualSavings,
      });
      setStep(3);
    } catch (error) {
      console.error('Error calculating payback:', error);
      alert('Failed to calculate payback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePremiumInterest = async () => {
    setPremiumInterest(true);
    trackEvent('roi_premium_interest');

    await supabase.from('roi_leads').insert({
      postcode,
      system_type: systemType,
      payback_years: paybackData?.paybackYears,
      premium_interest: true,
    });

    setStep(4);
  };

  const reset = () => {
    setStep(1);
    setPostcode('');
    setSystemType(null);
    setPaybackData(null);
    setPremiumInterest(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-6">
        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-2">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all ${
                s === step
                  ? 'w-8 bg-primary'
                  : s < step
                  ? 'w-2 bg-primary/60'
                  : 'w-2 bg-muted-foreground/20'
              }`}
            />
          ))}
        </div>

        <Card>
          <CardContent className="pt-6">
            <h1 className="text-3xl font-bold text-foreground text-center mb-8">
              ROI Calculator
            </h1>

            {/* Step 1: Postcode Input */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h2 className="text-xl font-semibold text-foreground">
                    Enter Your Postcode
                  </h2>
                  <p className="text-muted-foreground">
                    We'll calculate your potential savings based on your location
                  </p>
                </div>
                <div className="space-y-4">
                  <Input
                    type="text"
                    value={postcode}
                    onChange={(e) => setPostcode(e.target.value.toUpperCase())}
                    placeholder="e.g. SW1A 1AA or SW1A"
                    className="text-lg h-12"
                    maxLength={8}
                  />
                  <Button
                    onClick={handlePostcodeSubmit}
                    disabled={postcode.length < 3 || postcode.length > 8}
                    className="w-full h-12 text-lg"
                    size="lg"
                  >
                    Continue
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: System Selection */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h2 className="text-xl font-semibold text-foreground">
                    Choose Your System
                  </h2>
                  <p className="text-muted-foreground">
                    Select the renewable energy system you're interested in
                  </p>
                </div>
                <div className="grid gap-4">
                  <button
                    onClick={() => handleSystemSelect('solar')}
                    disabled={loading}
                    className="group relative overflow-hidden rounded-lg border border-border bg-card p-6 text-left transition-all hover:border-primary hover:bg-card/80 disabled:opacity-50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-4xl">☀️</div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground mb-1">
                          Solar Panels
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Generate clean electricity from sunlight
                        </p>
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleSystemSelect('hp')}
                    disabled={loading}
                    className="group relative overflow-hidden rounded-lg border border-border bg-card p-6 text-left transition-all hover:border-primary hover:bg-card/80 disabled:opacity-50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-4xl">🔥</div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground mb-1">
                          Heat Pump
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Efficient heating and cooling for your home
                        </p>
                      </div>
                    </div>
                  </button>
                </div>
                {loading && (
                  <p className="text-center text-muted-foreground animate-pulse">
                    Calculating your savings...
                  </p>
                )}
              </div>
            )}

            {/* Step 3: Results */}
            {step === 3 && paybackData && (
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold text-foreground">
                    Your Payback Calculation
                  </h2>
                  <p className="text-muted-foreground">
                    {systemType === 'solar' ? 'Solar Panels' : 'Heat Pump'} • {postcode}
                  </p>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-primary/10 border-primary/20">
                    <CardContent className="pt-6 text-center">
                      <div className="text-3xl font-bold text-primary mb-1">
                        {paybackData.paybackYears}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Years to Payback
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-primary/10 border-primary/20">
                    <CardContent className="pt-6 text-center">
                      <div className="text-3xl font-bold text-primary mb-1">
                        £{paybackData.annualSavings.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Annual Savings
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-primary/10 border-primary/20">
                    <CardContent className="pt-6 text-center">
                      <div className="text-3xl font-bold text-primary mb-1">
                        £{paybackData.initialCost.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Initial Cost
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Tariff Comparison */}
                {paybackData.currentTariff && paybackData.optimalTariff && (
                  <Card className="border-border">
                    <CardContent className="pt-6 space-y-4">
                      <h3 className="text-lg font-semibold text-foreground">
                        Tariff Comparison
                      </h3>
                      <div className="grid gap-3">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Current Tariff:</span>
                          <span className="font-semibold text-foreground">
                            {paybackData.currentTariff}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Recommended Tariff:</span>
                          <span className="font-semibold text-primary">
                            {paybackData.optimalTariff}
                          </span>
                        </div>
                        {paybackData.annualSavingsFromSwitch && (
                          <div className="flex justify-between pt-2 border-t border-border">
                            <span className="text-muted-foreground">Savings from Switch:</span>
                            <span className="font-bold text-primary">
                              £{paybackData.annualSavingsFromSwitch.toLocaleString()}/year
                            </span>
                          </div>
                        )}
                      </div>
                      {paybackData.switchRecommendation && (
                        <p className="text-sm text-muted-foreground pt-2">
                          {paybackData.switchRecommendation}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Actions */}
                <div className="grid gap-3">
                  <Button
                    onClick={handlePremiumInterest}
                    size="lg"
                    className="w-full"
                  >
                    Get Premium Detailed Report
                  </Button>
                  <Button
                    onClick={reset}
                    variant="outline"
                    size="lg"
                    className="w-full"
                  >
                    Calculate Again
                  </Button>
                </div>
              </div>
            )}

            {/* Step 4: Thank You */}
            {step === 4 && (
              <div className="space-y-6 text-center py-8">
                <div className="text-6xl mb-4">✅</div>
                <h2 className="text-2xl font-bold text-foreground">
                  Thank You!
                </h2>
                <p className="text-muted-foreground">
                  We'll contact you soon with your premium report.
                </p>
                <Button
                  onClick={reset}
                  size="lg"
                  className="w-full max-w-xs mx-auto"
                >
                  Calculate Another
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
