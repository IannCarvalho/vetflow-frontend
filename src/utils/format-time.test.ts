import dayjs from 'dayjs';
import { it, expect, describe } from 'vitest';

import { fDate, fToNow, fDateTime, toDateInput, defaultStart, formatPatterns, toLocalInputValue } from './format-time';

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

describe('toDateInput', () => {
  it('extracts the YYYY-MM-DD portion of an ISO timestamp', () => {
    expect(toDateInput('2022-04-17T13:45:00.000Z')).toBe('2022-04-17');
  });

  it('falls back to today for empty input', () => {
    const today = new Date().toISOString().split('T')[0];
    expect(toDateInput()).toBe(today);
  });

  it('falls back to today for invalid input', () => {
    const today = new Date().toISOString().split('T')[0];
    expect(toDateInput('not-a-date')).toBe(today);
  });
});

describe('toLocalInputValue', () => {
  it('returns empty string for empty input', () => {
    expect(toLocalInputValue()).toBe('');
  });

  it('returns empty string for invalid input', () => {
    expect(toLocalInputValue('not-a-date')).toBe('');
  });

  it('produces a YYYY-MM-DDTHH:mm value', () => {
    expect(toLocalInputValue('2022-04-17T13:45:00.000Z')).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/
    );
  });
});

describe('defaultStart', () => {
  it('returns a datetime-local string on a round hour', () => {
    const value = defaultStart();
    expect(value).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:00$/);
  });
});
