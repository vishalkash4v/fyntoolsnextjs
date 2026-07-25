'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, RotateCcw, Save, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const STORAGE_KEY = 'timetableMakerData';

interface TimeSlot {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  activity: string;
  category: 'work' | 'hobby' | 'goal' | 'rest' | 'other';
}

interface UserProfile {
  userType: 'student' | 'adult';
  hobbies: string;
  goals: string;
  jobCareer: string;
  other: string;
  wakeTime: string;
  sleepTime: string;
  workHoursPerDay: string;
  workDays: string;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const defaultProfile: UserProfile = {
  userType: 'student',
  hobbies: '',
  goals: '',
  jobCareer: '',
  other: '',
  wakeTime: '06:00',
  sleepTime: '23:00',
  workHoursPerDay: '8',
  workDays: '5', // weekdays
};

const generateTimeSlots = (profile: UserProfile): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  let id = 0;
  const hobbies = profile.hobbies.split(',').map((s) => s.trim()).filter(Boolean);
  const goals = profile.goals.split(',').map((s) => s.trim()).filter(Boolean);
  const workHrs = parseInt(profile.workHoursPerDay, 10) || 8;
  const workDaysCount = parseInt(profile.workDays, 10) || 5;
  const workDays = DAYS.slice(0, workDaysCount);

  const createSlot = (day: string, start: number, end: number, activity: string, category: TimeSlot['category']) => {
    slots.push({
      id: `slot-${id++}`,
      day,
      startTime: `${String(start).padStart(2, '0')}:00`,
      endTime: `${String(end).padStart(2, '0')}:00`,
      activity,
      category,
    });
  };

  // Work blocks on work days
  workDays.forEach((day) => {
    createSlot(day, 9, 9 + workHrs, profile.jobCareer || 'Work / Study', 'work');
  });

  // Hobby slots (evenings on work days, more on weekends)
  const hobby1 = hobbies[0] || 'Hobby / Free time';
  const hobby2 = hobbies[1] || hobbies[0] || 'Personal time';
  workDays.forEach((day) => createSlot(day, 18, 20, hobby1, 'hobby'));
  DAYS.filter((d) => !workDays.includes(d)).forEach((day) => {
    createSlot(day, 9, 12, hobby1, 'hobby');
    if (hobby2) createSlot(day, 14, 16, hobby2, 'hobby');
  });

  // Goal-focused time (early morning or evening)
  const goal1 = goals[0] || 'Goal / Skill development';
  workDays.forEach((day) => createSlot(day, 6, 7, goal1, 'goal'));
  DAYS.filter((d) => !workDays.includes(d)).forEach((day) => createSlot(day, 16, 18, goal1, 'goal'));

  return slots.sort((a, b) => {
    const dayOrder = DAYS.indexOf(a.day) - DAYS.indexOf(b.day);
    if (dayOrder !== 0) return dayOrder;
    return parseInt(a.startTime, 10) - parseInt(b.startTime, 10);
  });
};

