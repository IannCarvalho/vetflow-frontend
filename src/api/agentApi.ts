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

/** Envia uma mensagem ao agente, com o histórico acumulado. */
export async function sendChat(
  message: string,
  history: { role: ChatRole; content: string }[]
): Promise<ChatResponse> {
  const { data } = await agentApi.post<ChatResponse>('/chat', { message, history });
  return data;
}

/** Lê qual provider/modelo o agente usará (para exibir na UI). */
export async function getProvider(): Promise<ProviderInfo> {
  const { data } = await agentApi.get<ProviderInfo>('/providers');
  return data;
}

export default agentApi;
