'use client';
import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Weight, Activity } from 'lucide-react';
import PregnancyHealthDisclaimer from '@/components/tools/PregnancyHealthDisclaimer';

/**
 * Total gestational weight-gain ranges commonly cited from IOM guidelines
 * for singleton pregnancy by pre-pregnancy BMI category.
 */
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
    if (bmi < 18.5) range = { min: 12.5, max: 18, label: 'Underweight (BMI < 18.5)' };
    else if (bmi < 25) range = { min: 11.5, max: 16, label: 'Normal weight (BMI 18.5–24.9)' };
    else if (bmi < 30) range = { min: 7, max: 11.5, label: 'Overweight (BMI 25–29.9)' };
    else range = { min: 5, max: 9, label: 'Obesity (BMI ≥ 30)' };

    const weeklyMin = range.min / 40;
    const weeklyMax = range.max / 40;
    return { bmi: bmi.toFixed(1), range, weeklyMin, weeklyMax };
  }, [weight, height]);

  return (
    <div className="w-full space-y-6">
      <PregnancyHealthDisclaimer toolName="Pregnancy Weight Gain Calculator" />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Weight className="h-5 w-5" aria-hidden />
            Pregnancy Weight Gain Calculator
          </CardTitle>
          <CardDescription>
            Educational total weight-gain ranges for many singleton pregnancies, based on Institute of Medicine
            (IOM) categories using pre-pregnancy BMI. Twins, adolescents, and high-risk pregnancies need
            personalized targets from your clinician.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="pre-weight">Pre-pregnancy weight (kg)</Label>
            <Input
              id="pre-weight"
              type="number"
              min={30}
              max={200}
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="height">Height (cm)</Label>
            <Input
              id="height"
              type="number"
              min={120}
              max={220}
              value={height}
              onChange={(e) => setHeight(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" aria-hidden />
            Your educational range
          </CardTitle>
          <CardDescription>
            IOM-style total range and approximate weekly average if spread over ~40 weeks.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {results ? (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">BMI: {results.bmi}</Badge>
                <Badge variant="secondary">{results.range.label}</Badge>
              </div>
              <div className="text-lg font-semibold">
                Recommended total gain: {results.range.min} – {results.range.max} kg
              </div>
              <div className="text-sm text-muted-foreground">
                Approximate average if spread evenly: {results.weeklyMin.toFixed(2)} –{' '}
                {results.weeklyMax.toFixed(2)} kg/week (real gain is often slower early, faster later — follow
                your clinician).
              </div>
              <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                <li>Do not try to “diet” for weight loss in pregnancy unless your clinician directs it.</li>
                <li>
                  Sudden swelling, headaches, or rapid weight jumps can be clinical issues — contact your care
                  team.
                </li>
              </ul>
            </>
          ) : (
            <div className="text-muted-foreground">Enter your height and pre-pregnancy weight to see results.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PregnancyWeightGainCalculator;
