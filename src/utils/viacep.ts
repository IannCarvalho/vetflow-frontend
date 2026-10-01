/**
 * ViaCEP lookup helper.
 *
 * Fetches Brazilian address data from the public ViaCEP API. Returns null when
 * the CEP is incomplete, not found, or the request fails (best-effort, never
 * throws so it can be called from input handlers).
 */
import { onlyDigits } from './masks';

export interface ViaCepAddress {
  street: string; // logradouro
  neighborhood: string; // bairro
  city: string; // localidade
  state: string; // uf
}

interface ViaCepResponse {
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  erro?: boolean;
}

/**
 * Look up an address by CEP. Accepts formatted or raw input.
 * Returns null if the CEP is not 8 digits, not found, or the request fails.
 */
export async function lookupCep(cep: string): Promise<ViaCepAddress | null> {
  const digits = onlyDigits(cep);
  if (digits.length !== 8) return null;

  try {
    const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
    if (!response.ok) return null;

    const data: ViaCepResponse = await response.json();
    if (data.erro) return null;

    return {
      street: data.logradouro ?? '',
      neighborhood: data.bairro ?? '',
      city: data.localidade ?? '',
      state: data.uf ?? '',
    };
  } catch {
    return null;
  }
}
