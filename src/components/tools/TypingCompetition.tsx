'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Timer, Trophy, Users } from 'lucide-react';

interface Player {
  id: string;
  name: string;
  emoji: string;
  wpm: number;
  accuracy: number;
  progress: number;
  isFinished: boolean;
  isCurrentUser: boolean;
  baseSpeed: number;
  finishTime: number | null;  // Time when the player finishes
}

const TypingCompetition: React.FC = () => {
  const [language, setLanguage] = useState('english');
  const [step, setStep] = useState<'menu' | 'name' | 'race'>('menu');
  const [playerName, setPlayerName] = useState('');
  const [isGuest, setIsGuest] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentText, setCurrentText] = useState('');
  const [typedText, setTypedText] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [errors, setErrors] = useState(0);
  const [raceFinished, setRaceFinished] = useState(false);
  const [finalPosition, setFinalPosition] = useState(0);
  const [countdown, setCountdown] = useState(5);
  const inputRef = useRef<HTMLInputElement>(null);

  // Realistic name pool: Indian, US, Thai
  const namePool = React.useMemo(
    () => [
      'Aarav', 'Saanvi', 'Liam', 'Emma', 'Noah', 'Olivia', 'Narong', 'Mayura', 'Chai', 'Aran',
      // Indian
      'Vivaan', 'Anaya', 'Ishaan', 'Diya', 'Kabir', 'Myra', 'Rohan', 'Aanya', 'Aryan', 'Kavya',
      // American
      'Jackson', 'Avery', 'Elijah', 'Harper', 'Mason', 'Luna', 'Logan', 'Brooklyn', 'Carter', 'Riley',
      // Canadian
      'Hudson', 'Sophie', 'Connor', 'Claire', 'Landon', 'Mila', 'Wyatt', 'Zoe',
      // German
      'Lukas', 'Mia', 'Finn', 'Hannah', 'Ben', 'Lea', 'Paul', 'Emma',
      // Turkish
      'Deniz', 'Elif', 'Emir', 'Zeynep', 'Burak', 'Yasmin', 'Kerem', 'Meryem',
      // Taiwanese
      'Wei', 'Mei', 'Jia', 'Liang', 'Chen', 'Yun', 'Kai', 'Xinyi',
      // Singaporean (multicultural mix)
      'Zhi Hao', 'Nurul', 'Aarush', 'Siti', 'Wei Ming', 'Anjali', 'Dinesh', 'Clarissa',
      // European (mixed)
      'Léa', 'Mateo', 'Isla', 'Freya', 'Oscar', 'Nina', 'Theo', 'Sofia', 'Sebastian', 'Amelia'
    ],

    []
  );

  // Paragraphs (5+ lines each), ensuring only one space between words
  const raceTexts: Record<string, string[]> = {
    english: [
      `In the realm of digital communication, typing skills serve as a vital conduit between thought and expression. From the moment we sit at our keyboards, our fingers dance across the keys, translating ideas into words. Consistency in speed paves the way for fluidity of thought, minimizing the friction between mind and text. Every keystroke carries with it the potential for clarity or confusion, emphasizing precision alongside pace. As we strive for efficiency, we embark on a journey of self-improvement, one character at a time.`,
      `Effective typing transcends mere finger dexterity, encompassing cognitive agility and muscle memory. Each sentence we compose builds upon a foundation of accuracy, reinforcing correct patterns in the brain. Speed and precision intertwine, shaping a skill set that extends beyond the digital realm into everyday life. Practice sessions become laboratories of progress, where subtle adjustments yield significant gains. By challenging ourselves with varied content, we cultivate adaptability and resilience in our typing arsenal.`,
      `The evolution of typing technology, from typewriters to touchscreens, mirrors the trajectory of innovation. With each advancement, we adapt our techniques, embracing new layouts, devices, and interfaces. Yet the core principles remain unchanged: attentiveness, rhythm, and mindful engagement with the text. Competitions and drills inject a spirit of camaraderie, fostering growth through friendly rivalry. Ultimately, the true art of typing lies in harmonizing speed, accuracy, and consistency in every stroke.`
    ]
  };

  const emojiPool = ['🚗', '🚙', '🚕', '🚓', '🚐', '🛻', '🏎️', '🛵', '🚑', '🚒'];

  // Utility: draw random unique names
  const getRandomNames = (count: number): string[] => {
    const avail = [...namePool];
    const out: string[] = [];
    while (out.length < count && avail.length) {
      const i = Math.floor(Math.random() * avail.length);
      out.push(avail.splice(i, 1)[0]);
    }
    return out;
  };

  const setupPlayers = () => {
    const totalBots = Math.floor(Math.random() * 3) + 3; // 3 to 5 participants (including real user)
    const botNames = getRandomNames(totalBots - 1); // excluding real user

    // Speed between 12-40 WPM for bots
    const speedOptions = Array.from({ length: totalBots - 1 }, () => 12 + Math.random() * 28);

    const bots: Player[] = botNames.map((name, i) => ({
      id: `bot-${i}`,
      name,
      emoji: emojiPool[i % emojiPool.length],
      wpm: 0,
      accuracy: Math.round(Math.random() * 50) + 50,  // Random accuracy between 50 and 100
      progress: 0,
      isFinished: false,
      isCurrentUser: false,
      baseSpeed: speedOptions[i],
      finishTime: null
    }));

    const user: Player = {
      id: 'user',
      name: isGuest ? 'Guest' : playerName || 'Guest',
      emoji: '🚗',
      wpm: 0,
      accuracy: 0,
      progress: 0,
      isFinished: false,
      isCurrentUser: true,
      baseSpeed: 0,
      finishTime: null
    };

    setPlayers([user, ...bots]);
  };

  const startRace = () => {
    const texts = raceTexts[language];
    setCurrentText(texts[Math.floor(Math.random() * texts.length)]);
    setStep('race');
    setCountdown(5);
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) {
          clearInterval(countdownInterval);
          setStartTime(Date.now());
          inputRef.current?.focus();
        }
        return prev - 1;
      });
    }, 1000);
  };
  const simulateBotTyping = () => {
    const interval = setInterval(() => {
      if (!startTime) return;
      setPlayers((prev) =>
        prev.map((p) => {
          if (!p.isCurrentUser && !p.isFinished) {
            const fluct = Math.random() * 8 - 4;
            const speed = p.baseSpeed + fluct;
            const totalChars = currentText.replace(/\n/g, '').length;
            const inc = (speed / 60) / totalChars * 100 * 4.5;
            const prog = Math.min(p.progress + inc, 100);
            const elapsedMinutes = (Date.now() - startTime) / 60000;
            const wordsTyped = (prog / 100) * currentText.split(' ').length;
            const botWpm = elapsedMinutes > 0 ? Math.round(wordsTyped / elapsedMinutes) : 0;

            return {
              ...p,
              progress: prog,
              wpm: Math.max(0, botWpm),
              accuracy: Math.min(Math.max(p.accuracy + Math.round(Math.random() * 10 + 5), 50), 100),
              isFinished: prog >= 100 ? true : p.isFinished,
              finishTime: prog >= 100 && p.finishTime === null ? Date.now() : p.finishTime, // Set finish time when finished
            };
          }
          return p;
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  };

  useEffect(() => {
    if (step === 'race' && startTime) {
      const cleanup = simulateBotTyping();
      return cleanup;
    }
  }, [startTime]);

  useEffect(() => {
    if (step === 'race' && typedText && startTime) {
      let errorCount = 0;
      for (let i = 0; i < typedText.length; i++) {
        if (typedText[i] !== currentText[i]) errorCount++;
      }

      setErrors(errorCount);
      const newAccuracy = typedText.length > 0 ? Math.round((typedText.length - errorCount) / typedText.length * 100) : 0;
      const newWpm = typedText.length > 0 ? Math.round(typedText.split(' ').length / ((Date.now() - startTime) / 60000)) : 0;

      setAccuracy(newWpm > 0 ? newAccuracy : 0);
      setWpm(newWpm);

      const progress = Math.min((typedText.length / currentText.length) * 100, 100);

      setPlayers((prevPlayers) =>
        prevPlayers.map((p) =>
          p.isCurrentUser
            ? { ...p, wpm: newWpm, accuracy: newWpm > 0 ? newAccuracy : 0, progress, isFinished: progress >= 100, finishTime: progress >= 100 && p.finishTime === null ? Date.now() : p.finishTime }
            : p
        )
      );

      if (typedText === currentText) {
        const finishedPlayers = players.filter((p) => p.isFinished).length;
        setFinalPosition(finishedPlayers + 1);
        setRaceFinished(true);
      }
    }
  }, [typedText, startTime, currentText, players]);
  // After the race, calculate the final positions based on finish time
  const finishedPlayers = players
    .filter((p) => p.finishTime != null)
    .sort((a, b) => a.finishTime! - b.finishTime!); // Sort by finish time to determine rank

  const renderText = () => {
    return currentText.split('').map((char, index) => {
      let className = 'text-gray-800 dark:text-gray-200';
      if (index < typedText.length) {
        className = typedText[index] === char ? 'text-green-500' : 'text-red-500';
      }
      return (
        <span key={index} className={className}>
          {char}
        </span>
      );
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 sm:p-6">
      {step === 'menu' && (
        <Card className="max-w-lg mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" /> Typing Competition
            </CardTitle>
            <CardDescription>Compete in fun typing races</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block mb-1 text-sm dark:text-gray-200">Language</label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="english">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full mt-2" onClick={() => setStep('name')}>
              <Users className="h-4 w-4 mr-2" /> Find Race
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 'name' && (
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Enter Your Name</CardTitle>
            <CardDescription>Or continue as a guest</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Your name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full"
            />
            <div className="flex flex-col sm:flex-row gap-2">
              <Button className="flex-1" onClick={() => { setIsGuest(true); setupPlayers(); startRace(); }}>
                Start as Guest
              </Button>
              <Button
                disabled={!playerName.trim()}
                className="flex-1"
                onClick={() => { setIsGuest(false); setupPlayers(); startRace(); }}
              >
                Start
              </Button>
            </div>
            <Button variant="ghost" className="w-full" onClick={() => setStep('menu')}>Back</Button>
          </CardContent>
        </Card>
      )}

      {step === 'race' && (
        <div className="space-y-6 max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" /> Race Track
              </CardTitle>
            </CardHeader>
            <CardContent>
              {countdown > 0 && (
                <div className="text-center py-6">
                  <div className="text-4xl font-bold text-primary mb-2">{countdown}</div>
                  <p className="text-md text-muted-foreground">Get ready to type!</p>
                </div>
              )}
              <div className="space-y-4">
                {players.map((p) => (
                  <div key={p.id} className="flex items-center gap-2 flex-wrap">
                    <div className="w-20 sm:w-24 text-sm font-medium truncate">
                      {p.isCurrentUser ? 'You' : p.name}
                    </div>
                    <div className="flex-1 relative h-8 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="absolute top-0 bottom-0 left-0 bg-green-500 transition-all duration-500 ease-out" style={{ width: `${Math.min(p.progress, 100)}%` }} />
                      <div className="absolute top-0 text-2xl transition-all duration-500 ease-out" style={{ left: `${Math.min(p.progress, 100)}%`, transform: 'translateX(-50%)' }}>
                        {p.emoji}
                      </div>
                    </div>
                    <div className="w-24 sm:w-32 text-sm text-right truncate">
                      {p.wpm} WPM • {p.accuracy}%
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-center">Type the text below</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg border bg-gray-50 dark:bg-gray-900 font-mono text-sm leading-relaxed overflow-x-auto">
                {renderText()}
              </div>
              <Input
                ref={inputRef}
                value={typedText}
                onChange={(e) => {
                  const newValue = e.target.value.slice(0, currentText.length);
                  setTypedText(newValue);
                }}
                placeholder={raceFinished ? 'Finished!' : 'Start typing...'}
                disabled={raceFinished} // Disable input when race is finished
                className="w-full font-mono text-base"
              />
              {raceFinished && (
                <div className="text-center">
                  <Badge className="text-lg bg-green-500 mb-2">Finished #{finalPosition}</Badge>
                  <div className="flex flex-col sm:flex-row justify-center gap-2">
                    <Button onClick={() => window.location.reload()}>Race Again</Button>
                    <Button onClick={startRace}>Join New Race</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Final Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                {finishedPlayers.map((p, idx) => (
                  <div key={p.id} className="flex items-center gap-2">
                    <div className="text-sm font-medium">
                      {idx + 1}. {p.name} - {p.wpm} WPM
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default TypingCompetition;
