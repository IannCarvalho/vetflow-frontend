import { useCallback } from 'react';
import { useGoogleLogin } from '@react-oauth/google';

import { Tooltip, IconButton } from '@mui/material';

import { Iconify } from 'src/components/iconify';

interface GoogleLoginButtonProps {
  onSuccess: (provider: string, token: string, userData: any) => void;
}

export function GoogleLoginButton({ onSuccess }: GoogleLoginButtonProps) {
  const handleGoogleSuccess = useCallback(
    (userData: any) => {
      onSuccess('google', userData.access_token, {
        email: userData.email,
        name: userData.name,
        picture: userData.picture,
        sub: userData.id, // Google returns 'id' not 'sub'
      });
    },
    [onSuccess]
  );

  const googleLogin = useGoogleLogin({
    onSuccess: async (codeResponse) => {
      try {
        // Get access token and fetch user info
        const response = await fetch('https://www.googleapis.com/oauth2/v1/userinfo', {
          headers: { Authorization: `Bearer ${codeResponse.access_token}` },
        });
        const userInfo = await response.json();
        handleGoogleSuccess({ ...userInfo, access_token: codeResponse.access_token });
      } catch (error) {
        console.error('Failed to fetch Google user info:', error);
      }
    },
    onError: () => console.error('Google Login Failed'),
  });

  return (
    <Tooltip title="Sign in with Google">
      <IconButton
        color="inherit"
        onClick={() => googleLogin()}
        sx={{
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
          },
        }}
      >
        <Iconify icon="socials:google" width={22} />
      </IconButton>
    </Tooltip>
  );
}
