'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Receipt, Calculator } from 'lucide-react';
import {
  type AgeGroup,
  type TaxBreakdown,
  calculateNewRegimeTax,
  calculateOldRegimeTax,
} from '@/lib/finance/indiaIncomeTax';

const IncomeTaxCalculator = () => {
  const [grossIncome, setGrossIncome] = useState('');
  const [ageGroup, setAgeGroup] = useState<AgeGroup>('below-60');
  const [deductions, setDeductions] = useState('');
  const [oldRegimeResult, setOldRegimeResult] = useState<TaxBreakdown | null>(null);
  const [newRegimeResult, setNewRegimeResult] = useState<TaxBreakdown | null>(null);

  const handleCalculate = () => {
    const income = parseFloat(grossIncome);
    const deductionAmount = parseFloat(deductions) || 0;
    if (!income || income <= 0) return;

    setOldRegimeResult(calculateOldRegimeTax(income, ageGroup, deductionAmount));
    setNewRegimeResult(calculateNewRegimeTax(income));
  };

  const handleClear = () => {
    setGrossIncome('');
    setDeductions('');
    setAgeGroup('below-60');
    setOldRegimeResult(null);
    setNewRegimeResult(null);
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);

  const renderBreakdown = (result: TaxBreakdown, regime: 'old' | 'new') => (
    <div className="space-y-3 text-sm">
      <div className="flex justify-between">
        <span>Gross Income</span>
        <span className="font-medium">{formatCurrency(result.grossIncome)}</span>
      </div>
      <div className="flex justify-between text-muted-foreground">
        <span>Standard Deduction</span>
        <span>− {formatCurrency(result.standardDeduction)}</span>
      </div>
      {regime === 'old' && result.chapterViaDeductions > 0 && (
        <div className="flex justify-between text-muted-foreground">
          <span>Chapter VI-A Deductions</span>
          <span>− {formatCurrency(result.chapterViaDeductions)}</span>
        </div>
      )}
      <div className="flex justify-between font-medium border-t pt-2">
        <span>Taxable Income</span>
        <span>{formatCurrency(result.taxableIncome)}</span>
      </div>
      <div className="flex justify-between">
        <span>Income Tax (before rebate)</span>
        <span>{formatCurrency(result.incomeTax + result.rebate87A)}</span>
      </div>
      {result.rebate87A > 0 && (
        <div className="flex justify-between text-green-600 dark:text-green-400">
          <span>Rebate u/s 87A</span>
          <span>− {formatCurrency(result.rebate87A)}</span>
        </div>
      )}
      <div className="flex justify-between">
        <span>Income Tax (after rebate)</span>
        <span className="font-medium">{formatCurrency(result.incomeTax)}</span>
      </div>
      <div className="flex justify-between">
        <span>Health &amp; Education Cess (4%)</span>
        <span>{formatCurrency(result.cess)}</span>
      </div>
      <div className="flex justify-between text-lg font-bold border-t pt-2">
        <span>Total Tax</span>
        <span className="text-red-600">{formatCurrency(result.totalTax)}</span>
      </div>
      <div className="flex justify-between text-lg font-bold">
        <span>Net In-Hand</span>
        <span className="text-green-600">{formatCurrency(result.netIncome)}</span>
      </div>
      <div className="flex justify-between text-muted-foreground">
        <span>Effective tax rate</span>
        <span>{result.effectiveRate.toFixed(2)}%</span>
      </div>
    </div>
  );

  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-6 w-6" />
            Income Tax Calculator (India)
          </CardTitle>
          <CardDescription>
            FY 2024-25 (AY 2025-26) — progressive slab tax with Section 87A rebate, standard deduction, and 4% cess.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="grossIncome">Annual Gross Income (₹)</Label>
              <Input
                id="grossIncome"
                type="number"
                min={0}
                placeholder="1200000"
                value={grossIncome}
                onChange={(e) => setGrossIncome(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Age Group (Old Regime)</Label>
              <Select value={ageGroup} onValueChange={(v) => setAgeGroup(v as AgeGroup)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="below-60">Below 60 years</SelectItem>
                  <SelectItem value="60-80">60–80 years (Senior)</SelectItem>
                  <SelectItem value="above-80">Above 80 years (Super senior)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deductions">Chapter VI-A Deductions (₹)</Label>
              <Input
                id="deductions"
                type="number"
                min={0}
                placeholder="150000"
                value={deductions}
                onChange={(e) => setDeductions(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">80C, 80D, NPS etc. — old regime only</p>
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
                <TabsTrigger value="comparison">Compare</TabsTrigger>
              </TabsList>

              <TabsContent value="old-regime">
                {oldRegimeResult && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        Old Tax Regime
                        <Badge variant="outline">Std ded ₹50,000</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>{renderBreakdown(oldRegimeResult, 'old')}</CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="new-regime">
                {newRegimeResult && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        New Tax Regime
                        <Badge variant="outline">Std ded ₹75,000</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>{renderBreakdown(newRegimeResult, 'new')}</CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="comparison">
                {oldRegimeResult && newRegimeResult && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Which regime saves more?</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="text-center p-4 rounded-lg bg-muted/50">
                          <div className="font-semibold mb-1">Old Regime</div>
                          <div className="text-2xl font-bold">{formatCurrency(oldRegimeResult.totalTax)}</div>
                        </div>
                        <div className="text-center p-4 rounded-lg bg-muted/50">
                          <div className="font-semibold mb-1">New Regime</div>
                          <div className="text-2xl font-bold">{formatCurrency(newRegimeResult.totalTax)}</div>
                        </div>
                      </div>
                      <p className="text-center text-lg">
                        <strong>
                          {oldRegimeResult.totalTax <= newRegimeResult.totalTax ? 'Old' : 'New'} regime
                        </strong>{' '}
                        is lower by{' '}
                        <span className="text-primary font-bold">
                          {formatCurrency(Math.abs(oldRegimeResult.totalTax - newRegimeResult.totalTax))}
                        </span>
                      </p>
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
