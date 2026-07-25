'use client';

import React, { useState, useMemo } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const PercentageCalculator = () => {
  const [val1, setVal1] = useState<string>('');
  const [val2, setVal2] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>("findPercentage");

  const handleVal1Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (/^\d*\.?\d*$/.test(e.target.value)) setVal1(e.target.value);
  };
  const handleVal2Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (/^\d*\.?\d*$/.test(e.target.value)) setVal2(e.target.value);
  };

  const result = useMemo(() => {
    const num1 = parseFloat(val1);
    const num2 = parseFloat(val2);

    if (isNaN(num1) || isNaN(num2)) return null;

    switch (activeTab) {
      case "findPercentage": // What is X% of Y?
        if (num2 === 0) return "Cannot calculate percentage of zero.";
        return ((num1 / 100) * num2).toFixed(2);
      case "isWhatPercentOf": // X is what % of Y?
        if (num2 === 0) return "Cannot divide by zero.";
        return ((num1 / num2) * 100).toFixed(2) + "%";
      default:
        return null;
    }
  }, [val1, val2, activeTab]);

  const handleReset = () => {
    setVal1('');
    setVal2('');
  };
  
  const getLabels = () => {
    switch (activeTab) {
      case "findPercentage":
        return { label1: "Percentage (%)", label2: "Total Value", placeholder1: "e.g., 10", placeholder2: "e.g., 50" };
      case "isWhatPercentOf":
        return { label1: "Value", label2: "Total Value", placeholder1: "e.g., 5", placeholder2: "e.g., 50" };
      default:
        return { label1: "Value 1", label2: "Value 2", placeholder1: "", placeholder2: "" };
    }
  };

  const currentLabels = getLabels();

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={(value) => {setActiveTab(value); handleReset();}} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="findPercentage">X% of Y</TabsTrigger>
          <TabsTrigger value="isWhatPercentOf">X is what % of Y</TabsTrigger>
        </TabsList>
        <TabsContent value="findPercentage" className="mt-6">
          <p className="text-sm text-muted-foreground mb-4">Calculate: What is {val1 || 'X'}% of {val2 || 'Y'}?</p>
        </TabsContent>
        <TabsContent value="isWhatPercentOf" className="mt-6">
          <p className="text-sm text-muted-foreground mb-4">Calculate: {val1 || 'X'} is what percent of {val2 || 'Y'}?</p>
        </TabsContent>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="val1" className="text-sm font-medium">{currentLabels.label1}</Label>
          <Input
            id="val1"
            type="text"
            value={val1}
            onChange={handleVal1Change}
            placeholder={currentLabels.placeholder1}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="val2" className="text-sm font-medium">{currentLabels.label2}</Label>
          <Input
            id="val2"
            type="text"
            value={val2}
            onChange={handleVal2Change}
            placeholder={currentLabels.placeholder2}
            className="mt-1"
          />
        </div>
      </div>

      {result !== null && (
        <Card className="bg-secondary/50">
          <CardHeader>
            <CardTitle className="text-xl">Result</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">{result}</p>
          </CardContent>
        </Card>
      )}
      <Button onClick={handleReset} variant="outline" className="w-full mt-4">Reset</Button>
    </div>
  );
};

export default PercentageCalculator;
