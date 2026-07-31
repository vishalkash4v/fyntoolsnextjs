'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Banknote, Download, Lightbulb, TrendingDown, TrendingUp } from 'lucide-react';
import dynamic from 'next/dynamic';
import type { ChartConfig } from '@/components/ui/chart';
import Link from "next/link";

const EmiCharts = dynamic(() => import('@/components/tools/EmiCharts'), {
  ssr: false,
  loading: () => (
    <div className="h-[280px] w-full rounded-xl border bg-muted/30 animate-pulse" aria-label="Loading charts" />
  ),
});

type StrategyMode = 'reduceTenure' | 'reduceEmi';

type ScheduleRow = {
  month: number;
  year: number;
  emi: number;
  interest: number;
  principalPaid: number;
  extraApplied: number;
  cumulativeExtraPaid: number;
  remainingBalance: number;
  cumulativeInterestPaid: number;
  cumulativeInterestSaved: number;
};

type YearSummary = {
  year: number;
  totalEmi: number;
  totalInterest: number;
  totalPrincipal: number;
  totalExtra: number;
  closingBalance: number;
};

type CalculationSummary = {
  emi: number;
  totalInterest: number;
  totalPayment: number;
  totalMonths: number;
  yearlySummary: YearSummary[];
};

type FullResult = {
  base: CalculationSummary;
  optimized: CalculationSummary;
  baseSchedule: ScheduleRow[];
  schedule: ScheduleRow[];
};

const MAX_ALLOWED_MONTHS = 1200;
const PRINCIPAL_SLIDER_MAX = 5000000; // 50 lakh for smoother slider interaction
const PRINCIPAL_SLIDER_MIN = 10000;

const lineChartConfig = {
  remainingBalance: { label: 'With Prepayment', color: '#2563eb' },
  baseBalance: { label: 'Without Prepayment', color: '#f97316' },
} satisfies ChartConfig;

const yearlyBreakdownConfig = {
  interestWithoutPrepayment: { label: 'Without Prepayment', color: '#f97316' },
  interestWithPrepayment: { label: 'With Prepayment', color: '#ef4444' },
} satisfies ChartConfig;

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);

const formatCurrencyCompact = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(value);

const computeEmi = (principal: number, monthlyRate: number, months: number): number => {
  if (months <= 0) return 0;
  if (monthlyRate === 0) return principal / months;
  const growthFactor = Math.pow(1 + monthlyRate, months);
  return (principal * monthlyRate * growthFactor) / (growthFactor - 1);
};

