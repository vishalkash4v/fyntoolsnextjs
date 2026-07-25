'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import CopyButton from '@/components/common/CopyButton';
import { Clock, Calendar, Globe } from 'lucide-react';

const TIMEZONES = [
  { label: 'UTC', value: 'UTC' },
  { label: 'GMT', value: 'Etc/GMT' },
  { label: 'IST (India)', value: 'Asia/Kolkata' },
  { label: 'PST (Los Angeles)', value: 'America/Los_Angeles' },
  { label: 'EST (New York)', value: 'America/New_York' },
  { label: 'CST (Chicago)', value: 'America/Chicago' },
  { label: 'MST (Denver)', value: 'America/Denver' },
  { label: 'BST (London)', value: 'Europe/London' },
  { label: 'CET (Paris)', value: 'Europe/Paris' },
  { label: 'EET (Helsinki)', value: 'Europe/Helsinki' },
  { label: 'JST (Tokyo)', value: 'Asia/Tokyo' },
  { label: 'SGT (Singapore)', value: 'Asia/Singapore' },
  { label: 'AEST (Sydney)', value: 'Australia/Sydney' },
];

const formatDate = (date: Date) => ({
  iso: date.toISOString(),
  gmt: date.toUTCString(),
  local: date.toLocaleString(),
});

const toTimestamp = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const numeric = Number(trimmed);
  if (Number.isNaN(numeric)) return null;
  const isMs = trimmed.length > 10;
  const ms = isMs ? numeric : numeric * 1000;
  const date = new Date(ms);
  if (Number.isNaN(date.getTime())) return null;
  return { date, ms, seconds: Math.floor(ms / 1000) };
};

const parseDateInput = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const date = new Date(trimmed);
  if (Number.isNaN(date.getTime())) return null;
  return date;
};

const getZonedTimestamp = (parts: { year: number; month: number; day: number; hour: number; minute: number }, timeZone: string) => {
  const utcMs = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, 0);
  const utcDate = new Date(utcMs);
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  const tzParts = dtf.formatToParts(utcDate);
  const map: Record<string, string> = {};
  tzParts.forEach(part => {
    map[part.type] = part.value;
  });
  const asUTC = Date.UTC(
    Number(map.year),
    Number(map.month) - 1,
    Number(map.day),
    Number(map.hour),
    Number(map.minute),
    Number(map.second)
  );
  const offset = asUTC - utcDate.getTime();
  return utcMs - offset;
};

const formatInTimeZone = (date: Date, timeZone: string) => {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  return fmt.format(date);
};

