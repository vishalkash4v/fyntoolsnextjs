'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Shuffle, User, Building, Baby } from 'lucide-react';
import { toast } from 'sonner';
import CopyButton from '@/components/common/CopyButton';

const NameGenerator = () => {
  const [startupNames, setStartupNames] = useState<string[]>([]);
  const [babyNames, setBabyNames] = useState<string[]>([]);
  const [brandNames, setBrandNames] = useState<string[]>([]);
  const [keyword, setKeyword] = useState('');

  const startupPrefixes = ['Tech', 'Smart', 'Quantum', 'Digital', 'Cyber', 'Cloud', 'Micro', 'Meta', 'Ultra', 'Pro'];
  const startupSuffixes = ['Lab', 'Hub', 'Core', 'Works', 'Tech', 'Solutions', 'Systems', 'Dynamics', 'Logic', 'Sync'];
  
  const babyNamesData = {
    boys: ['Alexander', 'Benjamin', 'Christopher', 'Daniel', 'Ethan', 'Felix', 'Gabriel', 'Henry', 'Isaac', 'Jacob'],
    girls: ['Ava', 'Bella', 'Charlotte', 'Diana', 'Emma', 'Fiona', 'Grace', 'Hannah', 'Isabella', 'Julia']
  };

  const brandAdjectives = ['Bold', 'Bright', 'Creative', 'Dynamic', 'Elite', 'Fresh', 'Golden', 'Prime', 'Royal', 'Vital'];
  const brandNouns = ['Studio', 'Co', 'Group', 'Brand', 'House', 'Craft', 'Design', 'Media', 'Labs', 'Works'];

  const generateStartupNames = () => {
    const names = [];
    for (let i = 0; i < 10; i++) {
      if (keyword) {
        const prefix = startupPrefixes[Math.floor(Math.random() * startupPrefixes.length)];
        const suffix = startupSuffixes[Math.floor(Math.random() * startupSuffixes.length)];
        names.push(`${keyword}${suffix}`);
        names.push(`${prefix}${keyword}`);
      } else {
        const prefix = startupPrefixes[Math.floor(Math.random() * startupPrefixes.length)];
        const suffix = startupSuffixes[Math.floor(Math.random() * startupSuffixes.length)];
        names.push(`${prefix}${suffix}`);
      }
    }
    setStartupNames([...new Set(names)].slice(0, 10));
  };

  const generateBabyNames = () => {
    const allNames = [...babyNamesData.boys, ...babyNamesData.girls];
    const shuffled = allNames.sort(() => 0.5 - Math.random());
    setBabyNames(shuffled.slice(0, 10));
  };

  const generateBrandNames = () => {
    const names = [];
    for (let i = 0; i < 10; i++) {
      if (keyword) {
        const adjective = brandAdjectives[Math.floor(Math.random() * brandAdjectives.length)];
        const noun = brandNouns[Math.floor(Math.random() * brandNouns.length)];
        names.push(`${keyword} ${noun}`);
        names.push(`${adjective} ${keyword}`);
      } else {
        const adjective = brandAdjectives[Math.floor(Math.random() * brandAdjectives.length)];
        const noun = brandNouns[Math.floor(Math.random() * brandNouns.length)];
        names.push(`${adjective} ${noun}`);
      }
    }
    setBrandNames([...new Set(names)].slice(0, 10));
  };

  const renderNameList = (names: string[], type: string) => (
    <div className="grid gap-2">
      {names.map((name, index) => (
        <div key={index} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
          <span className="font-medium">{name}</span>
          <CopyButton
            textToCopy={name}
            successMessage="Copied to clipboard!"
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
          />
        </div>
      ))}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-6 w-6" />
            Name Generator
          </CardTitle>
          <CardDescription>
            Generate creative names for startups, babies, and brands
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter a keyword (optional)"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>
            
            <Tabs defaultValue="startup" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="startup">Startup Names</TabsTrigger>
                <TabsTrigger value="baby">Baby Names</TabsTrigger>
                <TabsTrigger value="brand">Brand Names</TabsTrigger>
              </TabsList>
              
              <TabsContent value="startup" className="space-y-4">
                <div className="flex items-center gap-2">
                  <Button onClick={generateStartupNames} className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Generate Startup Names
                  </Button>
                  <Button variant="outline" onClick={generateStartupNames}>
                    <Shuffle className="h-4 w-4" />
                  </Button>
                </div>
                {startupNames.length > 0 && renderNameList(startupNames, 'startup')}
              </TabsContent>
              
              <TabsContent value="baby" className="space-y-4">
                <div className="flex items-center gap-2">
                  <Button onClick={generateBabyNames} className="flex items-center gap-2">
                    <Baby className="h-4 w-4" />
                    Generate Baby Names
                  </Button>
                  <Button variant="outline" onClick={generateBabyNames}>
                    <Shuffle className="h-4 w-4" />
                  </Button>
                </div>
                {babyNames.length > 0 && renderNameList(babyNames, 'baby')}
              </TabsContent>
              
              <TabsContent value="brand" className="space-y-4">
                <div className="flex items-center gap-2">
                  <Button onClick={generateBrandNames} className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Generate Brand Names
                  </Button>
                  <Button variant="outline" onClick={generateBrandNames}>
                    <Shuffle className="h-4 w-4" />
                  </Button>
                </div>
                {brandNames.length > 0 && renderNameList(brandNames, 'brand')}
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NameGenerator;
