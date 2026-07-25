'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { RotateCcw, HelpCircle } from 'lucide-react';

const YesNoGenerator = () => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState<{ question: string, answer: string }[]>([]);
  const [stats, setStats] = useState({ yes: 0, no: 0 });

  const generateAnswer = async () => {
    if (!question.trim()) return;
    
    setIsGenerating(true);
    setAnswer(null);

    setTimeout(() => {
      const result = Math.random() < 0.5 ? 'Yes' : 'No';
      setAnswer(result);
      
      setHistory(prev => [{
        question: question.trim(),
        answer: result
      }, ...prev.slice(0, 9)]); // Keep last 10 questions
      
      setStats(prev => ({
        ...prev,
        [result.toLowerCase() as 'yes' | 'no']: prev[result.toLowerCase() as 'yes' | 'no'] + 1
      }));
      
      setIsGenerating(false);
    }, 800);
  };

  const reset = () => {
    setQuestion('');
    setAnswer(null);
    setHistory([]);
    setStats({ yes: 0, no: 0 });
  };

  const quickQuestions = [
    "Should I do it?",
    "Is it a good idea?",
    "Will it work out?",
    "Should I take the risk?",
    "Is now the right time?"
  ];

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Ask Your Question
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label>Your Question</Label>
              <Input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Type your yes/no question here..."
                className="mt-2"
                onKeyPress={(e) => e.key === 'Enter' && generateAnswer()}
              />
            </div>

            <div>
              <Label className="text-sm">Quick Questions:</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {quickQuestions.map((q, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => setQuestion(q)}
                    className="text-xs"
                  >
                    {q}
                  </Button>
                ))}
              </div>
            </div>

            <div className="text-center space-y-4">
              {answer && !isGenerating && (
                <div className="space-y-3">
                  <div className={`text-6xl font-bold ${answer === 'Yes' ? 'text-green-500' : 'text-red-500'}`}>
                    {answer}
                  </div>
                  <Badge 
                    variant={answer === 'Yes' ? 'default' : 'destructive'}
                    className="text-lg px-4 py-2"
                  >
                    {answer}
                  </Badge>
                </div>
              )}

              {isGenerating && (
                <div className="space-y-3">
                  <div className="text-4xl animate-bounce">🤔</div>
                  <div className="text-lg text-muted-foreground">Thinking...</div>
                </div>
              )}

              {!answer && !isGenerating && (
                <div className="text-4xl text-muted-foreground">❓</div>
              )}
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={generateAnswer} 
                disabled={!question.trim() || isGenerating}
                className="flex-1"
              >
                {isGenerating ? 'Deciding...' : 'Get Answer'}
              </Button>
              <Button onClick={reset} variant="outline">
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Statistics & History</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{stats.yes}</div>
                <div className="text-sm text-muted-foreground">Yes Answers</div>
              </div>
              <div className="text-center p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{stats.no}</div>
                <div className="text-sm text-muted-foreground">No Answers</div>
              </div>
            </div>

            {history.length > 0 && (
              <div>
                <Label className="text-sm font-semibold">Recent Questions:</Label>
                <div className="space-y-2 mt-2 max-h-64 overflow-y-auto">
                  {history.map((item, index) => (
                    <div key={index} className="p-3 bg-muted rounded-lg">
                      <div className="text-sm font-medium mb-1">{item.question}</div>
                      <Badge 
                        variant={item.answer === 'Yes' ? 'default' : 'destructive'}
                        className="text-xs"
                      >
                        {item.answer}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {stats.yes + stats.no > 0 && (
              <div className="text-center text-sm text-muted-foreground">
                Total questions: {stats.yes + stats.no}
              </div>
            )}

            <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <h4 className="font-semibold text-sm mb-2">💡 How to use:</h4>
              <ul className="text-xs space-y-1 text-muted-foreground">
                <li>• Ask clear yes/no questions</li>
                <li>• Use for quick decisions or fun</li>
                <li>• Results are completely random</li>
                <li>• For entertainment purposes only</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default YesNoGenerator;
