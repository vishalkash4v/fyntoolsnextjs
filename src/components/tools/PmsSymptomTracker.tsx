'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { HeartPulse, ClipboardList } from 'lucide-react';
import CommonDatePicker from '@/components/ui/CommonDatePicker';

type PmsEntry = {
  id: string;
  date: string;
  symptoms: string[];
  pain: number;
  energy: string;
  sleep: string;
  notes: string;
};

const symptomOptions = [
  'Cramps',
  'Back Pain',
  'Headache',
  'Bloating',
  'Breast Tenderness',
  'Fatigue',
  'Mood Swings',
  'Acne'
];

const energyOptions = ['Low', 'Medium', 'High'];
const sleepOptions = ['Poor', 'Okay', 'Good'];

const PmsSymptomTracker = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [pain, setPain] = useState(3);
  const [energy, setEnergy] = useState('Medium');
  const [sleep, setSleep] = useState('Okay');
  const [notes, setNotes] = useState('');
  const [entries, setEntries] = useState<PmsEntry[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem('pms-tracker-entries');
    if (stored) {
      setEntries(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('pms-tracker-entries', JSON.stringify(entries));
  }, [entries]);

  const toggleSymptom = (symptom: string) => {
    setSymptoms((prev) =>
      prev.includes(symptom) ? prev.filter((item) => item !== symptom) : [...prev, symptom]
    );
  };

  const saveEntry = () => {
    if (!selectedDate) return;
    const newEntry: PmsEntry = {
      id: `${selectedDate.toISOString()}-${Date.now()}`,
      date: selectedDate.toISOString(),
      symptoms,
      pain,
      energy,
      sleep,
      notes
    };
    setEntries((prev) => [newEntry, ...prev].slice(0, 20));
    setNotes('');
    setSymptoms([]);
  };

  const summary = useMemo(() => {
    if (entries.length === 0) {
      return { averagePain: 0, topSymptoms: [] as string[] };
    }
    const totalPain = entries.reduce((sum, entry) => sum + entry.pain, 0);
    const symptomCounts: Record<string, number> = {};
    entries.forEach((entry) => {
      entry.symptoms.forEach((symptom) => {
        symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
      });
    });
    const topSymptoms = Object.entries(symptomCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([symptom]) => symptom);
    return { averagePain: Math.round((totalPain / entries.length) * 10) / 10, topSymptoms };
  }, [entries]);

  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HeartPulse className="h-5 w-5" />
            PMS Symptom Tracker
          </CardTitle>
          <CardDescription>Log daily PMS symptoms and track patterns over time.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Log Date</label>
            <CommonDatePicker value={selectedDate} onChange={setSelectedDate} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Pain Scale: {pain}/10</label>
            <input
              type="range"
              min="0"
              max="10"
              value={pain}
              onChange={(event) => setPain(Number(event.target.value))}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Energy Level</label>
            <select
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={energy}
              onChange={(event) => setEnergy(event.target.value)}
            >
              {energyOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Sleep Quality</label>
            <select
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={sleep}
              onChange={(event) => setSleep(event.target.value)}
            >
              {sleepOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        </CardContent>
        <CardContent className="space-y-4">
          <div>
            <div className="text-sm font-medium mb-2">Daily Symptoms</div>
            <div className="flex flex-wrap gap-3">
              {symptomOptions.map((symptom) => (
                <label key={symptom} className="flex items-center gap-2 text-sm">
                  <Checkbox checked={symptoms.includes(symptom)} onCheckedChange={() => toggleSymptom(symptom)} />
                  {symptom}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Notes</label>
            <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Add any notes..." />
          </div>
          <Button onClick={saveEntry} disabled={!selectedDate}>
            Save Entry
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Reports & Charts
          </CardTitle>
          <CardDescription>Summary insights from your saved entries.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Badge variant="secondary">Average Pain: {summary.averagePain}</Badge>
            <Badge variant="secondary">
              Top Symptoms: {summary.topSymptoms.length ? summary.topSymptoms.join(', ') : 'N/A'}
            </Badge>
          </div>
          {entries.length === 0 ? (
            <div className="text-muted-foreground">No entries yet. Save your first log above.</div>
          ) : (
            entries.slice(0, 6).map((entry) => (
              <div key={entry.id} className="rounded-lg border p-3 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{new Date(entry.date).toDateString()}</Badge>
                  <Badge variant="outline">Pain: {entry.pain}/10</Badge>
                  <Badge variant="outline">Energy: {entry.energy}</Badge>
                  <Badge variant="outline">Sleep: {entry.sleep}</Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  Symptoms: {entry.symptoms.length ? entry.symptoms.join(', ') : 'None'}
                </div>
                {entry.notes && <div className="text-sm">{entry.notes}</div>}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PmsSymptomTracker;
