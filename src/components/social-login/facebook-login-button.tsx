import { useCallback } from 'react';

import { Tooltip, IconButton } from '@mui/material';

import { Iconify } from 'src/components/iconify';

export function FacebookLoginButton() {
  const handleFacebookLogin = useCallback(() => {
    const clientID = import.meta.env.VITE_FACEBOOK_APP_ID;
    if (!clientID) {
      console.error('Facebook App ID not configured');
      return;
    }

    // Store provider in session for callback handler
    sessionStorage.setItem('oauth_provider', 'facebook');

    // Redirect to Facebook OAuth
    const redirectUri = `${window.location.origin}/auth/facebook/callback`;
    const facebookAuthUrl = new URL('https://www.facebook.com/v18.0/dialog/oauth');
    facebookAuthUrl.searchParams.append('client_id', clientID);
    facebookAuthUrl.searchParams.append('redirect_uri', redirectUri);
    facebookAuthUrl.searchParams.append('response_type', 'code');
    facebookAuthUrl.searchParams.append('scope', 'email,public_profile');
    facebookAuthUrl.searchParams.append('state', 'facebook_state_' + Date.now());

    window.location.href = facebookAuthUrl.toString();
  }, []);

  return (
    <Tooltip title="Entre com Facebook">
      <IconButton
        color="inherit"
        onClick={handleFacebookLogin}
        sx={{
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
          },
        }}
      >
        <Iconify icon="socials:facebook" width={22} />
      </IconButton>
    </Tooltip>
  );
}