const TimetableMaker = () => {
  const [step, setStep] = useState<'profile' | 'timetable'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? 'timetable' : 'profile';
    }
    return 'profile';
  });
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.profile) setProfile(data.profile);
        if (data.slots && Array.isArray(data.slots) && data.slots.length > 0) {
          setSlots(data.slots);
        }
      } catch {
        // ignore
      }
    }
  }, []);

  const saveToStorage = (p: UserProfile, s: TimeSlot[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ profile: p, slots: s }));
  };

  const handleGenerate = () => {
    const newSlots = generateTimeSlots(profile);
    setSlots(newSlots);
    saveToStorage(profile, newSlots);
    setStep('timetable');
    toast({
      title: 'Timetable generated!',
      description: 'You can edit any slot or regenerate with different preferences.',
    });
  };

  const handleRegenerate = () => {
    const newSlots = generateTimeSlots(profile);
    setSlots(newSlots);
    saveToStorage(profile, newSlots);
    setEditingSlotId(null);
    toast({
      title: 'Timetable regenerated!',
      description: 'Based on your current profile.',
    });
  };

  const handleEditSlot = (id: string, field: 'activity' | 'startTime' | 'endTime', value: string) => {
    setSlots((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const saveTimetable = () => {
    saveToStorage(profile, slots);
    setEditingSlotId(null);
    toast({
      title: 'Saved!',
      description: 'Your timetable has been saved locally.',
    });
  };

  const slotsByDay = DAYS.map((day) => ({
    day,
    items: slots.filter((s) => s.day === day),
  }));

  const categoryColor: Record<string, string> = {
    work: 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700',
    hobby: 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700',
    goal: 'bg-amber-100 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700',
    rest: 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600',
    other: 'bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700',
  };

  return (
    <div className="space-y-6">
      {step === 'profile' ? (
        <Card>
          <CardHeader>
            <CardTitle>Your Profile</CardTitle>
            <CardDescription>
              Tell us about your hobbies, goals, job/career, and preferences. We'll generate a personalized timetable.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label>I am a</Label>
              <Select value={profile.userType} onValueChange={(v) => setProfile((p) => ({ ...p, userType: v as 'student' | 'adult' }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="adult">Adult / Professional</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Hobbies (comma separated)</Label>
              <Input
                placeholder="e.g. Reading, Gym, Music, Cooking"
                value={profile.hobbies}
                onChange={(e) => setProfile((p) => ({ ...p, hobbies: e.target.value }))}
              />
            </div>
            <div>
              <Label>Goals (comma separated)</Label>
              <Input
                placeholder="e.g. Learn coding, Fitness, Side project"
                value={profile.goals}
                onChange={(e) => setProfile((p) => ({ ...p, goals: e.target.value }))}
              />
            </div>
            <div>
              <Label>Job / Career / Study</Label>
              <Input
                placeholder="e.g. Software Engineer, Student - Engineering, Freelancer"
                value={profile.jobCareer}
                onChange={(e) => setProfile((p) => ({ ...p, jobCareer: e.target.value }))}
              />
            </div>
            <div>
              <Label>Other important things</Label>
              <Textarea
                placeholder="Family time, commute, classes, etc."
                value={profile.other}
                onChange={(e) => setProfile((p) => ({ ...p, other: e.target.value }))}
                rows={2}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label>Wake time</Label>
                <Input type="time" value={profile.wakeTime} onChange={(e) => setProfile((p) => ({ ...p, wakeTime: e.target.value }))} />
              </div>
              <div>
                <Label>Sleep time</Label>
                <Input type="time" value={profile.sleepTime} onChange={(e) => setProfile((p) => ({ ...p, sleepTime: e.target.value }))} />
              </div>
              <div>
                <Label>Work/Study hours per day</Label>
                <Select value={profile.workHoursPerDay} onValueChange={(v) => setProfile((p) => ({ ...p, workHoursPerDay: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[4, 5, 6, 7, 8, 9, 10].map((h) => (
                      <SelectItem key={h} value={String(h)}>
                        {h} hours
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Work/Study days per week</Label>
              <Select value={profile.workDays} onValueChange={(v) => setProfile((p) => ({ ...p, workDays: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[5, 6, 7].map((d) => (
                    <SelectItem key={d} value={String(d)}>
                      {d} days (Mon-{DAYS[d - 1].slice(0, 2)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleGenerate} className="w-full gap-2" size="lg">
              <Sparkles className="h-4 w-4" />
              Generate Timetable
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <div className="flex flex-wrap gap-4 justify-between items-start">
                <div>
                  <CardTitle>Your Timetable</CardTitle>
                  <CardDescription>Edit any slot, then save. Or regenerate with new profile.</CardDescription>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button variant="outline" size="sm" onClick={() => setStep('profile')} className="gap-2">
                    <Edit className="h-4 w-4" />
                    Edit Profile
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleRegenerate} className="gap-2">
                    <RotateCcw className="h-4 w-4" />
                    Regenerate
                  </Button>
                  <Button size="sm" onClick={saveTimetable} className="gap-2">
                    <Save className="h-4 w-4" />
                    Save
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {slots.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No timetable yet. Fill your profile and click Generate.
                </p>
              ) : (
                <div className="space-y-6">
                  {slotsByDay.map(({ day, items }) => (
                    <div key={day}>
                      <h3 className="font-semibold mb-2">{day}</h3>
                      <div className="space-y-2">
                        {items.length === 0 ? (
                          <p className="text-sm text-muted-foreground italic">No activities</p>
                        ) : (
                          items.map((slot) => (
                            <div
                              key={slot.id}
                              className={`flex flex-wrap items-center gap-2 p-3 rounded-lg border ${categoryColor[slot.category] || categoryColor.other}`}
                            >
                              <span className="font-mono text-sm whitespace-nowrap">
                                {slot.startTime} - {slot.endTime}
                              </span>
                              {editingSlotId === slot.id ? (
                                <>
                                  <Input
                                    value={slot.activity}
                                    onChange={(e) => handleEditSlot(slot.id, 'activity', e.target.value)}
                                    className="flex-1 min-w-[150px]"
                                  />
                                  <Button size="sm" variant="ghost" onClick={() => setEditingSlotId(null)}>
                                    Done
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <span className="flex-1">{slot.activity}</span>
                                  <Button size="sm" variant="ghost" onClick={() => setEditingSlotId(slot.id)}>
                                    Edit
                                  </Button>
                                </>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default TimetableMaker;
