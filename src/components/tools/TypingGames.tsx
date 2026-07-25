'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Gamepad2, Target, Zap, Heart, Star, RotateCcw, Play, Trophy, Clock, Keyboard, Users, Brain, Rocket, Bomb, Swords, Flame, Snowflake, Music, Code, BookOpen, Timer, Award } from 'lucide-react';

interface FallingLetter {
  id: number;
  letter: string;
  x: number;
  y: number;
  speed: number;
}

interface Bubble {
  id: number;
  word: string;
  x: number;
  y: number;
  size: number;
}

interface Enemy {
  id: number;
  word: string;
  x: number;
  health: number;
  maxHealth: number;
}

const TypingGames = () => {
  const [gameType, setGameType] = useState('word-race');
  const [language, setLanguage] = useState('english');
  const [difficulty, setDifficulty] = useState('easy');
  const [isGameActive, setIsGameActive] = useState(false);
  const [currentText, setCurrentText] = useState('');
  const [typedText, setTypedText] = useState('');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [timeLeft, setTimeLeft] = useState(60);
  const [wordsCompleted, setWordsCompleted] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [accuracy, setAccuracy] = useState(100);
  const [grossAccuracy, setGrossAccuracy] = useState(100);
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);
  const [correctKeystrokes, setCorrectKeystrokes] = useState(0);
  const [errors, setErrors] = useState(0);
  const [backspaceCount, setBackspaceCount] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  
  // Game-specific states
  const [fallingLetters, setFallingLetters] = useState<FallingLetter[]>([]);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [combo, setCombo] = useState(0);
  const [streak, setStreak] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [rhythm, setRhythm] = useState(0);
  const [energy, setEnergy] = useState(100);
  const [temperature, setTemperature] = useState(50);
  const [currentPhrase, setCurrentPhrase] = useState('');
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [bombs, setBombs] = useState<FallingLetter[]>([]);
  const [particles, setParticles] = useState<any[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const gameAreaRef = useRef<HTMLDivElement>(null);

  const gameTypes = {
    'word-race': { name: 'Word Race', icon: Rocket, desc: 'Classic word racing with speed boosts', color: 'from-blue-500 to-cyan-500' },
    'letter-rain': { name: 'Letter Rain', icon: Zap, desc: 'Catch falling letters before they hit ground', color: 'from-purple-500 to-pink-500' },
    'bubble-pop': { name: 'Bubble Pop', icon: Target, desc: 'Pop word bubbles floating around', color: 'from-green-500 to-teal-500' },
    'typing-warrior': { name: 'Typing Warrior', icon: Swords, desc: 'Defeat enemies by typing their names', color: 'from-red-500 to-orange-500' },
    'speed-burst': { name: 'Speed Burst', icon: Flame, desc: '30-second intense typing challenge', color: 'from-yellow-500 to-red-500' },
    'accuracy-master': { name: 'Accuracy Master', icon: Target, desc: 'Perfect typing - zero mistakes allowed', color: 'from-indigo-500 to-purple-500' },
    'survival-mode': { name: 'Survival Mode', icon: Heart, desc: 'Type to stay alive as long as possible', color: 'from-pink-500 to-rose-500' },
    'rhythm-typing': { name: 'Rhythm Typing', icon: Music, desc: 'Type to the beat of the music', color: 'from-purple-500 to-blue-500' },
    'bomb-defuser': { name: 'Bomb Defuser', icon: Bomb, desc: 'Defuse bombs by typing the code quickly', color: 'from-red-600 to-yellow-500' },
    'ice-breaker': { name: 'Ice Breaker', icon: Snowflake, desc: 'Melt ice blocks with hot typing', color: 'from-blue-400 to-cyan-300' },
    'code-ninja': { name: 'Code Ninja', icon: Code, desc: 'Type code snippets like a ninja', color: 'from-gray-700 to-gray-900' },
    'story-weaver': { name: 'Story Weaver', icon: BookOpen, desc: 'Complete stories by typing missing words', color: 'from-amber-500 to-orange-500' },
    'time-attack': { name: 'Time Attack', icon: Timer, desc: 'Race against countdown timer', color: 'from-red-500 to-pink-500' },
    'combo-master': { name: 'Combo Master', icon: Award, desc: 'Build massive typing combos', color: 'from-violet-500 to-purple-500' },
    'endless-runner': { name: 'Endless Runner', icon: Rocket, desc: 'Keep running by typing continuously', color: 'from-green-400 to-blue-500' },
    'typing-olympics': { name: 'Typing Olympics', icon: Trophy, desc: 'Complete multiple typing events', color: 'from-yellow-400 to-yellow-600' }
  };

  const gameWords = {
    english: {
      easy: ['cat', 'dog', 'sun', 'fun', 'run', 'big', 'red', 'blue', 'tree', 'book', 'love', 'home', 'time', 'good', 'day'],
      medium: ['happy', 'computer', 'keyboard', 'typing', 'practice', 'learning', 'challenge', 'victory', 'success', 'improve'],
      hard: ['programming', 'technology', 'development', 'algorithm', 'efficiency', 'productivity', 'optimization', 'performance', 'competitive', 'professional']
    },
    hindi: {
      easy: ['घर', 'पानी', 'आम', 'सूरज', 'चाँद', 'फूल', 'पेड़', 'किताब', 'प्यार', 'समय'],
      medium: ['कंप्यूटर', 'टाइपिंग', 'अभ्यास', 'विद्यालय', 'प्रगति', 'सफलता', 'चुनौती', 'विकास'],
      hard: ['तकनीकी', 'प्रौद्योगिकी', 'विकास', 'कुशलता', 'उत्पादकता', 'अनुकूलन', 'प्रतिस्पर्धा', 'व्यावसायिक']
    }
  };

  const storyParts = [
    "Once upon a time, in a land far away,",
    "there lived a brave knight who loved",
    "to type faster than the speed of light.",
    "Every day, the knight would practice",
    "typing on an ancient magical keyboard",
    "that could cast spells with every word."
  ];

  const codeSnippets = [
    'function hello() { return "world"; }',
    'const array = [1, 2, 3, 4, 5];',
    'if (condition) { execute(); }',
    'for (let i = 0; i < 10; i++) {}',
    'const result = await fetch(url);',
    'element.addEventListener("click", handler);'
  ];

  const getGameText = useCallback(() => {
    const words = gameWords[language as keyof typeof gameWords][difficulty as keyof typeof gameWords.english];
    
    switch (gameType) {
      case 'letter-rain':
        return String.fromCharCode(65 + Math.floor(Math.random() * 26));
      case 'bubble-pop':
        return words[Math.floor(Math.random() * words.length)];
      case 'typing-warrior':
        return words[Math.floor(Math.random() * words.length)];
      case 'story-weaver':
        return storyParts[phraseIndex] || storyParts[0];
      case 'code-ninja':
        return codeSnippets[Math.floor(Math.random() * codeSnippets.length)];
      case 'bomb-defuser':
        return Math.random().toString(36).substring(2, 8).toUpperCase();
      default:
        return words[Math.floor(Math.random() * words.length)];
    }
  }, [gameType, language, difficulty, phraseIndex]);

  const spawnFallingLetter = useCallback(() => {
    if (gameType === 'letter-rain') {
      const newLetter: FallingLetter = {
        id: Date.now() + Math.random(),
        letter: String.fromCharCode(65 + Math.floor(Math.random() * 26)),
        x: Math.random() * 90,
        y: 0,
        speed: 1 + Math.random() * 2
      };
      setFallingLetters(prev => [...prev, newLetter]);
    }
  }, [gameType]);

  const spawnBubble = useCallback(() => {
    if (gameType === 'bubble-pop') {
      const words = gameWords[language as keyof typeof gameWords][difficulty as keyof typeof gameWords.english];
      const newBubble: Bubble = {
        id: Date.now() + Math.random(),
        word: words[Math.floor(Math.random() * words.length)],
        x: Math.random() * 80,
        y: 20 + Math.random() * 60,
        size: 60 + Math.random() * 40
      };
      setBubbles(prev => [...prev, newBubble]);
    }
  }, [gameType, language, difficulty]);

  const spawnEnemy = useCallback(() => {
    if (gameType === 'typing-warrior') {
      const words = gameWords[language as keyof typeof gameWords][difficulty as keyof typeof gameWords.english];
      const word = words[Math.floor(Math.random() * words.length)];
      const newEnemy: Enemy = {
        id: Date.now() + Math.random(),
        word,
        x: Math.random() * 80,
        health: word.length,
        maxHealth: word.length
      };
      setEnemies(prev => [...prev, newEnemy]);
    }
  }, [gameType, language, difficulty]);

  const spawnBomb = useCallback(() => {
    if (gameType === 'bomb-defuser') {
      const newBomb: FallingLetter = {
        id: Date.now() + Math.random(),
        letter: Math.random().toString(36).substring(2, 6).toUpperCase(),
        x: Math.random() * 90,
        y: 0,
        speed: 0.5 + Math.random()
      };
      setBombs(prev => [...prev, newBomb]);
    }
  }, [gameType]);

  const calculateAccuracy = useCallback(() => {
    if (totalKeystrokes === 0) return;
    const netAccuracy = ((correctKeystrokes) / totalKeystrokes) * 100;
    const grossAccuracy = ((correctKeystrokes) / (totalKeystrokes + backspaceCount)) * 100;
    setAccuracy(Math.max(0, netAccuracy));
    setGrossAccuracy(Math.max(0, grossAccuracy));
  }, [totalKeystrokes, correctKeystrokes, backspaceCount]);

  const calculateWPM = useCallback(() => {
    if (!startTime) return;
    const timeElapsed = (Date.now() - startTime) / 1000 / 60;
    const wordsTyped = correctKeystrokes / 5;
    setWpm(Math.round(wordsTyped / timeElapsed));
  }, [startTime, correctKeystrokes]);

  const startGame = () => {
    setIsGameActive(true);
    setIsGameOver(false);
    setCurrentText(getGameText());
    setTypedText('');
    setScore(0);
    setLives(3);
    setLevel(1);
    setTimeLeft(gameType === 'speed-burst' ? 30 : 60);
    setWordsCompleted(0);
    setAccuracy(100);
    setGrossAccuracy(100);
    setTotalKeystrokes(0);
    setCorrectKeystrokes(0);
    setErrors(0);
    setBackspaceCount(0);
    setWpm(0);
    setStartTime(Date.now());
    
    // Reset game-specific states
    setFallingLetters([]);
    setBubbles([]);
    setEnemies([]);
    setCombo(0);
    setStreak(0);
    setMultiplier(1);
    setRhythm(0);
    setEnergy(100);
    setTemperature(50);
    setPhraseIndex(0);
    setBombs([]);
    setParticles([]);
    
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  };

  const resetGame = () => {
    setIsGameActive(false);
    setIsGameOver(false);
    setCurrentText('');
    setTypedText('');
    setScore(0);
    setLives(3);
    setLevel(1);
    setTimeLeft(60);
    setWordsCompleted(0);
    setAccuracy(100);
    setGrossAccuracy(100);
    setTotalKeystrokes(0);
    setCorrectKeystrokes(0);
    setErrors(0);
    setBackspaceCount(0);
    setWpm(0);
    setStartTime(null);
    
    // Reset game-specific states
    setFallingLetters([]);
    setBubbles([]);
    setEnemies([]);
    setCombo(0);
    setStreak(0);
    setMultiplier(1);
    setRhythm(0);
    setEnergy(100);
    setTemperature(50);
    setPhraseIndex(0);
    setBombs([]);
    setParticles([]);
  };

  const nextText = () => {
    if (gameType === 'story-weaver') {
      setPhraseIndex(prev => (prev + 1) % storyParts.length);
    }
    setCurrentText(getGameText());
    setTypedText('');
    setWordsCompleted(prev => prev + 1);
    
    if ((wordsCompleted + 1) % 10 === 0) {
      setLevel(prev => prev + 1);
      setMultiplier(prev => prev + 0.5);
    }
  };

  const handleGameOver = () => {
    setIsGameActive(false);
    setIsGameOver(true);
  };

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isGameActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleGameOver();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isGameActive, timeLeft]);

  // Game animations and spawning
  useEffect(() => {
    if (!isGameActive) return;

    const spawnInterval = setInterval(() => {
      if (gameType === 'letter-rain') spawnFallingLetter();
      if (gameType === 'bubble-pop') spawnBubble();
      if (gameType === 'typing-warrior') spawnEnemy();
      if (gameType === 'bomb-defuser') spawnBomb();
    }, 2000);

    const animationInterval = setInterval(() => {
      // Update falling letters
      setFallingLetters(prev => prev.map(letter => ({
        ...letter,
        y: letter.y + letter.speed
      })).filter(letter => letter.y < 100));

      // Update bombs
      setBombs(prev => prev.map(bomb => ({
        ...bomb,
        y: bomb.y + bomb.speed
      })).filter(bomb => bomb.y < 100));

      // Update rhythm
      if (gameType === 'rhythm-typing') {
        setRhythm(prev => (prev + 1) % 100);
      }

      // Update temperature
      if (gameType === 'ice-breaker') {
        setTemperature(prev => Math.max(0, prev - 0.5));
      }
    }, 100);

    return () => {
      clearInterval(spawnInterval);
      clearInterval(animationInterval);
    };
  }, [isGameActive, gameType, spawnFallingLetter, spawnBubble, spawnEnemy, spawnBomb]);

  // Calculate metrics
  useEffect(() => {
    calculateAccuracy();
    calculateWPM();
  }, [calculateAccuracy, calculateWPM]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isGameActive || isGameOver) return;

    const value = e.target.value;
    const prevLength = typedText.length;
    
    if (value.length < prevLength) {
      setBackspaceCount(prev => prev + 1);
      setTypedText(value);
      return;
    }

    const newChar = value[value.length - 1];
    const expectedChar = currentText[value.length - 1];
    
    setTotalKeystrokes(prev => prev + 1);
    
    if (newChar === expectedChar) {
      setCorrectKeystrokes(prev => prev + 1);
      setStreak(prev => prev + 1);
      setCombo(prev => prev + 1);
      
      // Game-specific effects
      if (gameType === 'ice-breaker') {
        setTemperature(prev => Math.min(100, prev + 2));
      }
      if (gameType === 'rhythm-typing') {
        setEnergy(prev => Math.min(100, prev + 1));
      }
    } else {
      setErrors(prev => prev + 1);
      setStreak(0);
      setCombo(0);
      
      if (gameType === 'accuracy-master') {
        setLives(prev => {
          const newLives = prev - 1;
          if (newLives <= 0) {
            handleGameOver();
            return 0;
          }
          return newLives;
        });
      }
    }
    
    setTypedText(value);

    // Handle game completion
    if (value === currentText) {
      const points = currentText.length * level * multiplier * (accuracy / 100);
      setScore(prev => prev + Math.round(points));
      
      // Game-specific completions
      if (gameType === 'letter-rain') {
        setFallingLetters(prev => prev.filter(letter => letter.letter !== currentText));
      } else if (gameType === 'bubble-pop') {
        setBubbles(prev => prev.filter(bubble => bubble.word !== currentText));
      } else if (gameType === 'typing-warrior') {
        setEnemies(prev => prev.map(enemy => 
          enemy.word === currentText 
            ? { ...enemy, health: enemy.health - 1 }
            : enemy
        ).filter(enemy => enemy.health > 0));
      } else if (gameType === 'bomb-defuser') {
        setBombs(prev => prev.filter(bomb => bomb.letter !== currentText));
      }
      
      nextText();
    }
  };

  const getCharacterClass = (index: number) => {
    if (index < typedText.length) {
      return typedText[index] === currentText[index] ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100';
    }
    if (index === typedText.length) {
      return 'bg-blue-200 animate-pulse';
    }
    return 'text-gray-600';
  };

  const getProgressValue = () => {
    switch (gameType) {
      case 'speed-burst':
        return ((30 - timeLeft) / 30) * 100;
      case 'rhythm-typing':
        return energy;
      case 'ice-breaker':
        return temperature;
      case 'survival-mode':
        return (lives / 3) * 100;
      default:
        return (typedText.length / currentText.length) * 100;
    }
  };

  const renderGameArea = () => {
    const currentGame = gameTypes[gameType as keyof typeof gameTypes];
    
    return (
      <div className={`relative overflow-hidden rounded-lg min-h-[400px] bg-gradient-to-br ${currentGame.color} p-6`}>
        {/* Game-specific UI elements */}
        {gameType === 'letter-rain' && (
          <div className="absolute inset-0">
            {fallingLetters.map(letter => (
              <div
                key={letter.id}
                className="absolute text-white text-3xl font-bold animate-pulse"
                style={{
                  left: `${letter.x}%`,
                  top: `${letter.y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                {letter.letter}
              </div>
            ))}
          </div>
        )}

        {gameType === 'bubble-pop' && (
          <div className="absolute inset-0">
            {bubbles.map(bubble => (
              <div
                key={bubble.id}
                className="absolute bg-white bg-opacity-30 rounded-full flex items-center justify-center text-white font-bold animate-bounce"
                style={{
                  left: `${bubble.x}%`,
                  top: `${bubble.y}%`,
                  width: `${bubble.size}px`,
                  height: `${bubble.size}px`,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                {bubble.word}
              </div>
            ))}
          </div>
        )}

        {gameType === 'typing-warrior' && (
          <div className="absolute inset-0">
            {enemies.map(enemy => (
              <div
                key={enemy.id}
                className="absolute bg-red-600 rounded-lg p-4 text-white font-bold"
                style={{
                  left: `${enemy.x}%`,
                  top: '50%',
                  transform: 'translate(-50%, -50%)'
                }}
              >
                <div className="text-center">{enemy.word}</div>
                <div className="w-full bg-red-300 rounded-full h-2 mt-2">
                  <div
                    className="bg-red-600 h-2 rounded-full"
                    style={{ width: `${(enemy.health / enemy.maxHealth) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {gameType === 'bomb-defuser' && (
          <div className="absolute inset-0">
            {bombs.map(bomb => (
              <div
                key={bomb.id}
                className="absolute text-red-600 text-2xl font-bold animate-pulse"
                style={{
                  left: `${bomb.x}%`,
                  top: `${bomb.y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                💣 {bomb.letter}
              </div>
            ))}
          </div>
        )}

        {gameType === 'rhythm-typing' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="w-32 h-32 rounded-full border-4 border-white animate-pulse"
              style={{
                transform: `scale(${1 + Math.sin(rhythm * 0.1) * 0.2})`,
                borderColor: energy > 50 ? '#10b981' : '#ef4444'
              }}
            />
          </div>
        )}

        {gameType === 'ice-breaker' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`text-6xl ${temperature > 50 ? 'animate-bounce' : ''}`}>
              {temperature > 50 ? '🔥' : '🧊'}
            </div>
          </div>
        )}

        {/* Main text display - always shown */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full">
          <div className="text-2xl md:text-4xl font-mono font-bold mb-4 p-4 bg-black bg-opacity-20 rounded-lg backdrop-blur-sm">
            {currentText.split('').map((char, index) => (
              <span
                key={index}
                className={`${getCharacterClass(index)} px-1 py-0.5 rounded text-white`}
              >
                {char === ' ' ? '\u00A0' : char}
              </span>
            ))}
          </div>
          
          {/* Game-specific indicators */}
          {combo > 5 && (
            <div className="text-yellow-300 font-bold text-xl animate-pulse">
              COMBO x{combo}!
            </div>
          )}
          
          {streak > 10 && (
            <div className="text-green-300 font-bold text-lg">
              STREAK: {streak}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Game Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gamepad2 className="h-5 w-5" />
            15+ Unique Typing Games
          </CardTitle>
          <CardDescription>
            Each game offers a completely different typing experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Game Type</label>
              <Select value={gameType} onValueChange={setGameType} disabled={isGameActive}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-60 overflow-y-auto">
                  {Object.entries(gameTypes).map(([key, game]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <game.icon className="h-4 w-4" />
                        {game.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Language</label>
              <Select value={language} onValueChange={setLanguage} disabled={isGameActive}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="hindi">हिंदी</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Difficulty</label>
              <Select value={difficulty} onValueChange={setDifficulty} disabled={isGameActive}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-2">
              <Button onClick={startGame} disabled={isGameActive} className="flex-1">
                <Play className="h-4 w-4 mr-2" />
                Start Game
              </Button>
              <Button variant="outline" onClick={resetGame}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Game Description */}
          {gameType && (
            <div className={`p-4 rounded-lg bg-gradient-to-r ${gameTypes[gameType as keyof typeof gameTypes].color} text-white`}>
              <div className="flex items-center gap-2 mb-2">
                {React.createElement(gameTypes[gameType as keyof typeof gameTypes].icon, { className: "h-5 w-5" })}
                <h4 className="font-bold text-lg">{gameTypes[gameType as keyof typeof gameTypes].name}</h4>
              </div>
              <p className="text-white/90">{gameTypes[gameType as keyof typeof gameTypes].desc}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Game Stats */}
      {isGameActive || isGameOver ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <div>
                  <p className="text-xl font-bold">{score}</p>
                  <p className="text-xs text-muted-foreground">Score</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-xl font-bold">{wpm}</p>
                  <p className="text-xs text-muted-foreground">WPM</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-xl font-bold">{accuracy.toFixed(1)}%</p>
                  <p className="text-xs text-muted-foreground">Net Accuracy</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-purple-500" />
                <div>
                  <p className="text-xl font-bold">{grossAccuracy.toFixed(1)}%</p>
                  <p className="text-xs text-muted-foreground">Gross Accuracy</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div>
                <p className="text-xl font-bold">{wordsCompleted}</p>
                <p className="text-xs text-muted-foreground">Words</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div>
                <p className="text-xl font-bold">{combo}</p>
                <p className="text-xs text-muted-foreground">Combo</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div>
                <p className="text-xl font-bold">{timeLeft}s</p>
                <p className="text-xs text-muted-foreground">Time Left</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div>
                <p className="text-sm font-medium mb-2">Progress</p>
                <Progress value={getProgressValue()} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">{getProgressValue().toFixed(0)}%</p>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* Game Area */}
      {currentText && (isGameActive || isGameOver) ? (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Game Arena</CardTitle>
              <div className="flex gap-2">
                {isGameOver && (
                  <Badge variant="destructive">Game Over</Badge>
                )}
                {isGameActive && (
                  <Badge variant="default" className="bg-green-500">Playing</Badge>
                )}
                {lives < 3 && gameType === 'accuracy-master' && (
                  <div className="flex gap-1">
                    {Array.from({ length: lives }, (_, i) => (
                      <Heart key={i} className="h-4 w-4 text-red-500 fill-current" />
                    ))}
                  </div>
                )}
                <Badge variant="outline">Level {level}</Badge>
                <Badge variant="outline">x{multiplier.toFixed(1)}</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Game Area */}
            <div ref={gameAreaRef}>
              {renderGameArea()}
            </div>

            {/* Input */}
            <div className="max-w-md mx-auto">
              <input
                ref={inputRef}
                type="text"
                value={typedText}
                onChange={handleInputChange}
                className="w-full p-4 border rounded-lg text-xl text-center font-mono focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder={isGameActive ? "Type here..." : "Game Over"}
                disabled={!isGameActive}
                autoFocus={isGameActive}
                autoComplete="off"
                spellCheck="false"
              />
            </div>

            {/* Game Over Results */}
            {isGameOver && (
              <div className="text-center p-6 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <h3 className="text-2xl font-bold mb-4">Game Complete!</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm max-w-2xl mx-auto mb-6">
                  <div>
                    <p className="text-muted-foreground">Final Score</p>
                    <p className="text-xl font-bold">{score}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">WPM</p>
                    <p className="text-xl font-bold">{wpm}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Net Accuracy</p>
                    <p className="text-xl font-bold">{accuracy.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Gross Accuracy</p>
                    <p className="text-xl font-bold">{grossAccuracy.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Max Combo</p>
                    <p className="text-xl font-bold">{combo}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Max Streak</p>
                    <p className="text-xl font-bold">{streak}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Level Reached</p>
                    <p className="text-xl font-bold">{level}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Multiplier</p>
                    <p className="text-xl font-bold">x{multiplier.toFixed(1)}</p>
                  </div>
                </div>
                <Button onClick={startGame} className="mt-4">
                  Play Again
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <Gamepad2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Choose Your Adventure!</h3>
            <p className="text-muted-foreground mb-4">
              Each game offers a unique typing experience with different mechanics and visuals
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-w-md mx-auto text-xs text-muted-foreground">
              <div>• Unique Gameplay</div>
              <div>• Visual Effects</div>
              <div>• Score Multipliers</div>
              <div>• Combo Systems</div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Accuracy Explanation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Understanding Game Mechanics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
              <h4 className="font-medium mb-2 text-green-700 dark:text-green-300">Net Accuracy</h4>
              <p className="text-muted-foreground">
                Raw typing accuracy without counting corrections. Shows your pure typing skill.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <h4 className="font-medium mb-2 text-blue-700 dark:text-blue-300">Gross Accuracy</h4>
              <p className="text-muted-foreground">
                Includes time spent on corrections. More realistic measure of practical typing speed.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20">
              <h4 className="font-medium mb-2 text-purple-700 dark:text-purple-300">Combo System</h4>
              <p className="text-muted-foreground">
                Build streaks for score multipliers. Each correct keystroke increases your combo!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TypingGames;
