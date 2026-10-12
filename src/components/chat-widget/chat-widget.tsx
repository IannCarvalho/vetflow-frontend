import type { ChatRole, AgentToolCall } from 'src/api/agentApi';

/**
 * Widget flutuante de chat do Assistente VetFlow.
 *
 * Botão flutuante (Fab) no canto inferior direito que abre um painel de chat.
 * Conversa com a API do agente (POST /chat) via src/api/agentApi. Renderiza as
 * mensagens e, de forma discreta, as ferramentas que o agente chamou. Montado
 * no DashboardLayout, aparece em todas as telas autenticadas.
 *
 * Erros degradam de forma amigável (Alert), mantendo o chat utilizável -- o
 * backend do agente nunca lança; respostas de erro vêm em ok=false/error.
 */
import { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Fab from '@mui/material/Fab';
import Chip from '@mui/material/Chip';
import Fade from '@mui/material/Fade';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import TextField from '@mui/material/TextField';
import SendIcon from '@mui/icons-material/Send';
import PetsIcon from '@mui/icons-material/Pets';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import ChatIcon from '@mui/icons-material/ChatBubbleOutline';
import CircularProgress from '@mui/material/CircularProgress';
import SettingsIcon from '@mui/icons-material/SettingsOutlined';
import BuildIcon from '@mui/icons-material/BuildCircleOutlined';

import { sendChat, getProvider, loadAgentConfig } from 'src/api/agentApi';

import { ChatSettings } from './chat-settings';
import { MarkdownLite } from './markdown-lite';

// ----------------------------------------------------------------------

type UiMessage = {
  role: ChatRole;
  content: string;
  toolCalls?: AgentToolCall[];
  isError?: boolean;
};

const WELCOME: UiMessage = {
  role: 'assistant',
  content:
    'Olá! Sou o assistente do VetFlow. Pergunte sobre clientes, pets, vacinas, ' +
    'agenda ou as métricas da clínica. 🐾',
};

/** Encurta o rótulo do provider para o cabeçalho (sem o id longo do modelo). */
function shortProvider(full: string): string {
  const lower = full.toLowerCase();
  let base = full;
  if (lower.includes('bedrock')) base = 'Amazon Bedrock';
  else if (lower.includes('openai') || lower.includes('gpt')) base = 'OpenAI';
  else if (lower.includes('gemini')) base = 'Google Gemini';
  else if (lower.includes('anthropic') || lower.includes('claude')) base = 'Anthropic';

  // Tenta extrair um nome de família amigável do modelo (ex.: "sonnet-4-5").
  const fam = full.match(/claude[-\s]?(sonnet|opus|haiku)[-\s]?([\d-]+)/i);
  if (fam) {
    const num = fam[2].replace(/-/g, '.').replace(/\.$/, '');
    return `${base} · Claude ${cap(fam[1])} ${num}`;
  }
  const gpt = full.match(/gpt[-\s]?([\w.-]+)/i);
  if (gpt) return `${base} · GPT ${gpt[1]}`;
  const gem = full.match(/gemini[-/]?([\w.-]+)/i);
  if (gem && base === 'Google Gemini') return `${base} · ${gem[1]}`;
  return base;
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [messages, setMessages] = useState<UiMessage[]>([WELCOME]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState<string>('');
  const listRef = useRef<HTMLDivElement>(null);

  // Define o rótulo do provider no cabeçalho. Prioriza a config BYOK local (o
  // que o usuário escolheu no ⚙️); só consulta o /providers do servidor quando
  // não há BYOK configurado -- senão o header mostraria o provider errado.
  useEffect(() => {
    if (!open || provider) return;
    const cfg = loadAgentConfig();
    if (cfg.model) {
      setProvider(shortProvider(cfg.model));
      return;
    }
    getProvider()
      .then((p) => setProvider(p.available ? shortProvider(p.provider) : 'sem provider'))
      .catch(() => setProvider(''));
  }, [open, provider]);

  // Rola para a última mensagem.
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    const nextMessages: UiMessage[] = [...messages, { role: 'user', content: text }];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);

    // Histórico no formato que a API espera (só role/content de user+assistant).
    const history = nextMessages
      .filter((m) => m !== WELCOME && m.content)
      .map((m) => ({ role: m.role, content: m.content }));
    // Remove a última (é a mensagem atual, enviada em `message`).
    history.pop();

    try {
      const cfg = loadAgentConfig();
      const res = await sendChat(text, history, { model: cfg.model, apiKey: cfg.apiKey });
      if (res.ok) {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: res.text, toolCalls: res.tool_calls },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: res.error || 'Não consegui responder agora.',
            isError: true,
          },
        ]);
      }
    } catch (err) {
      const detail =
        err instanceof Error ? err.message : 'Falha ao contatar o assistente.';
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Não consegui falar com o assistente (${detail}). Verifique se a API do agente está no ar.`,
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Botão flutuante */}
      <Tooltip title="Assistente VetFlow" placement="left">
        <Fab
          color="primary"
          aria-label="Abrir assistente VetFlow"
          onClick={() => setOpen((v) => !v)}
          sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: (t) => t.zIndex.speedDial }}
        >
          {open ? <CloseIcon /> : <ChatIcon />}
        </Fab>
      </Tooltip>

      {/* Painel de chat */}
      <Fade in={open} unmountOnExit>
        <Paper
          elevation={12}
          sx={{
            position: 'fixed',
            bottom: 96,
            right: 24,
            top: { xs: 16, sm: 'auto' },
            width: { xs: 'calc(100vw - 32px)', sm: 380 },
            height: { xs: 'auto', sm: 'min(600px, calc(100vh - 180px))' },
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            borderRadius: 3,
            border: (t) => `1px solid ${t.palette.divider}`,
            boxShadow: (t) => t.customShadows?.z24 ?? t.shadows[24],
            zIndex: (t) => t.zIndex.speedDial,
            bgcolor: 'background.paper',
          }}
        >
          {/* Cabeçalho */}
          <Box
            sx={{
              p: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
            }}
          >
            <Avatar sx={{ bgcolor: 'primary.dark', width: 36, height: 36 }}>
              <PetsIcon fontSize="small" />
            </Avatar>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="subtitle2" noWrap>
                Assistente VetFlow
              </Typography>
              {provider && (
                <Typography variant="caption" sx={{ opacity: 0.8 }} noWrap>
                  {provider}
                </Typography>
              )}
            </Box>
            <Tooltip title="Configurar">
              <IconButton
                size="small"
                onClick={() => setSettingsOpen(true)}
                sx={{ color: 'primary.contrastText' }}
                aria-label="Configurar assistente"
              >
                <SettingsIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>

          {/* Mensagens */}
          <Box
            ref={listRef}
            sx={{
              flex: 1,
              overflowY: 'auto',
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
              bgcolor: 'background.default',
            }}
          >
            {messages.map((m, i) => (
              <MessageBubble key={i} message={m} />
            ))}
            {loading && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                <CircularProgress size={16} />
                <Typography variant="caption">Consultando a clínica...</Typography>
              </Box>
            )}
          </Box>

          {/* Entrada */}
          <Box sx={{ p: 1.5, borderTop: (t) => `1px solid ${t.palette.divider}`, display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              size="small"
              multiline
              maxRows={3}
              placeholder="Pergunte algo..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
            <IconButton
              color="primary"
              onClick={handleSend}
              disabled={loading || !input.trim()}
              aria-label="Enviar mensagem"
            >
              <SendIcon />
            </IconButton>
          </Box>
        </Paper>
      </Fade>

      <ChatSettings
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onSaved={() => setProvider('')}
      />
    </>
  );
}

// ----------------------------------------------------------------------

function MessageBubble({ message }: { message: UiMessage }) {
  const isUser = message.role === 'user';

  return (
    <Stack spacing={0.5} sx={{ alignItems: isUser ? 'flex-end' : 'flex-start' }}>
      {/* Ferramentas chamadas (discretas, acima da resposta do assistente) */}
      {message.toolCalls && message.toolCalls.length > 0 && (
        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mb: 0.5 }}>
          {message.toolCalls.map((tc, i) => (
            <Chip
              key={i}
              size="small"
              variant="outlined"
              icon={<BuildIcon />}
              label={tc.name}
              sx={{ fontSize: 11 }}
            />
          ))}
        </Stack>
      )}

      {message.isError ? (
        <Alert severity="warning" sx={{ maxWidth: '90%' }}>
          {message.content}
        </Alert>
      ) : (
        <Box
          sx={{
            maxWidth: '85%',
            px: 1.5,
            py: 1,
            borderRadius: 2,
            bgcolor: isUser ? 'primary.main' : 'background.paper',
            color: isUser ? 'primary.contrastText' : 'text.primary',
            border: (t) => (isUser ? 'none' : `1px solid ${t.palette.divider}`),
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {isUser ? (
            <Typography variant="body2">{message.content}</Typography>
          ) : (
            <MarkdownLite text={message.content} />
          )}
        </Box>
      )}
    </Stack>
  );
}
