'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeftRight, Clock, HardDrive, Zap } from "lucide-react";

type ConversionUnit = {
  name: string;
  factor: number;
};

type ConversionCategory = {
  name: string;
  icon: typeof ArrowLeftRight;
  units: Record<string, ConversionUnit>;
};

type ConversionsType = Record<string, ConversionCategory>;

const EnhancedUnitConverter = () => {
  const [category, setCategory] = useState('length');
  const [fromUnit, setFromUnit] = useState('');
  const [toUnit, setToUnit] = useState('');
  const [fromValue, setFromValue] = useState('');
  const [result, setResult] = useState('');

  const conversions: ConversionsType = {
    length: {
      name: 'Length',
      icon: ArrowLeftRight,
      units: {
        mm: { name: 'Millimeter', factor: 0.001 },
        cm: { name: 'Centimeter', factor: 0.01 },
        m: { name: 'Meter', factor: 1 },
        km: { name: 'Kilometer', factor: 1000 },
        in: { name: 'Inch', factor: 0.0254 },
        ft: { name: 'Foot', factor: 0.3048 },
        yd: { name: 'Yard', factor: 0.9144 },
        mi: { name: 'Mile', factor: 1609.344 },
      }
    },
    weight: {
      name: 'Weight',
      icon: ArrowLeftRight,
      units: {
        mg: { name: 'Milligram', factor: 0.000001 },
        g: { name: 'Gram', factor: 0.001 },
        kg: { name: 'Kilogram', factor: 1 },
        oz: { name: 'Ounce', factor: 0.0283495 },
        lb: { name: 'Pound', factor: 0.453592 },
        ton: { name: 'Metric Ton', factor: 1000 },
      }
    },
    temperature: {
      name: 'Temperature',
      icon: ArrowLeftRight,
      units: {
        celsius: { name: 'Celsius (°C)', factor: 1 },
        fahrenheit: { name: 'Fahrenheit (°F)', factor: 1 },
        kelvin: { name: 'Kelvin (K)', factor: 1 },
      }
    },
    time: {
      name: 'Time',
      icon: Clock,
      units: {
        ms: { name: 'Millisecond', factor: 0.001 },
        s: { name: 'Second', factor: 1 },
        min: { name: 'Minute', factor: 60 },
        hr: { name: 'Hour', factor: 3600 },
        day: { name: 'Day', factor: 86400 },
        week: { name: 'Week', factor: 604800 },
        month: { name: 'Month (30 days)', factor: 2592000 },
        year: { name: 'Year (365 days)', factor: 31536000 },
      }
    },
    dataSize: {
      name: 'Data Size',
      icon: HardDrive,
      units: {
        bit: { name: 'Bit', factor: 1 },
        byte: { name: 'Byte', factor: 8 },
        kb: { name: 'Kilobyte', factor: 8192 },
        mb: { name: 'Megabyte', factor: 8388608 },
        gb: { name: 'Gigabyte', factor: 8589934592 },
        tb: { name: 'Terabyte', factor: 8796093022208 },
      }
    },
    speed: {
      name: 'Speed',
      icon: Zap,
      units: {
        'mps': { name: 'Meters per second', factor: 1 },
        'kph': { name: 'Kilometers per hour', factor: 0.277778 },
        'mph': { name: 'Miles per hour', factor: 0.44704 },
        'fps': { name: 'Feet per second', factor: 0.3048 },
        'knots': { name: 'Knots', factor: 0.514444 },
      }
    }
  };

  const convertTemperature = (value: number, from: string, to: string): number => {
    if (from === to) return value;
    
    // Convert to Celsius first
    let celsius = value;
    if (from === 'fahrenheit') {
      celsius = (value - 32) * 5/9;
    } else if (from === 'kelvin') {
      celsius = value - 273.15;
    }
    
    // Convert from Celsius to target
    if (to === 'fahrenheit') {
      return celsius * 9/5 + 32;
    } else if (to === 'kelvin') {
      return celsius + 273.15;
    }
    
    return celsius;
  };

  const performConversion = () => {
    if (!fromValue || !fromUnit || !toUnit) return;
    
    const value = parseFloat(fromValue);
    if (isNaN(value)) return;
    
    let convertedValue: number;
    
    if (category === 'temperature') {
      convertedValue = convertTemperature(value, fromUnit, toUnit);
    } else {
      const categoryData = conversions[category];
      const fromFactor = categoryData.units[fromUnit].factor;
      const toFactor = categoryData.units[toUnit].factor;
      
      // Convert to base unit, then to target unit
      const baseValue = value * fromFactor;
      convertedValue = baseValue / toFactor;
    }
    
    setResult(convertedValue.toString());
  };

  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory);
    setFromUnit('');
    setToUnit('');
    setFromValue('');
    setResult('');
  };

  const swapUnits = () => {
    const tempUnit = fromUnit;
    setFromUnit(toUnit);
    setToUnit(tempUnit);
    setFromValue(result);
    setResult(fromValue);
  };

  const currentCategory = conversions[category];

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowLeftRight className="h-5 w-5" />
            Enhanced Unit Converter
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={handleCategoryChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(conversions).map(([key, cat]) => (
                  <SelectItem key={key} value={key}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="from-unit">From</Label>
              <Select value={fromUnit} onValueChange={setFromUnit}>
                <SelectTrigger>
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(currentCategory.units).map(([key, unit]) => (
                    <SelectItem key={key} value={key}>
                      {unit.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="to-unit">To</Label>
              <Select value={toUnit} onValueChange={setToUnit}>
                <SelectTrigger>
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(currentCategory.units).map(([key, unit]) => (
                    <SelectItem key={key} value={key}>
                      {unit.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <div>
              <Label htmlFor="from-value">Value</Label>
              <Input
                id="from-value"
                type="number"
                placeholder="Enter value"
                value={fromValue}
                onChange={(e) => {
                  setFromValue(e.target.value);
                  if (e.target.value && fromUnit && toUnit) {
                    setTimeout(performConversion, 100);
                  }
                }}
              />
            </div>

            <div className="flex items-center justify-center md:block">
              <Button onClick={swapUnits} variant="outline" size="icon" className="mb-6 md:mb-0">
                <ArrowLeftRight className="h-4 w-4" />
              </Button>
            </div>

            <div>
              <Label htmlFor="result">Result</Label>
              <Input
                id="result"
                value={result}
                readOnly
                placeholder="Result will appear here"
                className="bg-muted"
              />
            </div>
          </div>

          {fromValue && result && fromUnit && toUnit && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm">
                <strong>{fromValue}</strong> {currentCategory.units[fromUnit].name} = 
                <strong className="ml-1">{parseFloat(result).toLocaleString()}</strong> {currentCategory.units[toUnit].name}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Supported Conversions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {Object.entries(conversions).map(([key, cat]) => (
              <div key={key} className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <cat.icon className="h-4 w-4" />
                  {cat.name}
                </h4>
                <ul className="text-muted-foreground space-y-1">
                  {Object.values(cat.units).map((unit, index) => (
                    <li key={index}>• {unit.name}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedUnitConverter;
