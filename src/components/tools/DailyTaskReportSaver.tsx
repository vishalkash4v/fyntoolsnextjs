'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Save, Download, FileText, ListTodo, Briefcase, StickyNote } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { saveAs } from 'file-saver';

const STORAGE_KEY = 'dailyTaskReports';

interface DailyReport {
  date: string;
  timetable: string;
  routine: string;
  workReport: string;
  other: string;
  updatedAt: string;
}

const DailyTaskReportSaver = () => {
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [timetable, setTimetable] = useState('');
  const [routine, setRoutine] = useState('');
  const [workReport, setWorkReport] = useState('');
  const [other, setOther] = useState('');
  const { toast } = useToast();

  const loadReport = (date: string) => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const reports: Record<string, DailyReport> = JSON.parse(stored);
        const report = reports[date];
        if (report) {
          setTimetable(report.timetable || '');
          setRoutine(report.routine || '');
          setWorkReport(report.workReport || '');
          setOther(report.other || '');
          return;
        }
      } catch {
        // ignore
      }
    }
    setTimetable('');
    setRoutine('');
    setWorkReport('');
    setOther('');
  };

  useEffect(() => {
    loadReport(selectedDate);
  }, [selectedDate]);

  const saveReport = () => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem(STORAGE_KEY);
    const reports: Record<string, DailyReport> = stored ? JSON.parse(stored) : {};
    reports[selectedDate] = {
      date: selectedDate,
      timetable,
      routine,
      workReport,
      other,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
    toast({
      title: 'Saved!',
      description: `Report for ${selectedDate} saved successfully.`,
    });
  };

  const exportReport = () => {
    const content = `Daily Task Report - ${selectedDate}
================================

DAILY TIMETABLE:
${timetable || '(empty)'}

DAILY ROUTINE:
${routine || '(empty)'}

DAILY WORK REPORT:
${workReport || '(empty)'}

OTHER NOTES:
${other || '(empty)'}

---
Saved from FYN Tools - ${new Date().toISOString()}
`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, `daily-report-${selectedDate}.txt`);
    toast({
      title: 'Exported!',
      description: 'Report downloaded as .txt file.',
    });
  };

  const getSavedDates = (): string[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    try {
      const reports: Record<string, DailyReport> = JSON.parse(stored);
      return Object.keys(reports).sort().reverse();
    } catch {
      return [];
    }
  };

  const savedDates = getSavedDates();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Select Date
          </CardTitle>
          <CardDescription>Choose the date for your daily report</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div>
              <Label htmlFor="report-date">Date</Label>
              <input
                id="report-date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
              />
            </div>
            {savedDates.length > 0 && (
              <div>
                <Label>Quick jump to saved</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {savedDates.slice(0, 7).map((d) => (
                    <Button
                      key={d}
                      variant={selectedDate === d ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedDate(d)}
                    >
                      {d}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <Tabs defaultValue="timetable">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start flex-wrap gap-4">
              <div>
                <CardTitle>Daily Report Sections</CardTitle>
                <CardDescription>Fill in each section and save. Data is stored locally in your browser.</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button onClick={saveReport} className="gap-2">
                  <Save className="h-4 w-4" />
                  Save
                </Button>
                <Button variant="outline" onClick={exportReport} className="gap-2">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-4">
              <TabsTrigger value="timetable" className="gap-2">
                <FileText className="h-4 w-4" />
                Timetable
              </TabsTrigger>
              <TabsTrigger value="routine" className="gap-2">
                <ListTodo className="h-4 w-4" />
                Routine
              </TabsTrigger>
              <TabsTrigger value="workReport" className="gap-2">
                <Briefcase className="h-4 w-4" />
                Work Report
              </TabsTrigger>
              <TabsTrigger value="other" className="gap-2">
                <StickyNote className="h-4 w-4" />
                Other
              </TabsTrigger>
            </TabsList>
            <TabsContent value="timetable">
              <Label>Daily Timetable</Label>
              <Textarea
                placeholder="e.g.&#10;9:00 - Team standup&#10;10:00 - Project work&#10;12:00 - Lunch&#10;14:00 - Meetings..."
                value={timetable}
                onChange={(e) => setTimetable(e.target.value)}
                className="min-h-[200px] mt-2"
              />
            </TabsContent>
            <TabsContent value="routine">
              <Label>Daily Routine</Label>
              <Textarea
                placeholder="e.g.&#10;Morning: Wake 6am, Exercise, Breakfast&#10;Evening: Dinner, Family time, Read..."
                value={routine}
                onChange={(e) => setRoutine(e.target.value)}
                className="min-h-[200px] mt-2"
              />
            </TabsContent>
            <TabsContent value="workReport">
              <Label>Daily Work Report</Label>
              <Textarea
                placeholder="e.g.&#10;Completed: Task A, Task B&#10;In Progress: Task C&#10;Blockers: None&#10;Tomorrow: Task D..."
                value={workReport}
                onChange={(e) => setWorkReport(e.target.value)}
                className="min-h-[200px] mt-2"
              />
            </TabsContent>
            <TabsContent value="other">
              <Label>Other Notes</Label>
              <Textarea
                placeholder="Any other notes, ideas, or reminders for this day..."
                value={other}
                onChange={(e) => setOther(e.target.value)}
                className="min-h-[200px] mt-2"
              />
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default DailyTaskReportSaver;
