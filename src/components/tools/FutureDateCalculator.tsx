'use client';

import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { addDays, addWeeks, addMonths, addYears, subDays, subWeeks, subMonths, subYears, format } from 'date-fns';
import { toast } from "sonner";
import { Calendar as CalendarIcon, Plus, Minus, RotateCcw, ArrowRight, Download, Copy } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CommonDatePicker from '@/components/ui/CommonDatePicker';
import SocialShareButtons from '@/components/tools/SocialShareButtons';

type TimeUnit = 'days' | 'weeks' | 'months' | 'years';
type Direction = 'add' | 'subtract';

const FutureDateCalculator = () => {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [value, setValue] = useState<string>('');
  const [timeUnit, setTimeUnit] = useState<TimeUnit>('days');
  const [direction, setDirection] = useState<Direction>('add');
  const [calculatedDate, setCalculatedDate] = useState<Date | null>(null);
  const [isImageGenerating, setIsImageGenerating] = useState(false);
  const [imageProgress, setImageProgress] = useState(0);
  const resultRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    if (!startDate) {
      toast.error("Please select a start date.");
      return;
    }

    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue < 0) {
      toast.error(`Please enter a valid number of ${timeUnit}.`);
      return;
    }

    if (numValue === 0) {
      toast.error("Please enter a value greater than 0.");
      return;
    }

    let result: Date;
    const startDateObj = startDate;

    if (direction === 'add') {
      switch (timeUnit) {
        case 'days':
          result = addDays(startDateObj, numValue);
          break;
        case 'weeks':
          result = addWeeks(startDateObj, numValue);
          break;
        case 'months':
          result = addMonths(startDateObj, numValue);
          break;
        case 'years':
          result = addYears(startDateObj, numValue);
          break;
        default:
          result = addDays(startDateObj, numValue);
      }
    } else {
      switch (timeUnit) {
        case 'days':
          result = subDays(startDateObj, numValue);
          break;
        case 'weeks':
          result = subWeeks(startDateObj, numValue);
          break;
        case 'months':
          result = subMonths(startDateObj, numValue);
          break;
        case 'years':
          result = subYears(startDateObj, numValue);
          break;
        default:
          result = subDays(startDateObj, numValue);
      }
    }

    setCalculatedDate(result);
  };

  const handleReset = () => {
    setStartDate(null);
    setValue('');
    setTimeUnit('days');
    setDirection('add');
    setCalculatedDate(null);
  };

  const setToday = () => {
    setStartDate(new Date());
  };

  const buildSummaryText = () => {
    if (!startDate || !calculatedDate) return '';
    const today = new Date();
    return [
      'Future/Past Date Result',
      `Start Date: ${format(startDate, 'MMMM d, yyyy')}`,
      `Operation: ${direction === 'add' ? 'Add' : 'Subtract'} ${value} ${timeUnit}`,
      `Result Date: ${format(calculatedDate, 'MMMM d, yyyy')}`,
      `Day: ${format(calculatedDate, 'EEEE')}`,
      `Generated: ${format(today, 'PPpp')}`,
    ].join('\n');
  };

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = buildSummaryText() || 'Future Date result';

  const copyResult = async () => {
    const text = buildSummaryText();
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Result copied');
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      toast.success('Result copied');
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
      link.download = 'future-date-result.png';
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
    <div className="max-w-4xl mx-auto space-y-6 p-4 sm:p-6">
      {/* Hero Section */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 mb-3">
          <CalendarIcon className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 dark:text-green-400" />
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">Past or Future Date Calculator</h1>
        <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto">
          Calculate past or future dates by adding or subtracting days, weeks, months, or years
        </p>
      </div>

      {/* Main Calculator Card */}
      <Card className="border-0 shadow-xl bg-card">
        <CardContent className="p-4 sm:p-6 lg:p-8">
          <div className="space-y-6 sm:space-y-8">
            {/* Input Section */}
            <div className="space-y-4 sm:space-y-6">
              {/* Start Date */}
              <div className="space-y-3">
                <Label className="text-sm sm:text-base font-semibold text-foreground">Start Date</Label>
                <CommonDatePicker
                  value={startDate}
                  onChange={setStartDate}
                  format="MMM d, yyyy"
                  placeholder="Pick a date"
                />
                <div className="flex gap-2">
                  <Button variant="outline" className="h-9 px-3 rounded-lg text-xs sm:text-sm" onClick={setToday}>
                    Today
                  </Button>
                  {startDate && (
                    <span className="text-xs sm:text-sm text-muted-foreground self-center">
                      Selected: {format(startDate, 'PPP')}
                    </span>
                  )}
                </div>
              </div>

              {/* Calculation Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Direction (Add/Subtract) */}
                <div className="space-y-3">
                  <Label className="text-sm sm:text-base font-semibold text-foreground">Direction</Label>
                  <Select value={direction} onValueChange={(value: Direction) => setDirection(value)}>
                    <SelectTrigger className="h-12 sm:h-14 text-sm sm:text-base border-2 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="add">
                        <div className="flex items-center gap-2">
                          <Plus className="w-4 h-4" />
                          <span>Add (Future)</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="subtract">
                        <div className="flex items-center gap-2">
                          <Minus className="w-4 h-4" />
                          <span>Subtract (Past)</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Value Input */}
                <div className="space-y-3">
                  <Label htmlFor="value" className="text-sm sm:text-base font-semibold text-foreground">
                    Value
                  </Label>
                  <Input
                    id="value"
                    type="number"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="Enter number"
                    className="h-12 sm:h-14 text-sm sm:text-base border-2 rounded-xl focus:border-primary focus:ring-0"
                    min="0"
                    step="any"
                  />
                </div>

                {/* Time Unit Selector */}
                <div className="space-y-3">
                  <Label className="text-sm sm:text-base font-semibold text-foreground">Time Unit</Label>
                  <Select value={timeUnit} onValueChange={(value: TimeUnit) => setTimeUnit(value)}>
                    <SelectTrigger className="h-12 sm:h-14 text-sm sm:text-base border-2 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="days">Days</SelectItem>
                      <SelectItem value="weeks">Weeks</SelectItem>
                      <SelectItem value="months">Months</SelectItem>
                      <SelectItem value="years">Years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Button 
                onClick={handleCalculate} 
                className="h-10 sm:h-12 px-6 sm:px-8 text-sm sm:text-lg bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 rounded-xl"
                disabled={!startDate || !value}
              >
                {direction === 'add' ? (
                  <Plus className="w-4 h-4 mr-2" />
                ) : (
                  <Minus className="w-4 h-4 mr-2" />
                )}
                Calculate Date
              </Button>
              <Button 
                onClick={handleReset} 
                variant="outline" 
                className="h-10 sm:h-12 px-6 sm:px-8 text-sm sm:text-lg border-2 rounded-xl"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {calculatedDate && startDate && (
        <div className="space-y-4 sm:space-y-6 animate-fade-in export-capture" ref={resultRef}>
          {/* Main Result */}
          <Card className={cn(
            "border-0 shadow-xl",
            direction === 'add' 
              ? "bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20"
              : "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20"
          )}>
            <CardContent className="p-4 sm:p-6 lg:p-8 text-center">
              <div className="space-y-3 sm:space-y-4">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">
                  {direction === 'add' ? 'Future Date' : 'Past Date'}
                </h2>
                <div className={cn(
                  "text-2xl sm:text-3xl lg:text-4xl font-bold",
                  direction === 'add'
                    ? "text-green-600 dark:text-green-400"
                    : "text-blue-600 dark:text-blue-400"
                )}>
                  {format(calculatedDate, 'EEEE')}
                </div>
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">
                  {format(calculatedDate, 'MMMM dd, yyyy')}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Calculation Summary */}
          <Card className="border-0 shadow-lg bg-card">
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-3">
                <h3 className="text-base sm:text-lg font-semibold text-foreground text-center">Calculation Summary</h3>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base">
                  <span className="font-semibold text-foreground">{format(startDate, 'MMM dd, yyyy')}</span>
                  <div className="flex items-center gap-2">
                    {direction === 'add' ? (
                      <Plus className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <Minus className="w-4 h-4 text-muted-foreground" />
                    )}
                    <span className="text-muted-foreground">
                      {value} {timeUnit}
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground hidden sm:block" />
                  <span className={cn(
                    "font-semibold",
                    direction === 'add'
                      ? "text-green-600 dark:text-green-400"
                      : "text-blue-600 dark:text-blue-400"
                  )}>
                    {format(calculatedDate, 'MMM dd, yyyy')}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {calculatedDate && startDate && (
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
      {calculatedDate && startDate && (
        <SocialShareButtons
          title="Future Date Calculator"
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

export default FutureDateCalculator;
