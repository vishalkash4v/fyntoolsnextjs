'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { RotateCcw, Dice1 } from 'lucide-react';

const DiceRoller = () => {
  const [diceType, setDiceType] = useState('6');
  const [numberOfDice, setNumberOfDice] = useState('1');
  const [results, setResults] = useState<number[]>([]);
  const [isRolling, setIsRolling] = useState(false);
  const [history, setHistory] = useState<{ dice: string, count: string, results: number[], total: number }[]>([]);

  const diceTypes = [
    { value: '4', label: 'D4 (4-sided)' },
    { value: '6', label: 'D6 (6-sided)' },
    { value: '8', label: 'D8 (8-sided)' },
    { value: '10', label: 'D10 (10-sided)' },
    { value: '12', label: 'D12 (12-sided)' },
    { value: '20', label: 'D20 (20-sided)' },
    { value: '100', label: 'D100 (100-sided)' }
  ];

  const rollDice = async () => {
    setIsRolling(true);
    
    setTimeout(() => {
      const count = parseInt(numberOfDice);
      const sides = parseInt(diceType);
      const newResults: number[] = [];
      
      for (let i = 0; i < count; i++) {
        newResults.push(Math.floor(Math.random() * sides) + 1);
      }
      
      setResults(newResults);
      const total = newResults.reduce((sum, result) => sum + result, 0);
      
      setHistory(prev => [{
        dice: diceType,
        count: numberOfDice,
        results: newResults,
        total
      }, ...prev.slice(0, 4)]); // Keep last 5 rolls
      
      setIsRolling(false);
    }, 800);
  };

  const reset = () => {
    setResults([]);
    setHistory([]);
  };

  const total = results.reduce((sum, result) => sum + result, 0);

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Dice1 className="h-5 w-5" />
              Dice Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label>Dice Type</Label>
                <Select value={diceType} onValueChange={setDiceType}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {diceTypes.map(dice => (
                      <SelectItem key={dice.value} value={dice.value}>
                        {dice.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Number of Dice</Label>
                <Select value={numberOfDice} onValueChange={setNumberOfDice}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 10 }, (_, i) => i + 1).map(num => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} {num === 1 ? 'die' : 'dice'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={rollDice} 
                disabled={isRolling}
                className="flex-1"
              >
                {isRolling ? 'Rolling...' : 'Roll Dice'}
              </Button>
              <Button onClick={reset} variant="outline">
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {results.length > 0 && (
              <div className="space-y-3">
                <div>
                  <Label>Individual Results:</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {results.map((result, index) => (
                      <Badge key={index} variant="default" className="text-lg px-3 py-1">
                        {result}
                      </Badge>
                    ))}
                  </div>
                </div>

                {results.length > 1 && (
                  <div className="text-center p-4 bg-primary/10 rounded-lg">
                    <div className="text-sm text-muted-foreground">Total Sum</div>
                    <div className="text-3xl font-bold text-primary">{total}</div>
                  </div>
                )}
              </div>
            )}

            {isRolling && (
              <div className="text-center py-8">
                <div className="text-lg text-muted-foreground">Rolling dice...</div>
                <div className="animate-bounce text-4xl mt-2">🎲</div>
              </div>
            )}

            {!results.length && !isRolling && (
              <div className="text-center py-8 text-muted-foreground">
                Select your dice settings and click "Roll Dice" to start!
              </div>
            )}

            {history.length > 0 && (
              <div className="mt-6">
                <Label>Recent Rolls:</Label>
                <div className="space-y-2 mt-2">
                  {history.map((roll, index) => (
                    <div key={index} className="p-2 bg-muted rounded text-sm">
                      <div className="flex justify-between items-center">
                        <span>{roll.count}×D{roll.dice}</span>
                        <span className="font-bold">Total: {roll.total}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Results: {roll.results.join(', ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DiceRoller;
