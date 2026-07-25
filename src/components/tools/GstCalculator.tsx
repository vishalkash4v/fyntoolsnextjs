'use client';

import React, { useState, useMemo } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const GST_RATES = [5, 12, 18, 28];

const GstCalculator = () => {
  const [amount, setAmount] = useState<string>('');
  const [gstRate, setGstRate] = useState<string>(GST_RATES[2].toString()); // Default to 18%
  const [calculationType, setCalculationType] = useState<'inclusive' | 'exclusive'>('exclusive');

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only numbers and one decimal point
    if (/^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };
  
  const results = useMemo(() => {
    const numAmount = parseFloat(amount);
    const numGstRate = parseFloat(gstRate);

    if (isNaN(numAmount) || isNaN(numGstRate) || numAmount <= 0) {
      return null;
    }

    let baseAmount = 0;
    let gstAmount = 0;
    let totalAmount = 0;

    if (calculationType === 'exclusive') {
      baseAmount = numAmount;
      gstAmount = (numAmount * numGstRate) / 100;
      totalAmount = numAmount + gstAmount;
    } else { // inclusive
      totalAmount = numAmount;
      baseAmount = numAmount / (1 + numGstRate / 100);
      gstAmount = totalAmount - baseAmount;
    }

    return {
      baseAmount: baseAmount.toFixed(2),
      gstAmount: gstAmount.toFixed(2),
      totalAmount: totalAmount.toFixed(2),
      gstRate: numGstRate,
    };
  }, [amount, gstRate, calculationType]);

  const handleReset = () => {
    setAmount('');
    setGstRate(GST_RATES[2].toString());
    setCalculationType('exclusive');
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="amount" className="text-sm font-medium">Enter Amount (₹)</Label>
          <Input
            id="amount"
            type="text"
            value={amount}
            onChange={handleAmountChange}
            placeholder="e.g., 1000"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="gstRate" className="text-sm font-medium">GST Rate (%)</Label>
          <Select value={gstRate} onValueChange={setGstRate}>
            <SelectTrigger id="gstRate" className="mt-1">
              <SelectValue placeholder="Select GST Rate" />
            </SelectTrigger>
            <SelectContent>
              {GST_RATES.map(rate => (
                <SelectItem key={rate} value={rate.toString()}>{rate}%</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label className="text-sm font-medium">Calculation Type</Label>
        <div className="flex gap-4 mt-1">
          <Button
            variant={calculationType === 'exclusive' ? 'default' : 'outline'}
            onClick={() => setCalculationType('exclusive')}
            className="flex-1"
          >
            Add GST (Exclusive)
          </Button>
          <Button
            variant={calculationType === 'inclusive' ? 'default' : 'outline'}
            onClick={() => setCalculationType('inclusive')}
            className="flex-1"
          >
            Remove GST (Inclusive)
          </Button>
        </div>
      </div>

      {results && (
        <Card className="bg-secondary/50">
          <CardHeader>
            <CardTitle className="text-xl">Calculation Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span>{calculationType === 'exclusive' ? 'Base Amount:' : 'Original Amount (Pre-GST):'}</span>
              <span className="font-semibold">₹{results.baseAmount}</span>
            </div>
            <div className="flex justify-between">
              <span>GST ({results.gstRate}%):</span>
              <span className="font-semibold">₹{results.gstAmount}</span>
            </div>
            <hr className="my-2 border-border" />
            <div className="flex justify-between font-bold text-base">
              <span>{calculationType === 'exclusive' ? 'Total Amount (Post-GST):' : 'Net Amount (GST Included):'}</span>
              <span className="text-primary">₹{results.totalAmount}</span>
            </div>
          </CardContent>
        </Card>
      )}
       <Button onClick={handleReset} variant="outline" className="w-full mt-4">Reset</Button>
    </div>
  );
};

export default GstCalculator;
