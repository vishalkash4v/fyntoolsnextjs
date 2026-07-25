'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, Plus, Trash2, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Post {
  id: string;
  platform: string;
  content: string;
  scheduledDate: string;
  scheduledTime: string;
  status: 'scheduled' | 'draft';
}

const SocialMediaPlanner = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [platform, setPlatform] = useState('');
  const [content, setContent] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const savedPosts = localStorage.getItem('socialMediaPosts');
    if (savedPosts) {
      setPosts(JSON.parse(savedPosts));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('socialMediaPosts', JSON.stringify(posts));
  }, [posts]);

  const addPost = () => {
    if (!platform || !content || !scheduledDate || !scheduledTime) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    const newPost: Post = {
      id: Date.now().toString(),
      platform,
      content,
      scheduledDate,
      scheduledTime,
      status: 'scheduled'
    };

    if (editingId) {
      setPosts(prev => prev.map(post => 
        post.id === editingId ? { ...newPost, id: editingId } : post
      ));
      setEditingId(null);
      toast({
        title: "Updated!",
        description: "Post updated successfully"
      });
    } else {
      setPosts(prev => [...prev, newPost]);
      toast({
        title: "Added!",
        description: "Post scheduled successfully"
      });
    }

    // Reset form
    setPlatform('');
    setContent('');
    setScheduledDate('');
    setScheduledTime('');
  };

  const editPost = (post: Post) => {
    setPlatform(post.platform);
    setContent(post.content);
    setScheduledDate(post.scheduledDate);
    setScheduledTime(post.scheduledTime);
    setEditingId(post.id);
  };

  const deletePost = (id: string) => {
    setPosts(prev => prev.filter(post => post.id !== id));
    toast({
      title: "Deleted",
      description: "Post removed from schedule"
    });
  };

  const formatDateTime = (date: string, time: string) => {
    return new Date(`${date}T${time}`).toLocaleString();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Social Media Content Planner
          </CardTitle>
          <CardDescription>
            Plan and organize your social media content
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="platform">Platform</Label>
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger>
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="twitter">Twitter</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                  <SelectItem value="youtube">YouTube</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              placeholder="Write your post content here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
            />
          </div>

          <Button onClick={addPost} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            {editingId ? 'Update Post' : 'Schedule Post'}
          </Button>
        </CardContent>
      </Card>

      {posts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Scheduled Posts ({posts.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {posts.map((post) => (
                <div key={post.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium capitalize">{post.platform}</span>
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDateTime(post.scheduledDate, post.scheduledTime)}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => editPost(post)}>
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => deletePost(post.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm">{post.content}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Best Posting Times</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Weekdays</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>Instagram: 11 AM - 1 PM, 5-7 PM</li>
                <li>Twitter: 9 AM, 1-3 PM</li>
                <li>LinkedIn: 8-10 AM, 12 PM, 5-6 PM</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Weekends</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>Facebook: 1-3 PM Saturday</li>
                <li>Instagram: 10-11 AM Sunday</li>
                <li>Twitter: 9-10 AM weekend</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SocialMediaPlanner;
