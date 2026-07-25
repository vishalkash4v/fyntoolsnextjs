'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Play, Pause, Square } from 'lucide-react';

const TextToSpeech: React.FC = () => {
  const [text, setText] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [speechInstance, setSpeechInstance] = useState<SpeechSynthesisUtterance | null>(null);
  const { toast } = useToast();

  const handleSpeak = () => {
    if (!text.trim()) {
      toast({
        title: 'No Text',
        description: 'Please enter text to convert to speech.',
        variant: 'destructive',
      });
      return;
    }

    if (isPlaying) {
      speechSynthesis.pause();
      setIsPlaying(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => {
        setIsPlaying(false);
        toast({
          title: 'Error',
          description: 'Failed to convert text to speech.',
          variant: 'destructive',
        });
      };
      
      setSpeechInstance(utterance);
      speechSynthesis.speak(utterance);
      setIsPlaying(true);
    }
  };

  const handleStop = () => {
    speechSynthesis.cancel();
    setIsPlaying(false);
    setSpeechInstance(null);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="text">Text to Convert</Label>
        <Textarea
          id="text"
          placeholder="Enter the text you want to convert to speech..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="min-h-[150px]"
        />
      </div>

      <div className="flex gap-2">
        <Button onClick={handleSpeak} disabled={!text.trim()}>
          {isPlaying ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
          {isPlaying ? 'Pause' : 'Play'}
        </Button>
        <Button variant="outline" onClick={handleStop} disabled={!isPlaying}>
          <Square className="mr-2 h-4 w-4" /> Stop
        </Button>
      </div>
    </div>
  );
};

export default TextToSpeech;
