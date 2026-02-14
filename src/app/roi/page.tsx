'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { calculatePayback, SystemType, PaybackData } from '@/lib/roi-calculator';

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
      // Could show error message to user
      alert('Failed to calculate payback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePremiumInterest = async () => {
    setPremiumInterest(true);
    trackEvent('roi_premium_interest');

    // Insert into Supabase
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center mb-6">ROI Calculator</h1>

        {step === 1 && (
          <div>
            <p className="mb-4">Enter your UK postcode to get started:</p>
            <input
              type="text"
              value={postcode}
              onChange={(e) => setPostcode(e.target.value.toUpperCase())}
              placeholder="e.g. SW1A 1AA or SW1A"
              className="w-full p-2 border rounded mb-4"
              maxLength={8}
            />
            <button
              onClick={handlePostcodeSubmit}
              disabled={postcode.length < 3 || postcode.length > 8}
              className="w-full bg-blue-500 text-white p-2 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <p className="mb-4">Choose your system:</p>
            <div className="space-y-2">
              <button
                onClick={() => handleSystemSelect('solar')}
                disabled={loading}
                className="w-full bg-green-500 text-white p-2 rounded disabled:opacity-50"
              >
                {loading ? 'Calculating...' : 'Solar Panels'}
              </button>
              <button
                onClick={() => handleSystemSelect('hp')}
                disabled={loading}
                className="w-full bg-blue-500 text-white p-2 rounded disabled:opacity-50"
              >
                {loading ? 'Calculating...' : 'Heat Pump'}
              </button>
            </div>
          </div>
        )}

        {step === 3 && paybackData && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Your Payback Calculation</h2>
            <p>System: {systemType === 'solar' ? 'Solar Panels' : 'Heat Pump'}</p>
            <p>Postcode: {postcode}</p>
            <p>Payback Period: {paybackData.paybackYears} years</p>
            <p>Annual Savings: £{paybackData.annualSavings.toLocaleString()}</p>
            <p>Initial Cost: £{paybackData.initialCost.toLocaleString()}</p>

            {paybackData.currentTariff && paybackData.optimalTariff && (
              <div className="mt-4 p-4 bg-blue-50 rounded">
                <h3 className="font-semibold mb-2">Tariff Comparison</h3>
                <p><strong>Current Tariff:</strong> {paybackData.currentTariff}</p>
                <p><strong>Recommended Tariff:</strong> {paybackData.optimalTariff}</p>
                {paybackData.annualSavingsFromSwitch && (
                  <p><strong>Annual Savings from Switch:</strong> £{paybackData.annualSavingsFromSwitch.toLocaleString()}</p>
                )}
                {paybackData.switchRecommendation && (
                  <p className="mt-2 text-sm text-blue-700">{paybackData.switchRecommendation}</p>
                )}
              </div>
            )}

            <div className="mt-4 space-y-2">
              <button
                onClick={handlePremiumInterest}
                className="w-full bg-purple-500 text-white p-2 rounded"
              >
                Get Premium Detailed Report
              </button>
              <button
                onClick={reset}
                className="w-full bg-gray-500 text-white p-2 rounded"
              >
                Recalculate
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Thank You!</h2>
            <p>We&apos;ll contact you soon with your premium report.</p>
            <button
              onClick={reset}
              className="w-full bg-blue-500 text-white p-2 rounded mt-4"
            >
              Calculate Another
            </button>
          </div>
        )}
      </div>
    </div>
  );
}