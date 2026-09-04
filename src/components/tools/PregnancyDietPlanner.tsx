'use client';

import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Apple, FileText, ShieldAlert, BookOpen, Ban, Scale } from 'lucide-react';
import PregnancyHealthDisclaimer from '@/components/tools/PregnancyHealthDisclaimer';
import {
  FOODS_TO_LIMIT_OR_AVOID,
  KEY_NUTRIENTS,
  PRECAUTIONS,
  TERMS_HEALTH_EDUCATION,
  TRIMESTER_PLANS,
  estimatePregnancyCalories,
  type TrimesterKey,
} from '@/data/pregnancy/pregnancyNutrition';

const PregnancyDietPlanner = () => {
  const [trimester, setTrimester] = useState<TrimesterKey>('first');
  const [weight, setWeight] = useState('');
  const [activity, setActivity] = useState<'low' | 'moderate' | 'high'>('moderate');

  const plan = TRIMESTER_PLANS[trimester];
  const weightKg = Number(weight);

  const calories = useMemo(
    () =>
      estimatePregnancyCalories({
        weightKg,
        activity,
        trimester,
      }),
    [weightKg, activity, trimester]
  );

  const exportPdf = async () => {
    const { default: jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    let y = 14;
    const line = (text: string, gap = 6) => {
      const lines = doc.splitTextToSize(text, 180);
      doc.text(lines, 12, y);
      y += lines.length * 5 + gap;
      if (y > 270) {
        doc.addPage();
        y = 14;
      }
    };

    doc.setFontSize(14);
    line('FYN Tools — Pregnancy Diet Planner (Educational)');
    doc.setFontSize(10);
    line('DISCLAIMER: Not medical advice. Confirm all diet and supplement decisions with your prenatal clinician.');
    line(`Trimester: ${plan.label} (${plan.weeks})`);
    line(`Estimated daily calories (rough): ${calories ?? '— enter weight'}`);
    line(`Extra kcal often cited for this trimester (singleton): ~${plan.extraKcal}`);
    line('Focus:');
    plan.focus.forEach((f) => line(`- ${f}`, 4));
    line('Sample meal ideas:');
    plan.mealsIdeas.forEach((m) => line(`- ${m}`, 4));
    line('Foods to limit/avoid (summary):');
    FOODS_TO_LIMIT_OR_AVOID.slice(0, 6).forEach((f) => line(`- ${f.title}: ${f.detail}`, 4));
    line('Sources theme: IOM/ACOG-cited calorie increments, CDC folic acid, DGA healthy pattern — educational only.');
    doc.save(`pregnancy-diet-${trimester}.pdf`);
  };

  return (
    <div className="w-full space-y-6 px-1">
      <PregnancyHealthDisclaimer toolName="Pregnancy Diet Planner" />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Apple className="h-5 w-5 text-primary" aria-hidden />
            Pregnancy Diet Planner
          </CardTitle>
          <CardDescription>
            Trimester-based educational meal ideas and nutrient targets commonly discussed in obstetric
            nutrition guidance. Calorie figures for singletons often cite about +0 / +340 / +452 kcal per day
            across trimesters — your clinician may adjust this.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="trimester">Trimester</Label>
            <Select value={trimester} onValueChange={(v) => setTrimester(v as TrimesterKey)}>
              <SelectTrigger id="trimester" aria-label="Select trimester">
                <SelectValue placeholder="Select trimester" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="first">First (weeks 1–12)</SelectItem>
                <SelectItem value="second">Second (weeks 13–26)</SelectItem>
                <SelectItem value="third">Third (weeks 27–40+)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="weight">Current weight (kg)</Label>
            <Input
              id="weight"
              type="number"
              min={35}
              max={200}
              inputMode="decimal"
              placeholder="e.g. 62"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              aria-describedby="weight-help"
            />
            <p id="weight-help" className="text-xs text-muted-foreground">
              Used only for a rough calorie estimate on your device.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="activity">Activity level</Label>
            <Select
              value={activity}
              onValueChange={(v) => setActivity(v as 'low' | 'moderate' | 'high')}
            >
              <SelectTrigger id="activity" aria-label="Select activity level">
                <SelectValue placeholder="Activity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low (mostly sedentary)</SelectItem>
                <SelectItem value="moderate">Moderate (daily walking)</SelectItem>
                <SelectItem value="high">Higher (active job / exercise as cleared)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Scale className="h-5 w-5" aria-hidden />
            {plan.label} overview
          </CardTitle>
          <CardDescription>
            {plan.weeks}. {plan.calorieNote}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">Extra kcal (typical singleton): ~{plan.extraKcal}/day</Badge>
            <Badge variant="outline">
              Estimated total: {calories != null ? `${calories} kcal/day` : 'Enter weight'}
            </Badge>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Priorities this trimester</h3>
            <ul className="list-disc pl-5 text-sm space-y-1 text-zinc-700 dark:text-zinc-300">
              {plan.focus.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Sample day (ideas — not a prescription)</h3>
            <ul className="list-disc pl-5 text-sm space-y-1 text-zinc-700 dark:text-zinc-300">
              {plan.mealsIdeas.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <Button type="button" onClick={exportPdf} variant="outline" className="gap-2">
            <FileText className="h-4 w-4" aria-hidden />
            Export educational PDF
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-1">
        {plan.foodGroups.map((group) => (
          <Card key={group.title}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{group.title}</CardTitle>
              <CardDescription>{group.why}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <li key={item}>
                    <Badge variant="secondary" className="font-normal">
                      {item}
                    </Badge>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BookOpen className="h-5 w-5" aria-hidden />
            Key nutrients clinicians often discuss
          </CardTitle>
          <CardDescription>
            Targets below reflect commonly published RDAs / practice summaries for many pregnancies. Your
            labs may change iron, vitamin D, or calcium plans.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {KEY_NUTRIENTS.map((n) => (
            <div key={n.name} className="rounded-lg border p-3 text-sm">
              <p className="font-semibold">{n.name}</p>
              <p className="text-muted-foreground">
                <span className="text-foreground font-medium">Typical target: </span>
                {n.target}
              </p>
              <p className="mt-1">{n.note}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Ban className="h-5 w-5" aria-hidden />
            Foods & habits to limit or avoid
          </CardTitle>
          <CardDescription>
            Food-safety guidance aims to reduce risks such as Listeria, Toxoplasma, and mercury exposure.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {FOODS_TO_LIMIT_OR_AVOID.map((f) => (
            <div key={f.title} className="text-sm border-b border-border/60 pb-3 last:border-0 last:pb-0">
              <p className="font-semibold">{f.title}</p>
              <p className="text-muted-foreground">{f.detail}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <ShieldAlert className="h-5 w-5" aria-hidden />
            Cautions & precautions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 text-sm space-y-2 text-zinc-700 dark:text-zinc-300">
            {PRECAUTIONS.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Terms — health education use</CardTitle>
          <CardDescription>Important conditions for using this pregnancy nutrition utility.</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal pl-5 text-sm space-y-2 text-zinc-700 dark:text-zinc-300">
            {TERMS_HEALTH_EDUCATION.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ol>
          <p className="mt-4 text-xs text-muted-foreground">
            Evidence themes referenced for education: Institute of Medicine energy increments often summarized
            in obstetric materials (~+340 / +452 kcal in 2nd / 3rd trimesters for many singletons), CDC folic
            acid recommendations, iron ~27 mg/day in pregnancy, calcium 1,000–1,300 mg/day, and Dietary
            Guidelines for Americans patterns for pregnant people (nutrient-dense foods; limit alcohol; cautious
            caffeine; seafood choices). Always defer to your prenatal clinician and local guidelines.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PregnancyDietPlanner;
