'use client';

/**
 * Lazy-loaded recharts charts for EMI calculator — keeps initial tool JS lighter.
 */
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';

type Props = {
  lineChartConfig: ChartConfig;
  yearlyBreakdownConfig: ChartConfig;
  lineChartData: Record<string, unknown>[];
  yearlyInterestComparisonData: Record<string, unknown>[];
};

export default function EmiCharts({
  lineChartConfig,
  yearlyBreakdownConfig,
  lineChartData,
  yearlyInterestComparisonData,
}: Props) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
        <div className="flex flex-col space-y-1.5 p-6">
          <h3 className="text-lg font-semibold leading-none tracking-tight">Remaining Balance Trend</h3>
        </div>
        <div className="p-6 pt-0">
          <ChartContainer config={lineChartConfig} className="h-[280px] w-full">
            <LineChart data={lineChartData}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} />
              <YAxis tickFormatter={(value) => `₹${Math.round(Number(value) / 100000)}L`} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line dataKey="baseBalance" type="monotone" stroke="var(--color-baseBalance)" strokeWidth={2} dot={false} />
              <Line dataKey="remainingBalance" type="monotone" stroke="var(--color-remainingBalance)" strokeWidth={2} dot={false} />
            </LineChart>
          </ChartContainer>
        </div>
      </div>
      <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
        <div className="flex flex-col space-y-1.5 p-6">
          <h3 className="text-lg font-semibold leading-none tracking-tight">Yearly Interest Comparison</h3>
        </div>
        <div className="p-6 pt-0">
          <ChartContainer config={yearlyBreakdownConfig} className="h-[280px] w-full">
            <BarChart data={yearlyInterestComparisonData}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="year" tickFormatter={(value) => `Y${value}`} />
              <YAxis tickFormatter={(value) => `₹${Math.round(Number(value) / 100000)}L`} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="interestWithoutPrepayment" fill="var(--color-interestWithoutPrepayment)" radius={4} />
              <Bar dataKey="interestWithPrepayment" fill="var(--color-interestWithPrepayment)" radius={4} />
            </BarChart>
          </ChartContainer>
        </div>
      </div>
    </div>
  );
}
