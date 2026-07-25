'use client';
import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Baby, CalendarDays, Sparkles } from 'lucide-react';
import { differenceInDays } from 'date-fns';
import CommonDatePicker from '@/components/ui/CommonDatePicker';

const weekTips = [
  { range: [1, 4], tip: 'Early development begins. Focus on folic acid and hydration.' },
  { range: [5, 8], tip: 'Baby’s heart starts beating. Prioritize rest and light movement.' },
  { range: [9, 12], tip: 'Major organs are forming. Keep nutritious meals and prenatal vitamins.' },
  { range: [13, 16], tip: 'Energy improves. Gentle walks and balanced meals help.' },
  { range: [17, 20], tip: 'Baby movements may start. Stay hydrated and monitor comfort.' },
  { range: [21, 27], tip: 'Growth accelerates. Add protein and calcium-rich foods.' },
  { range: [28, 32], tip: 'Third trimester begins. Rest more and practice breathing.' },
  { range: [33, 40], tip: 'Final weeks. Prepare hospital bag and track movements.' }
];

const PregnancyWeekCalculator = () => {
  const [lmpDate, setLmpDate] = useState<Date | null>(null);

  const data = useMemo(() => {
    if (!lmpDate) return null;
    const days = Math.max(0, differenceInDays(new Date(), lmpDate));
    const week = Math.min(40, Math.floor(days / 7) + 1);
    const trimester = week <= 12 ? 'First' : week <= 27 ? 'Second' : 'Third';
    const tip = weekTips.find(item => week >= item.range[0] && week <= item.range[1])?.tip || 'Stay healthy and follow your provider’s guidance.';
    return { week, trimester, tip };
  }, [lmpDate]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Pregnancy Week Calculator
          </CardTitle>
          <CardDescription>Track your current pregnancy week and trimester.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <label className="text-sm font-medium">Last Menstrual Period (LMP)</label>
          <CommonDatePicker value={lmpDate} onChange={setLmpDate} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Baby className="h-5 w-5" />
            Pregnancy Progress
          </CardTitle>
          <CardDescription>Week, trimester, and baby growth insights.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {data ? (
            <>
              <div className="text-lg font-semibold">You are in week {data.week}</div>
              <div className="text-sm text-muted-foreground">Trimester: {data.trimester}</div>
              <div className="rounded-lg border p-3 flex items-start gap-3">
                <Sparkles className="h-4 w-4 text-primary mt-1" />
                <div className="text-sm">{data.tip}</div>
              </div>
            </>
          ) : (
            <div className="text-muted-foreground">Select your LMP date to calculate your week.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PregnancyWeekCalculator;
