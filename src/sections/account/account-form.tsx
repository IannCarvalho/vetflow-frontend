import { useState, useEffect, useCallback } from 'react';

import { LoadingButton } from '@mui/lab';
import { Box, Stack, TextField } from '@mui/material';

import { usersApi } from 'src/api/usersApi';
import { useAuth } from 'src/contexts/auth-context';

interface AccountFormProps {
  onUpdateSuccess?: () => void;
}

export function AccountForm({ onUpdateSuccess }: AccountFormProps) {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [successDisabled, setSuccessDisabled] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form data when user changes (e.g., logout/login)
  useEffect(() => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
    });
    setSuccessDisabled(false);
  }, [user?.id]);

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

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!formData.email.includes('@')) {
      newErrors.email = 'Email inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!validateForm()) return;

      try {
        setLoading(true);

        const response = await usersApi.updateProfile({
          name: formData.name,
          email: formData.email,
        });

        if (response) {
          // Update form data immediately with response data to prevent hasChanges from becoming true
          setFormData({
            name: response.name || '',
            email: response.email || '',
          });

          updateUser(response);
          onUpdateSuccess?.();

          // Disable button for 2 seconds after success
          setSuccessDisabled(true);
          setTimeout(() => setSuccessDisabled(false), 2000);

          alert('Perfil atualizado com sucesso!');
        }
      } catch (error) {
        console.error('Error updating profile:', error);
        alert('Erro ao atualizar perfil');
      } finally {
        setLoading(false);
      }
    },
    [formData, user, updateUser, onUpdateSuccess]
  );

  const hasChanges = formData.name !== user?.name || formData.email !== user?.email;

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Stack spacing={3}>
        <TextField
          fullWidth
          label="Nome Completo"
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={!!errors.name}
          helperText={errors.name}
          placeholder="João Silva"
        />

        <TextField
          fullWidth
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          error={!!errors.email}
          helperText={errors.email}
          placeholder="email@example.com"
        />

        <LoadingButton
          type="submit"
          variant="contained"
          loading={loading}
          disabled={!hasChanges || loading || successDisabled}
        >
          Salvar Alterações
        </LoadingButton>
      </Stack>
    </Box>
  );
}
