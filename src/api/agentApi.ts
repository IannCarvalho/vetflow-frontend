/**
 * Cliente HTTP do Agente VetFlow (serviço separado do backend).
 *
 * O agente roda como uma API própria (FastAPI, porta dedicada), distinta do
 * backend Go. Por isso NÃO reusamos o axios do backend (que injeta o JWT do
 * VetFlow e redireciona no 401): este cliente fala só com a API do agente.
 *
 * URL resolvida nesta ordem:
 *   1. VITE_AGENT_API_URL (.env)
 *   2. auto-detecção: localhost -> http://localhost:8700
 */
import axios from 'axios';

const DEVELOPMENT_AGENT_URL = 'http://localhost:8700';

function resolveAgentBaseUrl(): string {
  const fromEnv = import.meta.env.VITE_AGENT_API_URL;
  if (fromEnv) {
    return fromEnv;
  }
  return DEVELOPMENT_AGENT_URL;
}

const agentApi = axios.create({
  baseURL: resolveAgentBaseUrl(),
  headers: { 'Content-Type': 'application/json' },
});

// Repassa o JWT do USUÁRIO LOGADO ao agente (pass-through): o chat age como o
// usuário, não como uma conta de serviço. É a mesma chave usada pelo axios do
// backend (`auth_token`); o agente lê este header e injeta no MCP.
agentApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ----------------------------------------------------------------------

/** Papel de uma mensagem no histórico enviado ao agente (formato OpenAI). */
export type ChatRole = 'user' | 'assistant';

/** Uma ferramenta que o agente chamou numa resposta. */
export type AgentToolCall = {
  name: string;
  arguments: Record<string, unknown>;
};

/** Resposta do POST /chat. */
export type ChatResponse = {
  ok: boolean;
  text: string;
  tool_calls: AgentToolCall[];
  error: string | null;
};

/** Status do provider ativo (GET /providers). */
export type ProviderInfo = {
  available: boolean;
  provider: string;
};

/** Config BYOK do usuário, guardada só no localStorage do navegador. */
export type AgentConfig = {
  provider: string; // '', 'openai', 'anthropic', 'gemini', 'bedrock'
  model: string; // string de modelo LiteLLM (ex.: 'gpt-4o')
  apiKey: string; // chave do usuário -- NUNCA sai do navegador, exceto no POST /chat
};

const STORAGE_KEY = 'vetflow_agent_config';

export function loadAgentConfig(): AgentConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        provider: parsed.provider ?? '',
        model: parsed.model ?? '',
        apiKey: parsed.apiKey ?? '',
      };
    }
  } catch {
    // localStorage indisponível ou JSON inválido -> config vazia.
  }
  return { provider: '', model: '', apiKey: '' };
}

export function saveAgentConfig(cfg: AgentConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
  } catch {
    // Sem localStorage (modo privado restrito): a config não persiste, mas o
    // app segue funcionando com o provider do servidor.
  }
}

export function clearAgentConfig(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // nada a fazer
  }
}

/** Envia uma mensagem ao agente, com o histórico acumulado e (opcional) BYOK. */
export async function sendChat(
  message: string,
  history: { role: ChatRole; content: string }[],
  config?: Pick<AgentConfig, 'model' | 'apiKey'>
): Promise<ChatResponse> {
  const body: Record<string, unknown> = { message, history };
  // Só envia model/api_key quando o usuário configurou (BYOK). Senão, o agente
  // usa o provider do próprio servidor.
  if (config?.model) body.model = config.model;
  if (config?.apiKey) body.api_key = config.apiKey;
  const { data } = await agentApi.post<ChatResponse>('/chat', body);
  return data;
}

/** Lê qual provider/modelo o agente usará (para exibir na UI). */
export async function getProvider(): Promise<ProviderInfo> {
  const { data } = await agentApi.get<ProviderInfo>('/providers');
  return data;
}

/** Resposta do POST /providers/models. */
export type ModelsResponse = {
  ok: boolean;
  models: string[];
  error: string | null;
};

/**
 * Valida a key e lista os modelos reais do provider (custo zero).
 * ok=false => key inválida/sem acesso (a UI deve avisar).
 */
export async function listModels(provider: string, apiKey: string): Promise<ModelsResponse> {
  const { data } = await agentApi.post<ModelsResponse>('/providers/models', {
    provider,
    api_key: apiKey,
  });
  return data;
}

export default agentApi;
