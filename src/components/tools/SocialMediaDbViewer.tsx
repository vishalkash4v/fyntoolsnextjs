'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Search, User, Calendar, Eye, Heart, MessageCircle, Share, ExternalLink, AlertCircle, Info } from 'lucide-react';

const SocialMediaDbViewer = () => {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [platform, setPlatform] = useState('instagram');

  const validateUsername = (username: string) => {
    const usernameRegex = /^[a-zA-Z0-9._]+$/;
    return username.length > 0 && username.length <= 30 && usernameRegex.test(username);
  };

  const handleSearch = async () => {
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }
    
    if (!validateUsername(username)) {
      setError('Please enter a valid username (letters, numbers, dots, and underscores only)');
      return;
    }

    setError('');
    setLoading(true);
    
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const getProfileUrl = (platform: string, username: string) => {
    const urls = {
      instagram: `https://instagram.com/${username}`,
      facebook: `https://facebook.com/${username}`
    };
    return urls[platform as keyof typeof urls];
  };

  const renderProfileInfo = () => {
    if (!username || !validateUsername(username) || loading) return null;

    return (
      <Card className="mt-4">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Info className="h-5 w-5 text-blue-500" />
              <h4 className="font-semibold">Profile Information</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Username:</p>
                <p className="text-sm font-medium">@{username}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Platform:</p>
                <p className="text-sm capitalize">{platform}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open(getProfileUrl(platform, username), '_blank')}
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                View Profile
              </Button>
            </div>

            <Alert>
              <AlertDescription>
                <strong>Privacy Note:</strong> Only publicly available information can be viewed. Private accounts and personal data are protected by platform privacy settings.
              </AlertDescription>
            </Alert>
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
            <Search className="h-6 w-6" />
            Social Media Profile Lookup
          </CardTitle>
          <CardDescription>
            Look up public profile information from social media platforms
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Privacy Respect:</strong> This tool only provides links to publicly available profiles. It respects privacy settings and does not access private or restricted content.
            </AlertDescription>
          </Alert>
          
          <Tabs value={platform} onValueChange={setPlatform} className="w-full">
            <TabsList>
              <TabsTrigger value="instagram">Instagram</TabsTrigger>
              <TabsTrigger value="facebook">Facebook</TabsTrigger>
            </TabsList>
            
            <TabsContent value="instagram" className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter Instagram username (without @)"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value.replace('@', ''));
                    setError('');
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch} disabled={loading}>
                  {loading ? 'Searching...' : 'Search'}
                </Button>
              </div>
              
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {renderProfileInfo()}
              
              <Alert>
                <AlertDescription>
                  <strong>Instagram Profiles:</strong> You can view public Instagram profiles directly on Instagram. Private profiles require following approval from the account owner.
                </AlertDescription>
              </Alert>
            </TabsContent>
            
            <TabsContent value="facebook" className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter Facebook username or profile name"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setError('');
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch} disabled={loading}>
                  {loading ? 'Searching...' : 'Search'}
                </Button>
              </div>
              
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {renderProfileInfo()}
              
              <Alert>
                <AlertDescription>
                  <strong>Facebook Profiles:</strong> Facebook has strict privacy controls. Most profile information is only visible to friends or connections. Public pages and profiles with public settings can be viewed by anyone.
                </AlertDescription>
              </Alert>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default SocialMediaDbViewer;
