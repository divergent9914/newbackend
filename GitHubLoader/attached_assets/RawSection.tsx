import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';

interface RawSectionProps {
  title: string;
  subtitle?: string;
  ctaText?: string;
  onCtaClick?: () => void;
  className?: string;
}

export default function RawSection({ 
  title, 
  subtitle, 
  ctaText = "View All", 
  onCtaClick,
  className = "" 
}: RawSectionProps) {
  return (
    <div className={`mb-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold">{title}</h2>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {ctaText && (
          <Button 
            variant="ghost" 
            className="text-primary flex items-center gap-1 font-medium"
            onClick={onCtaClick}
          >
            {ctaText}
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Premium Cuts */}
        <Card className="bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200 overflow-hidden">
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-amber-800">Premium Cuts</h3>
              <p className="text-sm text-amber-700 mt-1">Farm-fresh daily</p>
              <Button size="sm" className="mt-3 bg-amber-600 hover:bg-amber-700">Explore</Button>
            </div>
            <div className="w-24 h-24 rounded-md overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&q=80&w=200&h=200" 
                alt="Premium cuts" 
                className="h-full w-full object-cover"
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Marinades */}
        <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200 overflow-hidden">
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-red-800">Marinades</h3>
              <p className="text-sm text-red-700 mt-1">Chef's special recipes</p>
              <Button size="sm" className="mt-3 bg-red-600 hover:bg-red-700">Explore</Button>
            </div>
            <div className="w-24 h-24 rounded-md overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&q=80&w=200&h=200" 
                alt="Marinades" 
                className="h-full w-full object-cover"
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Ready to Cook */}
        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200 overflow-hidden">
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-green-800">Ready to Cook</h3>
              <p className="text-sm text-green-700 mt-1">Just heat and eat</p>
              <Button size="sm" className="mt-3 bg-green-600 hover:bg-green-700">Explore</Button>
            </div>
            <div className="w-24 h-24 rounded-md overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1600803907087-f56d462fd26b?auto=format&fit=crop&q=80&w=200&h=200" 
                alt="Ready to cook" 
                className="h-full w-full object-cover"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
