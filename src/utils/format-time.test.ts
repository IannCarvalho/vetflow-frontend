import dayjs from 'dayjs';
import { describe, expect, it } from 'vitest';

import { fDate, fToNow, fDateTime, formatPatterns } from './format-time';

// Use a fixed reference date to keep formatting assertions deterministic.
const REFERENCE = '2022-04-17T00:00:00';

describe('fDate', () => {
  it('formats a valid date with the default pattern', () => {
    expect(fDate(REFERENCE)).toBe('17 Apr 2022');
  });

  it('accepts a custom template', () => {
    expect(fDate(REFERENCE, formatPatterns.split.date)).toBe('17/04/2022');
  });

  it('returns "Invalid date" for null', () => {
    expect(fDate(null)).toBe('Invalid date');
  });

  it('returns "Invalid date" for garbage input', () => {
    expect(fDate('not-a-date')).toBe('Invalid date');
  });
});

describe('fDateTime', () => {
  it('formats a valid date-time with the default pattern', () => {
    expect(fDateTime(REFERENCE)).toBe('17 Apr 2022 12:00 am');
  });

  it('returns "Invalid date" for undefined', () => {
    expect(fDateTime(undefined)).toBe('Invalid date');
  });
});

describe('fToNow', () => {
  it('returns a relative time string for a valid date', () => {
    const oneHourAgo = dayjs().subtract(1, 'hour').toISOString();
    expect(fToNow(oneHourAgo)).toBe('an hour');
  });

  it('returns "Invalid date" for null', () => {
    expect(fToNow(null)).toBe('Invalid date');
  });
});
