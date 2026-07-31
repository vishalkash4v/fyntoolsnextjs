'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, ArrowLeft, Eye, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import ProfessionalRichTextEditor from '@/components/admin/ProfessionalRichTextEditor';



import { API_BASE_URL } from '@/lib/seo/site';
interface BlogEditorProps {
  blogId?: string;
}

const BlogEditor = ({ blogId }: BlogEditorProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [category, setCategory] = useState('General');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [status, setStatus] = useState<'draft' | 'published' | 'scheduled'>('draft');
  const [publishDate, setPublishDate] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [noIndex, setNoIndex] = useState(false);
  const [noFollow, setNoFollow] = useState(false);

  // SEO fields
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [focusKeyword, setFocusKeyword] = useState('');
  const [canonicalUrl, setCanonicalUrl] = useState('');

  useEffect(() => {
    if (blogId) {
      fetchBlog();
    }
  }, [blogId]);

  const fetchBlog = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/blog/admin/${blogId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch blog');

      const data = await response.json();
      if (data.success && data.data) {
        const blog = data.data;
        setTitle(blog.title || '');
        setSlug(blog.slug || '');
        setContent(blog.content || '');
        setExcerpt(blog.excerpt || '');
        setCategory(blog.category || 'General');
        setTags(blog.tags || []);
        setStatus(blog.status || 'draft');
        setPublishDate(blog.publishDate ? new Date(blog.publishDate).toISOString().split('T')[0] : '');
        setScheduledDate(blog.scheduledDate ? new Date(blog.scheduledDate).toISOString().split('T')[0] : '');
        setFeaturedImage(blog.featuredImage || '');
        setIsFeatured(blog.isFeatured || false);
        setNoIndex(blog.noIndex || false);
        setNoFollow(blog.noFollow || false);
        setMetaTitle(blog.metaTitle || '');
        setMetaDescription(blog.metaDescription || '');
        setFocusKeyword(blog.focusKeyword || '');
        setCanonicalUrl(blog.canonicalUrl || '');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to load blog');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (publish: boolean = false) => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      const finalStatus = publish ? 'published' : status;

      const blogData = {
        title,
        slug: slug || generateSlug(title),
        content,
        excerpt,
        category,
        tags,
        status: finalStatus,
        publishDate: publish ? new Date().toISOString() : (publishDate || new Date().toISOString()),
        scheduledDate: scheduledDate || null,
        featuredImage,
        isFeatured,
        noIndex,
        noFollow,
        metaTitle: metaTitle || title,
        metaDescription: metaDescription || excerpt.substring(0, 160),
        focusKeyword,
        canonicalUrl: canonicalUrl || `https://fyntools.com/blog/${slug || generateSlug(title)}`,
      };

      const url = blogId ? `${API_BASE_URL}/blog/${blogId}` : `${API_BASE_URL}/blog`;
      const method = blogId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(blogData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to save blog' }));
        throw new Error(errorData.error || 'Failed to save blog');
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to save blog');
      }
      
      toast.success(blogId ? 'Blog updated successfully' : 'Blog created successfully');
      
      if (!blogId && data.data?._id) {
        router.push(`/fyntoolsadmin/blogs/edit/${data.data._id}`);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to save blog');
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      const token = localStorage.getItem('adminToken');
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`${API_BASE_URL}/blog/upload-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to upload image');

      const data = await response.json();
      if (data.success) {
        setFeaturedImage(data.data.url);
        toast.success('Image uploaded successfully');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload image');
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 100);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">Loading blog...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
          <Button variant="ghost" onClick={() => router.push('/fyntoolsadmin/blogs')} size="sm" className="w-full sm:w-auto">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Blogs
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold">
            {blogId ? 'Edit Blog' : 'Create New Blog'}
          </h1>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={() => setPreviewMode(!previewMode)} size="sm" className="w-full sm:w-auto">
            <Eye className="h-4 w-4 mr-2" />
            {previewMode ? 'Edit' : 'Preview'}
          </Button>
          <Button variant="outline" onClick={() => handleSave(false)} disabled={isSaving} size="sm" className="w-full sm:w-auto">
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          <Button onClick={() => handleSave(true)} disabled={isSaving} size="sm" className="w-full sm:w-auto">
            {isSaving ? 'Saving...' : 'Publish'}
          </Button>
        </div>
      </div>

      {previewMode ? (
        <Card>
          <CardContent className="p-4 sm:p-6">
            <article className="prose prose-sm sm:prose-lg max-w-none">
              <h1 className="text-2xl sm:text-4xl">{title || 'Untitled'}</h1>
              <div dangerouslySetInnerHTML={{ __html: content }} />
            </article>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl">Content</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm sm:text-base">Title *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      if (!slug) {
                        setSlug(generateSlug(e.target.value));
                      }
                    }}
                    placeholder="Enter blog title"
                    className="text-sm sm:text-base"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug" className="text-sm sm:text-base">Slug</Label>
                  <Input
                    id="slug"
                    value={slug}
                    onChange={(e) => setSlug(generateSlug(e.target.value))}
                    placeholder="blog-url-slug"
                    className="text-sm sm:text-base"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="excerpt" className="text-sm sm:text-base">Excerpt</Label>
                  <Textarea
                    id="excerpt"
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    placeholder="Short description of the blog"
                    rows={3}
                    className="text-sm sm:text-base"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content" className="text-sm sm:text-base">Content *</Label>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-2">
                    Use H1 for main title, H2-H6 for sections. Write in paragraphs for better SEO.
                  </p>
                  <ProfessionalRichTextEditor value={content} onChange={setContent} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 sm:space-y-6">
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl">Publish</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-sm sm:text-base">Status</Label>
                  <Select value={status} onValueChange={(v: any) => setStatus(v)}>
                    <SelectTrigger className="text-sm sm:text-base">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {status === 'scheduled' && (
                  <div className="space-y-2">
                    <Label htmlFor="scheduledDate" className="text-sm sm:text-base">Scheduled Date</Label>
                    <Input
                      id="scheduledDate"
                      type="datetime-local"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="text-sm sm:text-base"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between gap-4">
                  <Label htmlFor="featured" className="text-sm sm:text-base">Featured</Label>
                  <Switch
                    id="featured"
                    checked={isFeatured}
                    onCheckedChange={setIsFeatured}
                    className="flex-shrink-0"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl">Categories & Tags</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-sm sm:text-base">Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="text-sm sm:text-base">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="General">General</SelectItem>
                      <SelectItem value="Technology">Technology</SelectItem>
                      <SelectItem value="Tools">Tools</SelectItem>
                      <SelectItem value="Tutorial">Tutorial</SelectItem>
                      <SelectItem value="Guide">Guide</SelectItem>
                      <SelectItem value="Best Practices">Best Practices</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags" className="text-sm sm:text-base">Tags</Label>
                  <div className="flex gap-2">
                    <Input
                      id="tags"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addTag()}
                      placeholder="Add tag"
                      className="text-sm sm:text-base flex-1"
                    />
                    <Button type="button" onClick={addTag} size="sm" className="flex-shrink-0">Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="cursor-pointer text-xs" onClick={() => removeTag(tag)}>
                        {tag} <X className="h-3 w-3 ml-1" />
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl">Featured Image</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
                {featuredImage && (
                  <div className="relative">
                    <img src={featuredImage} alt="Featured" className="w-full rounded-lg" />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 h-8 w-8 p-0"
                      onClick={() => setFeaturedImage('')}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file);
                  }}
                  className="text-xs sm:text-sm"
                />
                {featuredImage && (
                  <Input
                    value={featuredImage}
                    onChange={(e) => setFeaturedImage(e.target.value)}
                    placeholder="Or enter image URL"
                    className="text-sm sm:text-base"
                  />
                )}
              </CardContent>
            </Card>

            <Tabs defaultValue="seo" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="seo" className="text-xs sm:text-sm">SEO</TabsTrigger>
                <TabsTrigger value="advanced" className="text-xs sm:text-sm">Advanced</TabsTrigger>
              </TabsList>
              <TabsContent value="seo" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="metaTitle" className="text-sm sm:text-base">Meta Title</Label>
                  <Input
                    id="metaTitle"
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    placeholder="SEO title (60 chars)"
                    maxLength={60}
                    className="text-sm sm:text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="metaDescription" className="text-sm sm:text-base">Meta Description</Label>
                  <Textarea
                    id="metaDescription"
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    placeholder="SEO description (160 chars)"
                    rows={3}
                    maxLength={160}
                    className="text-sm sm:text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="focusKeyword" className="text-sm sm:text-base">Focus Keyword</Label>
                  <Input
                    id="focusKeyword"
                    value={focusKeyword}
                    onChange={(e) => setFocusKeyword(e.target.value)}
                    placeholder="Primary keyword"
                    className="text-sm sm:text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="canonicalUrl" className="text-sm sm:text-base">Canonical URL</Label>
                  <Input
                    id="canonicalUrl"
                    value={canonicalUrl}
                    onChange={(e) => setCanonicalUrl(e.target.value)}
                    placeholder="https://fyntools.com/blog/..."
                    className="text-sm sm:text-base"
                  />
                </div>
              </TabsContent>
              <TabsContent value="advanced" className="space-y-4 mt-4">
                <div className="flex items-center justify-between gap-4">
                  <Label htmlFor="noIndex" className="text-sm sm:text-base">No Index</Label>
                  <Switch
                    id="noIndex"
                    checked={noIndex}
                    onCheckedChange={setNoIndex}
                    className="flex-shrink-0"
                  />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <Label htmlFor="noFollow" className="text-sm sm:text-base">No Follow</Label>
                  <Switch
                    id="noFollow"
                    checked={noFollow}
                    onCheckedChange={setNoFollow}
                    className="flex-shrink-0"
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogEditor;
