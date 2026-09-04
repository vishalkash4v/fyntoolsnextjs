'use client';
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Shuffle, AtSign, Settings } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import CopyButton from '@/components/common/CopyButton';

const UsernameGenerator = () => {
  const [usernames, setUsernames] = useState<string[]>([]);
  const [baseName, setBaseName] = useState('');
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(false);
  const [minLength, setMinLength] = useState(6);
  const [maxLength, setMaxLength] = useState(12);

  const adjectives = ['cool', 'smart', 'creative', 'awesome', 'epic', 'pro', 'super', 'mega', 'ultra', 'prime'];
  const nouns = ['user', 'player', 'gamer', 'coder', 'ninja', 'master', 'hero', 'star', 'legend', 'wizard'];
  const symbols = ['_', '-', '.'];

  const generateUsernames = () => {
    const names = [];
    
    for (let i = 0; i < 15; i++) {
      let username = '';
      
      if (baseName) {
        username = baseName.toLowerCase().replace(/\s+/g, '');
      } else {
        const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
        const noun = nouns[Math.floor(Math.random() * nouns.length)];
        username = adjective + noun;
      }
      
      // Add variations
      if (includeNumbers) {
        const number = Math.floor(Math.random() * 999) + 1;
        if (Math.random() > 0.5) {
          username += number;
        } else {
          username = number + username;
        }
      }
      
      if (includeSymbols && Math.random() > 0.6) {
        const symbol = symbols[Math.floor(Math.random() * symbols.length)];
        const insertPos = Math.floor(Math.random() * username.length);
        username = username.slice(0, insertPos) + symbol + username.slice(insertPos);
      }
      
      // Ensure within length limits
      if (username.length >= minLength && username.length <= maxLength) {
        names.push(username);
      }
    }
    
    // Add some additional variations if we have a base name
    if (baseName) {
      const baseClean = baseName.toLowerCase().replace(/\s+/g, '');
      names.push(`${baseClean}_official`);
      names.push(`real_${baseClean}`);
      names.push(`${baseClean}123`);
      names.push(`${baseClean}_pro`);
    }
    
    setUsernames([...new Set(names)].slice(0, 12));
  };


  const handleNumbersChange = (checked: boolean | "indeterminate") => {
    setIncludeNumbers(checked === true);
  };

  const handleSymbolsChange = (checked: boolean | "indeterminate") => {
    setIncludeSymbols(checked === true);
  };

  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AtSign className="h-6 w-6" />
            Username Generator
          </CardTitle>
          <CardDescription>
            Generate unique usernames for social media, gaming, and online accounts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Base Name (Optional)</label>
              <Input
                placeholder="Enter your name or preferred base"
                value={baseName}
                onChange={(e) => setBaseName(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Min Length</label>
                <Input
                  type="number"
                  value={minLength}
                  onChange={(e) => setMinLength(parseInt(e.target.value) || 6)}
                  min={3}
                  max={20}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Max Length</label>
                <Input
                  type="number"
                  value={maxLength}
                  onChange={(e) => setMaxLength(parseInt(e.target.value) || 12)}
                  min={6}
                  max={25}
                />
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="numbers"
                  checked={includeNumbers}
                  onCheckedChange={handleNumbersChange}
                />
                <label htmlFor="numbers" className="text-sm">Include Numbers</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="symbols"
                  checked={includeSymbols}
                  onCheckedChange={handleSymbolsChange}
                />
                <label htmlFor="symbols" className="text-sm">Include Symbols (_ - .)</label>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={generateUsernames} className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Generate Usernames
              </Button>
              <Button variant="outline" onClick={generateUsernames}>
                <Shuffle className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {usernames.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Generated Usernames</h3>
              <div className="grid gap-2">
                {usernames.map((username, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{username.length}</Badge>
                      <span className="font-mono">{username}</span>
                    </div>
                    <CopyButton
                      textToCopy={username}
                      successMessage="Username copied to clipboard!"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UsernameGenerator;
