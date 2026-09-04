'use client';
import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, ShieldCheck } from 'lucide-react';
import { addDays, format, isWithinInterval } from 'date-fns';
import CommonDatePicker from '@/components/ui/CommonDatePicker';

const SafeDaysCalculator = () => {
  const [lastPeriod, setLastPeriod] = useState<Date | null>(null);
  const [cycleLength, setCycleLength] = useState('28');
  const [periodLength, setPeriodLength] = useState('5');
  const [checkDate, setCheckDate] = useState<Date | null>(null);

  const cycleData = useMemo(() => {
    if (!lastPeriod) return null;
    const cycle = Number(cycleLength);
    const length = Number(periodLength);
    if (!cycle || cycle < 18) return null;
    const nextPeriod = addDays(lastPeriod, cycle);
    const periodEnd = addDays(lastPeriod, Math.max(1, length) - 1);
    const ovulation = addDays(nextPeriod, -14);
    const fertileStart = addDays(ovulation, -5);
    const fertileEnd = addDays(ovulation, 1);
    return { nextPeriod, periodEnd, ovulation, fertileStart, fertileEnd };
  }, [lastPeriod, cycleLength, periodLength]);

  const calendarDays = useMemo(() => {
    if (!lastPeriod || !cycleData) return [];
    return Array.from({ length: 30 }).map((_, index) => {
      const date = addDays(lastPeriod, index);
      const isPeriod = isWithinInterval(date, { start: lastPeriod, end: cycleData.periodEnd });
      const isFertile = isWithinInterval(date, { start: cycleData.fertileStart, end: cycleData.fertileEnd });
      const isOvulation = date.toDateString() === cycleData.ovulation.toDateString();
      return { date, isPeriod, isFertile, isOvulation };
    });
  }, [lastPeriod, cycleData]);

  const riskStatus = useMemo(() => {
    if (!checkDate || !cycleData) return null;
    if (checkDate.toDateString() === cycleData.ovulation.toDateString()) {
      return { label: 'Very High', tone: 'bg-red-500/10 text-red-600 dark:text-red-300' };
    }
    if (isWithinInterval(checkDate, { start: cycleData.fertileStart, end: cycleData.fertileEnd })) {
      return { label: 'High', tone: 'bg-orange-500/10 text-orange-600 dark:text-orange-300' };
    }
    if (isWithinInterval(checkDate, { start: lastPeriod, end: cycleData.periodEnd })) {
      return { label: 'Medium', tone: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-300' };
    }
    return { label: 'Low', tone: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300' };
  }, [checkDate, cycleData, lastPeriod]);

  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            Safe Days Calculator
          </CardTitle>
          <CardDescription>Detect safe and fertile days based on your cycle.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <label className="text-sm font-medium">Last Period Start</label>
            <CommonDatePicker value={lastPeriod} onChange={setLastPeriod} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Cycle Length (days)</label>
            <Input type="number" min="18" max="45" value={cycleLength} onChange={(e) => setCycleLength(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Period Length (days)</label>
            <Input type="number" min="2" max="10" value={periodLength} onChange={(e) => setPeriodLength(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pregnancy Risk Indicator</CardTitle>
          <CardDescription>Check the likelihood for a specific date.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="w-full md:max-w-xs">
            <CommonDatePicker value={checkDate} onChange={setCheckDate} placeholder="Pick a date to check" />
          </div>
          {riskStatus ? (
            <div className={`rounded-lg px-4 py-3 text-sm font-semibold ${riskStatus.tone}`}>
              Risk Level: {riskStatus.label}
            </div>
          ) : (
            <div className="text-muted-foreground text-sm">Select a date to see risk level.</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Calendar Mode
          </CardTitle>
          <CardDescription>Next 30 days with fertile and safe days highlighted.</CardDescription>
        </CardHeader>
        <CardContent>
          {calendarDays.length > 0 ? (
            <>
              <div className="flex flex-wrap gap-2 mb-4 text-xs">
                <Badge variant="secondary" className="bg-red-500/10 text-red-600 dark:text-red-300">Period</Badge>
                <Badge variant="secondary" className="bg-orange-500/10 text-orange-600 dark:text-orange-300">Fertile</Badge>
                <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-300">Safe</Badge>
              </div>
              <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((day) => {
                  const tone = day.isPeriod
                    ? 'bg-red-500/10 text-red-600 dark:text-red-300'
                    : day.isFertile
                      ? 'bg-orange-500/10 text-orange-600 dark:text-orange-300'
                      : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300';
                  return (
                    <div key={day.date.toISOString()} className={`rounded-md border px-2 py-2 text-center text-xs sm:text-sm ${tone}`}>
                      <div className="font-semibold">{format(day.date, 'd')}</div>
                      <div className="text-[10px] sm:text-xs text-muted-foreground">{format(day.date, 'MMM')}</div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="text-muted-foreground">Calendar view will appear once your cycle details are added.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SafeDaysCalculator;
