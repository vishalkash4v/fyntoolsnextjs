'use client';

import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Scale as BmiIcon, Baby, User, Users } from 'lucide-react';
import {
  type BmiProfile,
  type BmiSex,
  type BmiUnit,
  computeBmi,
  evaluateBmi,
  toMetricHeight,
  toMetricWeight,
} from '@/lib/health/bmi';

const BmiCalculator = () => {
  const [unit, setUnit] = useState<BmiUnit>('metric');
  const [profile, setProfile] = useState<BmiProfile>('adult');
  const [sex, setSex] = useState<BmiSex>('male');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [ageYears, setAgeYears] = useState('');

  const result = useMemo(() => {
    const h = parseFloat(height);
    const w = parseFloat(weight);
    if (!h || !w || h <= 0 || w <= 0) return null;

    const heightM = toMetricHeight(h, unit);
    const weightKg = toMetricWeight(w, unit);
    const bmiValue = computeBmi(weightKg, heightM);
    if (bmiValue == null) return null;

    const rounded = Math.round(bmiValue * 10) / 10;
    return evaluateBmi({
      bmi: rounded,
      profile,
      sex,
      ageYears: ageYears ? parseFloat(ageYears) : undefined,
      heightM,
    });
  }, [height, weight, unit, profile, sex, ageYears]);

  const heightLabel = unit === 'metric' ? 'Height (cm)' : 'Height (inches)';
  const weightLabel = unit === 'metric' ? 'Weight (kg)' : 'Weight (lbs)';

  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BmiIcon className="h-5 w-5" />
            BMI Calculator
          </CardTitle>
          <CardDescription>
            Adult, child/teen, and infant modes with sex-specific guidance and healthy weight range.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs value={profile} onValueChange={(v) => setProfile(v as BmiProfile)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="adult" className="gap-1">
                <User className="h-3.5 w-3.5" /> Adult
              </TabsTrigger>
              <TabsTrigger value="child" className="gap-1">
                <Users className="h-3.5 w-3.5" /> Child
              </TabsTrigger>
              <TabsTrigger value="infant" className="gap-1">
                <Baby className="h-3.5 w-3.5" /> Infant
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex flex-wrap gap-3">
            <Tabs value={unit} onValueChange={(v) => setUnit(v as BmiUnit)}>
              <TabsList>
                <TabsTrigger value="metric">Metric</TabsTrigger>
                <TabsTrigger value="imperial">Imperial</TabsTrigger>
              </TabsList>
            </Tabs>
            <Select value={sex} onValueChange={(v) => setSex(v as BmiSex)}>
              <SelectTrigger className="w-[130px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="height">{heightLabel}</Label>
              <Input
                id="height"
                type="number"
                min={0}
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder={unit === 'metric' ? '170' : '67'}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="weight">{weightLabel}</Label>
              <Input
                id="weight"
                type="number"
                min={0}
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder={unit === 'metric' ? '65' : '143'}
                className="mt-1"
              />
            </div>
            {profile === 'child' && (
              <div className="sm:col-span-2">
                <Label htmlFor="age">Age (years)</Label>
                <Input
                  id="age"
                  type="number"
                  min={2}
                  max={19}
                  value={ageYears}
                  onChange={(e) => setAgeYears(e.target.value)}
                  placeholder="e.g. 12"
                  className="mt-1"
                />
              </div>
            )}
          </div>

          {result && (
            <Alert
              variant={
                result.categoryColor === 'destructive'
                  ? 'destructive'
                  : result.categoryColor === 'warning'
                    ? 'default'
                    : 'default'
              }
            >
              <BmiIcon className="h-4 w-4" />
              <AlertTitle className="flex flex-wrap items-center gap-2">
                BMI: {result.bmi}
                <Badge variant="outline">{result.category}</Badge>
              </AlertTitle>
              <AlertDescription className="space-y-2 mt-2">
                {result.healthyWeightMin != null && result.healthyWeightMax != null && profile === 'adult' && (
                  <p>
                    Healthy weight band for this height:{' '}
                    <strong>
                      {result.healthyWeightMin}–{result.healthyWeightMax} kg
                    </strong>{' '}
                    (BMI 18.5–24.9)
                  </p>
                )}
                <p>{result.note}</p>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BmiCalculator;
