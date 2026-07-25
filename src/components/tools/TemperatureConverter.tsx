'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Thermometer, ArrowUpDown } from 'lucide-react';

const TemperatureConverter = () => {
  const [inputValue, setInputValue] = useState('');
  const [fromUnit, setFromUnit] = useState('celsius');
  const [toUnit, setToUnit] = useState('fahrenheit');
  const [result, setResult] = useState<number | null>(null);

  const convertTemperature = (value: number, from: string, to: string): number => {
    // First convert to Celsius if not already
    let celsius = value;
    if (from === 'fahrenheit') {
      celsius = (value - 32) * 5/9;
    } else if (from === 'kelvin') {
      celsius = value - 273.15;
    }

    // Then convert from Celsius to target unit
    switch (to) {
      case 'fahrenheit':
        return (celsius * 9/5) + 32;
      case 'kelvin':
        return celsius + 273.15;
      default:
        return celsius;
    }
  };

  const handleConvert = () => {
    const value = parseFloat(inputValue);
    if (isNaN(value)) return;

    const convertedValue = convertTemperature(value, fromUnit, toUnit);
    setResult(convertedValue);
  };

  const handleSwapUnits = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
    if (result !== null) {
      setInputValue(result.toString());
      setResult(null);
    }
  };

  const handleClear = () => {
    setInputValue('');
    setResult(null);
  };

  const formatResult = (value: number) => {
    return value.toFixed(2);
  };

  const getUnitSymbol = (unit: string) => {
    switch (unit) {
      case 'celsius': return '°C';
      case 'fahrenheit': return '°F';
      case 'kelvin': return 'K';
      default: return '';
    }
  };

  const getUnitName = (unit: string) => {
    switch (unit) {
      case 'celsius': return 'Celsius';
      case 'fahrenheit': return 'Fahrenheit';
      case 'kelvin': return 'Kelvin';
      default: return '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Thermometer className="h-6 w-6" />
            Temperature Converter
          </CardTitle>
          <CardDescription>
            Convert temperatures between Celsius, Fahrenheit, and Kelvin.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="inputValue">Value</Label>
              <Input
                id="inputValue"
                type="number"
                step="any"
                placeholder="0"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>From</Label>
              <Select value={fromUnit} onValueChange={setFromUnit}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="celsius">Celsius (°C)</SelectItem>
                  <SelectItem value="fahrenheit">Fahrenheit (°F)</SelectItem>
                  <SelectItem value="kelvin">Kelvin (K)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-center">
              <Button
                variant="outline"
                size="icon"
                onClick={handleSwapUnits}
                title="Swap units"
              >
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              <Label>To</Label>
              <Select value={toUnit} onValueChange={setToUnit}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="celsius">Celsius (°C)</SelectItem>
                  <SelectItem value="fahrenheit">Fahrenheit (°F)</SelectItem>
                  <SelectItem value="kelvin">Kelvin (K)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleConvert} disabled={!inputValue} className="flex-1">
                Convert
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClear} className="flex-1">
              Clear
            </Button>
          </div>

          {result !== null && (
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">
                    {formatResult(result)} {getUnitSymbol(toUnit)}
                  </div>
                  <div className="text-muted-foreground">
                    {inputValue} {getUnitSymbol(fromUnit)} = {formatResult(result)} {getUnitSymbol(toUnit)}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Common Temperature References */}
          <Card className="bg-blue-50 dark:bg-blue-950/20">
            <CardHeader>
              <CardTitle className="text-lg">Common Temperature References</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Water</h4>
                  <ul className="text-sm space-y-1">
                    <li>Freezing: 0°C = 32°F = 273.15K</li>
                    <li>Boiling: 100°C = 212°F = 373.15K</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Human Body</h4>
                  <ul className="text-sm space-y-1">
                    <li>Normal: 37°C = 98.6°F = 310.15K</li>
                    <li>Fever: 38°C = 100.4°F = 311.15K</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default TemperatureConverter;
