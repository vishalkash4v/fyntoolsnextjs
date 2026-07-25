'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Hash, RefreshCw } from "lucide-react";
import CopyButton from '@/components/common/CopyButton';
import { useToast } from "@/hooks/use-toast";

const HashtagGenerator = () => {
  const [keyword, setKeyword] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [selectedHashtags, setSelectedHashtags] = useState<string[]>([]);
  const { toast } = useToast();

  const hashtagSuggestions = {
    travel: ['#travel', '#wanderlust', '#adventure', '#explore', '#vacation', '#photography', '#nature', '#mountains', '#beach', '#backpacking'],
    food: ['#food', '#foodie', '#delicious', '#yummy', '#cooking', '#recipe', '#chef', '#foodporn', '#instafood', '#homemade'],
    fitness: ['#fitness', '#workout', '#gym', '#health', '#motivation', '#fit', '#training', '#exercise', '#strong', '#lifestyle'],
    business: ['#business', '#entrepreneur', '#startup', '#success', '#marketing', '#leadership', '#growth', '#innovation', '#networking', '#productivity'],
    tech: ['#tech', '#technology', '#coding', '#programming', '#developer', '#software', '#innovation', '#digital', '#ai', '#startup'],
    fashion: ['#fashion', '#style', '#outfit', '#ootd', '#fashion', '#trendy', '#model', '#beauty', '#designer', '#accessories'],
    art: ['#art', '#artist', '#creative', '#drawing', '#painting', '#design', '#artwork', '#artistic', '#gallery', '#inspiration']
  };

  const generateHashtags = () => {
    if (!keyword) {
      toast({
        title: "Error",
        description: "Please enter a keyword",
        variant: "destructive"
      });
      return;
    }

    const lowerKeyword = keyword.toLowerCase();
    let suggestions: string[] = [];

    // Find matching category
    for (const [category, tags] of Object.entries(hashtagSuggestions)) {
      if (lowerKeyword.includes(category) || category.includes(lowerKeyword)) {
        suggestions = [...suggestions, ...tags];
      }
    }

    // If no specific match, generate generic hashtags
    if (suggestions.length === 0) {
      suggestions = [
        `#${keyword.toLowerCase().replace(/\s+/g, '')}`,
        `#${keyword.toLowerCase().replace(/\s+/g, '')}life`,
        `#love${keyword.toLowerCase().replace(/\s+/g, '')}`,
        `#${keyword.toLowerCase().replace(/\s+/g, '')}inspiration`,
        `#daily${keyword.toLowerCase().replace(/\s+/g, '')}`,
        '#love', '#instagood', '#photooftheday', '#beautiful', '#happy', '#cute', '#follow', '#like4like', '#picoftheday', '#me'
      ];
    }

    // Add some popular general hashtags
    suggestions = [...suggestions, '#love', '#instagood', '#photooftheday', '#beautiful', '#happy'];

    // Remove duplicates and limit to 20
    const uniqueHashtags = [...new Set(suggestions)].slice(0, 20);
    setHashtags(uniqueHashtags);
    setSelectedHashtags([]);
  };

  const toggleHashtag = (hashtag: string) => {
    setSelectedHashtags(prev => 
      prev.includes(hashtag) 
        ? prev.filter(h => h !== hashtag)
        : [...prev, hashtag]
    );
  };


  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hash className="h-5 w-5" />
            Hashtag Generator
          </CardTitle>
          <CardDescription>
            Generate relevant hashtags for your social media posts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="keyword">Keyword or Topic</Label>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                id="keyword"
                placeholder="e.g., travel, food, fitness, business"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="flex-1"
              />
              <Button onClick={generateHashtags} className="w-full sm:w-auto">
                <RefreshCw className="h-4 w-4 mr-2" />
                Generate
              </Button>
            </div>
          </div>

          {hashtags.length > 0 && (
            <div className="space-y-4">
              <div>
                <Label>Click hashtags to select them</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {hashtags.map((hashtag, index) => (
                    <Badge
                      key={index}
                      variant={selectedHashtags.includes(hashtag) ? "default" : "outline"}
                      className="cursor-pointer hover:bg-primary/80"
                      onClick={() => toggleHashtag(hashtag)}
                    >
                      {hashtag}
                    </Badge>
                  ))}
                </div>
              </div>

              {selectedHashtags.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Selected Hashtags ({selectedHashtags.length})</Label>
                    <CopyButton
                      textToCopy={selectedHashtags.join(' ')}
                      successMessage={`${selectedHashtags.length} hashtags copied to clipboard`}
                      emptyMessage="Please select some hashtags first"
                      variant="outline"
                      size="sm"
                    />
                  </div>
                  <Textarea
                    value={selectedHashtags.join(' ')}
                    readOnly
                    rows={3}
                    className="resize-none"
                  />
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Best Practices</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Use 5-10 relevant hashtags for optimal engagement</li>
            <li>• Mix popular and niche hashtags</li>
            <li>• Research hashtags specific to your industry</li>
            <li>• Avoid banned or overused hashtags</li>
            <li>• Use hashtags that match your content</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default HashtagGenerator;
