
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote } from 'lucide-react';

const Testimonials = () => {
  const testimonials = [
    {
      name: "Priya Sharma",
      role: "Software Developer",
      company: "Tech Solutions Pvt Ltd",
      content: "The JSON formatter and JavaScript minifier have become essential tools in my daily development workflow. Clean interface and lightning-fast results!",
      rating: 5,
      avatar: "PS"
    },
    {
      name: "Rajesh Kumar",
      role: "Financial Advisor",
      company: "Kumar Financial Services",
      content: "I use the EMI and GST calculators regularly with my clients. The accuracy and professional presentation make client meetings much more effective.",
      rating: 5,
      avatar: "RK"
    },
    {
      name: "Anjali Patel",
      role: "Content Writer",
      company: "Digital Marketing Agency",
      content: "The word counter and text case converter save me hours every week. Perfect for content creation and editing workflows.",
      rating: 5,
      avatar: "AP"
    },
    {
      name: "Vikram Singh",
      role: "Business Owner",
      company: "Singh Enterprises",
      content: "From currency conversion to QR code generation, these tools handle all my business needs. Reliable, fast, and completely free!",
      rating: 5,
      avatar: "VS"
    },
    {
      name: "Meera Joshi",
      role: "Digital Designer",
      company: "Creative Studio",
      content: "The color picker tool is fantastic for design work. The multiple format support and easy copying make it a designer's dream.",
      rating: 5,
      avatar: "MJ"
    },
    {
      name: "Arjun Nair",
      role: "Data Analyst",
      company: "Analytics Corp",
      content: "The duplicate line remover and text processing tools are incredibly useful for data cleaning. They've streamlined my entire workflow.",
      rating: 5,
      avatar: "AN"
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            What Our Users Say
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Trusted by thousands of professionals across India
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-background/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <Quote className="h-8 w-8 text-primary/30 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      "{testimonial.content}"
                    </p>
                    
                    <div className="flex items-center space-x-1 mb-3">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-semibold text-sm">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{testimonial.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {testimonial.role} at {testimonial.company}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
