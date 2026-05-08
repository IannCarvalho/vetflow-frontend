import { useState } from 'react';

import { Box, Card, Stack, Typography } from '@mui/material';

import { AccountForm } from '../account-form';
import { ChangePasswordForm } from '../change-password-form';
import { ProfilePictureUpload } from '../profile-picture-upload';

export function AccountView() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleUpdateSuccess = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <Box sx={{ py: 6 }}>
      <Stack spacing={4}>
        <Box>
          <Typography variant="h4" sx={{ mb: 0.5 }}>
            Minha Conta
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Edite suas informações e foto de perfil
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '40% 1fr' },
            gap: 3,
          }}
        >
          {/* Left Column - Photo */}
          <Box>
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Foto de Perfil
              </Typography>
              <ProfilePictureUpload key={refreshKey} onUpdateSuccess={handleUpdateSuccess} />
            </Card>
          </Box>

          {/* Right Column - Forms */}
          <Stack spacing={3}>
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Informações Pessoais
              </Typography>
              <AccountForm onUpdateSuccess={handleUpdateSuccess} />
            </Card>

            <Card sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Alterar Senha
              </Typography>
              <ChangePasswordForm onUpdateSuccess={handleUpdateSuccess} />
            </Card>
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}
