import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import InputAdornment from '@mui/material/InputAdornment';

import { getApiErrorMessage } from 'src/utils/api-error';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

interface SignUpModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    email: string;
    password: string;
    name: string;
    inviteCode?: string;
  }) => void | Promise<void>;
  loading?: boolean;
  /** When true, show and require an invite code field (closed production signup). */
  requireInvite?: boolean;
}

export function SignUpModal({
  open,
  onClose,
  onSubmit,
  loading = false,
  requireInvite = false,
}: SignUpModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    inviteCode: '',
  });
  const [error, setError] = useState('');

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  }, []);

  const handleSubmit = useCallback(async () => {
    // Validações
    if (!formData.name.trim()) {
      setError('Nome é obrigatório');
      return;
    }

    if (!formData.email.trim()) {
      setError('Email é obrigatório');
      return;
    }

    if (!formData.email.includes('@')) {
      setError('Email inválido');
      return;
    }

    if (formData.password.length < 6) {
      setError('Senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (requireInvite && !formData.inviteCode.trim()) {
      setError('Código de convite é obrigatório');
      return;
    }

    try {
      await onSubmit({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        inviteCode: requireInvite ? formData.inviteCode.trim() : undefined,
      });

      // Limpar formulário somente após sucesso
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        inviteCode: '',
      });
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }, [formData, onSubmit, requireInvite]);

  const handleClose = useCallback(() => {
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      inviteCode: '',
    });
    setError('');
    onClose();
  }, [onClose]);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6">Criar Nova Conta</Typography>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {error && (
            <Alert severity="error" onClose={() => setError('')}>
              {error}
            </Alert>
          )}
          <TextField
            autoFocus
            fullWidth
            name="name"
            label="Nome completo"
            value={formData.name}
            onChange={handleChange}
            placeholder="Ex: João Silva"
            disabled={loading}
          />

          <TextField
            fullWidth
            name="email"
            label="Email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="seu@email.com"
            disabled={loading}
          />

          <TextField
            fullWidth
            name="password"
            label="Senha"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleChange}
            disabled={loading}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      disabled={loading}
                    >
                      <Iconify icon={showPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          <TextField
            fullWidth
            name="confirmPassword"
            label="Confirmar Senha"
            type={showPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={handleChange}
            disabled={loading}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      disabled={loading}
                    >
                      <Iconify icon={showPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          {requireInvite && (
            <TextField
              fullWidth
              name="inviteCode"
              label="Código de convite"
              value={formData.inviteCode}
              onChange={handleChange}
              placeholder="Informe o código recebido"
              disabled={loading}
              helperText="O cadastro é restrito. Use o código de convite fornecido."
            />
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? 'Criando...' : 'Criar Conta'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
