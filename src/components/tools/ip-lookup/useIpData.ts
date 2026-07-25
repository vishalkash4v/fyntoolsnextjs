'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface IpData {
  ip: string;
  network: string;
  version: string;
  city: string;
  region: string;
  region_code: string;
  country: string;
  country_name: string;
  country_code: string;
  country_code_iso3: string;
  country_capital: string;
  country_tld: string;
  continent_code: string;
  in_eu: boolean;
  postal: string;
  latitude: number;
  longitude: number;
  timezone: string;
  utc_offset: string;
  country_calling_code: string;
  currency: string;
  currency_name: string;
  languages: string;
  country_area: number;
  country_population: number;
  asn: string;
  org: string;
}

export const useIpData = () => {
  const [ipData, setIpData] = useState<IpData | null>(null);
  const [ipv4, setIpv4] = useState<string | null>(null);
  const [ipv6, setIpv6] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchIpData = useCallback(async () => {
    setLoading(true);
    setError(null);
    setIpData(null);
    setIpv4(null);
    setIpv6(null);
    
    try {
      // Fetch main data, IPv4, and IPv6 in parallel
      const results = await Promise.allSettled([
        fetch('https://ipapi.co/json/'),
        fetch('https://api.ipify.org?format=json'),
        fetch('https://api64.ipify.org?format=json')
      ]);

      const [mainDataRes, ipv4Res, ipv6Res] = results;

      if (mainDataRes.status === 'fulfilled' && mainDataRes.value.ok) {
        const data = await mainDataRes.value.json();
        setIpData(data);
      } else {
        console.error('Failed to fetch main IP data with location.');
      }

      if (ipv4Res.status === 'fulfilled' && ipv4Res.value.ok) {
        const data = await ipv4Res.value.json();
        setIpv4(data.ip);
      } else {
         console.warn('Could not fetch IPv4 address from primary service, trying fallback.');
         try {
           const fallbackRes = await fetch('https://ipv4.icanhazip.com/');
           if (fallbackRes.ok) {
             const ip = await fallbackRes.text();
             setIpv4(ip.trim());
           } else {
             console.warn('Could not fetch IPv4 address from fallback service either.');
           }
         } catch (e) {
           console.error('Error fetching IPv4 from fallback service:', e);
         }
      }

      if (ipv6Res.status === 'fulfilled' && ipv6Res.value.ok) {
        const data = await ipv6Res.value.json();
        setIpv6(data.ip);
      } else {
        console.warn('Could not fetch IPv6 address. This is normal if you are not on an IPv6 network.');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      toast({
        title: "Error",
        description: "Failed to fetch IP data. Please check your network connection and try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchIpData();
  }, [fetchIpData]);
  
  return { ipData, ipv4, ipv6, loading, error, fetchIpData };
};
