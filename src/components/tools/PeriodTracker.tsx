'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { CalendarCheck, LineChart } from 'lucide-react';
import CommonDatePicker from '@/components/ui/CommonDatePicker';

type PeriodEntry = {
  id: string;
  date: string;
  mood: string;
  flow: string;
  symptoms: string[];
  notes: string;
  reminder: boolean;
};

const symptomsList = ['Cramps', 'Headache', 'Bloating', 'Fatigue', 'Acne', 'Mood Swings'];
const moodOptions = ['Great', 'Good', 'Okay', 'Low', 'Irritable'];
const flowOptions = ['Light', 'Medium', 'Heavy'];

const PeriodTracker = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [mood, setMood] = useState('Okay');
  const [flow, setFlow] = useState('Medium');
  const [notes, setNotes] = useState('');
  const [reminder, setReminder] = useState(false);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [entries, setEntries] = useState<PeriodEntry[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem('period-tracker-entries');
    if (stored) {
      setEntries(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('period-tracker-entries', JSON.stringify(entries));
  }, [entries]);

  const toggleSymptom = (symptom: string) => {
    setSymptoms((prev) =>
      prev.includes(symptom) ? prev.filter((item) => item !== symptom) : [...prev, symptom]
    );
  };

  const saveEntry = () => {
    if (!selectedDate) return;
    const newEntry: PeriodEntry = {
      id: `${selectedDate.toISOString()}-${Date.now()}`,
      date: selectedDate.toISOString(),
      mood,
      flow,
      symptoms,
      notes,
      reminder
    };
    setEntries((prev) => [newEntry, ...prev].slice(0, 20));
    setNotes('');
    setSymptoms([]);
  };

  const flowSummary = useMemo(() => {
    const counts = flowOptions.reduce((acc, option) => ({ ...acc, [option]: 0 }), {} as Record<string, number>);
    entries.forEach((entry) => {
      counts[entry.flow] = (counts[entry.flow] || 0) + 1;
    });
    const total = entries.length || 1;
    return flowOptions.map((option) => ({
      label: option,
      count: counts[option],
      percent: Math.round((counts[option] / total) * 100)
    }));
  }, [entries]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarCheck className="h-5 w-5" />
            Period Tracker
          </CardTitle>
          <CardDescription>Log your cycle, symptoms, mood, and flow in one place.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Log Date</label>
            <CommonDatePicker value={selectedDate} onChange={setSelectedDate} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Mood</label>
            <select
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={mood}
              onChange={(event) => setMood(event.target.value)}
            >
              {moodOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Flow</label>
            <select
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={flow}
              onChange={(event) => setFlow(event.target.value)}
            >
              {flowOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Notes</label>
            <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Add any notes..." />
          </div>
        </CardContent>
        <CardContent className="space-y-4">
          <div>
            <div className="text-sm font-medium mb-2">Symptoms</div>
            <div className="flex flex-wrap gap-3">
              {symptomsList.map((symptom) => (
                <label key={symptom} className="flex items-center gap-2 text-sm">
                  <Checkbox checked={symptoms.includes(symptom)} onCheckedChange={() => toggleSymptom(symptom)} />
                  {symptom}
                </label>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox checked={reminder} onCheckedChange={(value) => setReminder(Boolean(value))} />
            <span className="text-sm">Enable reminder for next cycle</span>
          </div>
          <Button onClick={saveEntry} disabled={!selectedDate}>
            Save Entry
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LineChart className="h-5 w-5" />
            History Charts
          </CardTitle>
          <CardDescription>Visual summary of your recent flow patterns.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {flowSummary.map((item) => (
            <div key={item.label} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>{item.label}</span>
                <span className="text-muted-foreground">{item.count} entries</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-2 bg-primary" style={{ width: `${item.percent}%` }} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Logs</CardTitle>
          <CardDescription>Your last few saved entries.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {entries.length === 0 ? (
            <div className="text-muted-foreground">No entries yet. Start tracking above.</div>
          ) : (
            entries.slice(0, 6).map((entry) => (
              <div key={entry.id} className="rounded-lg border p-3 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{new Date(entry.date).toDateString()}</Badge>
                  <Badge variant="outline">Mood: {entry.mood}</Badge>
                  <Badge variant="outline">Flow: {entry.flow}</Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  Symptoms: {entry.symptoms.length ? entry.symptoms.join(', ') : 'None'}
                </div>
                {entry.notes && (
                  <div className="text-sm">{entry.notes}</div>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PeriodTracker;
