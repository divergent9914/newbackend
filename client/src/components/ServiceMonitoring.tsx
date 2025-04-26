import React from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ServiceMonitoring: React.FC = () => {
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-neutral-darkest">Service Monitoring</h2>
        <div className="flex items-center space-x-2">
          <Select defaultValue="24h">
            <SelectTrigger className="w-[180px] h-9 text-sm">
              <SelectValue placeholder="Select time period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <h3 className="text-sm font-medium text-neutral-dark mb-4">Request Volume</h3>
            <div className="h-48 bg-neutral-lightest rounded-lg flex items-center justify-center">
              <span className="text-sm text-neutral-medium">Request Volume Chart</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <h3 className="text-sm font-medium text-neutral-dark mb-4">Response Time (ms)</h3>
            <div className="h-48 bg-neutral-lightest rounded-lg flex items-center justify-center">
              <span className="text-sm text-neutral-medium">Response Time Chart</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <h3 className="text-sm font-medium text-neutral-dark mb-4">Error Rate</h3>
            <div className="h-48 bg-neutral-lightest rounded-lg flex items-center justify-center">
              <span className="text-sm text-neutral-medium">Error Rate Chart</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <h3 className="text-sm font-medium text-neutral-dark mb-4">Service Health</h3>
            <div className="h-48 bg-neutral-lightest rounded-lg flex items-center justify-center">
              <span className="text-sm text-neutral-medium">Service Health Chart</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default ServiceMonitoring;
