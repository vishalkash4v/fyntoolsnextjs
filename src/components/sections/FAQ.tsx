
import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle } from 'lucide-react';

const FAQ = () => {
  const faqs = [
    {
      question: "Are all tools completely free to use?",
      answer: "Yes, all our tools are completely free to use with no hidden charges, registration requirements, or usage limits. We believe in providing accessible tools for everyone."
    },
    {
      question: "Do I need to create an account to use the tools?",
      answer: "No account creation is required. All tools work directly in your browser without any sign-up process. Your data stays private and secure."
    },
    {
      question: "Are my data and calculations secure?",
      answer: "Absolutely. All calculations and data processing happen locally in your browser. We don't store, transmit, or have access to any of your personal data or calculations."
    },
    {
      question: "Can I use these tools on mobile devices?",
      answer: "Yes, all our tools are fully responsive and work perfectly on mobile phones, tablets, and desktop computers. The interface adapts to your screen size for optimal usability."
    },
    {
      question: "Do the tools work offline?",
      answer: "Most of our tools work offline once the page is loaded, except for tools that require real-time data like currency converter or weather-related tools."
    },
    {
      question: "How accurate are the calculations?",
      answer: "Our tools use professional-grade algorithms and formulas to ensure maximum accuracy. Financial calculators follow standard banking formulas, and all calculations are thoroughly tested."
    },
    {
      question: "Can I suggest new tools or features?",
      answer: "We'd love to hear your suggestions! Please contact us through our contact form with your ideas for new tools or improvements to existing ones."
    },
    {
      question: "Are there any usage limits?",
      answer: "No, there are no usage limits. You can use any tool as many times as you need, process any amount of data (within browser limitations), and access all features without restrictions."
    }
  ];

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 backdrop-blur-sm border border-primary/20">
              <HelpCircle className="h-12 w-12 text-primary" />
            </div>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Find answers to common questions about our tools and services
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-center">Common Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
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

export default FAQ;
