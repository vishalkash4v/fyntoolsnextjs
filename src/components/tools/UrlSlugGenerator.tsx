'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link, FileText } from 'lucide-react';  // Use FileText instead of Type
import { useToast } from '@/hooks/use-toast';
import CopyButton from '@/components/common/CopyButton';

const UrlSlugGenerator = () => {
  const [inputText, setInputText] = useState('');
  const [slug, setSlug] = useState('');
  const { toast } = useToast();

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') 
      .replace(/[\s_-]+/g, '-') 
      .replace(/^-+|-+$/g, ''); 
  };

  useEffect(() => {
    if (inputText) {
      setSlug(generateSlug(inputText));
    } else {
      setSlug('');
    }
  }, [inputText]);


  const examples = [
    { input: "Hello World! This is a Test", output: "hello-world-this-is-a-test" },
    { input: "JavaScript & TypeScript Tutorial", output: "javascript-typescript-tutorial" },
    { input: "How to Create URL-Friendly Slugs?", output: "how-to-create-url-friendly-slugs" },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="h-6 w-6" />
            URL Slug Generator
          </CardTitle>
          <CardDescription>
            Convert any text into a URL-friendly slug for SEO-optimized URLs.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label htmlFor="input-text" className="block text-sm font-medium mb-2">
              Input Text
            </label>
            <Input
              id="input-text"
              placeholder="Enter text to convert to URL slug..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
          </div>

          {slug && (
            <div>
              <label htmlFor="slug-output" className="block text-sm font-medium mb-2">
                Generated URL Slug
              </label>
              <div className="flex gap-2">
                <Input
                  id="slug-output"
                  value={slug}
                  readOnly
                  className="font-mono"
                />
                <CopyButton
                  textToCopy={slug}
                  successMessage="URL slug copied to clipboard."
                  variant="outline"
                  size="icon"
                />
              </div>
            </div>
          )}

          <Card className="bg-muted/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />  {/* Replaced 'Type' with 'FileText' */}
                Examples
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {examples.map((example, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-background">
                    <div className="text-sm font-medium text-muted-foreground mb-1">Input:</div>
                    <div className="text-sm mb-2">{example.input}</div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">Output:</div>
                    <div className="text-sm font-mono bg-muted p-2 rounded">{example.output}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <h4 className="font-semibold mb-2">What is a URL Slug?</h4>
              <p className="text-sm text-muted-foreground">
                A URL slug is the part of a URL that identifies a particular page on a website in an easy-to-read form. 
                It's typically derived from the page title and made URL-friendly by converting to lowercase, 
                replacing spaces with hyphens, and removing special characters.
              </p>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default UrlSlugGenerator;
