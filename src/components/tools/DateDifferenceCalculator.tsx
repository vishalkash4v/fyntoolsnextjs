'use client';
import React, { useMemo, useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { format, differenceInDays, differenceInMonths, differenceInYears } from 'date-fns';
import { Calendar as CalendarIcon, ArrowRight, Download, Copy } from 'lucide-react';
import CommonDatePicker from '@/components/ui/CommonDatePicker';
import { toast } from 'sonner';
import SocialShareButtons from '@/components/tools/SocialShareButtons';

const DateDifferenceCalculator = () => {
  const [start, setStart] = useState<Date | null>(null);
  const [end, setEnd] = useState<Date | null>(null);
  const [isImageGenerating, setIsImageGenerating] = useState(false);
  const [imageProgress, setImageProgress] = useState(0);
  const resultRef = useRef<HTMLDivElement>(null);

  const difference = useMemo(() => {
    const startDate = start ?? undefined;
    const endDate = end ?? undefined;

    if (!startDate || !endDate) return null;
    if (startDate > endDate) return 'ERR_START_AFTER_END' as const;

    const years = differenceInYears(endDate, startDate);
    const monthsTotal = differenceInMonths(endDate, startDate);
    const months = monthsTotal % 12;

    const tempDate = new Date(startDate);
    tempDate.setFullYear(tempDate.getFullYear() + years);
    tempDate.setMonth(tempDate.getMonth() + months);

    const days = differenceInDays(endDate, tempDate);
    const totalDays = differenceInDays(endDate, startDate);

    return { years, months, days, totalDays };
  }, [start, end]);

  const handleReset = () => {
    setStart(null);
    setEnd(null);
  };

  const setToday = (which: 'start' | 'end') => {
    const today = new Date();
    if (which === 'start') setStart(today);
    else setEnd(today);
  };

  const swapDates = () => {
    setStart(end);
    setEnd(start);
  };

  const isError = difference === 'ERR_START_AFTER_END';

  const buildSummaryText = () => {
    if (!start || !end || !difference || isError) return '';
    const today = new Date();
    return [
      'Date Difference Result',
      `From: ${format(start, 'MMMM d, yyyy')}`,
      `To: ${format(end, 'MMMM d, yyyy')}`,
      `Total Days: ${difference.totalDays}`,
      `Duration: ${difference.years} years, ${difference.months} months, ${difference.days} days`,
      `Generated: ${format(today, 'PPpp')}`,
    ].join('\n');
  };

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = buildSummaryText() || 'Date Difference result';

  const copyResult = async () => {
    const text = buildSummaryText();
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Date difference copied');
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      toast.success('Date difference copied');
    }
  };

  const downloadResultImage = async () => {
    if (!resultRef.current) return;
    setIsImageGenerating(true);
    setImageProgress(10);
    let timer: number | undefined;
    try {
      document.documentElement.classList.add('export-mode');
      timer = window.setInterval(() => {
        setImageProgress((prev) => (prev < 90 ? prev + 5 : prev));
      }, 120);
      const bg = '#0b1220';
      const target = resultRef.current;
      const wrapper = document.createElement('div');
      wrapper.style.position = 'fixed';
      wrapper.style.left = '-10000px';
      wrapper.style.top = '0';
      wrapper.style.background = bg;
      wrapper.style.padding = '16px';
      const exportWidth = Math.min(720, target.offsetWidth || 720);
      wrapper.style.width = `${exportWidth}px`;

      const clone = target.cloneNode(true) as HTMLElement;
      clone.style.width = '100%';
      clone.style.maxWidth = '100%';
      wrapper.appendChild(clone);
      document.body.appendChild(wrapper);
      await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));

      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(wrapper, {
        scale: 2.5,
        backgroundColor: bg,
        useCORS: true,
        logging: false,
      });
      document.body.removeChild(wrapper);
      setImageProgress(100);
      const link = document.createElement('a');
      link.download = 'date-difference-result.png';
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
      toast.success('Result image downloaded');
    } finally {
      document.documentElement.classList.remove('export-mode');
      if (timer) window.clearInterval(timer);
      setTimeout(() => {
        setIsImageGenerating(false);
        setImageProgress(0);
      }, 400);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 mb-3">
          <CalendarIcon className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 dark:text-blue-400" />
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">Date Calculator</h1>
        <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto">
          Calculate the exact difference between two dates
        </p>
      </div>

      <Card className="border-0 shadow-xl bg-card">
        <CardContent className="p-4 sm:p-6 lg:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 items-end">
            {/* Start Date */}
            <div className="space-y-3">
              <Label className="text-sm sm:text-base font-semibold text-foreground">From Date</Label>
              <CommonDatePicker
                value={start}
                onChange={setStart}
                maxDate={end ?? undefined}
                format="MMM d, yyyy"
                placeholder="Pick a date"
              />
              <div className="flex gap-2">
                <Button variant="outline" className="h-9 px-3 rounded-lg text-xs sm:text-sm" onClick={() => setToday('start')}>
                  Today
                </Button>
                {start && (
                  <span className="text-xs sm:text-sm text-muted-foreground self-center">
                    Selected: {format(start, 'PPP')}
                  </span>
                )}
              </div>
            </div>

            {/* Arrow */}
            <div className="hidden lg:flex justify-center items-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-muted flex items-center justify-center">
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
              </div>
            </div>

            {/* End Date */}
            <div className="space-y-3">
              <Label className="text-sm sm:text-base font-semibold text-foreground">To Date</Label>
              <CommonDatePicker
                value={end}
                onChange={setEnd}
                minDate={start ?? undefined}
                format="MMM d, yyyy"
                placeholder="Pick a date"
              />
              <div className="flex gap-2">
                <Button variant="outline" className="h-9 px-3 rounded-lg text-xs sm:text-sm" onClick={() => setToday('end')}>
                  Today
                </Button>
                {end && (
                  <span className="text-xs sm:text-sm text-muted-foreground self-center">
                    Selected: {format(end, 'PPP')}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 sm:gap-4 justify-center mt-6">
            <Button
              onClick={swapDates}
              variant="outline"
              className="h-10 sm:h-12 px-4 sm:px-6 text-sm sm:text-lg border-2 rounded-xl"
              disabled={!start || !end}
            >
              Swap Dates
            </Button>
            <Button
              onClick={handleReset}
              variant="outline"
              className="h-10 sm:h-12 px-6 sm:px-8 text-sm sm:text-lg border-2 rounded-xl"
            >
              Reset
            </Button>
          </div>

          {/* Inline error instead of toast */}
          {isError && (
            <div className="mt-4 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-xl text-sm sm:text-base text-red-700">
              Start date cannot be after end date.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {difference && !isError && (
        <div className="space-y-4 sm:space-y-6 export-capture" ref={resultRef}>
          <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
            <CardContent className="p-4 sm:p-6 lg:p-8 text-center">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">Duration</h2>
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-blue-600 dark:text-blue-400">
                {difference.totalDays}
              </div>
              <div className="text-base sm:text-lg lg:text-xl text-muted-foreground">
                {difference.totalDays === 1 ? 'day' : 'days'}
              </div>
              <div className="pt-4 sm:pt-6 border-t border-blue-200 dark:border-blue-800">
                <div className="grid grid-cols-3 gap-3 sm:gap-6">
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">{difference.years}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground font-medium">Years</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">{difference.months}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground font-medium">Months</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">{difference.days}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground font-medium">Days</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-card">
            <CardContent className="p-4 sm:p-6">
              <div className="text-center space-y-2">
                <h3 className="text-base sm:text-lg font-semibold text-foreground">Date Range</h3>
                <p className="text-sm sm:text-base text-muted-foreground break-words">
                  From <span className="font-semibold">{format(start!, 'MMM dd, yyyy')}</span> to{' '}
                  <span className="font-semibold">{format(end!, 'MMM dd, yyyy')}</span>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {difference && !isError && (
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={downloadResultImage} variant="outline" className="flex items-center gap-2" disabled={isImageGenerating}>
            <Download className="h-4 w-4" />
            {isImageGenerating ? 'Preparing Image...' : 'Download Image'}
          </Button>
          <Button onClick={copyResult} variant="outline" className="flex items-center gap-2">
            <Copy className="h-4 w-4" />
            Copy Result
          </Button>
        </div>
      )}
      {difference && !isError && (
        <SocialShareButtons
          title="Date Difference Calculator"
          shareUrl={shareUrl}
          shareText={shareText}
          onShareImage={downloadResultImage}
        />
      )}
      {isImageGenerating && (
        <div className="text-center text-sm text-muted-foreground">
          Ready to download: {imageProgress}%
        </div>
      )}
    </div>
  );
};

export default DateDifferenceCalculator;
