'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PiggyBank, DollarSign, Calendar, Minus } from 'lucide-react';

interface PpfResult {
  totalInvestment: number;
  interestEarned: number;
  maturityAmount: number;
  monthlyDeduction: number;
}

const PpfCalculator = () => {
  const [annualInvestment, setAnnualInvestment] = useState('');
  const [result, setResult] = useState<PpfResult | null>(null);

  const calculatePpf = () => {
    const P = parseFloat(annualInvestment);
    const r = 0.071; // Current PPF rate is 7.1% (as of 2024)
    const n = 15; // PPF has a fixed tenure of 15 years

    if (P <= 0 || P > 150000) return; // PPF annual limit is ₹1.5 lakh

    let totalAmount = 0;
    let totalInvestment = 0;

    // Calculate compound interest for each year
    for (let year = 1; year <= n; year++) {
      totalAmount = (totalAmount + P) * (1 + r);
      totalInvestment += P;
    }

    const interestEarned = totalAmount - totalInvestment;
    const monthlyDeduction = P / 12; // Monthly equivalent

    setResult({
      totalInvestment,
      interestEarned,
      maturityAmount: totalAmount,
      monthlyDeduction,
    });
  };

  const handleCalculate = () => {
    calculatePpf();
  };

  const handleClear = () => {
    setAnnualInvestment('');
    setResult(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PiggyBank className="h-6 w-6" />
            PPF Calculator (India)
          </CardTitle>
          <CardDescription>
            Calculate your Public Provident Fund (PPF) maturity amount after 15 years.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="annualInvestment" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Annual Investment (₹)
              </Label>
              <Input
                id="annualInvestment"
                type="number"
                placeholder="150000"
                max="150000"
                value={annualInvestment}
                onChange={(e) => setAnnualInvestment(e.target.value)}
              />
              <div className="text-xs text-muted-foreground">
                Maximum annual investment: ₹1,50,000
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Investment Period
              </Label>
              <Input
                value="15 years (Fixed)"
                readOnly
                className="bg-muted"
              />
              <div className="text-xs text-muted-foreground">
                PPF has a fixed tenure of 15 years
              </div>
            </div>
          </div>

          {/* Monthly Deduction Display */}
          {annualInvestment && (
            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <Minus className="h-4 w-4" />
                <span className="font-medium">
                  Monthly Deduction: {formatCurrency(parseFloat(annualInvestment) / 12)}
                </span>
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                This is the equivalent monthly amount you would need to save.
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={handleCalculate} disabled={!annualInvestment} className="flex-1">
              Calculate PPF Maturity
            </Button>
            <Button variant="outline" onClick={handleClear}>
              Clear
            </Button>
          </div>

          {result && (
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="text-lg">PPF Maturity Calculation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-background rounded-lg border">
                    <div className="text-2xl font-bold text-blue-600">
                      {formatCurrency(result.totalInvestment)}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Investment</div>
                  </div>
                  
                  <div className="text-center p-4 bg-background rounded-lg border">
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(result.interestEarned)}
                    </div>
                    <div className="text-sm text-muted-foreground">Interest Earned</div>
                  </div>
                  
                  <div className="text-center p-4 bg-background rounded-lg border">
                    <div className="text-2xl font-bold text-primary">
                      {formatCurrency(result.maturityAmount)}
                    </div>
                    <div className="text-sm text-muted-foreground">Maturity Amount</div>
                  </div>

                  <div className="text-center p-4 bg-background rounded-lg border">
                    <div className="text-2xl font-bold text-orange-600">
                      {formatCurrency(result.monthlyDeduction)}
                    </div>
                    <div className="text-sm text-muted-foreground">Monthly Deduction</div>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <div className="text-sm text-blue-700 dark:text-blue-300">
                    <strong>Note:</strong> This calculation is based on the current PPF interest rate of 7.1% per annum. 
                    The rate is subject to change by the Government of India. PPF investments qualify for tax deduction under Section 80C.
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PpfCalculator;
