'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const API_BASE_URL = 'https://express-two-umber.vercel.app/api';

interface LikeDislikeButtonsProps {
  toolName: string;
  toolUrl?: string;
}

const LikeDislikeButtons: React.FC<LikeDislikeButtonsProps> = ({ toolName, toolUrl }) => {
  const [liked, setLiked] = useState<boolean | null>(null);
  const isSubmittingRef = useRef(false);
  const [likesCount, setLikesCount] = useState(0);
  const [dislikesCount, setDislikesCount] = useState(0);

  const currentUrl = toolUrl || window.location.href;

  // Load existing stats
  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/toolreview/stats/${encodeURIComponent(toolName)}?url=${encodeURIComponent(currentUrl)}`);
        const data = await response.json();
        if (data.success) {
          setLikesCount(data.data.likes || 0);
          setDislikesCount(data.data.dislikes || 0);
        }
      } catch (error) {
        // Silently fail - stats are optional
      }
    };
    loadStats();
  }, [toolName, currentUrl]);

  const submitRating = (isLike: boolean) => {
    // Prevent double-clicks
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    
    // Optimistic update - update UI immediately (no waiting)
    const previousLiked = liked;
    setLiked(isLike);
    
    // Update counts optimistically
    if (isLike) {
      setLikesCount(prev => prev + 1);
      if (previousLiked === false) {
        setDislikesCount(prev => Math.max(0, prev - 1));
      }
    } else {
      setDislikesCount(prev => prev + 1);
      if (previousLiked === true) {
        setLikesCount(prev => Math.max(0, prev - 1));
      }
    }

    // Show success message immediately (instant feedback)
    toast.success(
      isLike ? 'Thank you for your feedback! ❤️' : 'We appreciate your feedback',
      {
        duration: 2000,
      }
    );

    // Submit in background (non-blocking - don't wait for response)
    fetch(`${API_BASE_URL}/toolreview/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        toolName: toolName,
        toolUrl: currentUrl,
        rating: isLike ? 1 : 0
      }),
    })
      .then(async (response) => {
        const data = await response.json();
        
        if (!response.ok || !data.success) {
          // Revert optimistic update on error
          setLiked(previousLiked);
          if (isLike) {
            setLikesCount(prev => Math.max(0, prev - 1));
            if (previousLiked === false) {
              setDislikesCount(prev => prev + 1);
            }
          } else {
            setDislikesCount(prev => Math.max(0, prev - 1));
            if (previousLiked === true) {
              setLikesCount(prev => prev + 1);
            }
          }
          throw new Error(data.error || 'Failed to submit feedback');
        }
        
        // Silently refresh stats from server in background
        fetch(`${API_BASE_URL}/toolreview/stats/${encodeURIComponent(toolName)}?url=${encodeURIComponent(currentUrl)}`)
          .then(res => res.json())
          .then(statsData => {
            if (statsData.success) {
              setLikesCount(statsData.data.likes || 0);
              setDislikesCount(statsData.data.dislikes || 0);
            }
          })
          .catch(() => {}); // Silently fail stats refresh
      })
      .catch((error) => {
        console.error('Error submitting rating:', error);
        toast.error(error.message || 'Failed to submit feedback. Please try again.');
        // Revert optimistic update
        setLiked(previousLiked);
      })
      .finally(() => {
        isSubmittingRef.current = false;
      });
  };

  const handleLike = () => {
    if (liked === true) {
      toast.info('You already liked this tool!');
      return;
    }
    submitRating(true);
  };

  const handleDislike = () => {
    if (liked === false) {
      toast.info('You already disliked this tool!');
      return;
    }
    submitRating(false);
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={liked === true ? "default" : "outline"}
        size="sm"
        onClick={handleLike}
        disabled={false}
        className={cn(
          "gap-1.5 sm:gap-2 text-xs sm:text-sm",
          liked === true && "bg-primary text-primary-foreground"
        )}
        aria-label={`Like ${toolName}`}
      >
        <ThumbsUp className={cn(
          "h-3 w-3 sm:h-4 sm:w-4",
          liked === true && "fill-current"
        )} />
        <span className="hidden sm:inline">Like</span>
        {likesCount > 0 && (
          <Badge variant="secondary" className="ml-1 text-xs">
            {likesCount}
          </Badge>
        )}
      </Button>
      <Button
        variant={liked === false ? "destructive" : "outline"}
        size="sm"
        onClick={handleDislike}
        disabled={false}
        className={cn(
          "gap-1.5 sm:gap-2 text-xs sm:text-sm",
          liked === false && "bg-destructive text-destructive-foreground"
        )}
        aria-label={`Dislike ${toolName}`}
      >
        <ThumbsDown className={cn(
          "h-3 w-3 sm:h-4 sm:w-4",
          liked === false && "fill-current"
        )} />
        <span className="hidden sm:inline">Dislike</span>
        {dislikesCount > 0 && (
          <Badge variant="secondary" className="ml-1 text-xs">
            {dislikesCount}
          </Badge>
        )}
      </Button>
    </div>
  );
};

export default LikeDislikeButtons;

