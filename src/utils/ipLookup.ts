export interface IpLocationData {
  ip?: string;
  city?: string;
  region?: string;
  country?: string;
  country_name?: string;
  country_code?: string;
  postal?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  utc_offset?: string;
  org?: string;
  asn?: string;
  currency?: string;
  currency_name?: string;
  country_calling_code?: string;
  languages?: string;
  in_eu?: boolean;
  error?: boolean;
  reason?: string;
}

type IpProvider = {
  name: string;
  buildUrl: (ip?: string) => string;
  parse: (data: Record<string, unknown>) => IpLocationData | null;
};

const providers: IpProvider[] = [
  {
    name: 'ipapi.co',
    buildUrl: (ip) => (ip ? `https://ipapi.co/${ip}/json/` : 'https://ipapi.co/json/'),
    parse: (data) => {
      if (data.error) return null;
      return data as IpLocationData;
    },
  },
  {
    name: 'ipwho.is',
    buildUrl: (ip) => (ip ? `https://ipwho.is/${ip}` : 'https://ipwho.is/'),
    parse: (data) => {
      if (data.success === false) return null;
      const connection = data.connection as { isp?: string; org?: string; asn?: number } | undefined;
      const timezone = data.timezone as { id?: string } | string | undefined;
      const currency = data.currency as { code?: string; name?: string } | undefined;
      const languages = data.languages;
      return {
        ip: String(data.ip ?? ''),
        city: String(data.city ?? ''),
        region: String(data.region ?? ''),
        country: String(data.country ?? ''),
        country_name: String(data.country ?? ''),
        country_code: String(data.country_code ?? ''),
        postal: String(data.postal ?? ''),
        latitude: typeof data.latitude === 'number' ? data.latitude : undefined,
        longitude: typeof data.longitude === 'number' ? data.longitude : undefined,
        timezone: typeof timezone === 'string' ? timezone : String(timezone?.id ?? ''),
        org: String(connection?.isp ?? connection?.org ?? ''),
        asn: connection?.asn ? `AS${connection.asn}` : undefined,
        currency: String(currency?.code ?? ''),
        currency_name: String(currency?.name ?? ''),
        country_calling_code: String(data.calling_code ?? ''),
        languages: Array.isArray(languages) ? languages.join(', ') : String(languages ?? ''),
      };
    },
  },
  {
    name: 'ip-api.com',
    buildUrl: (ip) => {
      const host = ip || '';
      return `http://ip-api.com/json/${host}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,query`;
    },
    parse: (data) => {
      if (data.status !== 'success') return null;
      return {
        ip: String(data.query ?? ''),
        city: String(data.city ?? ''),
        region: String(data.regionName ?? ''),
        country: String(data.country ?? ''),
        country_name: String(data.country ?? ''),
        country_code: String(data.countryCode ?? ''),
        postal: String(data.zip ?? ''),
        latitude: typeof data.lat === 'number' ? data.lat : undefined,
        longitude: typeof data.lon === 'number' ? data.lon : undefined,
        timezone: String(data.timezone ?? ''),
        org: String(data.isp ?? data.org ?? ''),
        asn: String(data.as ?? ''),
      };
    },
  },
];

async function fetchWithTimeout(url: string, ms = 10000): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { signal: controller.signal, cache: 'no-store' });
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchIpLocation(
  ip?: string,
  maxAttemptsPerProvider = 3
): Promise<IpLocationData> {
  let lastError = 'Failed to fetch location data';

  for (const provider of providers) {
    for (let attempt = 0; attempt < maxAttemptsPerProvider; attempt++) {
      try {
        const res = await fetchWithTimeout(provider.buildUrl(ip));
        if (!res.ok) {
          if (res.status === 429 && attempt < maxAttemptsPerProvider - 1) {
            await new Promise((r) => setTimeout(r, 800 * (attempt + 1)));
            continue;
          }
          throw new Error(`HTTP ${res.status}`);
        }
        const data = (await res.json()) as Record<string, unknown>;
        const parsed = provider.parse(data);
        if (parsed?.ip || parsed?.city || parsed?.country_name) {
          return parsed;
        }
        throw new Error('Empty location response');
      } catch (err) {
        lastError = err instanceof Error ? err.message : 'Failed to fetch location data';
        if (attempt < maxAttemptsPerProvider - 1) {
          await new Promise((r) => setTimeout(r, 600 * (attempt + 1)));
        }
      }
    }
  }

  throw new Error(lastError);
}

export async function fetchPublicIpv4(): Promise<string | null> {
  const urls = ['https://api.ipify.org?format=json', 'https://ipv4.icanhazip.com/'];
  for (const url of urls) {
    try {
      const res = await fetchWithTimeout(url);
      if (!res.ok) continue;
      if (url.includes('json')) {
        const data = await res.json();
        return data.ip ?? null;
      }
      return (await res.text()).trim() || null;
    } catch {
      /* try next */
    }
  }
  return null;
}

export async function fetchPublicIpv6(): Promise<string | null> {
  try {
    const res = await fetchWithTimeout('https://api64.ipify.org?format=json');
    if (!res.ok) return null;
    const data = await res.json();
    return data.ip ?? null;
  } catch {
    return null;
  }
}
