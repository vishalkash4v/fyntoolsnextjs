'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Shuffle, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import CopyButton from '@/components/common/CopyButton';

const ListRandomizer = () => {
  const [inputText, setInputText] = useState('');
  const [randomizedList, setRandomizedList] = useState<string[]>([]);
  const [originalList, setOriginalList] = useState<string[]>([]);
  const { toast } = useToast();

  const randomizeList = () => {
    if (!inputText.trim()) {
      toast({
        title: "Error",
        description: "Please enter some items to randomize.",
        variant: "destructive",
      });
      return;
    }

    const items = inputText.split('\n').filter(item => item.trim() !== '');
    setOriginalList([...items]);
    
    const shuffled = [...items].sort(() => Math.random() - 0.5);
    setRandomizedList(shuffled);
  };


  const reset = () => {
    setInputText('');
    setRandomizedList([]);
    setOriginalList([]);
  };

  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shuffle className="h-6 w-6" />
            List Randomizer
          </CardTitle>
          <CardDescription>
            Enter a list of items (one per line) and randomize their order.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label htmlFor="input-list" className="block text-sm font-medium mb-2">
              Input List (one item per line)
            </label>
            <Textarea
              id="input-list"
              placeholder="Enter items here, one per line..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              rows={8}
            />
          </div>

          <div className="flex gap-3">
            <Button onClick={randomizeList} className="flex items-center gap-2">
              <Shuffle className="h-4 w-4" />
              Randomize List
            </Button>
            {randomizedList.length > 0 && (
              <>
                <CopyButton
                  textToCopy={randomizedList.join('\n')}
                  successMessage="Randomized list copied to clipboard."
                  variant="outline"
                  size="sm"
                  copyText="Copy Result"
                />
                <Button onClick={reset} variant="outline" className="flex items-center gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </Button>
              </>
            )}
          </div>

          {randomizedList.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-muted/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Original Order</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {originalList.map((item, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-background rounded border">
                        <span className="text-xs text-muted-foreground w-6">{index + 1}.</span>
                        <span className="text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-muted/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Randomized Order</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {randomizedList.map((item, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-background rounded border">
                        <span className="text-xs text-muted-foreground w-6">{index + 1}.</span>
                        <span className="text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ListRandomizer;
