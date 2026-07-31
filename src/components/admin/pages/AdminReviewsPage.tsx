'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, ThumbsUp, ThumbsDown, MessageSquare, ExternalLink, ChevronDown, ChevronUp, User, Users } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';



import { API_BASE_URL } from '@/lib/seo/site';
interface ToolStats {
  toolName: string;
  toolUrl: string;
  likes: number;
  dislikes: number;
  total: number;
  reviews: number;
}

interface Review {
  _id: string;
  toolName: string;
  toolUrl: string;
  rating: number;
  feedback: string | null;
  ipAddress: string;
  createdAt: string;
  reviewerType?: 'unique' | 'repeated';
  reviewCountByIp?: number;
}

const AdminReviewsPage = () => {
  const [tools, setTools] = useState<ToolStats[]>([]);
  const [selectedTool, setSelectedTool] = useState<ToolStats | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchTools();
  }, []);

  const fetchTools = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        router.push('/fyntoolsadmin/login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/toolreview/admin/tools`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        router.push('/fyntoolsadmin/login');
        return;
      }

      const data = await response.json();

      if (data.success) {
        setTools(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching tools:', error);
      toast.error('Failed to load tools reviews');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchReviews = async (tool: ToolStats) => {
    if (selectedTool?.toolName === tool.toolName && selectedTool?.toolUrl === tool.toolUrl) {
      // Toggle - close if already open
      setSelectedTool(null);
      setReviews([]);
      return;
    }

    setIsLoadingReviews(true);
    setSelectedTool(tool);

    try {
      const token = localStorage.getItem('adminToken');
      const params = new URLSearchParams({
        toolName: tool.toolName,
        toolUrl: tool.toolUrl,
        limit: '100',
      });

      const response = await fetch(`${API_BASE_URL}/toolreview/admin/reviews?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setReviews(data.data.reviews || []);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setIsLoadingReviews(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Tools Reviews & Feedback</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          Manage reviews and feedback for all tools ({tools.length} tools with reviews)
        </p>
      </div>

      {/* Tools list with inline reviews (reviews expand below selected tool) */}
      <div className="space-y-4">
        {tools.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <p className="text-center text-muted-foreground">
                No tools have received reviews yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          tools.map((tool) => {
            const isSelected = selectedTool?.toolName === tool.toolName && selectedTool?.toolUrl === tool.toolUrl;
            const showReviews = isSelected;
            const toolReviews = showReviews ? reviews : [];

            return (
              <div key={`${tool.toolName}-${tool.toolUrl}`} className="space-y-3">
                <Card
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    isSelected ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => fetchReviews(tool)}
                >
                  <CardHeader className="p-4 sm:p-6">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base sm:text-lg truncate">{tool.toolName}</CardTitle>
                        <CardDescription className="text-xs truncate mt-1 break-all">
                          {tool.toolUrl}
                        </CardDescription>
                      </div>
                      {isSelected ? (
                        <ChevronUp className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                      ) : (
                        <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 pt-0">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ThumbsUp className="h-4 w-4 text-green-600" />
                          <span className="font-semibold text-green-600 text-sm sm:text-base">{tool.likes}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <ThumbsDown className="h-4 w-4 text-red-600" />
                          <span className="font-semibold text-red-600 text-sm sm:text-base">{tool.dislikes}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            {tool.reviews} {tool.reviews === 1 ? 'review' : 'reviews'}
                          </span>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {tool.total} total
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Reviews inline below the selected tool */}
                {showReviews && (
                  <Card className="ml-0 sm:ml-4 border-l-4" style={{ borderLeftColor: 'var(--admin-primary)' }}>
                    <CardHeader className="p-4 sm:p-6 pb-2">
                      <CardTitle className="text-base sm:text-lg">Reviews for {tool.toolName}</CardTitle>
                      <CardDescription className="text-xs sm:text-sm">
                        {toolReviews.length} {toolReviews.length === 1 ? 'review' : 'reviews'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6 pt-0">
                      {isLoadingReviews ? (
                        <div className="flex items-center justify-center py-12">
                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                      ) : toolReviews.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8 text-sm">
                          No reviews found for this tool.
                        </p>
                      ) : (
                        <div className="space-y-3 sm:space-y-4">
                          {toolReviews.map((review) => (
                            <div
                              key={review._id}
                              className="p-3 sm:p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                            >
                              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                                <div className="flex flex-wrap items-center gap-2">
                                  {review.rating === 1 ? (
                                    <ThumbsUp className="h-4 w-4 text-green-600 flex-shrink-0" />
                                  ) : (
                                    <ThumbsDown className="h-4 w-4 text-red-600 flex-shrink-0" />
                                  )}
                                  <Badge variant={review.rating === 1 ? 'default' : 'destructive'} className="text-xs">
                                    {review.rating === 1 ? 'Like' : 'Dislike'}
                                  </Badge>
                                  <Badge
                                    variant={review.reviewerType === 'repeated' ? 'secondary' : 'outline'}
                                    className="text-xs flex items-center gap-1"
                                  >
                                    {review.reviewerType === 'repeated' ? (
                                      <>
                                        <Users className="h-3 w-3" />
                                        Repeated reviewer ({review.reviewCountByIp || 0} reviews from this IP)
                                      </>
                                    ) : (
                                      <>
                                        <User className="h-3 w-3" />
                                        Unique reviewer
                                      </>
                                    )}
                                  </Badge>
                                </div>
                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                  {new Date(review.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              {review.feedback && (
                                <p className="text-xs sm:text-sm mb-2 p-2 bg-muted rounded break-words">
                                  {review.feedback}
                                </p>
                              )}
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-muted-foreground">
                                <span>IP: {review.ipAddress}</span>
                                <a
                                  href={review.toolUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 hover:text-primary break-all"
                                >
                                  <ExternalLink className="h-3 w-3 flex-shrink-0" />
                                  View Tool
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AdminReviewsPage;