const TimestampConverter = () => {
  const [liveTimestamp, setLiveTimestamp] = useState(() => Math.floor(Date.now() / 1000));
  const [timestampInput, setTimestampInput] = useState('');
  const [dateInput, setDateInput] = useState('');
  const [tzInput, setTzInput] = useState('');
  const [sourceTz, setSourceTz] = useState('UTC');
  const [targetTz, setTargetTz] = useState('Asia/Kolkata');
  const [batchInput, setBatchInput] = useState('');
  const [outputFormat, setOutputFormat] = useState<'iso' | 'gmt' | 'local'>('iso');

  useEffect(() => {
    const timer = setInterval(() => {
      setLiveTimestamp(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const timestampResult = useMemo(() => {
    const parsed = toTimestamp(timestampInput);
    if (!parsed) return null;
    return formatDate(parsed.date);
  }, [timestampInput]);

  const dateToTimestamp = useMemo(() => {
    const parsed = parseDateInput(dateInput);
    if (!parsed) return null;
    return {
      seconds: Math.floor(parsed.getTime() / 1000),
      ms: parsed.getTime(),
      formatted: formatDate(parsed),
    };
  }, [dateInput]);

  const tzResult = useMemo(() => {
    if (!tzInput.trim()) return null;
    const [datePart, timePart = '00:00'] = tzInput.trim().split(' ');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hour, minute] = timePart.split(':').map(Number);
    if (!year || !month || !day || Number.isNaN(hour) || Number.isNaN(minute)) return null;
    const utcMs = getZonedTimestamp({ year, month, day, hour, minute }, sourceTz);
    const date = new Date(utcMs);
    return {
      source: `${formatInTimeZone(date, sourceTz)} (${sourceTz})`,
      target: `${formatInTimeZone(date, targetTz)} (${targetTz})`,
      iso: date.toISOString(),
    };
  }, [tzInput, sourceTz, targetTz]);

  const batchResult = useMemo(() => {
    const lines = batchInput.split('\n').map(line => line.trim()).filter(Boolean);
    if (lines.length === 0) return '';
    return lines.map(line => {
      const asTimestamp = toTimestamp(line);
      if (asTimestamp) {
        const formatted = formatDate(asTimestamp.date)[outputFormat];
        return `${line} -> ${formatted}`;
      }
      const asDate = parseDateInput(line);
      if (asDate) {
        const formatted = formatDate(asDate)[outputFormat];
        return `${line} -> ${formatted}`;
      }
      return `${line} -> Invalid input`;
    }).join('\n');
  }, [batchInput, outputFormat]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Live Unix Timestamp
          </CardTitle>
          <CardDescription>Updates every second (seconds since 01/01/1970 UTC)</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row sm:items-center gap-3">
          <Badge variant="secondary" className="text-lg px-4 py-2">{liveTimestamp}</Badge>
          <CopyButton textToCopy={String(liveTimestamp)} copyText="Copy" />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Timestamp → Date
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="Enter unix timestamp (seconds or ms)"
              value={timestampInput}
              onChange={(e) => setTimestampInput(e.target.value)}
            />
            {timestampResult ? (
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span>ISO:</span>
                  <CopyButton textToCopy={timestampResult.iso} copyText="Copy" />
                </div>
                <div className="text-muted-foreground break-words">{timestampResult.iso}</div>
                <div className="flex items-center justify-between gap-2">
                  <span>GMT:</span>
                  <CopyButton textToCopy={timestampResult.gmt} copyText="Copy" />
                </div>
                <div className="text-muted-foreground break-words">{timestampResult.gmt}</div>
                <div className="flex items-center justify-between gap-2">
                  <span>Local:</span>
                  <CopyButton textToCopy={timestampResult.local} copyText="Copy" />
                </div>
                <div className="text-muted-foreground break-words">{timestampResult.local}</div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">Enter a valid timestamp to see results.</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Date → Timestamp
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="Enter date (e.g., 2026-02-10 14:30)"
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value)}
            />
            {dateToTimestamp ? (
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span>Unix (seconds):</span>
                  <CopyButton textToCopy={String(dateToTimestamp.seconds)} copyText="Copy" />
                </div>
                <div className="text-muted-foreground">{dateToTimestamp.seconds}</div>
                <div className="flex items-center justify-between gap-2">
                  <span>Unix (ms):</span>
                  <CopyButton textToCopy={String(dateToTimestamp.ms)} copyText="Copy" />
                </div>
                <div className="text-muted-foreground">{dateToTimestamp.ms}</div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">Enter a valid date to see results.</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Timezone Converter
          </CardTitle>
          <CardDescription>Convert a date/time between timezones</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-[1fr_1fr_1fr]">
          <div className="space-y-2">
            <label className="text-sm font-medium">Input (YYYY-MM-DD HH:mm)</label>
            <Input
              placeholder="2026-02-10 14:30"
              value={tzInput}
              onChange={(e) => setTzInput(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">From</label>
            <Select value={sourceTz} onValueChange={setSourceTz}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONES.map(tz => (
                  <SelectItem key={tz.value} value={tz.value}>{tz.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">To</label>
            <Select value={targetTz} onValueChange={setTargetTz}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONES.map(tz => (
                  <SelectItem key={tz.value} value={tz.value}>{tz.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {tzResult ? (
            <div className="lg:col-span-3 grid gap-2 text-sm">
              <div className="flex items-center justify-between gap-2">
                <span>Source:</span>
                <CopyButton textToCopy={tzResult.source} copyText="Copy" />
              </div>
              <div className="text-muted-foreground">{tzResult.source}</div>
              <div className="flex items-center justify-between gap-2">
                <span>Target:</span>
                <CopyButton textToCopy={tzResult.target} copyText="Copy" />
              </div>
              <div className="text-muted-foreground">{tzResult.target}</div>
              <div className="flex items-center justify-between gap-2">
                <span>ISO:</span>
                <CopyButton textToCopy={tzResult.iso} copyText="Copy" />
              </div>
              <div className="text-muted-foreground">{tzResult.iso}</div>
            </div>
          ) : (
            <div className="lg:col-span-3 text-sm text-muted-foreground">
              Enter a valid date and time to see timezone conversion.
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Batch Conversion</CardTitle>
          <CardDescription>Enter one timestamp or date per line</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            placeholder={"1700000000\n1700000000000\n2026-02-10 14:30"}
            value={batchInput}
            onChange={(e) => setBatchInput(e.target.value)}
            className="min-h-[140px]"
          />
          <div className="flex flex-wrap items-center gap-3">
            <Select value={outputFormat} onValueChange={(v) => setOutputFormat(v as typeof outputFormat)}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="iso">ISO</SelectItem>
                <SelectItem value="gmt">GMT</SelectItem>
                <SelectItem value="local">Local</SelectItem>
              </SelectContent>
            </Select>
            <CopyButton textToCopy={batchResult} copyText="Copy Results" />
          </div>
          <pre className="text-sm text-muted-foreground whitespace-pre-wrap bg-muted/40 rounded-lg p-3">
            {batchResult || 'Batch results will appear here.'}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
};

export default TimestampConverter;
