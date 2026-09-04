'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Shuffle, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import CopyButton from '@/components/common/CopyButton';

const BusinessIdeaGenerator = () => {
  const [ideas, setIdeas] = useState<any[]>([]);
  const [industry, setIndustry] = useState('all');
  const [budget, setBudget] = useState('all');

  const industries = [
    { value: 'all', label: 'All Industries' },
    { value: 'tech', label: 'Technology' },
    { value: 'health', label: 'Health & Fitness' },
    { value: 'education', label: 'Education' },
    { value: 'food', label: 'Food & Beverage' },
    { value: 'retail', label: 'Retail & E-commerce' },
    { value: 'service', label: 'Service Business' },
    { value: 'creative', label: 'Creative & Arts' }
  ];

  const budgetOptions = [
    { value: 'all', label: 'All Budgets' },
    { value: 'low', label: 'Low Budget ($0 - $1K)' },
    { value: 'medium', label: 'Medium Budget ($1K - $10K)' },
    { value: 'high', label: 'High Budget ($10K+)' }
  ];

  const businessIdeas = {
    tech: [
      { idea: 'AI-Powered Content Creation Tool', difficulty: 'High', budget: 'high', potential: 'High' },
      { idea: 'No-Code Website Builder for Restaurants', difficulty: 'Medium', budget: 'medium', potential: 'Medium' },
      { idea: 'Social Media Scheduling App', difficulty: 'Medium', budget: 'medium', potential: 'High' },
      { idea: 'Digital Receipt Management System', difficulty: 'Low', budget: 'low', potential: 'Medium' }
    ],
    health: [
      { idea: 'Virtual Fitness Coaching Platform', difficulty: 'Medium', budget: 'medium', potential: 'High' },
      { idea: 'Meal Planning & Nutrition Tracking App', difficulty: 'Medium', budget: 'medium', potential: 'High' },
      { idea: 'Mental Health Support Chatbot', difficulty: 'High', budget: 'high', potential: 'High' },
      { idea: 'Home Workout Equipment Rental', difficulty: 'Low', budget: 'low', potential: 'Medium' }
    ],
    education: [
      { idea: 'Online Tutoring Marketplace', difficulty: 'Medium', budget: 'medium', potential: 'High' },
      { idea: 'Skill-Based Learning Platform', difficulty: 'High', budget: 'high', potential: 'High' },
      { idea: 'Language Exchange App', difficulty: 'Medium', budget: 'medium', potential: 'Medium' },
      { idea: 'Educational Game Development', difficulty: 'High', budget: 'high', potential: 'Medium' }
    ],
    food: [
      { idea: 'Ghost Kitchen for Healthy Meals', difficulty: 'Medium', budget: 'medium', potential: 'High' },
      { idea: 'Specialty Coffee Subscription Service', difficulty: 'Low', budget: 'low', potential: 'Medium' },
      { idea: 'Food Waste Reduction App', difficulty: 'Medium', budget: 'medium', potential: 'High' },
      { idea: 'Meal Kit Delivery for Seniors', difficulty: 'Medium', budget: 'medium', potential: 'Medium' }
    ],
    retail: [
      { idea: 'Sustainable Fashion Marketplace', difficulty: 'Medium', budget: 'medium', potential: 'High' },
      { idea: 'Custom Product Personalization Service', difficulty: 'Low', budget: 'low', potential: 'Medium' },
      { idea: 'Local Artisan E-commerce Platform', difficulty: 'Medium', budget: 'medium', potential: 'Medium' },
      { idea: 'Subscription Box for Pet Products', difficulty: 'Low', budget: 'low', potential: 'High' }
    ],
    service: [
      { idea: 'On-Demand Home Cleaning Service', difficulty: 'Low', budget: 'low', potential: 'High' },
      { idea: 'Digital Marketing Agency for Small Businesses', difficulty: 'Low', budget: 'low', potential: 'High' },
      { idea: 'Virtual Assistant Services', difficulty: 'Low', budget: 'low', potential: 'Medium' },
      { idea: 'Senior Care Coordination Platform', difficulty: 'Medium', budget: 'medium', potential: 'High' }
    ],
    creative: [
      { idea: 'Custom Digital Art Commission Platform', difficulty: 'Low', budget: 'low', potential: 'Medium' },
      { idea: 'Stock Photo & Video Marketplace', difficulty: 'Medium', budget: 'medium', potential: 'Medium' },
      { idea: 'Event Planning & Design Service', difficulty: 'Low', budget: 'low', potential: 'Medium' },
      { idea: 'Personalized Gift Creation Service', difficulty: 'Low', budget: 'low', potential: 'High' }
    ]
  };

  const generateIdeas = () => {
    let allIdeas: any[] = [];
    
    if (industry === 'all') {
      Object.values(businessIdeas).forEach(categoryIdeas => {
        allIdeas = [...allIdeas, ...categoryIdeas];
      });
    } else {
      allIdeas = businessIdeas[industry as keyof typeof businessIdeas] || [];
    }
    
    if (budget !== 'all') {
      allIdeas = allIdeas.filter(idea => idea.budget === budget);
    }
    
    // Shuffle and take 6 random ideas
    const shuffled = allIdeas.sort(() => 0.5 - Math.random());
    setIdeas(shuffled.slice(0, 6));
  };


  const getBadgeColor = (value: string, type: string) => {
    if (type === 'difficulty') {
      return value === 'Low' ? 'bg-green-100 text-green-800' : 
             value === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800';
    }
    if (type === 'potential') {
      return value === 'High' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800';
    }
    return 'bg-purple-100 text-purple-800';
  };

  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-6 w-6" />
            Business Idea Generator
          </CardTitle>
          <CardDescription>
            Generate innovative business ideas based on your preferences and budget
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Industry</label>
              <Select value={industry} onValueChange={setIndustry}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {industries.map((ind) => (
                    <SelectItem key={ind.value} value={ind.value}>
                      {ind.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Budget Range</label>
              <Select value={budget} onValueChange={setBudget}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {budgetOptions.map((budgetOption) => (
                    <SelectItem key={budgetOption.value} value={budgetOption.value}>
                      {budgetOption.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={generateIdeas} className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Generate Ideas
            </Button>
            <Button variant="outline" onClick={generateIdeas}>
              <Shuffle className="h-4 w-4" />
            </Button>
          </div>
          
          {ideas.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Generated Business Ideas</h3>
              <div className="grid gap-4">
                {ideas.map((idea, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg mb-2">{idea.idea}</h4>
                        <div className="flex gap-2 mb-2">
                          <Badge className={getBadgeColor(idea.difficulty, 'difficulty')}>
                            {idea.difficulty} Difficulty
                          </Badge>
                          <Badge className={getBadgeColor(idea.potential, 'potential')}>
                            {idea.potential} Potential
                          </Badge>
                          <Badge className={getBadgeColor(idea.budget, 'budget')}>
                            {budgetOptions.find(b => b.value === idea.budget)?.label.split(' ')[0]} Budget
                          </Badge>
                        </div>
                      </div>
                      <CopyButton
                        textToCopy={idea.idea}
                        successMessage="Business idea copied to clipboard!"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                      />
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BusinessIdeaGenerator;
