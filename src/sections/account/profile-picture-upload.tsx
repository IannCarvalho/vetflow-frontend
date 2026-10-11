import { useRef, useState, useCallback } from 'react';

import SaveIcon from '@mui/icons-material/Save';
import ClearIcon from '@mui/icons-material/Clear';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { Box, Alert, Stack, Avatar, Button, Typography, CircularProgress } from '@mui/material';

import { usersApi } from 'src/api/usersApi';
import { useAuth } from 'src/contexts/auth-context';

interface ProfilePictureUploadProps {
  onUpdateSuccess?: () => void;
}

export function ProfilePictureUpload({ onUpdateSuccess }: ProfilePictureUploadProps) {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [previewBase64, setPreviewBase64] = useState<string | null>(null);
  const [savedPicture, setSavedPicture] = useState<string | null>(user?.profile_picture || null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Show preview when user selects a file (before saving)
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Por favor selecione uma imagem válida' });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'A imagem deve ter menos de 5MB' });
      return;
    }

    // Convert to base64 for preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64String = e.target?.result as string;
      setPreviewBase64(base64String);
      setMessage(null);
    };
    reader.readAsDataURL(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  // Save the previewed photo to backend
  const handleSavePicture = useCallback(async () => {
    if (!previewBase64) return;

    try {
      setLoading(true);
      setMessage(null);

      // Upload to backend
      const response = await usersApi.updateProfilePicture(previewBase64);

      if (response) {
        // Update user in auth context (without logout)
        updateUser(response);
        setSavedPicture(previewBase64);
        setPreviewBase64(null);
        setMessage({ type: 'success', text: 'Foto atualizada com sucesso!' });
        onUpdateSuccess?.();
      }
    } catch (error) {
      console.error('Error saving profile picture:', error);
      setMessage({ type: 'error', text: 'Erro ao salvar a foto' });
    } finally {
      setLoading(false);
    }
  }, [previewBase64, updateUser, onUpdateSuccess]);

  // Cancel preview and go back to saved picture
  const handleCancelPreview = useCallback(() => {
    setPreviewBase64(null);
    setMessage(null);
  }, []);

  // Remove the saved profile picture
  const handleRemovePicture = useCallback(async () => {
    try {
      setLoading(true);
      const response = await usersApi.removeProfilePicture();

      if (response) {
        updateUser(response);
        setSavedPicture(null);
        setPreviewBase64(null);
        setMessage({ type: 'success', text: 'Foto removida com sucesso!' });
        onUpdateSuccess?.();
      }
    } catch (error) {
      console.error('Error removing profile picture:', error);
      setMessage({ type: 'error', text: 'Erro ao remover a foto' });
    } finally {
      setLoading(false);
    }
  }, [updateUser, onUpdateSuccess]);

  return (
    <Stack spacing={2}>
      {/* Messages */}
      {message && (
        <Alert severity={message.type} onClose={() => setMessage(null)}>
          {message.text}
        </Alert>
      )}

      {/* Avatar and Controls */}
      <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>
        <Avatar
          src={previewBase64 || savedPicture || ''}
          alt={user?.name ? `Foto de perfil de ${user.name}` : 'Foto de perfil'}
          sx={{
            width: 120,
            height: 120,
            backgroundColor: 'primary.main',
            fontSize: '2rem',
            flexShrink: 0,
          }}
        >
          {user?.name?.charAt(0).toUpperCase()}
        </Avatar>

        <Stack spacing={2} sx={{ flex: 1 }}>
          {/* Upload input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />

          {/* Upload Button */}
          <Button
            variant="contained"
            startIcon={<CloudUploadIcon />}
            onClick={() => fileInputRef.current?.click()}
            disabled={loading || !!previewBase64}
            fullWidth
            sx={{ display: previewBase64 ? 'none' : 'flex' }}
          >
            Escolher Foto
          </Button>

          {/* Preview Actions (Show only when there's a preview) */}
          {previewBase64 && (
            <Stack spacing={2}>
              <Button
                variant="contained"
                color="success"
                startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                onClick={handleSavePicture}
                disabled={loading}
                fullWidth
              >
                {loading ? 'Salvando...' : 'Salvar Foto'}
              </Button>
              <Button
                variant="outlined"
                color="error"
                size="small"
                startIcon={<ClearIcon />}
                onClick={handleCancelPreview}
                disabled={loading}
              >
                Cancelar
              </Button>
            </Stack>
          )}

          {/* Remove Photo Button (Show only when photo is saved) */}
          {savedPicture && !previewBase64 && (
            <Stack spacing={2}>
              <Button
                variant="outlined"
                color="error"
                size="small"
                startIcon={<ClearIcon />}
                onClick={handleRemovePicture}
                disabled={loading}
              >
                Remover Foto
              </Button>
            </Stack>
          )}

          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Formatos: JPG, PNG, WebP. Máximo 5MB
          </Typography>
        </Stack>
      </Box>
    </Stack>
  );
}
