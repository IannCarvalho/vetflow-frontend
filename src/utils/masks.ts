/**
 * Input masks and validators for Brazilian document/contact fields.
 *
 * The mask functions are progressive: they format whatever digits are present
 * so they can be used directly in controlled input onChange handlers.
 */

/** Keep only digits. */
export function onlyDigits(value: string): string {
  return value.replace(/\D/g, '');
}

/** Format as CPF: 000.000.000-00 (limited to 11 digits). */
export function maskCPF(value: string): string {
  const digits = onlyDigits(value).slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

/** Format as BR phone: (00) 00000-0000 or (00) 0000-0000. */
export function maskPhone(value: string): string {
  const digits = onlyDigits(value).slice(0, 11);
  if (digits.length <= 10) {
    return digits
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d{1,4})$/, '$1-$2');
  }
  return digits.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d{1,4})$/, '$1-$2');
}

/** Format as CEP: 00000-000 (limited to 8 digits). */
export function maskCEP(value: string): string {
  const digits = onlyDigits(value).slice(0, 8);
  return digits.replace(/(\d{5})(\d{1,3})$/, '$1-$2');
}

/**
 * Validate a Brazilian CPF using its check digits.
 * Accepts formatted ("000.000.000-00") or raw ("00000000000") input.
 */
export function isValidCPF(value: string): boolean {
  const cpf = onlyDigits(value);

  if (cpf.length !== 11) return false;
  // Reject sequences with all identical digits (e.g. 111.111.111-11).
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  const digits = cpf.split('').map(Number);

  const checkDigit = (length: number): number => {
    let sum = 0;
    for (let i = 0; i < length; i += 1) {
      sum += digits[i] * (length + 1 - i);
    }
    const remainder = (sum * 10) % 11;
    return remainder === 10 ? 0 : remainder;
  };

  return checkDigit(9) === digits[9] && checkDigit(10) === digits[10];
}

/** A BR phone is valid when it has 10 (landline) or 11 (mobile) digits. */
export function isValidPhone(value: string): boolean {
  const digits = onlyDigits(value);
  return digits.length === 10 || digits.length === 11;
}

/** A BR CEP is valid when it has exactly 8 digits. */
export function isValidCEP(value: string): boolean {
  return onlyDigits(value).length === 8;
}
