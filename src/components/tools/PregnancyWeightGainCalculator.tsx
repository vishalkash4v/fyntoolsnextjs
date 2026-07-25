'use client';
import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Weight, Activity } from 'lucide-react';

const PregnancyWeightGainCalculator = () => {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');

  const results = useMemo(() => {
    const weightKg = Number(weight);
    const heightCm = Number(height);
    if (!weightKg || !heightCm) return null;
    const heightM = heightCm / 100;
    const bmi = weightKg / (heightM * heightM);

    let range = { min: 0, max: 0, label: 'Unknown' };
    if (bmi < 18.5) range = { min: 12.5, max: 18, label: 'Underweight' };
    else if (bmi < 25) range = { min: 11.5, max: 16, label: 'Normal' };
    else if (bmi < 30) range = { min: 7, max: 11.5, label: 'Overweight' };
    else range = { min: 5, max: 9, label: 'Obese' };

    const weeklyMin = range.min / 40;
    const weeklyMax = range.max / 40;
    return { bmi: bmi.toFixed(1), range, weeklyMin, weeklyMax };
  }, [weight, height]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Weight className="h-5 w-5" />
            Pregnancy Weight Gain Calculator
          </CardTitle>
          <CardDescription>Get healthy weight gain recommendations based on BMI.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Pre-pregnancy Weight (kg)</label>
            <Input type="number" min="30" max="200" value={weight} onChange={(e) => setWeight(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Height (cm)</label>
            <Input type="number" min="120" max="220" value={height} onChange={(e) => setHeight(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Your Recommendations
          </CardTitle>
          <CardDescription>Personalized weight gain range and weekly target.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {results ? (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">BMI: {results.bmi}</Badge>
                <Badge variant="secondary">Category: {results.range.label}</Badge>
              </div>
              <div className="text-lg font-semibold">
                Recommended total gain: {results.range.min} – {results.range.max} kg
              </div>
              <div className="text-sm text-muted-foreground">
                Weekly target: {results.weeklyMin.toFixed(2)} – {results.weeklyMax.toFixed(2)} kg/week
              </div>
            </>
          ) : (
            <div className="text-muted-foreground">Enter your height and weight to see results.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PregnancyWeightGainCalculator;
