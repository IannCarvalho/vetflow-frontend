import { useCallback } from 'react';

import { Box, Tooltip, IconButton } from '@mui/material';

export function DiscordLoginButton() {
  const handleDiscordLogin = useCallback(() => {
    const clientId = import.meta.env.VITE_DISCORD_CLIENT_ID || 'YOUR_DISCORD_CLIENT_ID';
    const redirectUri = `${window.location.origin}/auth/discord/callback`;
    const scopes = ['identify', 'email'];

    const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scopes.join('%20')}`;

    // Store provider in session storage for callback handler
    sessionStorage.setItem('oauth_provider', 'discord');

    window.location.href = discordAuthUrl;
  }, []);

  return (
    <Tooltip title="Entre com Discord">
      <IconButton
        color="inherit"
        onClick={handleDiscordLogin}
        sx={{
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
          },
        }}
      >
        <Box component="svg" width={22} height={22} viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.317 4.3671C18.7933 3.69762 17.147 3.1814 15.3913 2.9039C15.121 3.42926 14.8216 4.12013 14.6117 4.63615C12.7734 4.35722 10.9541 4.35722 9.1855 4.63615C8.97486 4.12013 8.67538 3.42926 8.40468 2.9039C6.64893 3.1814 5.00243 3.69762 3.47876 4.3671C0.505744 8.97953 -0.31039 13.4694 0.0947502 17.8999C2.18236 19.6751 4.25847 20.5956 6.29617 21.2308C6.934 20.3655 7.50547 19.4593 7.9868 18.5118C7.07101 18.1546 6.189 17.7201 5.34328 17.2227C5.55028 17.0574 5.74612 16.8852 5.92143 16.7108C9.88928 18.2571 14.1415 18.2571 18.0563 16.7108C18.2314 16.8852 18.4272 17.0574 18.6342 17.2227C17.7886 17.7201 16.9058 18.1546 15.9906 18.5118C16.4719 19.4593 17.0434 20.3655 17.6819 21.2308C19.7195 20.5956 21.7956 19.6751 23.8832 17.8999C24.3747 12.7267 23.1249 8.37953 20.317 4.3671ZM8.02101 15.3695C6.8371 15.3695 5.85853 14.3506 5.85853 13.1148C5.85853 11.8789 6.8147 10.8601 8.02101 10.8601C9.22733 10.8601 10.1829 11.8789 10.1829 13.1148C10.1829 14.3506 9.22733 15.3695 8.02101 15.3695ZM15.9776 15.3695C14.7926 15.3695 13.8141 14.3506 13.8141 13.1148C13.8141 11.8789 14.7703 10.8601 15.9776 10.8601C17.1839 10.8601 18.1395 11.8789 18.1395 13.1148C18.1395 14.3506 17.1839 15.3695 15.9776 15.3695Z" />
        </Box>
      </IconButton>
    </Tooltip>
  );
}
