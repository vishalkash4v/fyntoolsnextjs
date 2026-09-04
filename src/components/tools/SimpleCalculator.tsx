'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const SimpleCalculator = () => {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  const inputNumber = (num: string) => {
    if (waitingForOperand) {
      setDisplay(num);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const inputOperator = (nextOperator: string) => {
    if (waitingForOperand && operator) {
      setOperator(nextOperator);
      return;
    }

    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operator) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operator);

      setDisplay(String(newValue));
      setPreviousValue(newValue);
    }

    setWaitingForOperand(true);
    setOperator(nextOperator);
  };

  const calculate = (firstValue: number, secondValue: number, operator: string): number => {
    switch (operator) {
      case '+':
        return firstValue + secondValue;
      case '-':
        return firstValue - secondValue;
      case '×':
        return firstValue * secondValue;
      case '÷':
        return firstValue / secondValue;
      default:
        return secondValue;
    }
  };

  const performCalculation = () => {
    const inputValue = parseFloat(display);

    if (previousValue !== null && operator) {
      const newValue = calculate(previousValue, inputValue, operator);
      const historyEntry = `${previousValue.toLocaleString()} ${operator} ${inputValue.toLocaleString()} = ${newValue.toLocaleString()}`;
      setHistory(prevHistory => [historyEntry, ...prevHistory]);

      setDisplay(String(newValue));
      setPreviousValue(null);
      setOperator(null);
      setWaitingForOperand(true);
    }
  };

  const clearAll = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperator(null);
    setWaitingForOperand(false);
    setHistory([]);
  };

  const clearEntry = () => {
    setDisplay('0');
  };

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
    }
  };

  const operationDisplay = previousValue !== null && operator ? `${previousValue.toLocaleString()} ${operator}` : '';

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Simple Calculator</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-20 mb-2 p-2 bg-muted text-right text-sm text-muted-foreground rounded border overflow-y-auto">
            {history.length > 0 ? (
            history.map((item, index) => (
                <div key={index} className="py-0.5">{item}</div>
            ))
            ) : (
            <div className="flex justify-center items-center h-full opacity-50">History</div>
            )}
        </div>
        
        <div className="relative mb-4 p-4 bg-black text-white text-right text-2xl font-mono rounded border min-h-[72px] flex items-end justify-end flex-col">
            <div className="text-sm text-gray-400 font-sans h-6">
                {operationDisplay}
            </div>
            <div className="truncate w-full">{display}</div>
        </div>
        
        <div className="grid grid-cols-4 gap-2">
          {/* First Row */}
          <Button variant="outline" onClick={clearAll} className="text-red-600 hover:text-red-700">
            AC
          </Button>
          <Button variant="outline" onClick={clearEntry} className="text-red-600 hover:text-red-700">
            CE
          </Button>
          <Button variant="outline" onClick={() => inputOperator('÷')} className="bg-orange-100 hover:bg-orange-200 text-orange-700 font-bold">
            ÷
          </Button>
          <Button variant="outline" onClick={() => inputOperator('×')} className="bg-orange-100 hover:bg-orange-200 text-orange-700 font-bold">
            ×
          </Button>

          {/* Second Row */}
          <Button variant="outline" onClick={() => inputNumber('7')}>
            7
          </Button>
          <Button variant="outline" onClick={() => inputNumber('8')}>
            8
          </Button>
          <Button variant="outline" onClick={() => inputNumber('9')}>
            9
          </Button>
          <Button variant="outline" onClick={() => inputOperator('-')} className="bg-orange-100 hover:bg-orange-200 text-orange-700 font-bold">
            −
          </Button>

          {/* Third Row */}
          <Button variant="outline" onClick={() => inputNumber('4')}>
            4
          </Button>
          <Button variant="outline" onClick={() => inputNumber('5')}>
            5
          </Button>
          <Button variant="outline" onClick={() => inputNumber('6')}>
            6
          </Button>
          <Button variant="outline" onClick={() => inputOperator('+')} className="bg-orange-100 hover:bg-orange-200 text-orange-700 font-bold">
            +
          </Button>

          {/* Fourth Row */}
          <Button variant="outline" onClick={() => inputNumber('1')}>
            1
          </Button>
          <Button variant="outline" onClick={() => inputNumber('2')}>
            2
          </Button>
          <Button variant="outline" onClick={() => inputNumber('3')}>
            3
          </Button>
          <Button variant="default" onClick={performCalculation} className="row-span-2 bg-blue-600 hover:bg-blue-700 text-white font-bold">
            =
          </Button>

          {/* Fifth Row */}
          <Button variant="outline" onClick={() => inputNumber('0')} className="col-span-2">
            0
          </Button>
          <Button variant="outline" onClick={inputDecimal}>
            .
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SimpleCalculator;
