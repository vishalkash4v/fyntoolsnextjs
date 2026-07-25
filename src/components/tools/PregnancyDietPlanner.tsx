'use client';
import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Apple, FileText } from 'lucide-react';
import jsPDF from 'jspdf';

const trimesterTips = {
  first: ['Folate-rich foods', 'Hydration focus', 'Small frequent meals'],
  second: ['Add protein snacks', 'Calcium and iron', 'More fruits and vegetables'],
  third: ['High-fiber foods', 'Healthy fats', 'Smaller meals more often']
};

const PregnancyDietPlanner = () => {
  const [trimester, setTrimester] = useState<'first' | 'second' | 'third'>('first');
  const [weight, setWeight] = useState('');
  const [activity, setActivity] = useState('moderate');

  const calories = useMemo(() => {
    const weightKg = Number(weight);
    if (!weightKg) return null;
    const base = weightKg * 30;
    const activityBonus = activity === 'low' ? -150 : activity === 'high' ? 150 : 0;
    const trimesterBonus = trimester === 'first' ? 0 : trimester === 'second' ? 340 : 450;
    return Math.round(base + activityBonus + trimesterBonus);
  }, [weight, trimester, activity]);

  const exportPdf = () => {
    const doc = new jsPDF();
    doc.text('Pregnancy Diet Planner', 12, 16);
    doc.text(`Trimester: ${trimester}`, 12, 26);
    doc.text(`Estimated daily calories: ${calories ?? '—'}`, 12, 36);
    doc.text('Tips:', 12, 46);
    trimesterTips[trimester].forEach((tip, index) => {
      doc.text(`- ${tip}`, 16, 56 + index * 8);
    });
    doc.save('pregnancy-diet-plan.pdf');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Apple className="h-5 w-5" />
            Pregnancy Diet Planner
          </CardTitle>
          <CardDescription>Get trimester-based diet suggestions and calorie goals.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <label className="text-sm font-medium">Trimester</label>
            <select
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={trimester}
              onChange={(event) => setTrimester(event.target.value as 'first' | 'second' | 'third')}
            >
              <option value="first">First Trimester</option>
              <option value="second">Second Trimester</option>
              <option value="third">Third Trimester</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Weight (kg)</label>
            <Input type="number" min="35" max="200" value={weight} onChange={(e) => setWeight(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Activity Level</label>
            <select
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={activity}
              onChange={(event) => setActivity(event.target.value)}
            >
              <option value="low">Low activity</option>
              <option value="moderate">Moderate activity</option>
              <option value="high">High activity</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Diet Plan Summary
          </CardTitle>
          <CardDescription>Personalized recommendations and food list.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-lg font-semibold">
            Estimated Daily Calories: {calories ?? 'Enter weight to calculate'}
          </div>
          <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
            {trimesterTips[trimester].map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
          <Button onClick={exportPdf} variant="outline">
            Export PDF
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PregnancyDietPlanner;
