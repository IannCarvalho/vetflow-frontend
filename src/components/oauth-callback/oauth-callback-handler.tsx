import { useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import { Box, Typography, CircularProgress } from '@mui/material';

import { useAuth } from 'src/contexts/auth-context';

/**
 * OAuth Callback Handler
 * This component handles the OAuth callback from providers
 * when users are redirected back from the provider's login page
 */
export function OAuthCallbackHandler() {
  const [searchParams] = useSearchParams();
  const { setAuthData } = useAuth();
  const hasExecuted = useRef(false);

  useEffect(() => {
    // Prevent double execution in StrictMode
    if (hasExecuted.current) return;
    hasExecuted.current = true;

    const handleCallback = async () => {
      const code = searchParams.get('code');
      const provider = sessionStorage.getItem('oauth_provider');

      if (!code || !provider) {
        console.error('Missing code or provider');
        window.location.href = '/sign-in';
        return;
      }

      try {
        console.log('Processing OAuth callback:', { provider, code });

        // Exchange code for token with backend
        const response = await fetch(`https://vetflow-backend-1oey.onrender.com/auth/oauth/callback`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            provider,
            code,
            redirectUri: `${window.location.origin}/auth/${provider}/callback`,
          }),
        });

        console.log('OAuth callback response:', response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('OAuth callback error response:', errorText);
          throw new Error('OAuth callback failed');
        }

        const data = await response.json();
        console.log('OAuth callback success:', data);

        // Store auth data
        setAuthData(data.user, data.token);

        // Redirect to dashboard
        window.location.href = '/';
      } catch (error) {
        console.error('OAuth callback error:', error);
        window.location.href = '/sign-in?error=oauth_failed';
      }
    };

    handleCallback();
  }, [searchParams, setAuthData]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        gap: 2,
      }}
    >
      <CircularProgress aria-label="Autenticando" />
      <Typography>Processando login social...</Typography>
    </Box>
  );
}
