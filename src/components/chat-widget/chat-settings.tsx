/**
 * Diálogo de configuração do Assistente (BYOK -- bring your own key).
 *
 * Fluxo: provider -> cola a API key -> "Validar" -> o agente chama a API do
 * provider (custo zero, só lista modelos). Se a key for válida, o dropdown de
 * modelos é populado com os modelos REAIS da conta; se não, avisa que a key
 * não serve. A key fica só no localStorage e trafega apenas no POST /chat.
 */
import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import CircularProgress from '@mui/material/CircularProgress';

import {
  listModels,
  saveAgentConfig,
  loadAgentConfig,
  type AgentConfig,
  clearAgentConfig,
} from 'src/api/agentApi';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
};

type ValidState = 'idle' | 'validating' | 'valid' | 'invalid';

export function ChatSettings({ open, onClose, onSaved }: Props) {
  const [cfg, setCfg] = useState<AgentConfig>(() => loadAgentConfig());
  const [models, setModels] = useState<string[]>([]);
  const [status, setStatus] = useState<ValidState>('idle');
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Ao reabrir, recarrega a config salva e reseta a validação.
  useEffect(() => {
    if (open) {
      setCfg(loadAgentConfig());
      setStatus('idle');
      setModels([]);
      setErrorMsg('');
    }
  }, [open]);

  const handleProvider = (provider: string) => {
    setCfg((c) => ({ ...c, provider, model: '' }));
    setStatus('idle');
    setModels([]);
    setErrorMsg('');
  };

  const handleValidate = async () => {
    if (!cfg.provider || !cfg.apiKey) return;
    setStatus('validating');
    setErrorMsg('');
    try {
      const res = await listModels(cfg.provider, cfg.apiKey);
      if (res.ok && res.models.length) {
        setModels(res.models);
        setStatus('valid');
        // Pré-seleciona o primeiro modelo se nenhum válido estiver escolhido.
        setCfg((c) => ({ ...c, model: res.models.includes(c.model) ? c.model : res.models[0] }));
      } else {
        setStatus('invalid');
        setErrorMsg(res.error || 'Chave inválida ou sem modelos disponíveis.');
        setModels([]);
      }
    } catch (err) {
      setStatus('invalid');
      setErrorMsg(
        err instanceof Error ? err.message : 'Falha ao validar a chave com o provedor.'
      );
      setModels([]);
    }
  };

  const handleSave = () => {
    saveAgentConfig(cfg);
    onSaved();
    onClose();
  };

  const handleClear = () => {
    clearAgentConfig();
    setCfg({ provider: '', model: '', apiKey: '' });
    setStatus('idle');
    setModels([]);
    setErrorMsg('');
    onSaved();
  };

  const canSave = !cfg.provider || (status === 'valid' && !!cfg.model);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Configurar assistente</DialogTitle>
      <DialogContent dividers>
        <Alert severity="info" sx={{ mb: 2 }}>
          Sua chave fica <strong>só neste navegador</strong> e nunca é salva no servidor. Deixe o
          provedor em branco para usar o padrão da clínica.
        </Alert>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControl fullWidth size="small">
            <InputLabel id="prov-label">Provedor</InputLabel>
            <Select
              labelId="prov-label"
              label="Provedor"
              value={cfg.provider}
              onChange={(e) => handleProvider(e.target.value)}
            >
              <MenuItem value="">Padrão do servidor</MenuItem>
              <MenuItem value="openai">OpenAI (GPT)</MenuItem>
              <MenuItem value="anthropic">Anthropic (Claude)</MenuItem>
              <MenuItem value="gemini">Google (Gemini)</MenuItem>
            </Select>
          </FormControl>

          {cfg.provider && (
            <>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                <TextField
                  fullWidth
                  size="small"
                  type="password"
                  label="API key"
                  placeholder="cole sua chave"
                  value={cfg.apiKey}
                  onChange={(e) => {
                    setCfg((c) => ({ ...c, apiKey: e.target.value }));
                    setStatus('idle');
                    setModels([]);
                  }}
                  autoComplete="off"
                />
                <Button
                  variant="outlined"
                  onClick={handleValidate}
                  disabled={!cfg.apiKey || status === 'validating'}
                  sx={{ whiteSpace: 'nowrap', minWidth: 96 }}
                >
                  {status === 'validating' ? <CircularProgress size={18} /> : 'Validar'}
                </Button>
              </Box>

              {status === 'invalid' && <Alert severity="error">{errorMsg}</Alert>}
              {status === 'valid' && (
                <Alert severity="success">
                  Chave válida — {models.length} modelo(s) disponível(is).
                </Alert>
              )}

              {status === 'valid' && (
                <FormControl fullWidth size="small">
                  <InputLabel id="model-label">Modelo</InputLabel>
                  <Select
                    labelId="model-label"
                    label="Modelo"
                    value={cfg.model}
                    onChange={(e) => setCfg((c) => ({ ...c, model: e.target.value }))}
                  >
                    {models.map((m) => (
                      <MenuItem key={m} value={m}>
                        {m}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              <Box sx={{ typography: 'caption', color: 'text.secondary' }}>
                Onde obter a chave:{' '}
                <Link href="https://platform.openai.com/api-keys" target="_blank" rel="noopener">
                  OpenAI
                </Link>
                {' · '}
                <Link href="https://console.anthropic.com/" target="_blank" rel="noopener">
                  Anthropic
                </Link>
                {' · '}
                <Link href="https://aistudio.google.com/apikey" target="_blank" rel="noopener">
                  Gemini
                </Link>
              </Box>
            </>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button color="inherit" onClick={handleClear}>
          Limpar
        </Button>
        <Box sx={{ flex: 1 }} />
        <Button color="inherit" onClick={onClose}>
          Cancelar
        </Button>
        <Button variant="contained" onClick={handleSave} disabled={!canSave}>
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
