'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Landmark, DollarSign, Calendar, Percent } from 'lucide-react';

interface FdResult {
  principalAmount: number;
  interestEarned: number;
  maturityAmount: number;
}

const FdCalculator = () => {
  const [principalAmount, setPrincipalAmount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [timePeriod, setTimePeriod] = useState('');
  const [compoundingFrequency, setCompoundingFrequency] = useState('4'); // Quarterly by default
  const [result, setResult] = useState<FdResult | null>(null);

  const calculateFd = () => {
    const P = parseFloat(principalAmount);
    const r = parseFloat(interestRate) / 100;
    const t = parseFloat(timePeriod);
    const n = parseFloat(compoundingFrequency);

    if (P <= 0 || r <= 0 || t <= 0) return;

    // Compound Interest Formula: A = P(1 + r/n)^(nt)
    const maturityAmount = P * Math.pow(1 + r / n, n * t);
    const interestEarned = maturityAmount - P;

    setResult({
      principalAmount: P,
      interestEarned,
      maturityAmount,
    });
  };

  const handleCalculate = () => {
    calculateFd();
  };

  const handleClear = () => {
    setPrincipalAmount('');
    setInterestRate('');
    setTimePeriod('');
    setCompoundingFrequency('4');
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
            <Landmark className="h-6 w-6" />
            FD Calculator (India)
          </CardTitle>
          <CardDescription>
            Calculate returns on your Fixed Deposit (FD) investments with compound interest.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="principalAmount" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Principal Amount (₹)
              </Label>
              <Input
                id="principalAmount"
                type="number"
                placeholder="100000"
                value={principalAmount}
                onChange={(e) => setPrincipalAmount(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="interestRate" className="flex items-center gap-2">
                <Percent className="h-4 w-4" />
                Interest Rate (% per annum)
              </Label>
              <Input
                id="interestRate"
                type="number"
                step="0.1"
                placeholder="6.5"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="timePeriod" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Time Period (Years)
              </Label>
              <Input
                id="timePeriod"
                type="number"
                step="0.1"
                placeholder="5"
                value={timePeriod}
                onChange={(e) => setTimePeriod(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Compounding Frequency</Label>
              <Select value={compoundingFrequency} onValueChange={setCompoundingFrequency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Annually</SelectItem>
                  <SelectItem value="2">Half-Yearly</SelectItem>
                  <SelectItem value="4">Quarterly</SelectItem>
                  <SelectItem value="12">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleCalculate} disabled={!principalAmount || !interestRate || !timePeriod} className="flex-1">
              Calculate FD Returns
            </Button>
            <Button variant="outline" onClick={handleClear}>
              Clear
            </Button>
          </div>

          {result && (
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="text-lg">FD Calculation Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-background rounded-lg border">
                    <div className="text-2xl font-bold text-blue-600">
                      {formatCurrency(result.principalAmount)}
                    </div>
                    <div className="text-sm text-muted-foreground">Principal Amount</div>
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
                </div>
                
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <div className="text-sm text-blue-700 dark:text-blue-300">
                    <strong>Note:</strong> This calculation assumes compound interest based on the selected frequency. 
                    Actual returns may vary based on the bank's terms and conditions. Consider tax implications on FD interest.
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

export default FdCalculator;
