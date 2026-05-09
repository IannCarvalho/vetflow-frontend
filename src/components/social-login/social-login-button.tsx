import { useCallback } from 'react';

import { Box } from '@mui/material';

import { useAuth } from '../../contexts/auth-context';
import { GoogleLoginButton } from './google-login-button';
import { DiscordLoginButton } from './discord-login-button';
import { FacebookLoginButton } from './facebook-login-button';

export interface SocialLoginButtonsProps {
  onSuccess?: () => void;
}

export function SocialLoginButtons({ onSuccess }: SocialLoginButtonsProps) {
  const { setAuthData } = useAuth();

  const handleSocialSuccess = useCallback(
    async (provider: string, token: string, userData: any) => {
      try {
        const payload = {
          provider,
          token,
          userData,
        };

        console.log('Sending social login payload:', payload);

        // Call backend to validate and create user
        const response = await fetch('https://vetflow-backend-1oey.onrender.com/auth/social-login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        console.log('Social login response status:', response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Social login failed with response:', errorText);
          throw new Error('Social login failed');
        }

        const data = await response.json();
        console.log('Social login successful:', data);

        // Store auth token and user
        setAuthData(data.user, data.token);

        // Redirect to dashboard
        window.location.href = '/';

        onSuccess?.();
      } catch (error) {
        console.error('Social login error:', error);
      }
    },
    [setAuthData, onSuccess]
  );

  return (
    <Box
      sx={{
        gap: 1,
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <GoogleLoginButton onSuccess={handleSocialSuccess} />
      <FacebookLoginButton />
      <DiscordLoginButton />
    </Box>
  );
}
