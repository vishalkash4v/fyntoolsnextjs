'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wifi, MapPin, Shield } from 'lucide-react';
import IpInfoRow from './IpInfoRow';
import type { IpData } from './useIpData';

interface IpDataCardsProps {
  ipData: IpData | null;
  ipv4: string | null;
  ipv6: string | null;
}

const IpDataCards: React.FC<IpDataCardsProps> = ({ ipData, ipv4, ipv6 }) => {
  if (!ipData && !ipv4 && !ipv6) {
    return (
        <div className="text-center text-muted-foreground py-10">
            No IP information could be retrieved.
        </div>
    );
  }

  const primaryIp = ipData?.ip || ipv4 || ipv6;

  return (
    <div className="space-y-6">
      <Card className="bg-muted/30 w-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Wifi className="h-5 w-5" />
            IP Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-0 p-4 pt-0">
            <IpInfoRow label="IPv4 Address" value={ipv4} isCopiable />
            <IpInfoRow label="IPv6 Address" value={ipv6} isCopiable />
            {!ipv4 && !ipv6 && primaryIp && (
                <IpInfoRow label="IP Address" value={primaryIp} isCopiable />
            )}
            <IpInfoRow label="ISP" value={ipData?.org} />
        </CardContent>
      </Card>

      {ipData && (
        <>
          <Card className="bg-muted/30 w-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Location
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-0 p-4 pt-0">
              <IpInfoRow label="Country" value={ipData.country_name ? `${ipData.country_name} (${ipData.country_code})` : ''} />
              <IpInfoRow label="Region" value={ipData.region} />
              <IpInfoRow label="City" value={ipData.city} />
              <IpInfoRow label="Postal" value={ipData.postal || 'N/A'} />
              <IpInfoRow label="Coordinates" value={ipData.latitude ? `${ipData.latitude}, ${ipData.longitude}`: ''} isCopiable />
            </CardContent>
          </Card>

          <Card className="bg-muted/30 w-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Additional Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-0 p-4 pt-0">
              <IpInfoRow label="Timezone" value={ipData.timezone} />
              <IpInfoRow label="UTC Offset" value={ipData.utc_offset} />
              <IpInfoRow label="Currency" value={ipData.currency ? `${ipData.currency} (${ipData.currency_name})` : ''} />
              <IpInfoRow label="Calling Code" value={ipData.country_calling_code} />
              <IpInfoRow label="In EU" value={ipData.in_eu} />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default IpDataCards;
