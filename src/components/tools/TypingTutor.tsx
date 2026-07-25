'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Keyboard, RotateCcw, Trophy, Target, Timer, Hand, BookOpen, Code, Users, Calendar, Lightbulb } from 'lucide-react';

const TypingTutor = () => {
  const [mode, setMode] = useState('beginner'); // beginner, advanced, custom
  const [language, setLanguage] = useState('english');
  const [currentLesson, setCurrentLesson] = useState(1);
  const [lessonType, setLessonType] = useState('homerow');
  const [currentText, setCurrentText] = useState('');
  const [typedText, setTypedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [isCompleted, setIsCompleted] = useState(false);
  const [errors, setErrors] = useState(0);
  const [slowMode, setSlowMode] = useState(false);
  const [showHints, setShowHints] = useState(true);
  const [customText, setCustomText] = useState('');
  const [testDuration, setTestDuration] = useState(60);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [activeKey, setActiveKey] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const beginnerLessons = {
    homerow: {
      1: 'asdf jkl;',
      2: 'asdf jkl; asdf jkl;',
      3: 'sad lad ask dad',
      4: 'fallask dad sad lad',
      5: 'a sad lad asks dad'
    },
    toprow: {
      1: 'qwer uiop',
      2: 'quit work upper power',
      3: 'we pour water quite quietly',
      4: 'power upper quit work water',
      5: 'quiet workers pour water'
    },
    bottomrow: {
      1: 'zxcv bnm,',
      2: 'zoom box cave',
      3: 'move box cave zoom',
      4: 'brave box move cave zoom',
      5: 'move the brave box'
    },
    numbers: {
      1: '1234 5678 90',
      2: '123 456 789 0',
      3: 'call 123-456-7890',
      4: 'room 1234 floor 56',
      5: 'year 2024 month 12'
    }
  };

  const fingerColors = {
    'q': '#ff6b6b', 'a': '#ff6b6b', 'z': '#ff6b6b',
    'w': '#4ecdc4', 's': '#4ecdc4', 'x': '#4ecdc4',
    'e': '#45b7d1', 'd': '#45b7d1', 'c': '#45b7d1',
    'r': '#96ceb4', 'f': '#96ceb4', 'v': '#96ceb4',
    't': '#96ceb4', 'g': '#96ceb4', 'b': '#96ceb4',
    'y': '#feca57', 'h': '#feca57', 'n': '#feca57',
    'u': '#ff9ff3', 'j': '#ff9ff3', 'm': '#ff9ff3',
    'i': '#54a0ff', 'k': '#54a0ff', ',': '#54a0ff',
    'o': '#5f27cd', 'l': '#5f27cd', '.': '#5f27cd',
    'p': '#00d2d3', ';': '#00d2d3', '/': '#00d2d3',
    ' ': '#ddd'
  };

  const keyboardLayout = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/'],
    [' ']
  ];

  const codeSnippets = {
    html: '<div class="container"><h1>Hello World</h1></div>',
    css: '.container { display: flex; justify-content: center; }',
    javascript: 'function greet(name) { return `Hello, ${name}!`; }',
    python: 'def fibonacci(n): return n if n <= 1 else fibonacci(n-1) + fibonacci(n-2)'
  };

  const getLessonText = () => {
    if (mode === 'custom') return customText;
    if (mode === 'code') return codeSnippets.javascript;
    
    const lessons = beginnerLessons[lessonType as keyof typeof beginnerLessons];
    return lessons[currentLesson as keyof typeof lessons] || lessons[1];
  };

  const startLesson = () => {
    const newText = getLessonText();
    setCurrentText(newText);
    setTypedText('');
    setCurrentIndex(0);
    setStartTime(new Date());
    setWpm(0);
    setAccuracy(100);
    setIsCompleted(false);
    setErrors(0);
    
    if (mode === 'speedtest') {
      setTimeLeft(testDuration);
      setIsTimerActive(true);
    }
    
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    if (slowMode && value.length > typedText.length + 1) {
      return; // Prevent fast typing in slow mode
    }
    
    setTypedText(value);

    if (value.length <= currentText.length) {
      setCurrentIndex(value.length);
      
      // Set active key for visual feedback
      if (value.length < currentText.length) {
        setActiveKey(currentText[value.length]);
      }

      // Calculate errors
      let errorCount = 0;
      for (let i = 0; i < value.length; i++) {
        if (value[i] !== currentText[i]) {
          errorCount++;
        }
      }
      setErrors(errorCount);

      // Calculate accuracy
      const accuracyPercentage = value.length > 0 ? ((value.length - errorCount) / value.length) * 100 : 100;
      setAccuracy(Math.round(accuracyPercentage));

      // Calculate WPM
      if (startTime) {
        const timeElapsed = (new Date().getTime() - startTime.getTime()) / 1000 / 60;
        const wordsTyped = value.trim().split(' ').length;
        const currentWpm = timeElapsed > 0 ? Math.round(wordsTyped / timeElapsed) : 0;
        setWpm(currentWpm);
      }

      // Check completion
      if (value === currentText) {
        setIsCompleted(true);
        setIsTimerActive(false);
        if (mode === 'beginner' && currentLesson < 5) {
          // Auto-unlock next lesson if accuracy > 90%
          if (accuracy > 90) {
            setTimeout(() => {
              setCurrentLesson(prev => prev + 1);
            }, 2000);
          }
        }
      }
    }
  };

  // Timer effect for speed tests
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => {
          if (time <= 1) {
            setIsTimerActive(false);
            setIsCompleted(true);
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timeLeft]);

  const resetLesson = () => {
    setTypedText('');
    setCurrentIndex(0);
    setStartTime(new Date());
    setWpm(0);
    setAccuracy(100);
    setIsCompleted(false);
    setErrors(0);
    setIsTimerActive(false);
    setTimeLeft(testDuration);
    setActiveKey('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const getCharacterClass = (index: number) => {
    if (index < typedText.length) {
      const isCorrect = typedText[index] === currentText[index];
      return isCorrect ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100 animate-pulse';
    } else if (index === currentIndex) {
      return 'bg-blue-200 border-b-2 border-blue-500 animate-pulse';
    }
    return 'text-gray-600';
  };

  const progress = currentText ? (currentIndex / currentText.length) * 100 : 0;
  const timeProgress = mode === 'speedtest' ? ((testDuration - timeLeft) / testDuration) * 100 : 0;

  const renderKeyboard = () => (
    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
      <h3 className="text-sm font-medium mb-3 text-center">Virtual Keyboard - Finger Guide</h3>
      <div className="space-y-2">
        {keyboardLayout.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center gap-1">
            {row.map((key) => (
              <div
                key={key}
                className={`
                  px-3 py-2 rounded text-center text-sm font-mono border-2 transition-all
                  ${key === ' ' ? 'w-32' : 'w-8'}
                  ${activeKey === key ? 'ring-2 ring-blue-500 scale-110' : ''}
                  ${key === activeKey ? 'bg-blue-200' : ''}
                `}
                style={{ 
                  backgroundColor: fingerColors[key as keyof typeof fingerColors] || '#e5e7eb',
                  color: key === activeKey ? '#1e40af' : '#374151'
                }}
              >
                {key === ' ' ? 'SPACE' : key.toUpperCase()}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="mt-3 text-xs text-center text-muted-foreground">
        Each color represents a different finger. Follow the colors to learn proper finger placement!
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Mode Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Choose Your Learning Path
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={mode} onValueChange={setMode} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="beginner" className="flex items-center gap-2">
                <Hand className="h-4 w-4" />
                Beginner
              </TabsTrigger>
              <TabsTrigger value="speedtest" className="flex items-center gap-2">
                <Timer className="h-4 w-4" />
                Speed Test
              </TabsTrigger>
              <TabsTrigger value="code" className="flex items-center gap-2">
                <Code className="h-4 w-4" />
                Code Practice
              </TabsTrigger>
              <TabsTrigger value="custom" className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                Custom Text
              </TabsTrigger>
            </TabsList>

            <TabsContent value="beginner" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Lesson Type</label>
                  <Select value={lessonType} onValueChange={setLessonType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="homerow">Home Row (ASDF JKL;)</SelectItem>
                      <SelectItem value="toprow">Top Row (QWER UIOP)</SelectItem>
                      <SelectItem value="bottomrow">Bottom Row (ZXCV BNM)</SelectItem>
                      <SelectItem value="numbers">Numbers (1234 5678)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Lesson Level</label>
                  <Select value={currentLesson.toString()} onValueChange={(v) => setCurrentLesson(parseInt(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Level 1 - Basic Keys</SelectItem>
                      <SelectItem value="2">Level 2 - Key Combinations</SelectItem>
                      <SelectItem value="3">Level 3 - Simple Words</SelectItem>
                      <SelectItem value="4">Level 4 - Word Combinations</SelectItem>
                      <SelectItem value="5">Level 5 - Sentences</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch id="slow-mode" checked={slowMode} onCheckedChange={setSlowMode} />
                    <label htmlFor="slow-mode" className="text-sm">Slow Mode</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="hints" checked={showHints} onCheckedChange={setShowHints} />
                    <label htmlFor="hints" className="text-sm">Show Hints</label>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="speedtest" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Test Duration</label>
                  <Select value={testDuration.toString()} onValueChange={(v) => setTestDuration(parseInt(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="60">1 Minute</SelectItem>
                      <SelectItem value="180">3 Minutes</SelectItem>
                      <SelectItem value="300">5 Minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Language</label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="hindi">हिंदी</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="custom" className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Your Custom Text</label>
                <textarea
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  className="w-full p-3 border rounded-lg min-h-[100px]"
                  placeholder="Paste your text here (articles, emails, documents)..."
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-center mt-6">
            <Button onClick={startLesson} size="lg" className="px-8">
              Start {mode === 'beginner' ? 'Lesson' : mode === 'speedtest' ? 'Speed Test' : 'Practice'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      {currentText && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Timer className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{mode === 'speedtest' ? timeLeft : wpm}</p>
                  <p className="text-xs text-muted-foreground">{mode === 'speedtest' ? 'Seconds' : 'WPM'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{accuracy}%</p>
                  <p className="text-xs text-muted-foreground">Accuracy</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold">{errors}</p>
                  <p className="text-xs text-muted-foreground">Errors</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div>
                <p className="text-sm font-medium mb-2">
                  {mode === 'speedtest' ? 'Time Progress' : 'Text Progress'}
                </p>
                <Progress value={mode === 'speedtest' ? timeProgress : progress} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {Math.round(mode === 'speedtest' ? timeProgress : progress)}%
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm font-medium mb-1">Level {currentLesson}</p>
                <Badge variant={accuracy > 90 ? "default" : "secondary"}>
                  {accuracy > 90 ? "Excellent!" : "Keep Going!"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Keyboard Guide for Beginners */}
      {mode === 'beginner' && showHints && renderKeyboard()}

      {/* Typing Area */}
      {currentText && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>
                {mode === 'beginner' ? `Lesson ${currentLesson}: ${lessonType}` : 
                 mode === 'speedtest' ? 'Speed Test' : 
                 mode === 'code' ? 'Code Practice' : 'Custom Practice'}
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={resetLesson}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
                {isCompleted && (
                  <Badge variant="default" className="bg-green-500">
                    <Trophy className="h-4 w-4 mr-1" />
                    {mode === 'beginner' && accuracy > 90 ? 'Level Unlocked!' : 'Completed!'}
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Text Display */}
            <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-900">
              <div className="text-lg leading-relaxed font-mono">
                {currentText.split('').map((char, index) => (
                  <span
                    key={index}
                    className={`${getCharacterClass(index)} px-0.5 rounded transition-all`}
                  >
                    {char === ' ' ? '\u00A0' : char}
                  </span>
                ))}
              </div>
            </div>

            {/* Input */}
            <input
              ref={inputRef}
              type="text"
              value={typedText}
              onChange={handleInputChange}
              className="w-full p-3 border rounded-lg text-lg font-mono focus:ring-2 focus:ring-primary"
              placeholder={mode === 'beginner' ? "Type the highlighted letters..." : "Start typing here..."}
              disabled={isCompleted || (mode === 'speedtest' && timeLeft === 0)}
              autoFocus
            />

            {/* Instructions */}
            <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div>
                <h4 className="font-medium mb-2">Typing Tips:</h4>
                <ul className="space-y-1">
                  <li>• Keep your wrists straight and hands relaxed</li>
                  <li>• Use all fingers and maintain home row position</li>
                  <li>• Focus on accuracy first, speed will follow</li>
                  <li>• Take breaks every 15-20 minutes</li>
                </ul>
              </div>
              {mode === 'beginner' && (
                <div>
                  <h4 className="font-medium mb-2">Current Lesson Goals:</h4>
                  <ul className="space-y-1">
                    <li>• Target accuracy: 90%+</li>
                    <li>• Maintain steady rhythm</li>
                    <li>• Complete without looking at keyboard</li>
                    <li>• Progress to unlock next level</li>
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Start Message */}
      {!currentText && (
        <Card className="text-center py-12">
          <CardContent>
            <Keyboard className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Welcome to Modern Typing Tutor!</h3>
            <p className="text-muted-foreground mb-4">
              Choose your learning path above and start your typing journey
            </p>
            <div className="grid md:grid-cols-3 gap-4 max-w-2xl mx-auto text-sm">
              <div className="p-3 border rounded-lg">
                <Hand className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                <h4 className="font-medium">Beginner Lessons</h4>
                <p className="text-muted-foreground">Step-by-step finger placement</p>
              </div>
              <div className="p-3 border rounded-lg">
                <Timer className="h-6 w-6 mx-auto mb-2 text-green-500" />
                <h4 className="font-medium">Speed Tests</h4>
                <p className="text-muted-foreground">Measure your WPM progress</p>
              </div>
              <div className="p-3 border rounded-lg">
                <Code className="h-6 w-6 mx-auto mb-2 text-purple-500" />
                <h4 className="font-medium">Code Practice</h4>
                <p className="text-muted-foreground">For developers and programmers</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TypingTutor;
