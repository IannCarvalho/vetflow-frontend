import { it, expect, describe } from 'vitest';

import { fNumber, fPercent, fCurrency, formatBRL, fShortenNumber } from './format-number';

describe('fNumber', () => {
  it('formats an integer', () => {
    expect(fNumber(1000)).toBe('1,000');
  });

  it('formats a decimal capping at 2 fraction digits', () => {
    expect(fNumber(1234.567)).toBe('1,234.57');
  });

  it('accepts numeric strings', () => {
    expect(fNumber('2500')).toBe('2,500');
  });

  it('returns empty string for null', () => {
    expect(fNumber(null)).toBe('');
  });

  it('returns empty string for undefined', () => {
    expect(fNumber(undefined)).toBe('');
  });

  it('returns empty string for NaN', () => {
    expect(fNumber(NaN)).toBe('');
  });

  it('honors custom options', () => {
    expect(fNumber(1.5, { minimumFractionDigits: 2 })).toBe('1.50');
  });
});

describe('fCurrency', () => {
  it('formats a value as USD', () => {
    expect(fCurrency(1000)).toBe('$1,000');
  });

  it('formats decimals', () => {
    expect(fCurrency(19.9)).toBe('$19.9');
  });

  it('returns empty string for null', () => {
    expect(fCurrency(null)).toBe('');
  });
});

describe('fPercent', () => {
  it('divides by 100 and appends percent sign', () => {
    expect(fPercent(50)).toBe('50%');
  });

  it('keeps up to one fraction digit', () => {
    expect(fPercent(12.34)).toBe('12.3%');
  });

  it('returns empty string for undefined', () => {
    expect(fPercent(undefined)).toBe('');
  });
});

describe('fShortenNumber', () => {
  it('shortens thousands with lowercase suffix', () => {
    expect(fShortenNumber(1500)).toBe('1.5k');
  });

  it('shortens millions with lowercase suffix', () => {
    expect(fShortenNumber(2_000_000)).toBe('2m');
  });

  it('returns empty string for null', () => {
    expect(fShortenNumber(null)).toBe('');
  });
});

describe('formatBRL', () => {
  it('formats a value as Brazilian Real', () => {
    // toLocaleString('pt-BR') uses a non-breaking space between symbol and value.
    expect(formatBRL(1234.5)).toBe('R$\u00a01.234,50');
  });

  it('formats zero', () => {
    expect(formatBRL(0)).toBe('R$\u00a00,00');
  });
});
