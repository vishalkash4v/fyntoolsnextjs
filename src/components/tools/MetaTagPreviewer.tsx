'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Eye, Globe } from "lucide-react";
import { toast } from "sonner";
import CopyButton from '@/components/common/CopyButton';

const MetaTagPreviewer = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [image, setImage] = useState('');
  const [siteName, setSiteName] = useState('');
  const [twitterHandle, setTwitterHandle] = useState('');

  const generateMetaTags = () => {
    const metaTags = `<!-- Basic Meta Tags -->
<title>${title}</title>
<meta name="description" content="${description}">

<!-- Open Graph Meta Tags -->
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:url" content="${url}">
<meta property="og:type" content="website">
${image ? `<meta property="og:image" content="${image}">` : ''}
${siteName ? `<meta property="og:site_name" content="${siteName}">` : ''}

<!-- Twitter Card Meta Tags -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${description}">
${twitterHandle ? `<meta name="twitter:site" content="@${twitterHandle}">` : ''}
${image ? `<meta name="twitter:image" content="${image}">` : ''}

<!-- Additional SEO Meta Tags -->
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta charset="UTF-8">`;

    return metaTags;
  };


  const loadSampleData = () => {
    setTitle('Amazing Web Development Tools - Free Online Utilities');
    setDescription('Discover powerful web development tools including image converters, text utilities, and SEO helpers. All free and browser-based with no signup required.');
    setUrl('https://example.com');
    setImage('https://example.com/og-image.jpg');
    setSiteName('Web Tools Hub');
    setTwitterHandle('webtoolshub');
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Meta Tag Previewer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Page Title</Label>
              <Input
                id="title"
                placeholder="Enter page title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={60}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {title.length}/60 characters (optimal: 50-60)
              </p>
            </div>

            <div>
              <Label htmlFor="url">Page URL</Label>
              <Input
                id="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Meta Description</Label>
            <Textarea
              id="description"
              placeholder="Enter meta description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={160}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {description.length}/160 characters (optimal: 150-160)
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="image">OG Image URL</Label>
              <Input
                id="image"
                placeholder="https://example.com/image.jpg"
                value={image}
                onChange={(e) => setImage(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="siteName">Site Name</Label>
              <Input
                id="siteName"
                placeholder="Your Site Name"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="twitter">Twitter Handle (without @)</Label>
            <Input
              id="twitter"
              placeholder="yourusername"
              value={twitterHandle}
              onChange={(e) => setTwitterHandle(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={loadSampleData} variant="outline">
              Load Sample Data
            </Button>
            <CopyButton
              textToCopy={generateMetaTags()}
              successMessage="Meta tags copied to clipboard"
              variant="default"
              size="sm"
              copyText="Copy Meta Tags"
              className="flex-1"
            />
          </div>
        </CardContent>
      </Card>

      {title && description && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Google Search Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-4 bg-white">
                <div className="text-sm text-green-700 mb-1">{url || 'https://example.com'}</div>
                <div className="text-xl text-blue-600 hover:underline cursor-pointer mb-1">
                  {title || 'Page Title'}
                </div>
                <div className="text-sm text-gray-600">
                  {description || 'Meta description will appear here...'}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Social Media Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-4 bg-white max-w-md">
                {image && (
                  <div className="mb-3">
                    <img 
                      src={image} 
                      alt="OG Preview" 
                      className="w-full h-32 object-cover rounded"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
                <div className="space-y-1">
                  <div className="text-sm text-gray-500">{siteName || url}</div>
                  <div className="font-semibold text-gray-900">{title}</div>
                  <div className="text-sm text-gray-600">{description}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Generated Meta Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-muted p-4 rounded overflow-auto max-h-64">
                {generateMetaTags()}
              </pre>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default MetaTagPreviewer;
