'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MessageSquare, Send, X } from 'lucide-react';
import { toast } from 'sonner';

interface FeedbackButtonProps {
  toolName: string;
  toolUrl?: string;
}

const FeedbackButton: React.FC<FeedbackButtonProps> = ({ toolName, toolUrl }) => {
  const [message, setMessage] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleSendFeedback = () => {
    if (!message.trim()) {
      toast.error('Please enter your feedback message');
      return;
    }

    const feedbackMessage = message.trim();
    const currentUrl = toolUrl || window.location.href;
    
    // Optimistic update - close dialog and show success immediately (instant feedback)
    setMessage('');
    setIsOpen(false);

    // Show success message immediately
    toast.success('Thank you for your feedback!', {
      description: 'Your feedback has been submitted successfully.',
      duration: 2000,
    });

    // Submit in background (non-blocking - don't wait for response)
    const API_BASE_URL = 'https://express-two-umber.vercel.app/api';
    fetch(`${API_BASE_URL}/toolreview/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        toolName: toolName,
        toolUrl: currentUrl,
        rating: 1, // Feedback is considered positive
        feedback: feedbackMessage
      }),
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Failed to submit feedback');
        }
      })
      .catch((error) => {
        console.error('Error submitting feedback:', error);
        toast.error(error.message || 'Failed to submit feedback. Please try again.');
      });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 text-xs sm:text-sm"
          aria-label={`Send feedback for ${toolName}`}
        >
          <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4" aria-hidden="true" />
          <span className="hidden sm:inline">Feedback</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">
            Send Feedback for {toolName}
          </DialogTitle>
          <DialogDescription className="text-sm">
            We'd love to hear your thoughts! Your feedback helps us improve our tools.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="feedback-message" className="text-sm font-medium">
              Your Message
            </Label>
            <Textarea
              id="feedback-message"
              placeholder="Type your feedback, suggestions, or report any issues..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[120px] resize-none text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Your feedback will be sent to: bestsmm4all@gmail.com
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsOpen(false);
                setMessage('');
              }}
              className="text-xs sm:text-sm"
            >
              <X className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              Cancel
            </Button>
            <Button
              onClick={handleSendFeedback}
              disabled={!message.trim()}
              className="gap-2 text-xs sm:text-sm"
            >
              <Send className="h-3 w-3 sm:h-4 sm:w-4" />
              Send Feedback
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackButton;

