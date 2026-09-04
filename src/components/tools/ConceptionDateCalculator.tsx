'use client';
import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays, Activity } from 'lucide-react';
import { addDays, format } from 'date-fns';
import CommonDatePicker from '@/components/ui/CommonDatePicker';

const ConceptionDateCalculator = () => {
  const [dueDate, setDueDate] = useState<Date | null>(null);

  const data = useMemo(() => {
    if (!dueDate) return null;
    const conceptionDate = addDays(dueDate, -266);
    const fertileStart = addDays(conceptionDate, -5);
    const fertileEnd = addDays(conceptionDate, 1);
    return { conceptionDate, fertileStart, fertileEnd };
  }, [dueDate]);

  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Conception Date Calculator
          </CardTitle>
          <CardDescription>Estimate when you conceived using your due date.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <label className="text-sm font-medium">Expected Due Date</label>
          <CommonDatePicker value={dueDate} onChange={setDueDate} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Estimated Results
          </CardTitle>
          <CardDescription>Conception date and fertility window.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {data ? (
            <>
              <div className="text-lg font-semibold">Estimated Conception Date: {format(data.conceptionDate, 'MMMM dd, yyyy')}</div>
              <div className="text-sm text-muted-foreground">
                Fertile Window: {format(data.fertileStart, 'MMM dd')} - {format(data.fertileEnd, 'MMM dd, yyyy')}
              </div>
            </>
          ) : (
            <div className="text-muted-foreground">Select a due date to estimate conception.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ConceptionDateCalculator;
