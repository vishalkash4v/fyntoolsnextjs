'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Play, Pause, Square, RotateCcw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const CountdownTimer = () => {
  const [initialTime, setInitialTime] = useState({ hours: 0, minutes: 5, seconds: 0 });
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning && time > 0) {
      intervalRef.current = setInterval(() => {
        setTime(prevTime => {
          if (prevTime <= 1000) {
            setIsRunning(false);
            toast({
              title: 'Time\'s Up!',
              description: 'Your countdown timer has finished.',
            });
            return 0;
          }
          return prevTime - 1000;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, time]);

  const formatTime = (time: number) => {
    const hours = Math.floor(time / 3600000);
    const minutes = Math.floor((time % 3600000) / 60000);
    const seconds = Math.floor((time % 60000) / 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    if (time === 0) {
      const totalTime = (initialTime.hours * 3600 + initialTime.minutes * 60 + initialTime.seconds) * 1000;
      if (totalTime > 0) {
        setTime(totalTime);
        setIsRunning(true);
      } else {
        toast({
          title: 'Invalid Time',
          description: 'Please set a valid countdown time.',
          variant: 'destructive',
        });
      }
    } else {
      setIsRunning(true);
    }
  };

  const handlePause = () => setIsRunning(false);
  const handleStop = () => {
    setIsRunning(false);
    setTime(0);
  };
  const handleReset = () => {
    setIsRunning(false);
    const totalTime = (initialTime.hours * 3600 + initialTime.minutes * 60 + initialTime.seconds) * 1000;
    setTime(totalTime);
  };

  return (
    <div className="w-full">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Countdown Timer</CardTitle>
          <CardDescription>
            Set a countdown timer for any duration and get notified when time's up.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="hours">Hours</Label>
              <Input
                id="hours"
                type="number"
                min="0"
                max="23"
                value={initialTime.hours}
                onChange={(e) => setInitialTime(prev => ({ ...prev, hours: parseInt(e.target.value) || 0 }))}
                disabled={isRunning}
              />
            </div>
            <div>
              <Label htmlFor="minutes">Minutes</Label>
              <Input
                id="minutes"
                type="number"
                min="0"
                max="59"
                value={initialTime.minutes}
                onChange={(e) => setInitialTime(prev => ({ ...prev, minutes: parseInt(e.target.value) || 0 }))}
                disabled={isRunning}
              />
            </div>
            <div>
              <Label htmlFor="seconds">Seconds</Label>
              <Input
                id="seconds"
                type="number"
                min="0"
                max="59"
                value={initialTime.seconds}
                onChange={(e) => setInitialTime(prev => ({ ...prev, seconds: parseInt(e.target.value) || 0 }))}
                disabled={isRunning}
              />
            </div>
          </div>

          <div className="text-center">
            <div className="text-6xl font-mono font-bold text-primary mb-8">
              {formatTime(time)}
            </div>
            
            <div className="flex justify-center gap-4">
              {!isRunning ? (
                <Button onClick={handleStart} size="lg" className="gap-2">
                  <Play className="h-5 w-5" />
                  Start
                </Button>
              ) : (
                <Button onClick={handlePause} size="lg" variant="secondary" className="gap-2">
                  <Pause className="h-5 w-5" />
                  Pause
                </Button>
              )}
              
              <Button onClick={handleStop} size="lg" variant="destructive" className="gap-2">
                <Square className="h-5 w-5" />
                Stop
              </Button>
              
              <Button onClick={handleReset} size="lg" variant="outline" className="gap-2">
                <RotateCcw className="h-5 w-5" />
                Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CountdownTimer;
