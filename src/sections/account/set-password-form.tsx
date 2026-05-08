import { useState, useEffect, useCallback } from 'react';

import { LoadingButton } from '@mui/lab';
import { Box, Stack, TextField } from '@mui/material';

import { usersApi } from 'src/api/usersApi';

interface SetPasswordFormProps {
  onUpdateSuccess?: () => void;
}

export function SetPasswordForm({ onUpdateSuccess }: SetPasswordFormProps) {
  const [loading, setLoading] = useState(false);
  const [successDisabled, setSuccessDisabled] = useState(false);
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setFormData({
      password: '',
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

    if (!formData.password.trim()) {
      newErrors.password = 'Senha é obrigatória';
    }
    if (formData.password.length < 8) {
      newErrors.password = 'A senha deve ter no mínimo 8 caracteres';
    }
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Confirmação de senha é obrigatória';
    }
    if (formData.password !== formData.confirmPassword) {
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
        await usersApi.setPassword({
          password: formData.password,
        });

        setFormData({
          password: '',
          confirmPassword: '',
        });

        setSuccessDisabled(true);
        setTimeout(() => setSuccessDisabled(false), 2000);

        alert('Senha criada com sucesso! Agora você pode fazer login com email e senha.');
        onUpdateSuccess?.();
      } catch (error: any) {
        console.error('Error setting password:', error);
        const errorMessage = error.response?.data?.message || 'Erro ao criar senha';
        alert(errorMessage);
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
          label="Nova Senha"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          error={!!errors.password}
          helperText={errors.password}
          placeholder="Mínimo 8 caracteres"
        />

        <TextField
          fullWidth
          label="Confirmar Senha"
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={!!errors.confirmPassword}
          helperText={errors.confirmPassword}
          placeholder="Repita sua senha"
        />

        <LoadingButton
          fullWidth
          color="inherit"
          size="large"
          type="submit"
          variant="contained"
          loading={loading}
          disabled={successDisabled}
        >
          Criar Senha
        </LoadingButton>
      </Stack>
    </Box>
  );
}
