'use client';
import React, { useState, useMemo, useMemo as useMemoAlias, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { differenceInYears, differenceInMonths, differenceInDays, isValid, format } from 'date-fns';
import { User, Gift, Download, Copy } from 'lucide-react';
import { cn } from "@/lib/utils";
import CommonDatePicker from '@/components/ui/CommonDatePicker';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';
import SocialShareButtons from '@/components/tools/SocialShareButtons';

// Animations
import { motion, AnimatePresence } from 'framer-motion';

const EMOJIS = ["🎉", "🎈", "🎂", "🥳", "🎊"];

const AgeCalculator = () => {
  const [dob, setDob] = useState<Date | null>(null);
  const [isImageGenerating, setIsImageGenerating] = useState(false);
  const [imageProgress, setImageProgress] = useState(0);
  const resultRef = useRef<HTMLDivElement>(null);

  const ageResult = useMemo(() => {
    if (!dob) return null;

    const birthDate = dob;
    if (!isValid(birthDate)) return { error: "Invalid date selected." };

    const today = new Date();
    if (birthDate > today) return { error: "Date of birth cannot be in the future." };

    const years = differenceInYears(today, birthDate);

    const monthsDate = new Date(birthDate);
    monthsDate.setFullYear(monthsDate.getFullYear() + years);

    const months = differenceInMonths(today, monthsDate);

    const daysDate = new Date(monthsDate);
    daysDate.setMonth(daysDate.getMonth() + months);

    const days = differenceInDays(today, daysDate);

    const nextBirthday = new Date(
      today.getFullYear(),
      birthDate.getMonth(),
      birthDate.getDate()
    );
    if (nextBirthday < today) {
      nextBirthday.setFullYear(nextBirthday.getFullYear() + 1);
    }
    const daysToNextBirthday = differenceInDays(nextBirthday, today);

    return {
      years,
      months,
      days,
      daysToNextBirthday,
      error: null as string | null,
      summary: `You are ${years} years, ${months} months, and ${days} days old.`
    };
  }, [dob]);

  const isBirthdayToday = !!ageResult && !ageResult.error && ageResult.daysToNextBirthday === 0;

  const handleReset = () => setDob(null);

  const buildSummaryText = () => {
    if (!dob || !ageResult || ageResult.error) return '';
    const today = new Date();
    return [
      'Age Calculator Result',
      `Date of Birth: ${format(dob, 'MMMM d, yyyy')}`,
      `Today: ${format(today, 'MMMM d, yyyy')}`,
      `Age: ${ageResult.years} years, ${ageResult.months} months, ${ageResult.days} days`,
      `Days to Next Birthday: ${ageResult.daysToNextBirthday}`,
      `Generated: ${format(today, 'PPpp')}`,
    ].join('\n');
  };

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = buildSummaryText() || 'Age Calculator result';

  const copyResult = async () => {
    const text = buildSummaryText();
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Age summary copied');
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      toast.success('Age summary copied');
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

      const canvas = await html2canvas(wrapper, {
        scale: 2.5,
        backgroundColor: bg,
        useCORS: true,
        logging: false,
      });
      document.body.removeChild(wrapper);
      setImageProgress(100);
      const link = document.createElement('a');
      link.download = 'age-calculator-result.png';
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
    <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8 px-4 sm:px-6">
      {/* Hero Section */}
      <div className="text-center space-y-3 sm:space-y-4">
        <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 mb-2 sm:mb-4">
          <User className="w-7 h-7 sm:w-8 sm:h-8 text-purple-600 dark:text-purple-400" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground">Age Calculator</h1>
        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
          Calculate your exact age and days until your next birthday
        </p>
      </div>

      {/* Main Calculator Card */}
      <Card className="glass-card shadow-xl">
        <CardContent className="p-4 sm:p-6 md:p-8">
          <div className="space-y-6 sm:space-y-8">
            {/* Date Input */}
            <div className="space-y-3 sm:space-y-6">
              <div className="text-center space-y-1.5 sm:space-y-2">
                <h3 className="text-base sm:text-lg font-semibold gradient-text">
                  Select Your Date of Birth
                </h3>
                <p className="text-muted-foreground text-xs sm:text-sm">
                  Choose your birth date below
                </p>
              </div>

              <div className="flex justify-center">
                <div className="w-full max-w-md">
                  <CommonDatePicker
                    value={dob}
                    onChange={setDob}
                    minDate={new Date(1900, 0, 1)}
                    maxDate={new Date()}
                    format="MMMM d, yyyy"
                    placeholder="Pick your birth date"
                  />
                  <div className="mt-2 text-xs sm:text-sm text-muted-foreground">
                    {dob ? `Selected: ${format(dob, "MMMM d, yyyy")}` : "No date selected"}
                  </div>
                </div>
              </div>
            </div>

            {/* Error Display */}
            {ageResult && ageResult.error && (
              <div className="p-3 sm:p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-600 text-sm sm:text-base font-medium">{ageResult.error}</p>
              </div>
            )}

            {/* Reset Button */}
            {dob && (
              <div className="flex justify-center">
                <Button
                  onClick={handleReset}
                  variant="glass"
                  className="h-11 sm:h-12 px-6 sm:px-8 text-base sm:text-lg w-full sm:w-auto"
                >
                  Reset Date
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {ageResult && !ageResult.error && (
        <div className="space-y-4 sm:space-y-6 animate-fade-in export-capture" ref={resultRef}>
          {/* Main Age Display */}
          <Card className="glass-card shadow-xl bg-gradient-to-br from-primary/5 to-accent/5">
            <CardContent className="p-5 sm:p-8 text-center">
              <div className="space-y-4 sm:space-y-6">
                <h2 className="text-xl sm:text-2xl font-bold gradient-text">Your Age</h2>

                <div className="text-5xl sm:text-6xl font-bold gradient-text">
                  {ageResult.years}
                </div>
                <div className="text-base sm:text-xl text-muted-foreground">
                  years old
                </div>

                <div className="pt-5 sm:pt-6 border-t border-border/30">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                    <div className="text-center space-y-1.5 sm:space-y-2">
                      <div className="text-2xl sm:text-3xl font-bold text-foreground">{ageResult.years}</div>
                      <div className="text-xs sm:text-sm text-muted-foreground font-medium">Years</div>
                    </div>
                    <div className="text-center space-y-1.5 sm:space-y-2">
                      <div className="text-2xl sm:text-3xl font-bold text-foreground">{ageResult.months}</div>
                      <div className="text-xs sm:text-sm text-muted-foreground font-medium">Months</div>
                    </div>
                    <div className="text-center space-y-1.5 sm:space-y-2">
                      <div className="text-2xl sm:text-3xl font-bold text-foreground">{ageResult.days}</div>
                      <div className="text-xs sm:text-sm text-muted-foreground font-medium">Days</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Next Birthday Card with animations & emojis */}
          <motion.div
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 120, damping: 14 }}
          >
            <Card className="relative overflow-hidden glass-card shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-4 sm:p-6">
                {/* Confetti layer (shown only on birthday) */}
                <AnimatePresence>
                  {isBirthdayToday && (
                    <motion.div
                      className="pointer-events-none absolute inset-0"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      {Array.from({ length: 18 }).map((_, i) => {
                        const delay = Math.random() * 0.6;
                        const x = Math.random() * 100;   // vw%
                        const duration = 2.2 + Math.random() * 1.5;
                        const emoji = EMOJIS[i % EMOJIS.length];
                        return (
                          <motion.span
                            key={i}
                            className="absolute text-xl sm:text-2xl"
                            style={{ left: `${x}%`, top: `-10%` }}
                            initial={{ y: -20, rotate: 0, opacity: 0 }}
                            animate={{
                              y: "120%",
                              rotate: 360,
                              opacity: [0, 1, 1, 0],
                            }}
                            transition={{
                              delay,
                              duration,
                              repeat: Infinity,
                              repeatDelay: 1.2,
                              ease: "easeOut",
                            }}
                          >
                            {emoji}
                          </motion.span>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex items-center justify-center gap-3 sm:gap-4 text-center">
                  <motion.div
                    className={cn(
                      "p-3 sm:p-3.5 rounded-full bg-gradient-to-br from-primary/20 to-accent/20"
                    )}
                    animate={isBirthdayToday ? { scale: [1, 1.1, 1] } : { scale: 1 }}
                    transition={{ repeat: isBirthdayToday ? Infinity : 0, duration: 1.2 }}
                  >
                    <Gift className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
                  </motion.div>
                  <div className="text-center">
                    <h3 className="text-base sm:text-lg font-semibold gradient-text">
                      {isBirthdayToday ? "It’s Your Birthday! 🥳" : "Next Birthday"}
                    </h3>
                    <p className="text-muted-foreground text-sm sm:text-base">
                      {isBirthdayToday ? (
                        <span className="font-semibold">
                          Wishing you a fantastic year ahead 🎉🎂🎈
                        </span>
                      ) : (
                        <>
                          <span className="font-bold text-primary">
                            {ageResult.daysToNextBirthday}
                          </span>{" "}
                          days to go{" "}
                          <span aria-hidden>✨</span>
                        </>
                      )}
                    </p>
                  </div>
                </div>

                {/* Subtle hover emoji trail when not birthday */}
                {!isBirthdayToday && (
                  <motion.div
                    className="mt-3 flex justify-center gap-2 text-lg"
                    whileHover={{ scale: 1.02 }}
                  >
                    <span>🎈</span><span>🎉</span><span>🎂</span>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}

      {ageResult && !ageResult.error && (
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
      {ageResult && !ageResult.error && (
        <SocialShareButtons
          title="Age Calculator"
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

export default AgeCalculator;
