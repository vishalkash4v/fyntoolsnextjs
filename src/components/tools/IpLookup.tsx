'use client';
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Globe, RefreshCw } from 'lucide-react';
import { useIpData } from './ip-lookup/useIpData';
import IpDataCards from './ip-lookup/IpDataCards';

const IpLookup = () => {
  const { ipData, ipv4, ipv6, loading, error, fetchIpData } = useIpData();

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      );
    }
  
    if (error) {
      return (
        <div className="text-center py-10">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={fetchIpData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      );
    }
  
    return <IpDataCards ipData={ipData} ipv4={ipv4} ipv6={ipv6} />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-6 w-6" />
            What's My IP Address
          </CardTitle>
          <CardDescription>
            View your public IP address and location information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-end items-center mb-6">
            <Button onClick={fetchIpData} variant="outline" size="sm" disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          {renderContent()}
        </CardContent>
      </Card>
    </div>
  );
};

export default IpLookup;
