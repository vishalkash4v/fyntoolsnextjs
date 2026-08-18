'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  fetchIpLocation,
  fetchPublicIpv4,
  fetchPublicIpv6,
  type IpLocationData,
} from '@/utils/ipLookup';

export type IpData = IpLocationData;

export const useIpData = () => {
  const [ipData, setIpData] = useState<IpLocationData | null>(null);
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
      const [locationResult, v4, v6] = await Promise.allSettled([
        fetchIpLocation(undefined, 3),
        fetchPublicIpv4(),
        fetchPublicIpv6(),
      ]);

      if (locationResult.status === 'fulfilled') {
        setIpData(locationResult.value);
      } else {
        const message =
          locationResult.reason instanceof Error
            ? locationResult.reason.message
            : 'Failed to fetch location data';
        setError(message);
      }

      if (v4.status === 'fulfilled' && v4.value) setIpv4(v4.value);
      if (v6.status === 'fulfilled' && v6.value) setIpv6(v6.value);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      toast({
        title: 'Error',
        description:
          'Failed to fetch IP data. Please check your network connection and try again.',
        variant: 'destructive',
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
