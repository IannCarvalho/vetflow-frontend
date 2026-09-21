import { describe, expect, it } from 'vitest';

import {
  maskCEP,
  maskCPF,
  isValidCEP,
  maskPhone,
  isValidCPF,
  onlyDigits,
  isValidPhone,
} from './masks';

describe('onlyDigits', () => {
  it('strips every non-digit character', () => {
    expect(onlyDigits('(11) 98765-4321')).toBe('11987654321');
    expect(onlyDigits('abc')).toBe('');
  });
});

describe('maskCPF', () => {
  it('formats a full CPF', () => {
    expect(maskCPF('12345678900')).toBe('123.456.789-00');
  });

  it('formats progressively as digits are typed', () => {
    expect(maskCPF('123')).toBe('123');
    expect(maskCPF('1234')).toBe('123.4');
    expect(maskCPF('1234567')).toBe('123.456.7');
  });

  it('ignores extra digits and existing punctuation', () => {
    expect(maskCPF('123.456.789-0099')).toBe('123.456.789-00');
  });
});

describe('maskPhone', () => {
  it('formats a mobile (11 digits)', () => {
    expect(maskPhone('11987654321')).toBe('(11) 98765-4321');
  });

  it('formats a landline (10 digits)', () => {
    expect(maskPhone('1133334444')).toBe('(11) 3333-4444');
  });
});

describe('maskCEP', () => {
  it('formats a full CEP', () => {
    expect(maskCEP('01234567')).toBe('01234-567');
  });
});

describe('isValidCPF', () => {
  it('accepts a valid CPF (formatted or raw)', () => {
    expect(isValidCPF('529.982.247-25')).toBe(true);
    expect(isValidCPF('52998224725')).toBe(true);
  });

  it('rejects wrong check digits', () => {
    expect(isValidCPF('529.982.247-24')).toBe(false);
  });

  it('rejects repeated-digit sequences', () => {
    expect(isValidCPF('111.111.111-11')).toBe(false);
  });

  it('rejects wrong length', () => {
    expect(isValidCPF('123')).toBe(false);
  });
});

describe('isValidPhone', () => {
  it('accepts 10 and 11 digit numbers', () => {
    expect(isValidPhone('(11) 3333-4444')).toBe(true);
    expect(isValidPhone('(11) 98765-4321')).toBe(true);
  });

  it('rejects too-short numbers', () => {
    expect(isValidPhone('1234')).toBe(false);
  });
});

describe('isValidCEP', () => {
  it('accepts exactly 8 digits', () => {
    expect(isValidCEP('01234-567')).toBe(true);
  });

  it('rejects other lengths', () => {
    expect(isValidCEP('123')).toBe(false);
  });
});
