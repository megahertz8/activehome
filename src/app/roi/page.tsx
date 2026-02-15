'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase-client';
import { calculatePayback, getAllECMs, SystemType, PaybackData } from '@/lib/roi-calculator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

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
  const [allECMs, setAllECMs] = useState<PaybackData[]>([]);
  const [showFullReport, setShowFullReport] = useState(false);
  const [loading, setLoading] = useState(false);
  const [premiumInterest, setPremiumInterest] = useState(false);

  useEffect(() => {
    trackEvent('roi_start');
  }, []);

  const handlePostcodeSubmit = async () => {
    // UK postcode validation - accept partial postcodes
    if (postcode.length >= 3 && postcode.length <= 8) {
      trackEvent('roi_postcode_entered', { postcode });
      setLoading(true);
      
      try {
        // Load all ECMs for this postcode
        const ecms = await getAllECMs(postcode);
        setAllECMs(ecms);
        setStep(2);
      } catch (error) {
        console.error('Error loading ECMs:', error);
        alert('Failed to load energy conservation measures. Please try again.');
      } finally {
        setLoading(false);
      }
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

            {/* Step 2: ECM Selection & Full Report */}
            {step === 2 && !showFullReport && (
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h2 className="text-xl font-semibold text-foreground">
                    Choose Your Upgrade
                  </h2>
                  <p className="text-muted-foreground">
                    Select an energy conservation measure to see detailed payback
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {allECMs.map((ecm) => (
                    <button
                      key={ecm.systemType}
                      onClick={() => handleSystemSelect(ecm.systemType)}
                      disabled={loading}
                      className="group relative overflow-hidden rounded-lg border border-border bg-card p-4 text-left transition-all hover:border-primary hover:bg-card/80 disabled:opacity-50"
                    >
                      <div className="flex flex-col items-center text-center gap-2">
                        <div className="text-3xl">{ecm.emoji}</div>
                        <div className="flex-1">
                          <h3 className="text-sm font-semibold text-foreground mb-1">
                            {ecm.systemType === 'solar' ? 'Solar Panels' :
                             ecm.systemType === 'hp' ? 'Heat Pump' :
                             ecm.systemType === 'led' ? 'LED Lighting' :
                             ecm.systemType === 'insulation' ? 'Insulation' :
                             ecm.systemType === 'draught_proofing' ? 'Draught Proofing' :
                             ecm.systemType === 'cylinder_insulation' ? 'Cylinder Jacket' :
                             ecm.systemType === 'smart_thermostat' ? 'Smart Thermostat' :
                             'Double Glazing'}
                          </h3>
                          <p className="text-xs text-muted-foreground mb-2">
                            {ecm.description}
                          </p>
                          <Badge variant="outline" className="text-xs">
                            ~£{ecm.initialCost.toLocaleString()}
                          </Badge>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                <Button
                  onClick={() => setShowFullReport(true)}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  📊 View Full Report (All Measures)
                </Button>
                {loading && (
                  <p className="text-center text-muted-foreground animate-pulse">
                    Calculating your savings...
                  </p>
                )}
              </div>
            )}

            {/* Full Report View */}
            {step === 2 && showFullReport && (
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h2 className="text-xl font-semibold text-foreground">
                    Complete Energy Upgrade Roadmap
                  </h2>
                  <p className="text-muted-foreground">{postcode}</p>
                </div>

                {/* Phase 1: Quick Wins */}
                {allECMs.filter(ecm => ecm.paybackYears < 2).length > 0 && (
                  <Card className="border-green-500/20 bg-green-500/5">
                    <CardHeader>
                      <CardTitle className="text-lg text-green-400">
                        Phase 1: Quick Wins (&lt;2 year payback)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {allECMs.filter(ecm => ecm.paybackYears < 2).map((ecm) => (
                        <div key={ecm.systemType} className="flex items-start justify-between p-3 rounded-lg bg-background/50">
                          <div className="flex gap-3 flex-1">
                            <div className="text-2xl">{ecm.emoji}</div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-foreground mb-1">
                                {ecm.systemType === 'led' ? 'LED Lighting' :
                                 ecm.systemType === 'cylinder_insulation' ? 'Cylinder Jacket' :
                                 ecm.systemType === 'draught_proofing' ? 'Draught Proofing' :
                                 ecm.systemType === 'smart_thermostat' ? 'Smart Thermostat' : ecm.systemType}
                              </h4>
                              <p className="text-xs text-muted-foreground mb-2">{ecm.description}</p>
                              <div className="flex gap-4 text-xs">
                                <span>Cost: £{ecm.initialCost.toLocaleString()}{ecm.grantAmount && <span className="text-emerald-400 ml-1">(−£{ecm.grantAmount.toLocaleString()} {ecm.grantName})</span>}</span>
                                <span className="text-green-400">Saves: £{ecm.annualSavings}/yr</span>
                                <span>Payback: {ecm.paybackYears}yr</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div className="pt-2 border-t border-border">
                        <div className="flex justify-between text-sm font-semibold">
                          <span>Phase 1 Total:</span>
                          <span>
                            £{allECMs.filter(ecm => ecm.paybackYears < 2).reduce((sum, ecm) => sum + ecm.initialCost, 0).toLocaleString()} investment
                            <span className="text-green-400 ml-2">
                              → £{allECMs.filter(ecm => ecm.paybackYears < 2).reduce((sum, ecm) => sum + ecm.annualSavings, 0).toLocaleString()}/yr savings
                            </span>
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Phase 2: Medium Term */}
                {allECMs.filter(ecm => ecm.paybackYears >= 2 && ecm.paybackYears < 5).length > 0 && (
                  <Card className="border-yellow-500/20 bg-yellow-500/5">
                    <CardHeader>
                      <CardTitle className="text-lg text-yellow-400">
                        Phase 2: Medium Term (2-5 year payback)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {allECMs.filter(ecm => ecm.paybackYears >= 2 && ecm.paybackYears < 5).map((ecm) => (
                        <div key={ecm.systemType} className="flex items-start justify-between p-3 rounded-lg bg-background/50">
                          <div className="flex gap-3 flex-1">
                            <div className="text-2xl">{ecm.emoji}</div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-foreground mb-1">
                                {ecm.systemType === 'insulation' ? 'Insulation' :
                                 ecm.systemType === 'smart_thermostat' ? 'Smart Thermostat' : ecm.systemType}
                              </h4>
                              <p className="text-xs text-muted-foreground mb-2">{ecm.description}</p>
                              <div className="flex gap-4 text-xs">
                                <span>Cost: £{ecm.initialCost.toLocaleString()}{ecm.grantAmount && <span className="text-emerald-400 ml-1">(−£{ecm.grantAmount.toLocaleString()} {ecm.grantName})</span>}</span>
                                <span className="text-yellow-400">Saves: £{ecm.annualSavings}/yr</span>
                                <span>Payback: {ecm.paybackYears}yr</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div className="pt-2 border-t border-border">
                        <div className="flex justify-between text-sm font-semibold">
                          <span>Phase 2 Total:</span>
                          <span>
                            £{allECMs.filter(ecm => ecm.paybackYears >= 2 && ecm.paybackYears < 5).reduce((sum, ecm) => sum + ecm.initialCost, 0).toLocaleString()} investment
                            <span className="text-yellow-400 ml-2">
                              → £{allECMs.filter(ecm => ecm.paybackYears >= 2 && ecm.paybackYears < 5).reduce((sum, ecm) => sum + ecm.annualSavings, 0).toLocaleString()}/yr savings
                            </span>
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Phase 3: Major Retrofit */}
                {allECMs.filter(ecm => ecm.paybackYears >= 5).length > 0 && (
                  <Card className="border-blue-500/20 bg-blue-500/5">
                    <CardHeader>
                      <CardTitle className="text-lg text-blue-400">
                        Phase 3: Major Retrofit (5+ year payback)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {allECMs.filter(ecm => ecm.paybackYears >= 5).map((ecm) => (
                        <div key={ecm.systemType} className="flex items-start justify-between p-3 rounded-lg bg-background/50">
                          <div className="flex gap-3 flex-1">
                            <div className="text-2xl">{ecm.emoji}</div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-foreground mb-1">
                                {ecm.systemType === 'solar' ? 'Solar Panels' :
                                 ecm.systemType === 'hp' ? 'Heat Pump' :
                                 ecm.systemType === 'double_glazing' ? 'Double Glazing' : ecm.systemType}
                              </h4>
                              <p className="text-xs text-muted-foreground mb-2">{ecm.description}</p>
                              <div className="flex gap-4 text-xs">
                                <span>Cost: £{ecm.initialCost.toLocaleString()}{ecm.grantAmount && <span className="text-emerald-400 ml-1">(−£{ecm.grantAmount.toLocaleString()} {ecm.grantName})</span>}</span>
                                <span className="text-blue-400">Saves: £{ecm.annualSavings}/yr</span>
                                <span>Payback: {ecm.paybackYears}yr</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div className="pt-2 border-t border-border">
                        <div className="flex justify-between text-sm font-semibold">
                          <span>Phase 3 Total:</span>
                          <span>
                            £{allECMs.filter(ecm => ecm.paybackYears >= 5).reduce((sum, ecm) => sum + ecm.initialCost, 0).toLocaleString()} investment
                            <span className="text-blue-400 ml-2">
                              → £{allECMs.filter(ecm => ecm.paybackYears >= 5).reduce((sum, ecm) => sum + ecm.annualSavings, 0).toLocaleString()}/yr savings
                            </span>
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Total Summary */}
                <Card className="border-primary/20 bg-primary/5">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">Complete Upgrade Investment</p>
                      <p className="text-3xl font-bold text-foreground mb-1">
                        £{allECMs.reduce((sum, ecm) => sum + ecm.initialCost, 0).toLocaleString()}
                      </p>
                      {allECMs.some(ecm => ecm.grantAmount) && (
                        <p className="text-sm text-emerald-400 mb-1">
                          After grants: £{allECMs.reduce((sum, ecm) => sum + (ecm.netCost ?? ecm.initialCost), 0).toLocaleString()}
                          {' '}(−£{allECMs.reduce((sum, ecm) => sum + (ecm.grantAmount ?? 0), 0).toLocaleString()} in grants)
                        </p>
                      )}
                      <p className="text-sm text-primary">
                        Annual Savings: £{allECMs.reduce((sum, ecm) => sum + ecm.annualSavings, 0).toLocaleString()}/year
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid gap-3">
                  <Button
                    onClick={() => {
                      setShowFullReport(false);
                      setStep(4);
                    }}
                    size="lg"
                    className="w-full"
                  >
                    Get Premium Detailed Report
                  </Button>
                  <Button
                    onClick={() => setShowFullReport(false)}
                    variant="outline"
                    size="lg"
                    className="w-full"
                  >
                    ← Back to Individual Measures
                  </Button>
                </div>
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
