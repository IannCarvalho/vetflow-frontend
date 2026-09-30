import { useState, useEffect, useCallback } from 'react';

import { LoadingButton } from '@mui/lab';
import { Box, Stack, TextField, IconButton, InputAdornment } from '@mui/material';

import { usersApi } from 'src/api/usersApi';

import { Iconify } from 'src/components/iconify';

interface ChangePasswordFormProps {
  onUpdateSuccess?: () => void;
}

export function ChangePasswordForm({ onUpdateSuccess }: ChangePasswordFormProps) {
  const [loading, setLoading] = useState(false);
  const [successDisabled, setSuccessDisabled] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form data and success state when needed
  useEffect(() => {
    setFormData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setSuccessDisabled(false);
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
      if (errors[name]) {
        setErrors((prev) => ({
          ...prev,
          [name]: '',
        }));
      }
    },
    [errors]
  );

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.currentPassword.trim()) {
      newErrors.currentPassword = 'Senha atual é obrigatória';
    }
    if (!formData.newPassword.trim()) {
      newErrors.newPassword = 'Nova senha é obrigatória';
    }
    if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'A senha deve ter no mínimo 8 caracteres';
    }
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Confirmação de senha é obrigatória';
    }
    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'As senhas não coincidem';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!validateForm()) {
        return;
      }

      setLoading(true);
      try {
        await usersApi.changePassword({
          current_password: formData.currentPassword,
          new_password: formData.newPassword,
        });

        // Clear form
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });

        // Disable button for 2 seconds after success
        setSuccessDisabled(true);
        setTimeout(() => setSuccessDisabled(false), 2000);

        alert('Senha atualizada com sucesso!');
        onUpdateSuccess?.();
      } catch (error: any) {
        console.error('Error changing password:', error);
        const errorMsg = error.response?.data?.error || error.response?.data?.message || '';
        alert('Erro ao atualizar senha: ' + (errorMsg || 'Tente novamente'));
      } finally {
        setLoading(false);
      }
    },
    [formData, onUpdateSuccess]
  );

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack spacing={2.5}>
        <TextField
          fullWidth
          label="Senha Atual"
          type={showCurrentPassword ? 'text' : 'password'}
          name="currentPassword"
          value={formData.currentPassword}
          onChange={handleChange}
          error={!!errors.currentPassword}
          helperText={errors.currentPassword}
          placeholder="Digite sua senha atual"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  edge="end"
                >
                  <Iconify
                    icon={showCurrentPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
                  />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <TextField
          fullWidth
          label="Nova Senha"
          type={showNewPassword ? 'text' : 'password'}
          name="newPassword"
          value={formData.newPassword}
          onChange={handleChange}
          error={!!errors.newPassword}
          helperText={errors.newPassword}
          placeholder="Digite sua nova senha"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowNewPassword(!showNewPassword)} edge="end">
                  <Iconify icon={showNewPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <TextField
          fullWidth
          label="Confirmar Nova Senha"
          type={showConfirmPassword ? 'text' : 'password'}
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={!!errors.confirmPassword}
          helperText={errors.confirmPassword}
          placeholder="Confirme sua nova senha"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                  <Iconify
                    icon={showConfirmPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
                  />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <LoadingButton
          fullWidth
          color="primary"
          size="large"
          type="submit"
          variant="contained"
          loading={loading}
          disabled={loading || successDisabled}
        >
          Atualizar Senha
        </LoadingButton>
      </Stack>
    </Box>
  );
}
