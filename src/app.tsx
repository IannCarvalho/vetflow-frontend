import 'src/global.css';

import { useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { usePathname } from 'src/routes/hooks';

import { ThemeProvider } from 'src/theme/theme-provider';
import { AuthProvider } from 'src/contexts/auth-context';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

// ----------------------------------------------------------------------

type AppProps = {
  children: React.ReactNode;
};

export default function App({ children }: AppProps) {
  useScrollToTop();

  // Only mount GoogleOAuthProvider when a real client id is configured. The old
  // 'YOUR_GOOGLE_CLIENT_ID' fallback produced a non-functional Google button on
  // the public demo; now the provider (and the Google button) simply do not
  // render unless VITE_GOOGLE_CLIENT_ID is set.
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const tree = (
    <AuthProvider>
      <ThemeProvider>{children}</ThemeProvider>
    </AuthProvider>
  );

  return (
    <QueryClientProvider client={queryClient}>
      {googleClientId ? (
        <GoogleOAuthProvider clientId={googleClientId}>{tree}</GoogleOAuthProvider>
      ) : (
        tree
      )}
    </QueryClientProvider>
  );
}

// ----------------------------------------------------------------------

function useScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
