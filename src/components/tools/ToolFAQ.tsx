'use client';
/**
 * Reusable FAQ Component for Tool Pages
 * Matches the homepage FAQ interface with Accordion style
 * Includes schema markup support for SEO
 */

import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle } from 'lucide-react';

interface ToolFAQProps {
  /**
   * Tool name for the FAQ title
   */
  toolName: string;
  /**
   * Array of FAQ items with question and answer
   */
  faqs: Array<{ question: string; answer: string }>;
  /**
   * Optional custom title (defaults to "Frequently Asked Questions About {toolName}")
   */
  title?: string;
  /**
   * Optional custom description
   */
  description?: string;
  /**
   * Optional className for the section wrapper
   */
  className?: string;
}

const ToolFAQ: React.FC<ToolFAQProps> = ({
  toolName,
  faqs,
  title,
  description,
  className = ""
}) => {
  // Don't render if no FAQs provided
  if (!faqs || faqs.length === 0) {
    return null;
  }

  // Filter out invalid FAQs
  const validFaqs = faqs.filter(faq => 
    faq.question && faq.answer && 
    typeof faq.question === 'string' &&
    typeof faq.answer === 'string' &&
    faq.question.trim().length > 0 && 
    faq.answer.trim().length > 0
  );

  if (validFaqs.length === 0) {
    return null;
  }

  const defaultTitle = `Frequently Asked Questions About ${toolName}`;
  const defaultDescription = "Find answers to common questions about this tool";

  return (
    <section id="faq" className={`py-16 bg-muted/30 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 backdrop-blur-sm border border-primary/20">
              <HelpCircle className="h-12 w-12 text-primary" />
            </div>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {title || defaultTitle}
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {description || defaultDescription}
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-center">Common Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {validFaqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left hover:text-primary transition-colors">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ToolFAQ;
