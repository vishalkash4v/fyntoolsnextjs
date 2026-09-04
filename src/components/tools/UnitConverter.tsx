'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Ruler, ArrowUpDown } from 'lucide-react';

interface ConversionUnit {
  name: string;
  symbol: string;
  factor: number; // Factor to convert to base unit
}

const units = {
  length: [
    { name: 'Millimeter', symbol: 'mm', factor: 0.001 },
    { name: 'Centimeter', symbol: 'cm', factor: 0.01 },
    { name: 'Meter', symbol: 'm', factor: 1 },
    { name: 'Kilometer', symbol: 'km', factor: 1000 },
    { name: 'Inch', symbol: 'in', factor: 0.0254 },
    { name: 'Foot', symbol: 'ft', factor: 0.3048 },
    { name: 'Yard', symbol: 'yd', factor: 0.9144 },
    { name: 'Mile', symbol: 'mi', factor: 1609.34 },
  ],
  weight: [
    { name: 'Milligram', symbol: 'mg', factor: 0.000001 },
    { name: 'Gram', symbol: 'g', factor: 0.001 },
    { name: 'Kilogram', symbol: 'kg', factor: 1 },
    { name: 'Pound', symbol: 'lb', factor: 0.453592 },
    { name: 'Ounce', symbol: 'oz', factor: 0.0283495 },
    { name: 'Ton (Metric)', symbol: 't', factor: 1000 },
  ],
  area: [
    { name: 'Square Millimeter', symbol: 'mm²', factor: 0.000001 },
    { name: 'Square Centimeter', symbol: 'cm²', factor: 0.0001 },
    { name: 'Square Meter', symbol: 'm²', factor: 1 },
    { name: 'Square Kilometer', symbol: 'km²', factor: 1000000 },
    { name: 'Square Inch', symbol: 'in²', factor: 0.00064516 },
    { name: 'Square Foot', symbol: 'ft²', factor: 0.092903 },
    { name: 'Square Yard', symbol: 'yd²', factor: 0.836127 },
    { name: 'Acre', symbol: 'ac', factor: 4046.86 },
    { name: 'Hectare', symbol: 'ha', factor: 10000 },
  ],
  volume: [
    { name: 'Milliliter', symbol: 'ml', factor: 0.001 },
    { name: 'Liter', symbol: 'l', factor: 1 },
    { name: 'Cubic Meter', symbol: 'm³', factor: 1000 },
    { name: 'Fluid Ounce', symbol: 'fl oz', factor: 0.0295735 },
    { name: 'Cup', symbol: 'cup', factor: 0.236588 },
    { name: 'Pint', symbol: 'pt', factor: 0.473176 },
    { name: 'Quart', symbol: 'qt', factor: 0.946353 },
    { name: 'Gallon', symbol: 'gal', factor: 3.78541 },
  ],
};

const UnitConverter = () => {
  const [inputValue, setInputValue] = useState('');
  const [fromUnit, setFromUnit] = useState('');
  const [toUnit, setToUnit] = useState('');
  const [result, setResult] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('length');

  const convert = (value: number, from: ConversionUnit, to: ConversionUnit): number => {
    // Convert to base unit, then to target unit
    const baseValue = value * from.factor;
    return baseValue / to.factor;
  };

  const handleConvert = () => {
    const value = parseFloat(inputValue);
    if (isNaN(value) || !fromUnit || !toUnit) return;

    const currentUnits = units[activeTab as keyof typeof units];
    const fromUnitData = currentUnits.find(u => u.symbol === fromUnit);
    const toUnitData = currentUnits.find(u => u.symbol === toUnit);

    if (!fromUnitData || !toUnitData) return;

    const convertedValue = convert(value, fromUnitData, toUnitData);
    setResult(convertedValue);
  };

  const handleSwapUnits = () => {
    const temp = fromUnit;
    setFromUnit(toUnit);
    setToUnit(temp);
    if (result !== null) {
      setInputValue(result.toString());
      setResult(null);
    }
  };

  const handleClear = () => {
    setInputValue('');
    setResult(null);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setFromUnit('');
    setToUnit('');
    setInputValue('');
    setResult(null);
  };

  const formatResult = (value: number) => {
    if (value >= 1000000 || value <= 0.001) {
      return value.toExponential(6);
    }
    return value.toFixed(6).replace(/\.?0+$/, '');
  };

  const currentUnits = units[activeTab as keyof typeof units];

  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ruler className="h-6 w-6" />
            Unit Converter
          </CardTitle>
          <CardDescription>
            Convert between different units of length, weight, area, and volume.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="length">Length</TabsTrigger>
              <TabsTrigger value="weight">Weight</TabsTrigger>
              <TabsTrigger value="area">Area</TabsTrigger>
              <TabsTrigger value="volume">Volume</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-6">
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
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {currentUnits.map((unit) => (
                        <SelectItem key={unit.symbol} value={unit.symbol}>
                          {unit.name} ({unit.symbol})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleSwapUnits}
                    disabled={!fromUnit || !toUnit}
                    title="Swap units"
                  >
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label>To</Label>
                  <Select value={toUnit} onValueChange={setToUnit}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {currentUnits.map((unit) => (
                        <SelectItem key={unit.symbol} value={unit.symbol}>
                          {unit.name} ({unit.symbol})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleConvert} disabled={!inputValue || !fromUnit || !toUnit} className="flex-1">
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
                        {formatResult(result)} {toUnit}
                      </div>
                      <div className="text-muted-foreground">
                        {inputValue} {fromUnit} = {formatResult(result)} {toUnit}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default UnitConverter;