const parseInputToNumber = (value: string): number | null => {
  if (value.trim() === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const normalizePrincipalSliderValue = (value: number) => {
  if (value <= PRINCIPAL_SLIDER_MIN) return PRINCIPAL_SLIDER_MIN;
  return Math.round(value / 5000) * 5000;
};

const generateSmartSuggestions = (inputs: {
  principal: number;
  annualRate: number;
  tenureYears: number;
  yearlyExtra: number;
  stepUpEnabled: boolean;
  stepUpMode: 'percent' | 'fixed';
  stepUpValue: number;
  stepUpYears: number;
}, results: FullResult) => {
  const suggestions: string[] = [];
  const interestSaved = Math.max(results.base.totalInterest - results.optimized.totalInterest, 0);
  const yearsSaved = Math.max(results.base.totalMonths - results.optimized.totalMonths, 0) / 12;
  const targetYears = 10;
  const targetMonths = targetYears * 12;
  const monthlyRate = inputs.annualRate / (12 * 100);
  const targetEmi = computeEmi(inputs.principal, monthlyRate, targetMonths);
  const yearlyEquivalent = Math.max((targetEmi - results.base.emi) * 12, 0);
  const shorterTenureEmi = computeEmi(inputs.principal, monthlyRate, Math.max((inputs.tenureYears - 5) * 12, 12));
  const fiveYearInterestSaving = Math.max(results.base.totalInterest - ((shorterTenureEmi * Math.max((inputs.tenureYears - 5) * 12, 12)) - inputs.principal), 0);

  if (inputs.yearlyExtra > 0) {
    suggestions.push(`If you pay ${formatCurrency(inputs.yearlyExtra)} extra every year, you can save about ${formatCurrency(interestSaved)} interest and close your loan ${yearsSaved.toFixed(2)} years earlier.`);
  } else {
    suggestions.push(`Adding a yearly extra payment of around ${formatCurrency(Math.max(Math.round(inputs.principal * 0.02), 25000))} can significantly reduce your tenure and interest burden.`);
  }

  if (inputs.stepUpEnabled) {
    suggestions.push(`With step-up EMI (${inputs.stepUpMode === 'percent' ? `${inputs.stepUpValue}%` : formatCurrency(inputs.stepUpValue)} every ${inputs.stepUpYears} year(s)), your loan payoff accelerates as your income grows.`);
  } else {
    suggestions.push('If your income increases yearly, increasing EMI by 5-10% every 2 years can reduce your loan tenure significantly.');
  }

  suggestions.push(`To target closing this loan in about ${targetYears} years, aim for an EMI near ${formatCurrency(targetEmi)} or add roughly ${formatCurrency(yearlyEquivalent)} yearly extra payment.`);
  suggestions.push(`You are paying high interest due to long tenure. Reducing tenure by 5 years can save approximately ${formatCurrency(fiveYearInterestSaving)} interest.`);

  return suggestions;
};

const EmiCalculator = () => {
  const [principal, setPrincipal] = useState<string>('1000000');
  const [annualRate, setAnnualRate] = useState<string>('8.5');
  const [tenureYears, setTenureYears] = useState<string>('20');
  const [yearlyExtraEmi, setYearlyExtraEmi] = useState<string>('0');
  const [yearlyExtraEnabled, setYearlyExtraEnabled] = useState<boolean>(false);
  const [stepUpEnabled, setStepUpEnabled] = useState<boolean>(false);
  const [stepUpMode, setStepUpMode] = useState<'percent' | 'fixed'>('percent');
  const [stepUpValue, setStepUpValue] = useState<string>('5');
  const [stepUpYears, setStepUpYears] = useState<string>('1');
  const [debouncedInputs, setDebouncedInputs] = useState({
    principal: '1000000',
    annualRate: '8.5',
    tenureYears: '20',
    yearlyExtraEmi: '0',
    yearlyExtraEnabled: false,
    stepUpEnabled: false,
    stepUpMode: 'percent' as 'percent' | 'fixed',
    stepUpValue: '5',
    stepUpYears: '1',
  });

  const [principalError, setPrincipalError] = useState<string>('');
  const [rateError, setRateError] = useState<string>('');
  const [tenureError, setTenureError] = useState<string>('');
  const [uiPrincipal, setUiPrincipal] = useState<number>(1000000);
  const [uiRate, setUiRate] = useState<number>(8.5);
  const [uiTenure, setUiTenure] = useState<number>(20);
  const [uiYearlyExtra, setUiYearlyExtra] = useState<number>(0);

  const principalNum = parseInputToNumber(principal);
  const annualRateNum = parseInputToNumber(annualRate);
  const tenureYearsNum = parseInputToNumber(tenureYears);
  const yearlyExtraNum = parseInputToNumber(yearlyExtraEmi);
  const stepUpValueNum = parseInputToNumber(stepUpValue);
  const stepUpYearsNum = parseInputToNumber(stepUpYears);
  const dynamicLoanMax = Math.max(principalNum ?? 1000000, 1);

  useEffect(() => {
    let isValid = true;
    if (!principal || parseFloat(principal) <= 0) {
      setPrincipalError('Principal must be greater than 0.');
      isValid = false;
    } else {
      setPrincipalError('');
    }
    if (annualRate === '' || parseFloat(annualRate) < 0) {
      setRateError('Annual interest rate cannot be negative.');
      isValid = false;
    } else {
      setRateError('');
    }
    if (!tenureYears || parseFloat(tenureYears) <= 0) {
      setTenureError('Loan tenure must be greater than 0.');
      isValid = false;
    } else {
      setTenureError('');
    }
    if (!isValid) {
      // Keep errors reactive while typing.
    }
  }, [principal, annualRate, tenureYears]);

  const validateInputs = () => !!principal && parseFloat(principal) > 0 && annualRate !== '' && parseFloat(annualRate) >= 0 && !!tenureYears && parseFloat(tenureYears) > 0;

  const buildSchedule = ({
    principalValue,
    monthlyRate,
    numberOfMonths,
    monthlyEmi,
    yearlyExtra,
    stepUp,
    mode,
    applyPrepayment,
  }: {
    principalValue: number;
    monthlyRate: number;
    numberOfMonths: number;
    monthlyEmi: number;
    yearlyExtra: number;
    stepUp: {
      enabled: boolean;
      mode: 'percent' | 'fixed';
      value: number;
      years: number;
    };
    mode: StrategyMode;
    applyPrepayment: boolean;
  }): { schedule: ScheduleRow[]; summary: CalculationSummary } => {
    const schedule: ScheduleRow[] = [];
    let balance = principalValue;
    let emiForMonth = monthlyEmi;
    let month = 1;
    let accruedInterest = 0;
    let paidTotal = 0;
    let cumulativeExtraPaid = 0;
    let cumulativeInterestPaid = 0;

    while (month <= Math.min(MAX_ALLOWED_MONTHS, numberOfMonths)) {
      if (balance <= 0.01) {
        break;
      }
      const plannedInterest = balance * monthlyRate;
      let principalPaid = Math.min(Math.max(emiForMonth - plannedInterest, 0), balance);
      let actualEmi = plannedInterest + principalPaid;
      let extraApplied = 0;

      if (applyPrepayment) {
        if (yearlyExtra > 0 && month % 12 === 0) {
          const yearlyApplied = Math.min(yearlyExtra, balance - principalPaid);
          if (yearlyApplied > 0) {
            extraApplied += yearlyApplied;
            balance -= yearlyApplied;
          }
        }

        if (stepUp.enabled && stepUp.years > 0 && month % (stepUp.years * 12) === 0) {
          if (stepUp.mode === 'percent') {
            emiForMonth = emiForMonth * (1 + stepUp.value / 100);
          } else {
            emiForMonth = emiForMonth + stepUp.value;
          }
        }
      }

      if (principalPaid > balance || month === numberOfMonths) {
        principalPaid = balance;
        actualEmi = plannedInterest + principalPaid;
      }

      balance = Math.max(balance - principalPaid, 0);
      cumulativeExtraPaid += extraApplied;
      cumulativeInterestPaid += plannedInterest;

      accruedInterest += plannedInterest;
      paidTotal += actualEmi + extraApplied;

      schedule.push({
        month,
        year: Math.ceil(month / 12),
        emi: actualEmi,
        interest: plannedInterest,
        principalPaid,
        extraApplied,
        cumulativeExtraPaid,
        remainingBalance: balance,
        cumulativeInterestPaid,
        cumulativeInterestSaved: 0,
      });

      if (applyPrepayment && mode === 'reduceEmi' && extraApplied > 0 && month < numberOfMonths && balance > 0) {
        // Critical fix: EMI recalculation uses post-prepayment balance and remaining months.
        const remainingMonths = numberOfMonths - month;
        emiForMonth = computeEmi(balance, monthlyRate, remainingMonths);
      }

      if (!applyPrepayment && month >= numberOfMonths) {
        break;
      }

      if (applyPrepayment && mode === 'reduceEmi' && month >= numberOfMonths) {
        break;
      }

      if (applyPrepayment && mode === 'reduceTenure' && balance <= 0.01) {
        break;
      }

      month += 1;
    }

    const yearlyMap = new Map<number, YearSummary>();
    schedule.forEach((row) => {
      const existing = yearlyMap.get(row.year) ?? {
        year: row.year,
        totalEmi: 0,
        totalInterest: 0,
        totalPrincipal: 0,
        totalExtra: 0,
        closingBalance: 0,
      };
      existing.totalEmi += row.emi;
      existing.totalInterest += row.interest;
      existing.totalPrincipal += row.principalPaid;
      existing.totalExtra += row.extraApplied;
      existing.closingBalance = row.remainingBalance;
      yearlyMap.set(row.year, existing);
    });

    return {
      schedule,
      summary: {
        emi: monthlyEmi,
        totalInterest: accruedInterest,
        totalPayment: paidTotal,
        totalMonths: schedule.length,
        yearlySummary: [...yearlyMap.values()],
      } satisfies CalculationSummary,
    };
  };

  const result = useMemo((): FullResult | null => {
    const activeInputs = debouncedInputs;
    if (!validateInputs()) return null;

    const p = parseFloat(activeInputs.principal);
    const annualR = parseFloat(activeInputs.annualRate);
    const tYears = parseFloat(activeInputs.tenureYears);
    const yearlyExtra = activeInputs.yearlyExtraEnabled ? Math.max(parseFloat(activeInputs.yearlyExtraEmi || '0'), 0) : 0;
    const stepUp = {
      enabled: activeInputs.stepUpEnabled,
      mode: activeInputs.stepUpMode,
      value: Math.max(parseFloat(activeInputs.stepUpValue || '0'), 0),
      years: Math.max(parseInt(activeInputs.stepUpYears || '1', 10), 1),
    };
    const monthlyRate = annualR / (12 * 100);
    const numberOfMonths = Math.max(Math.round(tYears * 12), 1);
    const baseEmi = computeEmi(p, monthlyRate, numberOfMonths);

    const baseRun = buildSchedule({
      principalValue: p,
      monthlyRate,
      numberOfMonths,
      monthlyEmi: baseEmi,
      yearlyExtra: 0,
      stepUp: { enabled: false, mode: 'percent', value: 0, years: 1 },
      mode: 'reduceTenure',
      applyPrepayment: false,
    });

    const optimizedRun = buildSchedule({
      principalValue: p,
      monthlyRate,
      numberOfMonths,
      monthlyEmi: baseEmi,
      yearlyExtra,
      stepUp,
      mode: 'reduceTenure',
      applyPrepayment: true,
    });

    const baselineCumulativeInterestByMonth = new Map<number, number>();
    baseRun.schedule.forEach((row) => {
      baselineCumulativeInterestByMonth.set(row.month, row.cumulativeInterestPaid);
    });
    const enrichedOptimizedSchedule = optimizedRun.schedule.map((row) => ({
      ...row,
      cumulativeInterestSaved: Math.max((baselineCumulativeInterestByMonth.get(row.month) ?? row.cumulativeInterestPaid) - row.cumulativeInterestPaid, 0),
    }));

    return {
      base: baseRun.summary,
      optimized: optimizedRun.summary,
      baseSchedule: baseRun.schedule,
      schedule: enrichedOptimizedSchedule,
    };
  }, [debouncedInputs]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const next = {
        principal,
        annualRate,
        tenureYears,
        yearlyExtraEmi,
        yearlyExtraEnabled,
        stepUpEnabled,
        stepUpMode,
        stepUpValue,
        stepUpYears,
      };
      setDebouncedInputs(next);
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [principal, annualRate, tenureYears, yearlyExtraEmi, yearlyExtraEnabled, stepUpEnabled, stepUpMode, stepUpValue, stepUpYears]);

  const savings = useMemo(() => {
    if (!result) return null;
    const interestSaved = Math.max(result.base.totalInterest - result.optimized.totalInterest, 0);
    const monthsSaved = Math.max(result.base.totalMonths - result.optimized.totalMonths, 0);
    const emiDifference = Math.max(result.base.emi - result.optimized.emi, 0);
    return {
      interestSaved,
      monthsSaved,
      yearsSaved: monthsSaved / 12,
      emiDifference,
    };
  }, [result]);

  const smartSuggestions = useMemo(() => {
    if (!result || !principalNum || annualRateNum === null || !tenureYearsNum) return [];
    return generateSmartSuggestions({
      principal: principalNum,
      annualRate: annualRateNum,
      tenureYears: tenureYearsNum,
      yearlyExtra: yearlyExtraEnabled ? Number(yearlyExtraNum ?? 0) : 0,
      stepUpEnabled,
      stepUpMode,
      stepUpValue: Number(stepUpValueNum ?? 0),
      stepUpYears: Math.max(Number(stepUpYearsNum ?? 1), 1),
    }, result);
  }, [result, principalNum, annualRateNum, tenureYearsNum, yearlyExtraEnabled, yearlyExtraNum, stepUpEnabled, stepUpMode, stepUpValueNum, stepUpYearsNum]);

  const lineChartData = useMemo(() => {
    if (!result) return [];
    const baseMap = new Map<number, number>();
    result.baseSchedule.forEach((row) => {
      baseMap.set(row.month, row.remainingBalance);
    });
    const optimizedMap = new Map<number, number>();
    result.schedule.forEach((row) => {
      optimizedMap.set(row.month, row.remainingBalance);
    });
    const maxMonth = Math.max(result.base.totalMonths, result.optimized.totalMonths);
    return Array.from({ length: maxMonth }, (_, idx) => {
      const month = idx + 1;
      return {
        month,
        remainingBalance: Math.round(optimizedMap.get(month) ?? 0),
        baseBalance: Math.round(baseMap.get(month) ?? 0),
      };
    });
  }, [result]);

  const yearlyInterestComparisonData = useMemo(() => {
    if (!result) return [];
    const years = Math.max(
      result.base.yearlySummary[result.base.yearlySummary.length - 1]?.year ?? 0,
      result.optimized.yearlySummary[result.optimized.yearlySummary.length - 1]?.year ?? 0,
    );
    const baseMap = new Map(result.base.yearlySummary.map((row) => [row.year, row.totalInterest]));
    const optMap = new Map(result.optimized.yearlySummary.map((row) => [row.year, row.totalInterest]));
    return Array.from({ length: years }, (_, idx) => ({
      year: idx + 1,
      interestWithoutPrepayment: Math.round(baseMap.get(idx + 1) ?? 0),
      interestWithPrepayment: Math.round(optMap.get(idx + 1) ?? 0),
    }));
  }, [result]);

  const downloadCsv = () => {
    if (!result) return;
    const header = 'Month,Year,EMI,Interest,Principal,Extra Payment,Balance,Cumulative Interest,Cumulative Extra Paid';
    const rows = result.schedule.map((row) =>
      [
        row.month,
        row.year,
        row.emi.toFixed(2),
        row.interest.toFixed(2),
        row.principalPaid.toFixed(2),
        row.extraApplied.toFixed(2),
        row.remainingBalance.toFixed(2),
        row.cumulativeInterestPaid.toFixed(2),
        row.cumulativeExtraPaid.toFixed(2),
      ].join(','),
    );
    const csvContent = [header, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'emi-amortization-schedule.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Loan Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="principal" className="mb-1 block">Principal Amount (₹)</Label>
          <Input
            id="principal"
            type="text"
            inputMode="numeric"
            value={principal}
            onChange={(e) => {
              const val = e.target.value.replace(/[^\d]/g, '');
              setPrincipal(val);
              if (val !== '') setUiPrincipal(Number(val));
            }}
            className="text-right"
          />
          <Slider
            className="mt-3 w-full"
            min={PRINCIPAL_SLIDER_MIN}
            max={PRINCIPAL_SLIDER_MAX}
            step={5000}
            value={[Math.min(Math.max(uiPrincipal, PRINCIPAL_SLIDER_MIN), PRINCIPAL_SLIDER_MAX)]}
            onValueChange={(value) => {
              const normalized = normalizePrincipalSliderValue(value[0]);
              setUiPrincipal(normalized);
              setPrincipal(String(normalized));
            }}
          />
          <p className="text-xs text-muted-foreground mt-1">Selected: ₹{formatCurrencyCompact(principalNum ?? 0)}</p>
          {principalError && <p className="text-red-500 text-xs mt-1">{principalError}</p>}
        </div>
        <div>
          <Label htmlFor="annualRate" className="mb-1 block">Annual Interest Rate (%)</Label>
          <Input
            id="annualRate"
            type="text"
            inputMode="decimal"
            value={annualRate}
            onChange={(e) => {
              const val = e.target.value.replace(/[^\d.]/g, '');
              setAnnualRate(val);
              if (val !== '' && !Number.isNaN(Number(val))) setUiRate(Number(val));
            }}
            className="text-right"
          />
          <Slider className="mt-3 w-full" min={1} max={20} step={0.01} value={[Math.min(Math.max(uiRate, 1), 20)]} onValueChange={(value) => { setUiRate(value[0]); setAnnualRate(String(value[0])); }} />
          <p className="text-xs text-muted-foreground mt-1">Selected: {(annualRateNum ?? 0).toFixed(2)}%</p>
          {rateError && <p className="text-red-500 text-xs mt-1">{rateError}</p>}
        </div>
        <div>
          <Label htmlFor="tenureYears" className="mb-1 block">Loan Tenure (Years)</Label>
          <Input
            id="tenureYears"
            type="text"
            inputMode="numeric"
            value={tenureYears}
            onChange={(e) => {
              const val = e.target.value.replace(/[^\d]/g, '');
              setTenureYears(val);
              if (val !== '') setUiTenure(Number(val));
            }}
            className="text-right"
          />
          <Slider className="mt-3 w-full" min={1} max={35} step={0.5} value={[Math.min(Math.max(uiTenure, 1), 35)]} onValueChange={(value) => { setUiTenure(value[0]); setTenureYears(String(value[0])); }} />
          <p className="text-xs text-muted-foreground mt-1">Selected: {(tenureYearsNum ?? 0).toFixed(0)} years</p>
          {tenureError && <p className="text-red-500 text-xs mt-1">{tenureError}</p>}
        </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Prepayment Options (Optional)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
        <div className="space-y-3 rounded-md border p-4">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={yearlyExtraEnabled} onChange={(e) => setYearlyExtraEnabled(e.target.checked)} />
            <span className="font-medium">Add Extra Payment Every Year</span>
          </label>
          {yearlyExtraEnabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="yearlyExtraEmi" className="mb-1 block">Yearly Extra Payment (₹)</Label>
          <Input
            id="yearlyExtraEmi"
            type="text"
            inputMode="numeric"
            value={yearlyExtraEmi}
            onChange={(e) => {
              const val = e.target.value.replace(/[^\d]/g, '');
              if (val === '') {
                setYearlyExtraEmi('');
                return;
              }
              setYearlyExtraEmi(val);
              setUiYearlyExtra(Number(val));
            }}
            className="text-right"
          />
          <Slider className="mt-3 w-full" min={0} max={dynamicLoanMax} step={500} value={[Math.min(Math.max(uiYearlyExtra, 0), dynamicLoanMax)]} onValueChange={(value) => { setUiYearlyExtra(value[0]); setYearlyExtraEmi(String(value[0])); }} />
          <p className="text-xs text-muted-foreground mt-1">Selected: ₹{formatCurrencyCompact(yearlyExtraNum ?? 0)}</p>
          <p className="text-xs text-muted-foreground mt-1">Pay this extra amount once every year to reduce loan faster.</p>
        </div>
            </div>
          )}
        </div>

        <div className="space-y-3 rounded-md border p-4">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={stepUpEnabled} onChange={(e) => setStepUpEnabled(e.target.checked)} />
            <span className="font-medium">Increase EMI Over Time</span>
          </label>
          {stepUpEnabled && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="mb-1 block">Increase EMI By</Label>
                <Select value={stepUpMode} onValueChange={(value) => setStepUpMode(value as 'percent' | 'fixed')}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percent">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Fixed Amount (₹)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="stepUpValue" className="mb-1 block">Value</Label>
                <Input id="stepUpValue" type="text" inputMode="numeric" value={stepUpValue} onChange={(e) => setStepUpValue(e.target.value.replace(/[^\d.]/g, ''))} className="text-right" />
              </div>
              <div>
                <Label htmlFor="stepUpYears" className="mb-1 block">Apply Every (Years)</Label>
                <Input id="stepUpYears" type="text" inputMode="numeric" value={stepUpYears} onChange={(e) => setStepUpYears(e.target.value.replace(/[^\d]/g, ''))} className="text-right" />
              </div>
            </div>
          )}
        </div>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">Auto recalculates after 250ms when inputs change.</p>

      {result && savings && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-blue-500/40">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">EMI</p>
                <p className="text-xl font-bold text-blue-600">{formatCurrency(result.optimized.emi)}</p>
              </CardContent>
            </Card>
            <Card className="border-red-500/40">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Total Interest</p>
                <p className="text-xl font-bold text-red-500">{formatCurrency(result.optimized.totalInterest)}</p>
              </CardContent>
            </Card>
            <Card className="border-blue-500/40">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Total Savings</p>
                <p className="text-xl font-bold text-blue-600">{formatCurrency(savings.interestSaved)}</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Interest Saved</p>
                <p className="font-semibold text-blue-600">{formatCurrency(savings.interestSaved)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Tenure Reduced</p>
                <p className="font-semibold">{(savings.monthsSaved / 12).toFixed(2)} years</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Debt-Free Earlier</p>
                <p className="font-semibold text-green-600">{savings.yearsSaved.toFixed(2)} years earlier</p>
              </CardContent>
            </Card>
          </div>

          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="text-xl">Smart Insights</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-3">
              <div className="rounded-md bg-blue-50 dark:bg-blue-950/40 p-3">
                <p className="text-sm text-muted-foreground">Interest Saved</p>
                <p className="font-semibold text-blue-600">You save {formatCurrency(savings.interestSaved)} interest.</p>
              </div>
              <div className="rounded-md bg-green-50 dark:bg-green-950/40 p-3">
                <p className="text-sm text-muted-foreground">Tenure Reduction</p>
                <p className="font-semibold text-green-600">Loan tenure reduced by {(savings.monthsSaved / 12).toFixed(2)} years.</p>
              </div>
              <div className="rounded-md bg-purple-50 dark:bg-purple-950/40 p-3">
                <p className="text-sm text-muted-foreground">Debt Free Earlier</p>
                <p className="font-semibold text-purple-600">You become debt-free {savings.yearsSaved.toFixed(2)} years earlier.</p>
              </div>
              <div className="rounded-md bg-amber-50 dark:bg-amber-950/40 p-3 md:col-span-3">
                <p className="font-semibold text-amber-700 dark:text-amber-300">
                  With your extra payments, you will save {formatCurrency(savings.interestSaved)} interest and close the loan {savings.yearsSaved.toFixed(2)} years earlier.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-amber-500" />
                Smart Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              {smartSuggestions.map((suggestion, index) => (
                <div key={index} className="rounded-md border border-amber-200/70 bg-amber-50/60 dark:bg-amber-950/20 p-3 text-sm">
                  {suggestion}
                </div>
              ))}
            </CardContent>
          </Card>

          <EmiCharts
            lineChartConfig={lineChartConfig}
            yearlyBreakdownConfig={yearlyBreakdownConfig}
            lineChartData={lineChartData}
            yearlyInterestComparisonData={yearlyInterestComparisonData}
          />

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Amortization Schedule</CardTitle>
              <Button onClick={downloadCsv} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </CardHeader>
            <CardContent className="max-h-[460px] overflow-x-auto overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-white dark:bg-zinc-900 z-20 shadow-[0_1px_0_rgba(0,0,0,0.08)]">
                  <tr className="border-b">
                    <th className="text-left p-2">Month</th>
                    <th className="text-left p-2">Year</th>
                    <th className="text-right p-2">EMI</th>
                    <th className="text-right p-2 text-red-500">Interest</th>
                    <th className="text-right p-2 text-green-600">Principal</th>
                    <th className="text-right p-2 text-blue-600">Extra Payment</th>
                    <th className="text-right p-2 text-blue-600">Cumulative Extra Paid</th>
                    <th className="text-right p-2">Cumulative Interest</th>
                    <th className="text-right p-2">Cumulative Savings</th>
                    <th className="text-right p-2">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {result.schedule.map((row) => (
                    <tr key={row.month} className={`border-b ${row.extraApplied > 0 ? 'bg-blue-50/80 dark:bg-blue-950/30' : ''}`}>
                      <td className="p-2">{row.month}</td>
                      <td className="p-2">{row.year}</td>
                      <td className="p-2 text-right">{formatCurrency(row.emi)}</td>
                      <td className="p-2 text-right text-red-500">{formatCurrency(row.interest)}</td>
                      <td className="p-2 text-right text-green-600">{formatCurrency(row.principalPaid)}</td>
                      <td className="p-2 text-right text-blue-600">
                        {formatCurrency(row.extraApplied)}
                        {row.extraApplied > 0 && <Badge className="ml-2 bg-blue-600">Extra EMI Applied</Badge>}
                      </td>
                      <td className="p-2 text-right text-blue-600">{formatCurrency(row.cumulativeExtraPaid)}</td>
                      <td className="p-2 text-right">{formatCurrency(row.cumulativeInterestPaid)}</td>
                      <td className="p-2 text-right text-blue-600">{formatCurrency(row.cumulativeInterestSaved)}</td>
                      <td className="p-2 text-right">{formatCurrency(row.remainingBalance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Year-wise Summary</CardTitle>
            </CardHeader>
            <CardContent className="overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Year</th>
                    <th className="text-right p-2">Total EMI Paid</th>
                    <th className="text-right p-2 text-red-500">Total Interest</th>
                    <th className="text-right p-2 text-green-600">Total Principal</th>
                    <th className="text-right p-2 text-blue-600">Total Extra EMI</th>
                    <th className="text-right p-2">Closing Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {result.optimized.yearlySummary.map((row) => (
                    <tr key={row.year} className="border-b">
                      <td className="p-2">{row.year}</td>
                      <td className="p-2 text-right">{formatCurrency(row.totalEmi)}</td>
                      <td className="p-2 text-right text-red-500">{formatCurrency(row.totalInterest)}</td>
                      <td className="p-2 text-right text-green-600">{formatCurrency(row.totalPrincipal)}</td>
                      <td className="p-2 text-right text-blue-600">{formatCurrency(row.totalExtra)}</td>
                      <td className="p-2 text-right">{formatCurrency(row.closingBalance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
            <CardFooter className="text-xs text-muted-foreground">
              Prepayments are applied monthly as configured; yearly extra EMI appears every 12th month.
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Comparison (With vs Without Prepayment)</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-3">
              <div className="rounded-md border p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Banknote className="h-4 w-4" />
                  <p className="text-sm text-muted-foreground">Total Payment</p>
                </div>
                <p className="font-semibold">{formatCurrency(result.optimized.totalPayment)}</p>
                <p className="text-xs text-muted-foreground">Without prepayment: {formatCurrency(result.base.totalPayment)}</p>
              </div>
              <div className="rounded-md border p-3">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-red-500" />
                  <p className="text-sm text-muted-foreground">Interest Paid</p>
                </div>
                <p className="font-semibold text-red-500">{formatCurrency(result.optimized.totalInterest)}</p>
                <p className="text-xs text-muted-foreground">Without prepayment: {formatCurrency(result.base.totalInterest)}</p>
              </div>
              <div className="rounded-md border p-3">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingDown className="h-4 w-4 text-blue-600" />
                  <p className="text-sm text-muted-foreground">Tenure</p>
                </div>
                <p className="font-semibold">{(result.optimized.totalMonths / 12).toFixed(2)} years</p>
                <p className="text-xs text-muted-foreground">Without prepayment: {(result.base.totalMonths / 12).toFixed(2)} years</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">How To Reduce EMI & Loan Burden</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <h2 className="text-base font-semibold text-foreground">How to Reduce Your EMI or Close Loan Faster</h2>
              <p>Add yearly extra payments, use a step-up EMI strategy, and choose a shorter tenure where affordable.</p>
              <h2 className="text-base font-semibold text-foreground">How to Close a 20-25 Year Loan in 10 Years</h2>
              <p>Combine yearly extra payment with step-up EMI every 1-2 years. The combined strategy sharply cuts interest and tenure.</p>
              <h2 className="text-base font-semibold text-foreground">Benefits of Prepayment</h2>
              <p>Prepayment helps save interest, reduce tenure, and become debt-free earlier without changing loan type.</p>
              <h2 className="text-base font-semibold text-foreground">What is Step-Up EMI?</h2>
              <p>Step-up EMI means EMI increases over time. It is useful when your income is expected to grow steadily.</p>
              <p>
                Also explore <Link href="/sip-calculator" className="text-primary underline">SIP Calculator</Link> and <Link href="/fd-calculator" className="text-primary underline">FD Calculator</Link> for overall financial planning.
              </p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default EmiCalculator;

