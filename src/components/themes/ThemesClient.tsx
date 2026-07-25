'use client';

import { useTheme } from 'next-themes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ThemesClient() {
  const { theme, setTheme } = useTheme();
  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-3">
        {(['light', 'dark', 'system'] as const).map((t) => (
          <Button
            key={t}
            variant={theme === t ? 'default' : 'outline'}
            onClick={() => setTheme(t)}
            className="capitalize"
          >
            {t}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
