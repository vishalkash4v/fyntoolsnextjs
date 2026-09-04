'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { FileText, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import CopyButton from '@/components/common/CopyButton';

const LoremIpsumGenerator = () => {
  const [paragraphs, setParagraphs] = useState('3');
  const [wordsPerParagraph, setWordsPerParagraph] = useState('50');
  const [randomWords, setRandomWords] = useState('false');
  const [startWithLorem, setStartWithLorem] = useState('true');
  const [generatedText, setGeneratedText] = useState('');
  const { toast } = useToast();

  const loremWords = [
    'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
    'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
    'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
    'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
    'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
    'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
    'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
    'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum', 'at', 'vero', 'eos',
    'accusamus', 'accusantium', 'doloremque', 'laudantium', 'totam', 'rem',
    'aperiam', 'eaque', 'ipsa', 'quae', 'ab', 'illo', 'inventore', 'veritatis',
    'quasi', 'architecto', 'beatae', 'vitae', 'dicta', 'explicabo', 'nemo',
    'ipsam', 'quia', 'voluptas', 'aspernatur', 'aut', 'odit', 'fugit'
  ];

  const generateParagraph = (baseWordCount: number, isFirst: boolean) => {
    let words = [];
    let actualWordCount = baseWordCount;

    // If random words is enabled, vary the word count by ±30%
    if (randomWords === 'true') {
      const variation = Math.floor(baseWordCount * 0.3);
      const minWords = Math.max(10, baseWordCount - variation);
      const maxWords = baseWordCount + variation;
      actualWordCount = Math.floor(Math.random() * (maxWords - minWords + 1)) + minWords;
    }
    
    if (isFirst && startWithLorem === 'true') {
      words = ['Lorem', 'ipsum', 'dolor', 'sit', 'amet'];
      actualWordCount -= 5;
    }

    for (let i = 0; i < actualWordCount; i++) {
      const randomWord = loremWords[Math.floor(Math.random() * loremWords.length)];
      words.push(randomWord);
    }

    let paragraph = words.join(' ');
    paragraph = paragraph.charAt(0).toUpperCase() + paragraph.slice(1);
    return paragraph + '.';
  };

  const generateLorem = () => {
    const numParagraphs = parseInt(paragraphs);
    const wordsPerPar = parseInt(wordsPerParagraph);
    
    if (numParagraphs <= 0 || wordsPerPar <= 0) {
      toast({
        title: "Invalid Input",
        description: "Please enter valid numbers for paragraphs and words.",
        variant: "destructive",
      });
      return;
    }

    const paragraphsArray = [];
    for (let i = 0; i < numParagraphs; i++) {
      paragraphsArray.push(generateParagraph(wordsPerPar, i === 0));
    }

    setGeneratedText(paragraphsArray.join('\n\n'));
  };


  const clearText = () => {
    setGeneratedText('');
  };

  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Lorem Ipsum Generator
          </CardTitle>
          <CardDescription>
            Generate Lorem Ipsum placeholder text for your designs and layouts.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="paragraphs">Number of Paragraphs</Label>
              <Input
                id="paragraphs"
                type="number"
                min="1"
                max="10"
                value={paragraphs}
                onChange={(e) => setParagraphs(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="wordsPerParagraph">Words per Paragraph</Label>
              <Input
                id="wordsPerParagraph"
                type="number"
                min="10"
                max="200"
                value={wordsPerParagraph}
                onChange={(e) => setWordsPerParagraph(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Random Words per Paragraph</Label>
              <Select value={randomWords} onValueChange={setRandomWords}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="false">Fixed Count</SelectItem>
                  <SelectItem value="true">Random (±30%)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Start with "Lorem ipsum"</Label>
              <Select value={startWithLorem} onValueChange={setStartWithLorem}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Yes</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={generateLorem} className="flex-1">
              <RefreshCw className="h-4 w-4 mr-2" />
              Generate Lorem Ipsum
            </Button>
          </div>

          {generatedText && (
            <Card className="bg-muted/50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Generated Text</CardTitle>
                  <div className="flex flex-wrap gap-2">
                    <CopyButton
                      textToCopy={generatedText}
                      successMessage="Lorem ipsum text copied to clipboard."
                      variant="outline"
                      size="sm"
                    />
                    <Button variant="outline" size="sm" onClick={clearText} className="flex-shrink-0">
                      <RefreshCw className="h-4 w-4 sm:mr-2" />
                      <span className="hidden sm:inline">Clear</span>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={generatedText}
                  readOnly
                  className="min-h-[300px] resize-none"
                />
                <div className="mt-4 text-sm text-muted-foreground">
                  Characters: {generatedText.length} | Words: {generatedText.split(' ').length}
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LoremIpsumGenerator;