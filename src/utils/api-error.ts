import axios from 'axios';

/**
 * Shape of the error payload returned by the VetFlow backend.
 * See controllers/helpers.go (errorResponse): { error, details?, code? }.
 */
interface BackendErrorBody {
  error?: string;
  details?: string;
  code?: string;
}

/**
 * Extract a human-friendly, pt-BR message from an unknown thrown value.
 *
 * Priority:
 * 1. Access-denied (HTTP 403 or backend code "ACCESS_DENIED") -> friendly message
 * 2. Rate limit (HTTP 429) -> "try again later" message
 * 3. Duplicate email (HTTP 409) -> backend "error" or a default duplicate-email message
 * 4. Backend "error" (+ "details") from the JSON response body
 * 5. Network/unreachable server message
 * 6. A provided fallback (defaults to a generic message)
 */
export function getApiErrorMessage(error: unknown, fallback = 'Ocorreu um erro inesperado'): string {
  if (axios.isAxiosError(error)) {
    const body = error.response?.data as BackendErrorBody | undefined;

    // Resource owned by another vet (scope-per-vet). The backend returns
    // 403 { error: "Acesso negado", code: "ACCESS_DENIED" }; show a clear,
    // consistent message regardless of the exact backend wording.
    if (error.response?.status === 403 || body?.code === 'ACCESS_DENIED') {
      return 'Você não tem acesso a este registro';
    }

    // Too many requests (auth rate limit on login/register).
    if (error.response?.status === 429) {
      return 'Muitas tentativas. Aguarde um momento e tente novamente.';
    }

    // Invite-only signup (production). The backend returns:
    //   401 { error: "invalid invite code" }  -> wrong/missing code
    //   403 { error: "registration is closed" } -> no invite code configured
    // Translate both to friendly pt-BR instead of leaking the raw English.
    if (body?.error === 'invalid invite code') {
      return 'Código de convite inválido. Verifique o código e tente novamente.';
    }
    if (body?.error === 'registration is closed') {
      return 'O cadastro está fechado no momento.';
    }

    // Duplicate email on sign-up.
    if (error.response?.status === 409) {
      return body?.error ?? 'Este e-mail já está cadastrado.';
    }

    if (body?.error) {
      return body.details ? `${body.error}: ${body.details}` : body.error;
    }

    // Response arrived but without a recognizable body
    if (error.response) {
      return `Erro do servidor (${error.response.status})`;
    }

    // No response at all -> network / server down / CORS
    return 'Não foi possível conectar ao servidor. Verifique se o backend está no ar.';
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}
