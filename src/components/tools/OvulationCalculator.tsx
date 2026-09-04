'use client';
import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Activity, Calendar } from 'lucide-react';
import { addDays, format } from 'date-fns';
import CommonDatePicker from '@/components/ui/CommonDatePicker';

const OvulationCalculator = () => {
  const [lastPeriod, setLastPeriod] = useState<Date | null>(null);
  const [cycleLength, setCycleLength] = useState('28');
  const [cycleDay, setCycleDay] = useState('');

  const parsedDate = useMemo(() => lastPeriod, [lastPeriod]);

  const ovulationData = useMemo(() => {
    if (!parsedDate) return null;
    const cycle = Number(cycleLength);
    if (!cycle || cycle < 18) return null;
    const nextPeriod = addDays(parsedDate, cycle);
    const ovulation = addDays(nextPeriod, -14);
    const fertileStart = addDays(ovulation, -5);
    const fertileEnd = addDays(ovulation, 1);
    return { ovulation, fertileStart, fertileEnd };
  }, [parsedDate, cycleLength]);

  const chanceMeter = useMemo(() => {
    if (!ovulationData || !cycleDay) return { label: 'Enter cycle day', value: 0 };
    const day = Number(cycleDay);
    if (Number.isNaN(day)) return { label: 'Enter cycle day', value: 0 };
    if (day >= 10 && day <= 16) return { label: 'High', value: 75 };
    if (day >= 7 && day <= 9) return { label: 'Medium', value: 35 };
    return { label: 'Low', value: 10 };
  }, [ovulationData, cycleDay]);

  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Ovulation Calculator
          </CardTitle>
          <CardDescription>Find your fertile window and ovulation day.</CardDescription>
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
            <label className="text-sm font-medium">Current Cycle Day</label>
            <Input type="number" min="1" max="40" value={cycleDay} onChange={(e) => setCycleDay(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Fertile Window</CardTitle>
          <CardDescription>Predicted fertile days based on your cycle.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {ovulationData ? (
            <>
              <div>Ovulation Day: <strong>{format(ovulationData.ovulation, 'MMMM dd, yyyy')}</strong></div>
              <div>Fertile Window: {format(ovulationData.fertileStart, 'MMM dd')} - {format(ovulationData.fertileEnd, 'MMM dd, yyyy')}</div>
            </>
          ) : (
            <div className="text-muted-foreground">Enter valid inputs to see results.</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Pregnancy Chance Meter
          </CardTitle>
          <CardDescription>Estimated chance based on your cycle day.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-sm text-muted-foreground">Chance: {chanceMeter.label}</div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div className="h-2 bg-primary" style={{ width: `${chanceMeter.value}%` }} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OvulationCalculator;
