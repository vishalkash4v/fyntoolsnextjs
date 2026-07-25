'use client';

import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Clock } from 'lucide-react';

interface ProgressWithTimeProps {
  progress: number;
  estimatedTime?: number; // in seconds
  label?: string;
  className?: string;
}

const ProgressWithTime: React.FC<ProgressWithTimeProps> = ({
  progress,
  estimatedTime,
  label = "Processing",
  className = ""
}) => {
  const formatTime = (seconds: number) => {
    if (seconds < 60) {
      return `${Math.ceil(seconds)}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.ceil(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getRemainingTime = () => {
    if (!estimatedTime) return null;
    const remaining = (estimatedTime * (100 - progress)) / 100;
    return remaining > 0 ? remaining : 0;
  };

  const remainingTime = getRemainingTime();

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex justify-between items-center text-sm">
        <div className="flex items-center gap-2">
          <span className="font-medium">{label}</span>
          {remainingTime !== null && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{formatTime(remainingTime)} remaining</span>
            </div>
          )}
        </div>
        <span className="font-semibold text-primary">{Math.round(progress)}%</span>
      </div>
      <Progress 
        value={progress} 
        className="w-full h-2"
      />
    </div>
  );
};

export default ProgressWithTime;
