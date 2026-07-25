'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { RefreshCw, Shield } from 'lucide-react';
import CopyButton from '@/components/common/CopyButton';

const PasswordGenerator: React.FC = () => {
  const [length, setLength] = useState(12);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [password, setPassword] = useState('');
  const { toast } = useToast();

  const generatePassword = () => {
    let characters = '';
    if (includeUppercase) characters += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (includeLowercase) characters += 'abcdefghijklmnopqrstuvwxyz';
    if (includeNumbers) characters += '0123456789';
    if (includeSymbols) characters += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (!characters) {
      toast({
        title: 'No Character Set',
        description: 'Please select at least one character type.',
        variant: 'destructive',
      });
      return;
    }

    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    setPassword(result);
  };


  const getStrengthColor = () => {
    if (length < 6) return 'text-red-500';
    if (length < 10) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getStrengthText = () => {
    if (length < 6) return 'Weak';
    if (length < 10) return 'Medium';
    return 'Strong';
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="length">Password Length: {length}</Label>
          <Input
            id="length"
            type="range"
            min="4"
            max="128"
            value={length}
            onChange={(e) => setLength(parseInt(e.target.value))}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="uppercase"
              checked={includeUppercase}
              onCheckedChange={(checked) => setIncludeUppercase(checked === true)}
            />
            <Label htmlFor="uppercase">Uppercase (A-Z)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="lowercase"
              checked={includeLowercase}
              onCheckedChange={(checked) => setIncludeLowercase(checked === true)}
            />
            <Label htmlFor="lowercase">Lowercase (a-z)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="numbers"
              checked={includeNumbers}
              onCheckedChange={(checked) => setIncludeNumbers(checked === true)}
            />
            <Label htmlFor="numbers">Numbers (0-9)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="symbols"
              checked={includeSymbols}
              onCheckedChange={(checked) => setIncludeSymbols(checked === true)}
            />
            <Label htmlFor="symbols">Symbols (!@#$%)</Label>
          </div>
        </div>
      </div>

      <Button onClick={generatePassword} className="w-full">
        <RefreshCw className="mr-2 h-4 w-4" /> Generate Password
      </Button>

      {password && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Generated Password</h3>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className={`text-sm font-medium ${getStrengthColor()}`}>
                {getStrengthText()}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Input value={password} readOnly className="font-mono" />
            <CopyButton
              textToCopy={password}
              successMessage="Password copied to clipboard."
              emptyMessage="Please generate a password first."
              variant="outline"
              size="icon"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PasswordGenerator;
