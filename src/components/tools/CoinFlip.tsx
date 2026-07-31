'use client';

import React, { useState, useRef, useEffect } from 'react';
import '@/styles/coin-flip.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RotateCcw, Coins, Volume2, VolumeX } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const CoinFlip = () => {
  const [result, setResult] = useState<string | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [stats, setStats] = useState({ heads: 0, tails: 0 });
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio element on mount
  useEffect(() => {
    audioRef.current = new Audio('/coin.mp3');
    audioRef.current.preload = 'auto';
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Play coin flip sound effect
  const playCoinFlipSound = () => {
    if (isMuted || !audioRef.current || typeof window === 'undefined') return;

    try {
      // Reset audio to start
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(error => {
        // Silently fail if audio is not supported or blocked
        console.debug('Audio playback failed:', error);
      });
    } catch (error) {
      // Silently fail if audio is not supported or blocked
      console.debug('Audio playback failed:', error);
    }
  };

  const flipCoin = async () => {
    // Play sound on user click
    if (!isMuted) {
      playCoinFlipSound();
    }

    setIsFlipping(true);
    setResult(null);

    // Fast and smooth animation: matches CSS animation duration (1.15s)
    const animationDuration = 1150;

    setTimeout(() => {
      const outcome = Math.random() < 0.5 ? 'Head' : 'Tail';
      setResult(outcome);
      setHistory(prev => [outcome, ...prev.slice(0, 9)]); // Keep last 10 flips
      setStats(prev => ({
        ...prev,
        [outcome.toLowerCase() === 'head' ? 'heads' : 'tails']: prev[outcome.toLowerCase() === 'head' ? 'heads' : 'tails'] + 1
      }));
      setIsFlipping(false);
    }, animationDuration);
  };

  const reset = () => {
    setResult(null);
    setHistory([]);
    setStats({ heads: 0, tails: 0 });
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5" />
              Coin Flip
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              {/* Coin Flip Animation - Fixed Height Container */}
              <div className="flex justify-center items-center h-[220px] relative perspective-1000">
                <div 
                  className={`relative w-48 h-48 mx-auto cursor-pointer ${
                    isFlipping ? 'coin-flip-animation' : ''
                  }`}
                  style={{
                    transformStyle: 'preserve-3d',
                  }}
                  onClick={!isFlipping ? flipCoin : undefined}
                >
                  {/* Coin with realistic 3D effect and text - Indian Currency Style */}
                  <div
                    className={`coin-face w-full h-full rounded-full flex flex-col items-center justify-center font-extrabold shadow-2xl border-4 relative overflow-hidden transition-colors ${
                      isFlipping 
                        ? 'coin-spinning' 
                        : ''
                    } ${
                      result 
                        ? result === 'Head' 
                          ? 'bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 border-amber-700 dark:from-amber-500 dark:via-amber-600 dark:to-amber-700 dark:border-amber-800' 
                          : 'bg-gradient-to-br from-slate-300 via-slate-400 to-slate-500 border-slate-600 dark:from-slate-500 dark:via-slate-600 dark:to-slate-700 dark:border-slate-800'
                        : 'bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 border-amber-700 dark:from-amber-500 dark:via-amber-600 dark:to-amber-700'
                    }`}
                    style={{
                      transformStyle: 'preserve-3d',
                    }}
                  >
                    {isFlipping ? (
                      <span className="text-amber-900 dark:text-amber-100 text-2xl opacity-70">🪙</span>
                    ) : result ? (
                      <span className={`text-3xl font-black tracking-wider ${
                        result === 'Head' 
                          ? 'text-amber-900 dark:text-amber-100' 
                          : 'text-slate-900 dark:text-slate-100'
                      }`}>
                        {result === 'Head' ? 'HEAD' : 'TAIL'}
                      </span>
                    ) : (
                      <span className="text-amber-900 dark:text-amber-100 text-2xl">🪙</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Result Display */}
              {result && !isFlipping && (
                <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h3 className={`text-5xl md:text-6xl font-extrabold ${
                    result === 'Head' 
                      ? 'text-amber-700 dark:text-amber-400' 
                      : 'text-slate-700 dark:text-slate-300'
                  }`}>
                    {result}!
                  </h3>
                  <Badge 
                    variant={result === 'Head' ? 'default' : 'secondary'}
                    className="text-lg px-6 py-2"
                  >
                    {result === 'Head' ? '🪙 Head' : '🪙 Tail'}
                  </Badge>
                </div>
              )}

              {isFlipping && (
                <div className="text-xl text-muted-foreground animate-pulse">
                  Flipping coin...
                </div>
              )}

              {!result && !isFlipping && (
                <div className="text-muted-foreground">
                  Click coin or button to flip
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex gap-2">
                <Button 
                  onClick={flipCoin} 
                  disabled={isFlipping}
                  className="flex-1 text-lg py-6"
                  size="lg"
                >
                  {isFlipping ? 'Flipping...' : '🪙 Flip Coin'}
                </Button>
                <Button onClick={reset} variant="outline" size="lg">
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>

              {/* Sound Toggle */}
              <div className="flex items-center justify-center gap-2 pt-2 border-t">
                <Label htmlFor="sound-toggle" className="cursor-pointer flex items-center gap-2">
                  {isMuted ? (
                    <VolumeX className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Volume2 className="h-4 w-4 text-primary" />
                  )}
                  <span className="text-sm text-muted-foreground">Sound</span>
                </Label>
                <Switch
                  id="sound-toggle"
                  checked={!isMuted}
                  onCheckedChange={(checked) => setIsMuted(!checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Statistics & History</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 rounded-lg border-2 border-amber-200 dark:border-amber-800">
                <div className="text-3xl font-extrabold text-amber-700 dark:text-amber-400">{stats.heads}</div>
                <div className="text-sm font-semibold text-amber-600 dark:text-amber-500 mt-1">Head</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 rounded-lg border-2 border-slate-200 dark:border-slate-800">
                <div className="text-3xl font-extrabold text-slate-700 dark:text-slate-300">{stats.tails}</div>
                <div className="text-sm font-semibold text-slate-600 dark:text-slate-400 mt-1">Tail</div>
              </div>
            </div>

            {history.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3 text-foreground">Recent Flips:</h4>
                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                  {history.map((flip, index) => (
                    <Badge 
                      key={index}
                      variant={flip === 'Head' ? 'default' : 'secondary'}
                      className={`text-sm px-3 py-1.5 font-semibold ${
                        flip === 'Head' 
                          ? 'bg-amber-500 hover:bg-amber-600 text-amber-900 dark:bg-amber-600 dark:hover:bg-amber-700 dark:text-amber-100' 
                          : 'bg-slate-500 hover:bg-slate-600 text-slate-900 dark:bg-slate-600 dark:hover:bg-slate-700 dark:text-slate-100'
                      }`}
                    >
                      {flip}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {stats.heads + stats.tails > 0 && (
              <div className="text-center pt-3 border-t border-border">
                <div className="text-sm font-medium text-muted-foreground">
                  Total flips: <span className="font-bold text-foreground">{stats.heads + stats.tails}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CoinFlip;
