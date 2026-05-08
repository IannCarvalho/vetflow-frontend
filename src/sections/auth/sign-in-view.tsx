import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';

import { useRouter } from 'src/routes/hooks';

import { useAuth } from 'src/contexts/auth-context';

import { Iconify } from 'src/components/iconify';
import { SocialLoginButtons } from 'src/components/social-login/social-login-button';

import { SignUpModal } from './sign-up-modal';

// ----------------------------------------------------------------------

export function SignInView() {
  const router = useRouter();
  const { login, register } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [openSignUp, setOpenSignUp] = useState(false);
  const [signUpLoading, setSignUpLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const handleSignIn = useCallback(async () => {
    try {
      setLoginError('');
      setLoading(true);
      await login(email, password);
      router.push('/');
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      setLoginError('Email ou senha inválidos');
    } finally {
      setLoading(false);
    }
  }, [email, password, login, router]);

  const handleSignUp = useCallback(
    async (data: { email: string; password: string; name: string }) => {
      try {
        setSignUpLoading(true);
        await register({
          name: data.name,
          email: data.email,
          password: data.password,
          confirm_password: data.password,
        });
        setOpenSignUp(false);
        router.push('/');
      } catch (error) {
        console.error('Erro ao registrar:', error);
      } finally {
        setSignUpLoading(false);
      }
    },
    [register, router]
  );

  const renderForm = (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-end',
        flexDirection: 'column',
      }}
    >
      {loginError && (
        <Alert severity="error" sx={{ width: '100%', mb: 2 }} onClose={() => setLoginError('')}>
          {loginError}
        </Alert>
      )}
      <TextField
        fullWidth
        name="email"
        label="Endereço de email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        sx={{ mb: 3 }}
      />

      <Link variant="body2" color="inherit" sx={{ mb: 1.5 }}>
        Esqueceu a senha?
      </Link>

      <TextField
        fullWidth
        name="password"
        label="Senha"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        type={showPassword ? 'text' : 'password'}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                <Iconify icon={showPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{ mb: 3 }}
      />

      <Button
        fullWidth
        size="large"
        type="submit"
        color="inherit"
        variant="contained"
        onClick={handleSignIn}
        disabled={loading}
      >
        {loading ? 'Entrando...' : 'Entrar'}
      </Button>
    </Box>
  );

  return (
    <>
      <Box
        sx={{
          gap: 1.5,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mb: 5,
        }}
      >
        <Typography variant="h5">Entrar</Typography>
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
          }}
        >
          Não tem uma conta?
          <Link
            component="button"
            variant="subtitle2"
            sx={{ ml: 0.5 }}
            onClick={() => setOpenSignUp(true)}
          >
            Comece agora
          </Link>
        </Typography>
      </Box>
      {renderForm}
      <Divider sx={{ my: 3, '&::before, &::after': { borderTopStyle: 'dashed' } }}>
        <Typography
          variant="overline"
          sx={{ color: 'text.secondary', fontWeight: 'fontWeightMedium' }}
        >
          OU
        </Typography>
      </Divider>
      <SocialLoginButtons onSuccess={() => router.push('/')} />

      <SignUpModal
        open={openSignUp}
        onClose={() => setOpenSignUp(false)}
        onSubmit={handleSignUp}
        loading={signUpLoading}
      />
    </>
  );
}
