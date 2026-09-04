'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, Link, Video, Image, Music, AlertCircle, ExternalLink, Info } from 'lucide-react';

const SocialMediaDownloader = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('reels');

  const validateSocialMediaUrl = (url: string, type: string) => {
    const patterns = {
      instagram: /^(https?:\/\/)?(www\.)?(instagram\.com|instagr\.am)\/(p|reel|stories)\/[A-Za-z0-9_-]+/,
      facebook: /^(https?:\/\/)?(www\.)?(facebook\.com|fb\.com)\/(watch|reel|stories|photo)/,
      general: /^(https?:\/\/)?(www\.)?(instagram\.com|instagr\.am|facebook\.com|fb\.com)/
    };
    
    return patterns.general.test(url);
  };

  const handleAnalyze = async (type: string) => {
    if (!url.trim()) {
      setError('Please enter a valid social media URL');
      return;
    }
    
    if (!validateSocialMediaUrl(url, type)) {
      setError('Please enter a valid Instagram or Facebook URL');
      return;
    }

    setError('');
    setLoading(true);
    
    // Simulate processing - in reality, this would require backend services
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const renderContentInfo = () => {
    if (!url || !validateSocialMediaUrl(url, activeTab) || loading) return null;

    return (
      <Card className="mt-4">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Info className="h-5 w-5 text-blue-500" />
              <h4 className="font-semibold">Content Information</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">URL:</p>
                <p className="text-sm break-all">{url}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Platform:</p>
                <p className="text-sm">
                  {url.includes('instagram') ? 'Instagram' : 'Facebook'}
                </p>
              </div>
            </div>

            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open(url, '_blank')}
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Open Original Post
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-6 w-6" />
            Social Media Content Information
          </CardTitle>
          <CardDescription>
            Get information about Instagram and Facebook content
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Important:</strong> This tool provides information about social media content. Downloading content may require permission from the original creator and compliance with platform terms of service.
            </AlertDescription>
          </Alert>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="reels">Reels</TabsTrigger>
              <TabsTrigger value="posts">Posts</TabsTrigger>
              <TabsTrigger value="stories">Stories</TabsTrigger>
              <TabsTrigger value="highlights">Highlights</TabsTrigger>
            </TabsList>
            
            <TabsContent value="reels" className="space-y-4">
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Paste Instagram/Facebook Reel URL here..."
                    value={url}
                    onChange={(e) => {
                      setUrl(e.target.value);
                      setError('');
                    }}
                  />
                  <Button onClick={() => handleAnalyze('reel')} disabled={loading}>
                    <Video className="h-4 w-4 mr-2" />
                    {loading ? 'Analyzing...' : 'Analyze'}
                  </Button>
                </div>
                
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                {renderContentInfo()}
                
                <Alert>
                  <AlertDescription>
                    <strong>For Reels:</strong> Most social media platforms have built-in sharing options. Look for the share button and "Copy Link" option to share content legally.
                  </AlertDescription>
                </Alert>
              </div>
            </TabsContent>
            
            <TabsContent value="posts" className="space-y-4">
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Paste Instagram/Facebook Post URL here..."
                    value={url}
                    onChange={(e) => {
                      setUrl(e.target.value);
                      setError('');
                    }}
                  />
                  <Button onClick={() => handleAnalyze('post')} disabled={loading}>
                    <Image className="h-4 w-4 mr-2" />
                    {loading ? 'Analyzing...' : 'Analyze'}
                  </Button>
                </div>
                
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                {renderContentInfo()}
                
                <Alert>
                  <AlertDescription>
                    <strong>For Posts:</strong> Screenshots are often the most appropriate way to save posts for personal reference. Always respect creator rights and privacy settings.
                  </AlertDescription>
                </Alert>
              </div>
            </TabsContent>
            
            <TabsContent value="stories" className="space-y-4">
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Paste Instagram/Facebook Story URL here..."
                    value={url}
                    onChange={(e) => {
                      setUrl(e.target.value);
                      setError('');
                    }}
                  />
                  <Button onClick={() => handleAnalyze('story')} disabled={loading}>
                    <Video className="h-4 w-4 mr-2" />
                    {loading ? 'Analyzing...' : 'Analyze'}
                  </Button>
                </div>
                
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                {renderContentInfo()}
                
                <Alert>
                  <AlertDescription>
                    <strong>For Stories:</strong> Stories are temporary content (24 hours). Most platforms provide built-in options to save your own stories or share others' stories through official channels.
                  </AlertDescription>
                </Alert>
              </div>
            </TabsContent>
            
            <TabsContent value="highlights" className="space-y-4">
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Paste Instagram Highlights URL here..."
                    value={url}
                    onChange={(e) => {
                      setUrl(e.target.value);
                      setError('');
                    }}
                  />
                  <Button onClick={() => handleAnalyze('highlight')} disabled={loading}>
                    <Download className="h-4 w-4 mr-2" />
                    {loading ? 'Analyzing..' : 'Analyze'}
                  </Button>
                </div>
                
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                {renderContentInfo()}
                
                <Alert>
                  <AlertDescription>
                    <strong>For Highlights:</strong> Highlights are curated collections of stories. Use platform-provided sharing options or screenshots for personal reference.
                  </AlertDescription>
                </Alert>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default SocialMediaDownloader;
