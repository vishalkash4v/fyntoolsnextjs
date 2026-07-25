'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tool } from '@/data/toolsData';

interface ToolSearchProps {
  tools: Tool[];
  className?: string;
  onResultClick?: () => void;
}

const ToolSearch: React.FC<ToolSearchProps> = ({ tools, className, onResultClick }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const filteredTools = useMemo(() => {
    if (!searchTerm.trim()) return [];
    
    const query = searchTerm.toLowerCase();
    return tools.filter(tool => 
      tool.name.toLowerCase().includes(query) ||
      tool.description.toLowerCase().includes(query) ||
      tool.category.toLowerCase().includes(query) ||
      tool.keywords.toLowerCase().includes(query)
    ).slice(0, 8);
  }, [searchTerm, tools]);

  const handleClear = () => {
    setSearchTerm('');
    setIsOpen(false);
  };

  const handleResultClick = (toolPath: string) => {
    setIsOpen(false);
    setSearchTerm('');
    router.push(toolPath);
    if (onResultClick) {
      onResultClick();
    }
  };

  return (
    <div className={cn("relative w-full", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search tools..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="pl-10 pr-10 h-10 md:h-12 text-sm md:text-base border-2 rounded-xl"
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        )}
      </div>

      {isOpen && searchTerm && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <Card className="absolute top-full left-0 right-0 mt-2 z-50 max-h-96 overflow-y-auto shadow-2xl border-2 rounded-xl bg-background/98 backdrop-blur-xl backdrop-saturate-150">
            <CardContent className="p-2 bg-background/95 backdrop-blur-md">
              {filteredTools.length > 0 ? (
                <div className="space-y-1">
                  {filteredTools.map((tool) => (
                    <button
                      key={tool.id}
                      onClick={() => handleResultClick(tool.path)}
                      className="w-full text-left block p-3 md:p-4 hover:bg-muted/70 transition-colors border-b border-border/50 last:border-b-0 rounded-md bg-background/90 backdrop-blur-sm"
                    >
                      <div className="flex items-center gap-3">
                        <tool.icon className="h-5 w-5 text-primary shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm truncate text-foreground">{tool.name}</div>
                          <div className="text-xs text-muted-foreground/90 truncate">{tool.description}</div>
                        </div>
                        <Badge variant="secondary" className="text-xs shrink-0 bg-background/80 backdrop-blur-sm">
                          {tool.category.split(' ')[0]}
                        </Badge>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-muted-foreground bg-background/90 backdrop-blur-sm rounded-md">
                  No tools found for "{searchTerm}"
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default ToolSearch;
