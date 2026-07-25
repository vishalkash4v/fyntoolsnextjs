'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Receipt, DollarSign, Calculator } from 'lucide-react';

interface TaxResult {
  grossIncome: number;
  taxableIncome: number;
  incomeTax: number;
  cess: number;
  totalTax: number;
  netIncome: number;
}

const IncomeTaxCalculator = () => {
  const [grossIncome, setGrossIncome] = useState('');
  const [ageGroup, setAgeGroup] = useState('below-60');
  const [deductions, setDeductions] = useState('');
  const [oldRegimeResult, setOldRegimeResult] = useState<TaxResult | null>(null);
  const [newRegimeResult, setNewRegimeResult] = useState<TaxResult | null>(null);

  const calculateOldRegimeTax = (income: number, age: string) => {
    let tax = 0;
    let exemptionLimit = 250000; // Default for below 60

    if (age === '60-80') exemptionLimit = 300000;
    if (age === 'above-80') exemptionLimit = 500000;

    if (income <= exemptionLimit) return 0;

    const taxableIncome = income - exemptionLimit;

    // Old regime tax slabs (FY 2023-24)
    if (taxableIncome <= 250000) {
      tax = taxableIncome * 0.05;
    } else if (taxableIncome <= 500000) {
      tax = 250000 * 0.05 + (taxableIncome - 250000) * 0.2;
    } else {
      tax = 250000 * 0.05 + 250000 * 0.2 + (taxableIncome - 500000) * 0.3;
    }

    return tax;
  };

  const calculateNewRegimeTax = (income: number) => {
    let tax = 0;

    if (income <= 300000) return 0;

    const taxableIncome = income - 300000;

    // New regime tax slabs (FY 2023-24)
    if (taxableIncome <= 300000) {
      tax = taxableIncome * 0.05;
    } else if (taxableIncome <= 300000) {
      tax = 300000 * 0.05 + (taxableIncome - 300000) * 0.1;
    } else if (taxableIncome <= 300000) {
      tax = 300000 * 0.05 + 300000 * 0.1 + (taxableIncome - 600000) * 0.15;
    } else if (taxableIncome <= 600000) {
      tax = 300000 * 0.05 + 300000 * 0.1 + 300000 * 0.15 + (taxableIncome - 900000) * 0.2;
    } else if (taxableIncome <= 600000) {
      tax = 300000 * 0.05 + 300000 * 0.1 + 300000 * 0.15 + 600000 * 0.2 + (taxableIncome - 1200000) * 0.25;
    } else {
      tax = 300000 * 0.05 + 300000 * 0.1 + 300000 * 0.15 + 600000 * 0.2 + 300000 * 0.25 + (taxableIncome - 1500000) * 0.3;
    }

    return tax;
  };

  const calculateTax = () => {
    const income = parseFloat(grossIncome);
    const deductionAmount = parseFloat(deductions) || 0;

    if (income <= 0) return;

    // Old Regime Calculation
    const oldRegimeTaxableIncome = income - deductionAmount;
    const oldRegimeIncomeTax = calculateOldRegimeTax(oldRegimeTaxableIncome, ageGroup);
    const oldRegimeCess = oldRegimeIncomeTax * 0.04; // 4% Health & Education Cess
    const oldRegimeTotalTax = oldRegimeIncomeTax + oldRegimeCess;

    setOldRegimeResult({
      grossIncome: income,
      taxableIncome: oldRegimeTaxableIncome,
      incomeTax: oldRegimeIncomeTax,
      cess: oldRegimeCess,
      totalTax: oldRegimeTotalTax,
      netIncome: income - oldRegimeTotalTax,
    });

    // New Regime Calculation (no deductions except standard deduction of 50k)
    const newRegimeTaxableIncome = income - 50000; // Standard deduction
    const newRegimeIncomeTax = calculateNewRegimeTax(newRegimeTaxableIncome);
    const newRegimeCess = newRegimeIncomeTax * 0.04;
    const newRegimeTotalTax = newRegimeIncomeTax + newRegimeCess;

    setNewRegimeResult({
      grossIncome: income,
      taxableIncome: newRegimeTaxableIncome,
      incomeTax: newRegimeIncomeTax,
      cess: newRegimeCess,
      totalTax: newRegimeTotalTax,
      netIncome: income - newRegimeTotalTax,
    });
  };

  const handleCalculate = () => {
    calculateTax();
  };

  const handleClear = () => {
    setGrossIncome('');
    setDeductions('');
    setAgeGroup('below-60');
    setOldRegimeResult(null);
    setNewRegimeResult(null);
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
            <Receipt className="h-6 w-6" />
            Income Tax Calculator (India)
          </CardTitle>
          <CardDescription>
            Calculate income tax for FY 2023-24 under both old and new tax regimes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="grossIncome" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Annual Gross Income (₹)
              </Label>
              <Input
                id="grossIncome"
                type="number"
                placeholder="1000000"
                value={grossIncome}
                onChange={(e) => setGrossIncome(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Age Group</Label>
              <Select value={ageGroup} onValueChange={setAgeGroup}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="below-60">Below 60 years</SelectItem>
                  <SelectItem value="60-80">60-80 years</SelectItem>
                  <SelectItem value="above-80">Above 80 years</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deductions">
                Total Deductions (₹) - Old Regime
              </Label>
              <Input
                id="deductions"
                type="number"
                placeholder="150000"
                value={deductions}
                onChange={(e) => setDeductions(e.target.value)}
              />
              <div className="text-xs text-muted-foreground">
                80C, 80D, HRA, etc.
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleCalculate} disabled={!grossIncome} className="flex-1">
              <Calculator className="h-4 w-4 mr-2" />
              Calculate Tax
            </Button>
            <Button variant="outline" onClick={handleClear}>
              Clear
            </Button>
          </div>

          {(oldRegimeResult || newRegimeResult) && (
            <Tabs defaultValue="comparison" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="old-regime">Old Regime</TabsTrigger>
                <TabsTrigger value="new-regime">New Regime</TabsTrigger>
                <TabsTrigger value="comparison">Comparison</TabsTrigger>
              </TabsList>

              <TabsContent value="old-regime">
                {oldRegimeResult && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Old Tax Regime</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span>Gross Income:</span>
                          <span className="font-medium">{formatCurrency(oldRegimeResult.grossIncome)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Taxable Income:</span>
                          <span className="font-medium">{formatCurrency(oldRegimeResult.taxableIncome)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Income Tax:</span>
                          <span className="font-medium">{formatCurrency(oldRegimeResult.incomeTax)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Health & Education Cess (4%):</span>
                          <span className="font-medium">{formatCurrency(oldRegimeResult.cess)}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold border-t pt-2">
                          <span>Total Tax:</span>
                          <span className="text-red-600">{formatCurrency(oldRegimeResult.totalTax)}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold">
                          <span>Net Income:</span>
                          <span className="text-green-600">{formatCurrency(oldRegimeResult.netIncome)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="new-regime">
                {newRegimeResult && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">New Tax Regime</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span>Gross Income:</span>
                          <span className="font-medium">{formatCurrency(newRegimeResult.grossIncome)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Taxable Income:</span>
                          <span className="font-medium">{formatCurrency(newRegimeResult.taxableIncome)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Income Tax:</span>
                          <span className="font-medium">{formatCurrency(newRegimeResult.incomeTax)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Health & Education Cess (4%):</span>
                          <span className="font-medium">{formatCurrency(newRegimeResult.cess)}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold border-t pt-2">
                          <span>Total Tax:</span>
                          <span className="text-red-600">{formatCurrency(newRegimeResult.totalTax)}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold">
                          <span>Net Income:</span>
                          <span className="text-green-600">{formatCurrency(newRegimeResult.netIncome)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="comparison">
                {oldRegimeResult && newRegimeResult && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Regime Comparison</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                          <div className="text-lg font-semibold mb-2">Old Regime</div>
                          <div className="text-2xl font-bold text-blue-600 mb-1">
                            {formatCurrency(oldRegimeResult.totalTax)}
                          </div>
                          <div className="text-sm text-muted-foreground">Total Tax</div>
                        </div>
                        
                        <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                          <div className="text-lg font-semibold mb-2">New Regime</div>
                          <div className="text-2xl font-bold text-green-600 mb-1">
                            {formatCurrency(newRegimeResult.totalTax)}
                          </div>
                          <div className="text-sm text-muted-foreground">Total Tax</div>
                        </div>
                      </div>
                      
                      <div className="mt-6 text-center">
                        <div className="text-lg font-semibold">
                          {oldRegimeResult.totalTax < newRegimeResult.totalTax ? 'Old Regime' : 'New Regime'} is better
                        </div>
                        <div className="text-2xl font-bold text-primary">
                          Save {formatCurrency(Math.abs(oldRegimeResult.totalTax - newRegimeResult.totalTax))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default IncomeTaxCalculator;
