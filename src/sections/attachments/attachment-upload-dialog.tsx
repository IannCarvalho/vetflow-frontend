import type { AttachmentCategory } from 'src/types';

/**
 * Attachment Upload Dialog
 * Reads a file into base64 and uploads it as a pet attachment.
 */
import { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';

import { useCreateAttachment } from 'src/hooks/useAttachmentsQuery';

import { getApiErrorMessage } from 'src/utils/api-error';

import { Iconify } from 'src/components/iconify';

// -----------------------------------------------------------------------

// ~10MB raw file cap (base64 grows ~33%, backend caps at ~10MB encoded).
const MAX_FILE_BYTES = 7 * 1024 * 1024;

const CATEGORY_OPTIONS: Array<{ value: AttachmentCategory; label: string }> = [
  { value: 'exam', label: 'Exame' },
  { value: 'report', label: 'Laudo' },
  { value: 'image', label: 'Imagem' },
  { value: 'document', label: 'Documento' },
];

interface AttachmentUploadDialogProps {
  open: boolean;
  onClose: () => void;
  petId: string;
  onSuccess?: (message: string) => void;
}

/** Split a data URL ("data:<mime>;base64,<body>") into mime + base64 body. */
function parseDataUrl(dataUrl: string): { mimeType: string; content: string } {
  const match = /^data:([^;]+);base64,(.*)$/s.exec(dataUrl);
  if (!match) return { mimeType: 'application/octet-stream', content: '' };
  return { mimeType: match[1], content: match[2] };
}

export default function AttachmentUploadDialog({
  open,
  onClose,
  petId,
  onSuccess,
}: AttachmentUploadDialogProps) {
  const createMutation = useCreateAttachment();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [category, setCategory] = useState<AttachmentCategory>('exam');
  const [notes, setNotes] = useState('');
  const [fileData, setFileData] = useState<{ mimeType: string; content: string } | null>(null);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setName('');
      setCategory('exam');
      setNotes('');
      setFileData(null);
      setFileName('');
      setError('');
    }
  }, [open]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_BYTES) {
      setError('Arquivo muito grande (máximo ~7MB).');
      return;
    }

    setError('');
    setFileName(file.name);
    // Default the attachment name to the file name (without extension) if empty.
    setName((prev) => prev || file.name.replace(/\.[^.]+$/, ''));

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      setFileData(parseDataUrl(result));
    };
    reader.onerror = () => setError('Não foi possível ler o arquivo.');
    reader.readAsDataURL(file);
  }, []);

  const isLoading = createMutation.isPending;

  const handleSubmit = useCallback(() => {
    setError('');
    if (!name.trim()) {
      setError('Informe um nome para o anexo.');
      return;
    }
    if (!fileData || !fileData.content) {
      setError('Selecione um arquivo.');
      return;
    }

    createMutation.mutate(
      {
        pet_id: petId,
        name: name.trim(),
        category,
        mime_type: fileData.mimeType,
        content: fileData.content,
        notes: notes.trim() || undefined,
      },
      {
        onSuccess: () => onSuccess?.('Anexo enviado com sucesso!'),
        onError: (err) => setError(getApiErrorMessage(err, 'Erro ao enviar anexo')),
      }
    );
  }, [name, fileData, category, notes, petId, createMutation, onSuccess]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Novo Anexo</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <Stack spacing={2}>
            {error && (
              <Alert severity="error" onClose={() => setError('')}>
                {error}
              </Alert>
            )}

            <Button
              variant="outlined"
              startIcon={<Iconify icon="solar:upload-bold" />}
              onClick={() => fileInputRef.current?.click()}
            >
              {fileName || 'Selecionar arquivo'}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              hidden
              accept="image/*,application/pdf"
              onChange={handleFileChange}
            />
            {fileName && (
              <Typography variant="caption" color="text.secondary">
                Arquivo selecionado: {fileName}
              </Typography>
            )}

            <TextField
              label="Nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
            />

            <TextField
              select
              label="Categoria"
              value={category}
              onChange={(e) => setCategory(e.target.value as AttachmentCategory)}
              fullWidth
            >
              {CATEGORY_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Notas"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              fullWidth
              multiline
              rows={2}
            />
          </Stack>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={isLoading}>
          {isLoading && <CircularProgress size={20} sx={{ mr: 1 }} />}
          Enviar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
