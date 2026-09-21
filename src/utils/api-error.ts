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
 * 1. Backend "error" (+ "details") from the JSON response body
 * 2. Network/unreachable server message
 * 3. A provided fallback (defaults to a generic message)
 */
export function getApiErrorMessage(error: unknown, fallback = 'Ocorreu um erro inesperado'): string {
  if (axios.isAxiosError(error)) {
    const body = error.response?.data as BackendErrorBody | undefined;

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
