
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface ToolWrapperProps {
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
}

const ToolWrapper = ({ title, description, children, className = '' }: ToolWrapperProps) => {
  return (
    <div className={`w-full min-h-screen space-y-4 sm:space-y-6 ${className}`}>
      <div className="text-center space-y-2 px-2 sm:px-4">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">{title}</h1>
        <p className="text-sm sm:text-base text-muted-foreground max-w-3xl mx-auto">
          {description}
        </p>
      </div>
      
      <div className="w-full px-2 sm:px-4">
        <Card className="w-full max-w-none bg-card text-card-foreground border-border">
          <CardContent className="p-4 sm:p-6 w-full">
            {children}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ToolWrapper;
