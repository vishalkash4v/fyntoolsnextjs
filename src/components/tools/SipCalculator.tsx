'use client';
import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PiggyBank, Loader2 } from 'lucide-react';
import { useCurrency } from '@/contexts/CurrencyContext';

// Dynamically import chart.js only when needed
const Line = lazy(() => import('react-chartjs-2').then(module => ({ default: module.Line })));

// Chart registration will happen in useEffect when chart is actually rendered
let chartRegistered = false;

const SipCalculator = () => {
  const [calculationType, setCalculationType] = useState<'sip' | 'lumpsum'>('sip');
  const [monthlyInvestment, setMonthlyInvestment] = useState(25000);
  const [lumpSumAmount, setLumpSumAmount] = useState(100000);
  const [timePeriod, setTimePeriod] = useState(10);
  const [interestRate, setInterestRate] = useState(12);
  const [result, setResult] = useState<{ totalInvestment: number; totalReturns: number; maturityAmount: number; } | null>(null);
  const { currencySymbol, loading: currencyLoading } = useCurrency();
  const [editingValues, setEditingValues] = useState<{ monthlyInvestment: boolean, lumpSumAmount: boolean, interestRate: boolean, timePeriod: boolean }>({
    monthlyInvestment: false,
    lumpSumAmount: false,
    interestRate: false,
    timePeriod: false,
  });
  const [chartData, setChartData] = useState<any>({});
  const [chartReady, setChartReady] = useState(false);

  // Dynamically load and register chart.js only when chart is needed
  useEffect(() => {
    if (result && Object.keys(chartData).length > 0 && !chartRegistered) {
      import('chart.js').then((module) => {
        const { Chart, LineElement, CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend } = module;
        Chart.register(LineElement, CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend);
        chartRegistered = true;
        setChartReady(true);
      });
    } else if (result && Object.keys(chartData).length > 0 && chartRegistered) {
      setChartReady(true);
    } else {
      setChartReady(false);
    }
  }, [result, chartData]);

const calculateSIP = () => {
  const P = monthlyInvestment;
  const r = interestRate / 100 / 12; // monthly rate
  const n = timePeriod * 12; // total months

  if (P <= 0 || r <= 0 || n <= 0) return;

  let totalInvestment = P * n;
  let maturityAmount = P * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
  let totalReturns = maturityAmount - totalInvestment;

  // Prepare yearly chart data
  let investmentData = {
    investedAmount: [],
    interestEarned: [],
    totalAmount: [],
  };

  for (let year = 1; year <= timePeriod; year++) {
    const months = year * 12;
    const invested = P * months;
    const matured = P * ((Math.pow(1 + r, months) - 1) / r) * (1 + r);
    const interest = matured - invested;

    investmentData.investedAmount.push(invested);
    investmentData.interestEarned.push(interest);
    investmentData.totalAmount.push(matured);
  }

  setResult({
    totalInvestment,
    totalReturns,
    maturityAmount,
  });

  return investmentData;
};


 const calculateLumpsum = () => {
  const L = lumpSumAmount;
  const r = interestRate / 100;
  const n = timePeriod;

  if (L <= 0 || r <= 0 || n <= 0) return;

  const totalInvestment = L;
  const investmentData = {
    investedAmount: [],
    interestEarned: [],
    totalAmount: [],
  };

  for (let year = 1; year <= timePeriod; year++) {
    const matured = L * Math.pow(1 + r, year);
    const interest = matured - L;

    investmentData.investedAmount.push(totalInvestment); // constant principal
    investmentData.interestEarned.push(interest);
    investmentData.totalAmount.push(matured);
  }

  const finalMaturityAmount = L * Math.pow(1 + r, n);
  const totalReturns = finalMaturityAmount - totalInvestment;

  setResult({
    totalInvestment,
    totalReturns,
    maturityAmount: finalMaturityAmount,
  });

  return investmentData;
};


  const handleCalculate = () => {
    if (calculationType === 'sip') {
      const investmentData = calculateSIP();
      updateChartData(investmentData);
    } else {
      const investmentData = calculateLumpsum();
      updateChartData(investmentData);
    }
  };

  const updateChartData = (investmentData: any) => {
    setChartData({
      labels: Array.from({ length: timePeriod }, (_, i) => `Year ${i + 1}`),
      datasets: [
        {
          label: 'Invested Amount',
          data: investmentData.investedAmount,
          borderColor: 'rgb(51, 0, 0)',
          fill: false,
          tension: 0.4, // Smooth lines
        },
        {
          label: 'Interest Earned',
          data: investmentData.interestEarned,
          borderColor: 'rgb(3, 139, 37)',
          fill: false,
          tension: 0.4,
        },
        {
          label: 'Total Value',
          data: investmentData.totalAmount,
          borderColor: 'rgb(88, 158, 228)',
          fill: false,
          tension: 0.4,
        }
      ],
    });
  };

  const handleClear = () => {
    setMonthlyInvestment(25000);
    setLumpSumAmount(100000);
    setTimePeriod(10);
    setInterestRate(12);
    setResult(null);
    setChartData({});
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        ticks: {
          autoSkip: true,
          maxRotation: 45,
          minRotation: 30,
        },
        title: {
          display: true,
          text: 'Years',
        },
      },
      y: {
        beginAtZero: true,
      },
    },
    plugins: {
      legend: {
        position: 'bottom' as const,
        align: 'start' as const,
        labels: {
          boxWidth: 20,
          padding: 10,
          usePointStyle: true,
        },
      },
      tooltip: {
        mode: 'nearest' as const,
        intersect: false,
        position: 'nearest' as const,
        callbacks: {
          label: (context: any) => {
            const dataIndex = context.dataIndex;
            const investedAmount = context.chart.data.datasets[0].data[dataIndex];
            const interestEarned = context.chart.data.datasets[1].data[dataIndex];
            const totalValue = context.chart.data.datasets[2].data[dataIndex];

            return [
              `Invested Amount: ₹${investedAmount.toFixed(2)}`,
              `Interest Earned: ₹${interestEarned.toFixed(2)}`,
              `Total Value: ₹${totalValue.toFixed(2)}`
            ];
          },
        },
      },
    },
  } as const;




  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PiggyBank className="h-6 w-6" />
            SIP & Lump Sum Calculator
          </CardTitle>
          <CardDescription>
            Calculate returns on your Systematic Investment Plan (SIP) or Lump Sum investments.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-4">
            <Button
              variant={calculationType === 'sip' ? 'default' : 'outline'}
              onClick={() => setCalculationType('sip')}
              className="flex-1"
            >
              SIP
            </Button>
            <Button
              variant={calculationType === 'lumpsum' ? 'default' : 'outline'}
              onClick={() => setCalculationType('lumpsum')}
              className="flex-1"
            >
              Lump Sum
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Monthly Investment / Lump Sum Amount */}
            <div className="space-y-2">
              <Label htmlFor="monthlyInvestment" className="flex items-center gap-2">
                {calculationType === 'sip' ? 'Monthly Investment (₹)' : 'Lump Sum Amount (₹)'}
              </Label>
              <input
                type="range"
                min="1000"
                max="100000"
                value={calculationType === 'sip' ? monthlyInvestment : lumpSumAmount}
                onChange={(e) => calculationType === 'sip' ? setMonthlyInvestment(Number(e.target.value)) : setLumpSumAmount(Number(e.target.value))}
                className="w-full"
              />
              <div>{currencySymbol}{formatCurrency(calculationType === 'sip' ? monthlyInvestment : lumpSumAmount)}</div>
            </div>

            {/* Expected Rate of Return */}
            <div className="space-y-2">
              <Label htmlFor="interestRate" className="flex items-center gap-2">
                Expected Rate of Return (%)
              </Label>
              <input
                type="range"
                min="1"
                max="25"
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                className="w-full"
              />
              <div>{interestRate}%</div>
            </div>

            {/* Time Period */}
            <div className="space-y-2">
              <Label htmlFor="timePeriod" className="flex items-center gap-2">
                Time Period (Years)
              </Label>
              <input
                type="range"
                min="1"
                max="30"
                value={timePeriod}
                onChange={(e) => setTimePeriod(Number(e.target.value))}
                className="w-full"
              />
              <div>{timePeriod} years</div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleCalculate} disabled={monthlyInvestment <= 0 || timePeriod <= 0 || interestRate <= 0} className="flex-1">
              Calculate
            </Button>
            <Button variant="outline" onClick={handleClear}>
              Clear
            </Button>
          </div>

          {result && (
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="text-lg">Investment Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-background rounded-lg border">
                    <div className="text-2xl font-bold text-blue-600">
                      {currencySymbol}{formatCurrency(result.totalInvestment)}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Investment</div>
                  </div>
                  <div className="text-center p-4 bg-background rounded-lg border">
                    <div className="text-2xl font-bold text-green-600">
                      {currencySymbol}{formatCurrency(result.totalReturns)}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Returns</div>
                  </div>
                  <div className="text-center p-4 bg-background rounded-lg border">
                    <div className="text-2xl font-bold text-primary">
                      {currencySymbol}{formatCurrency(result.maturityAmount)}
                    </div>
                    <div className="text-sm text-muted-foreground">Maturity Value</div>
                  </div>
                </div>

                {/* Chart Component - Dynamically loaded */}
                <div className="mt-6" style={{ position: 'relative', height: '400px' }}>
                  {chartReady ? (
                    <Suspense fallback={
                      <div className="flex items-center justify-center h-full">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    }>
                      <Line data={chartData} options={chartOptions} />
                    </Suspense>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SipCalculator;
