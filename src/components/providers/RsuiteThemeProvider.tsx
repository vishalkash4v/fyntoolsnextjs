import React, { useEffect, useState } from 'react';
import { CustomProvider } from 'rsuite';
import { useTheme } from '@/contexts/ThemeContext';

type RsuiteTheme = 'light' | 'dark';

const resolveTheme = (theme: string): RsuiteTheme => {
  if (theme === 'dark') return 'dark';
  if (theme === 'light' || theme === 'metallic') return 'light';
  if (typeof document !== 'undefined') {
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  }
  return 'light';
};

const RsuiteThemeProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { theme } = useTheme();
  const [resolvedTheme, setResolvedTheme] = useState<RsuiteTheme>(() => resolveTheme(theme));

  useEffect(() => {
    setResolvedTheme(resolveTheme(theme));
  }, [theme]);

  return (
    <CustomProvider theme={resolvedTheme}>
      {children}
    </CustomProvider>
  );
};

export default RsuiteThemeProvider;
