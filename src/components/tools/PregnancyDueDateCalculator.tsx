'use client';
import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarDays, Baby } from 'lucide-react';
import { addDays, format, differenceInDays } from 'date-fns';
import CommonDatePicker from '@/components/ui/CommonDatePicker';

const PregnancyDueDateCalculator = () => {
  const [mode, setMode] = useState<'lmp' | 'conception'>('lmp');
  const [lmpDate, setLmpDate] = useState<Date | null>(null);
  const [conceptionDate, setConceptionDate] = useState<Date | null>(null);

  const result = useMemo(() => {
    const baseDate = mode === 'lmp' ? lmpDate : conceptionDate;
    if (!baseDate) return null;
    const dueDate = mode === 'lmp' ? addDays(baseDate, 280) : addDays(baseDate, 266);
    const trimester1End = addDays(baseDate, 12 * 7);
    const trimester2End = addDays(baseDate, 26 * 7);
    const today = new Date();
    const daysPregnant = Math.max(0, differenceInDays(today, baseDate));
    const week = Math.min(40, Math.floor(daysPregnant / 7) + 1);
    return { dueDate, trimester1End, trimester2End, week };
  }, [mode, lmpDate, conceptionDate]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Baby className="h-5 w-5" />
            Pregnancy Due Date Calculator
          </CardTitle>
          <CardDescription>Calculate your baby’s expected arrival date.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">Select input type</span>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button variant={mode === 'lmp' ? 'default' : 'outline'} onClick={() => setMode('lmp')}>
                Use Last Period (LMP)
              </Button>
              <Button variant={mode === 'conception' ? 'default' : 'outline'} onClick={() => setMode('conception')}>
                Use Conception Date
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {mode === 'lmp' ? 'Last Menstrual Period (LMP)' : 'Conception Date'}
            </label>
            <CommonDatePicker value={mode === 'lmp' ? lmpDate : conceptionDate} onChange={mode === 'lmp' ? setLmpDate : setConceptionDate} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Due Date Result
          </CardTitle>
          <CardDescription>Estimated dates based on your input.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {result ? (
            <>
              <div className="text-lg font-semibold">Estimated Due Date: {format(result.dueDate, 'MMMM dd, yyyy')}</div>
              <div className="text-sm text-muted-foreground">Current Pregnancy Week: {result.week} of 40</div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border p-3">
                  <div className="text-sm text-muted-foreground">Trimester 1 ends</div>
                  <div className="font-semibold">{format(result.trimester1End, 'MMM dd, yyyy')}</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-sm text-muted-foreground">Trimester 2 ends</div>
                  <div className="font-semibold">{format(result.trimester2End, 'MMM dd, yyyy')}</div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-muted-foreground">Select a date to calculate your due date.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PregnancyDueDateCalculator;
