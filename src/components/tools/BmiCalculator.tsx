'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Scale as BmiIcon } from 'lucide-react'; // Changed Bmi to Scale

const BmiCalculator = () => {
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [bmi, setBmi] = useState<number | null>(null);
  const [bmiCategory, setBmiCategory] = useState('');

  const calculateBmi = () => {
    const h = parseFloat(height) / 100; // Assuming height in cm
    const w = parseFloat(weight); // Assuming weight in kg

    if (h > 0 && w > 0) {
      const bmiValue = w / (h * h);
      setBmi(parseFloat(bmiValue.toFixed(2)));

      if (bmiValue < 18.5) {
        setBmiCategory('Underweight');
      } else if (bmiValue >= 18.5 && bmiValue <= 24.9) {
        setBmiCategory('Normal weight');
      } else if (bmiValue >= 25 && bmiValue <= 29.9) {
        setBmiCategory('Overweight');
      } else {
        setBmiCategory('Obesity');
      }
    } else {
      setBmi(null);
      setBmiCategory('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-1">Height (cm)</Label>
          <Input
            id="height"
            type="number"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            placeholder="e.g., 170"
          />
        </div>
        <div>
          <Label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</Label>
          <Input
            id="weight"
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="e.g., 65"
          />
        </div>
      </div>
      <Button onClick={calculateBmi} className="w-full">
        <BmiIcon className="mr-2 h-4 w-4" /> Calculate BMI
      </Button>
      {bmi !== null && (
        <Alert variant={
          bmiCategory === 'Normal weight' ? 'default' : 
          bmiCategory === 'Underweight' ? 'destructive' :
          bmiCategory === 'Overweight' ? 'destructive' :
          bmiCategory === 'Obesity' ? 'destructive' : 'default' 
        }>
          <BmiIcon className="h-4 w-4" />
          <AlertTitle>Your BMI: {bmi}</AlertTitle>
          <AlertDescription>Category: {bmiCategory}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default BmiCalculator;
