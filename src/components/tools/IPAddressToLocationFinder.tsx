'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Search, Loader2, Globe, Wifi, Building2, Clock, Navigation } from 'lucide-react';
import { toast } from 'sonner';

interface LocationData {
  ip: string;
  city: string;
  region: string;
  country: string;
  country_name: string;
  country_code: string;
  postal: string;
  latitude: number;
  longitude: number;
  timezone: string;
  org: string;
  asn: string;
  currency: string;
  currency_name: string;
  country_calling_code: string;
  languages: string;
}

const IPAddressToLocationFinder = () => {
  const [ipAddress, setIpAddress] = useState('');
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // IP address validation regex
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$/;

  const isValidIP = (ip: string) => {
    if (!ip) return false;
    
    // Check IPv4
    if (ipv4Regex.test(ip)) {
      const parts = ip.split('.');
      return parts.every(part => {
        const num = parseInt(part, 10);
        return num >= 0 && num <= 255;
      });
    }
    
    // Check IPv6 (basic check)
    if (ipv6Regex.test(ip) || ip.includes(':')) {
      return true; // Simplified IPv6 validation
    }
    
    return false;
  };

  const fetchLocation = async () => {
    if (!ipAddress.trim()) {
      toast.error('Please enter an IP address');
      return;
    }

    if (!isValidIP(ipAddress.trim())) {
      toast.error('Please enter a valid IP address (IPv4 or IPv6)');
      return;
    }

    setLoading(true);
    setError(null);
    setLocationData(null);

    try {
      const response = await fetch(`https://ipapi.co/${ipAddress.trim()}/json/`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch location data');
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.reason || 'Invalid IP address or API error');
      }

      setLocationData(data as LocationData);
      toast.success('Location found successfully!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch location. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      fetchLocation();
    }
  };

  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-6 w-6" />
            IP Address to Location Finder
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Input Section */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ip-input">Enter IP Address</Label>
              <div className="flex gap-2">
                <Input
                  id="ip-input"
                  type="text"
                  placeholder="e.g., 8.8.8.8 or 2001:4860:4860::8888"
                  value={ipAddress}
                  onChange={(e) => setIpAddress(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                />
                <Button 
                  onClick={fetchLocation} 
                  disabled={loading || !ipAddress.trim()}
                  className="min-w-[120px]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Find Location
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Enter any IPv4 or IPv6 address to find its location
              </p>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <Card className="border-destructive bg-destructive/10">
              <CardContent className="pt-6">
                <p className="text-destructive text-center">{error}</p>
              </CardContent>
            </Card>
          )}

          {/* Location Data Display */}
          {locationData && (
            <div className="space-y-4">
              {/* IP Information */}
              <Card className="bg-muted/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Wifi className="h-5 w-5" />
                    IP Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-muted-foreground">IP Address</span>
                    <span className="font-mono font-semibold">{locationData.ip}</span>
                  </div>
                  {locationData.org && (
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-muted-foreground">ISP/Organization</span>
                      <span className="text-right">{locationData.org}</span>
                    </div>
                  )}
                  {locationData.asn && (
                    <div className="flex justify-between items-center py-2">
                      <span className="text-muted-foreground">ASN</span>
                      <span className="font-mono">{locationData.asn}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Location Information */}
              <Card className="bg-muted/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Location Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        Country
                      </span>
                      <span className="font-semibold text-right">
                        {locationData.country_name} ({locationData.country_code})
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-muted-foreground">Region</span>
                      <span className="text-right">{locationData.region || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-muted-foreground">City</span>
                      <span className="text-right font-semibold">{locationData.city || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-muted-foreground">Postal Code</span>
                      <span className="text-right">{locationData.postal || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <Navigation className="h-4 w-4" />
                        Coordinates
                      </span>
                      <span className="font-mono text-right">
                        {locationData.latitude?.toFixed(4)}, {locationData.longitude?.toFixed(4)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Timezone
                      </span>
                      <span className="text-right">{locationData.timezone || 'N/A'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Additional Information */}
              <Card className="bg-muted/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Additional Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {locationData.currency && (
                      <div className="flex justify-between items-center py-2 border-b">
                        <span className="text-muted-foreground">Currency</span>
                        <span className="text-right">
                          {locationData.currency} ({locationData.currency_name || 'N/A'})
                        </span>
                      </div>
                    )}
                    {locationData.country_calling_code && (
                      <div className="flex justify-between items-center py-2 border-b">
                        <span className="text-muted-foreground">Calling Code</span>
                        <span className="text-right">+{locationData.country_calling_code}</span>
                      </div>
                    )}
                    {locationData.languages && (
                      <div className="flex justify-between items-center py-2">
                        <span className="text-muted-foreground">Languages</span>
                        <span className="text-right">{locationData.languages}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Map Link */}
              {locationData.latitude && locationData.longitude && (
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold mb-1">View on Map</p>
                        <p className="text-sm text-muted-foreground">
                          Click to open this location in Google Maps
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => {
                          window.open(
                            `https://www.google.com/maps?q=${locationData.latitude},${locationData.longitude}`,
                            '_blank'
                          );
                        }}
                      >
                        <MapPin className="h-4 w-4 mr-2" />
                        Open in Maps
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default IPAddressToLocationFinder;
