'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';



import { API_BASE_URL } from '@/lib/seo/site';
const blogTypes = [
  { value: 'how-to', label: 'How To Guide', description: 'Step-by-step instructional content' },
  { value: 'best', label: 'Best Of', description: 'Comparison and review of top options' },
  { value: 'top', label: 'Top List', description: 'Ranked list with detailed explanations' },
  { value: 'guide', label: 'Complete Guide', description: 'Comprehensive guide from basics to advanced' },
  { value: 'tutorial', label: 'Tutorial', description: 'Step-by-step learning guide with examples' },
  { value: 'comparison', label: 'Comparison', description: 'Compare different options or tools' },
  { value: 'review', label: 'Review', description: 'Detailed analysis and review' },
  { value: 'tips', label: 'Tips & Tricks', description: 'Practical advice and best practices' },
  { value: 'what-is', label: 'What Is', description: 'Explanatory article about a concept' },
  { value: 'why', label: 'Why', description: 'Explaining reasons and benefits' },
];

const categories = [
  'General',
  'Technology',
  'Tools',
  'Tutorial',
  'Guide',
  'Best Practices',
  'Development',
  'Productivity',
];

const AIBlogGenerationPage = () => {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [topic, setTopic] = useState('');
  const [blogType, setBlogType] = useState('guide');
  const [category, setCategory] = useState('General');
  const [targetKeywords, setTargetKeywords] = useState('');
  const [wordCount, setWordCount] = useState(1500);
  const [includeInternalLinks, setIncludeInternalLinks] = useState(true);
  const [includeExternalLinks, setIncludeExternalLinks] = useState(true);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a topic');
      return;
    }

    setIsGenerating(true);
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        router.push('/fyntoolsadmin/login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/blog/generate-ai`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: topic.trim(),
          blogType,
          category,
          targetKeywords: targetKeywords.trim(),
          includeInternalLinks,
          includeExternalLinks,
          wordCount: parseInt(wordCount.toString()),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate blog');
      }

      const data = await response.json();
      
      if (data.success) {
        toast.success('Blog generated successfully! Review and publish when ready.');
        router.push(`/fyntoolsadmin/blogs/edit/${data.data._id}`);
      } else {
        throw new Error(data.error || 'Failed to generate blog');
      }
    } catch (error: any) {
      console.error('Generation error:', error);
      toast.error(error.message || 'Failed to generate blog. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 admin-fade-in">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
          <Button variant="ghost" onClick={() => router.push('/fyntoolsadmin/blogs')} size="sm" className="w-full sm:w-auto">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Blogs
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
              <Sparkles className="h-6 w-6 sm:h-8 sm:w-8" />
              AI Blog Generator
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              Generate high-quality blog posts using AI with automatic internal and external linking
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl">Blog Details</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Provide information about the blog you want to generate
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 space-y-4 sm:space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="topic" className="text-sm sm:text-base">Topic *</Label>
                  <Input
                    id="topic"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., URL Shortener Tools, AI Text Rewriting, Image Compression"
                    disabled={isGenerating}
                    className="text-sm sm:text-base"
                  />
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Enter the main topic or subject of the blog post
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="blogType" className="text-sm sm:text-base">Blog Type *</Label>
                  <Select value={blogType} onValueChange={setBlogType} disabled={isGenerating}>
                    <SelectTrigger className="text-sm sm:text-base">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {blogTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div>
                            <div className="font-medium text-sm sm:text-base">{type.label}</div>
                            <div className="text-xs text-muted-foreground">{type.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-sm sm:text-base">Category</Label>
                    <Select value={category} onValueChange={setCategory} disabled={isGenerating}>
                      <SelectTrigger className="text-sm sm:text-base">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="wordCount" className="text-sm sm:text-base">Word Count</Label>
                    <Input
                      id="wordCount"
                      type="number"
                      value={wordCount}
                      onChange={(e) => setWordCount(parseInt(e.target.value) || 1500)}
                      min={500}
                      max={5000}
                      step={100}
                      disabled={isGenerating}
                      className="text-sm sm:text-base"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="keywords" className="text-sm sm:text-base">Target Keywords (comma-separated)</Label>
                  <Input
                    id="keywords"
                    value={targetKeywords}
                    onChange={(e) => setTargetKeywords(e.target.value)}
                    placeholder="e.g., url shortener, free tools, seo"
                    disabled={isGenerating}
                    className="text-sm sm:text-base"
                  />
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Keywords will be naturally incorporated into the content
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl">Linking Options</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Configure internal and external links in the generated blog
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-0.5 flex-1">
                    <Label htmlFor="internalLinks" className="text-sm sm:text-base">Include Internal Links</Label>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Automatically add links to relevant FYN Tools
                    </p>
                  </div>
                  <Switch
                    id="internalLinks"
                    checked={includeInternalLinks}
                    onCheckedChange={setIncludeInternalLinks}
                    disabled={isGenerating}
                    className="flex-shrink-0"
                  />
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-0.5 flex-1">
                    <Label htmlFor="externalLinks" className="text-sm sm:text-base">Include External Links</Label>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Add links to authoritative external sources
                    </p>
                  </div>
                  <Switch
                    id="externalLinks"
                    checked={includeExternalLinks}
                    onCheckedChange={setIncludeExternalLinks}
                    disabled={isGenerating}
                    className="flex-shrink-0"
                  />
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !topic.trim()}
              className="w-full"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating Blog...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Blog
                </>
              )}
            </Button>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-4 sm:space-y-6">
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl">SEO Auto-Generated</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 text-sm text-muted-foreground space-y-2">
                <p>Each draft includes:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Meta title &amp; meta description</li>
                  <li>Focus keyword + keyword list</li>
                  <li>Canonical, Open Graph &amp; Twitter fields</li>
                  <li>JSON-LD: Article, BreadcrumbList, FAQPage, HowTo (when relevant)</li>
                  <li>TOC, FAQ section, and internal/external links</li>
                </ul>
                <p className="pt-2">Saved as <strong>draft</strong> — review before publishing.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl">How It Works</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 space-y-3 text-xs sm:text-sm">
                <div>
                  <strong className="text-sm sm:text-base">1. AI Generation</strong>
                  <p className="text-muted-foreground mt-1">
                    Uses Google Gemini AI to generate high-quality, SEO-optimized content
                  </p>
                </div>
                <div>
                  <strong className="text-sm sm:text-base">2. Internal Linking</strong>
                  <p className="text-muted-foreground mt-1">
                    Automatically includes relevant links to FYN Tools throughout the content
                  </p>
                </div>
                <div>
                  <strong className="text-sm sm:text-base">3. External Links</strong>
                  <p className="text-muted-foreground mt-1">
                    Adds authoritative external links for credibility and SEO
                  </p>
                </div>
                <div>
                  <strong className="text-sm sm:text-base">4. Review & Publish</strong>
                  <p className="text-muted-foreground mt-1">
                    Generated blog is saved as draft for you to review and edit before publishing
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl">Tips</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 space-y-2 text-xs sm:text-sm text-muted-foreground">
                <p>• Be specific with your topic for better results</p>
                <p>• Include relevant keywords for SEO optimization</p>
                <p>• Review generated content before publishing</p>
                <p>• Edit and customize the AI-generated content as needed</p>
                <p>• Add images and optimize for better engagement</p>
              </CardContent>
            </Card>
          </div>
        </div>
    </div>
  );
};

export default AIBlogGenerationPage;
