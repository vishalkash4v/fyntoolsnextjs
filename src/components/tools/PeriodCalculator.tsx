'use client';
import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, Bell } from 'lucide-react';
import { addDays, format, addMonths } from 'date-fns';
import CommonDatePicker from '@/components/ui/CommonDatePicker';

const PeriodCalculator = () => {
  const [lastPeriod, setLastPeriod] = useState<Date | null>(null);
  const [cycleLength, setCycleLength] = useState('28');
  const [periodLength, setPeriodLength] = useState('5');
  const [reminder, setReminder] = useState(false);

  const parsedDate = useMemo(() => lastPeriod, [lastPeriod]);

  const nextPeriodDate = useMemo(() => {
    if (!parsedDate) return null;
    const cycle = Number(cycleLength);
    if (!cycle || cycle < 15) return null;
    return addDays(parsedDate, cycle);
  }, [parsedDate, cycleLength]);

  const forecast = useMemo(() => {
    if (!parsedDate) return [];
    const cycle = Number(cycleLength);
    if (!cycle || cycle < 15) return [];
    return Array.from({ length: 6 }).map((_, index) => {
      const date = addDays(parsedDate, cycle * (index + 1));
      return {
        month: format(addMonths(parsedDate, index + 1), 'MMMM yyyy'),
        date
      };
    });
  }, [parsedDate, cycleLength]);

  const calendarDays = useMemo(() => {
    if (!nextPeriodDate) return [];
    const length = Math.max(1, Math.min(Number(periodLength) || 5, 10));
    return Array.from({ length: 28 }).map((_, index) => {
      const date = addDays(nextPeriodDate, index);
      return {
        date,
        isPeriod: index < length
      };
    });
  }, [nextPeriodDate, periodLength]);

  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Period Calculator
          </CardTitle>
          <CardDescription>Enter your details to predict your next period date.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <label className="text-sm font-medium">Last Period Start Date</label>
            <CommonDatePicker value={lastPeriod} onChange={setLastPeriod} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Cycle Length (days)</label>
            <Input type="number" min="15" max="45" value={cycleLength} onChange={(e) => setCycleLength(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Period Length (days)</label>
            <Input type="number" min="2" max="10" value={periodLength} onChange={(e) => setPeriodLength(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Next Period Prediction</CardTitle>
          <CardDescription>Based on your inputs above.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {nextPeriodDate ? (
            <>
              <div className="text-lg font-semibold">
                Expected Next Period: {format(nextPeriodDate, 'MMMM dd, yyyy')}
              </div>
              <div className="text-sm text-muted-foreground">
                Estimated period window: {format(nextPeriodDate, 'MMM dd')} - {format(addDays(nextPeriodDate, Math.max(1, Number(periodLength) || 5) - 1), 'MMM dd, yyyy')}
              </div>
            </>
          ) : (
            <div className="text-muted-foreground">Enter valid inputs to see prediction.</div>
          )}
          <div className="flex items-center gap-2">
            <Checkbox checked={reminder} onCheckedChange={(value) => setReminder(Boolean(value))} />
            <div className="flex items-center gap-2 text-sm">
              <Bell className="h-4 w-4" />
              Set a reminder for my next period
            </div>
          </div>
          {reminder && (
            <div className="text-xs text-muted-foreground">
              Reminder option saved in your browser for this session.
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Calendar View</CardTitle>
          <CardDescription>Upcoming cycle with predicted period days highlighted.</CardDescription>
        </CardHeader>
        <CardContent>
          {calendarDays.length > 0 ? (
            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((day) => (
                <div
                  key={day.date.toISOString()}
                  className={`rounded-md border px-2 py-2 text-center text-xs sm:text-sm ${day.isPeriod ? 'bg-red-500/10 border-red-500/40 text-red-600 dark:text-red-300' : 'bg-muted/40'}`}
                >
                  <div className="font-semibold">{format(day.date, 'd')}</div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground">{format(day.date, 'MMM')}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-muted-foreground">Calendar view will appear after entering your details.</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>6 Month Forecast</CardTitle>
          <CardDescription>Upcoming cycles and predicted start dates.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {forecast.length > 0 ? (
            forecast.map(item => (
              <div key={item.month} className="border rounded-lg p-3">
                <div className="text-sm text-muted-foreground">{item.month}</div>
                <div className="text-base font-semibold">{format(item.date, 'MMMM dd, yyyy')}</div>
              </div>
            ))
          ) : (
            <div className="text-muted-foreground">Forecast will appear once inputs are valid.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PeriodCalculator;
