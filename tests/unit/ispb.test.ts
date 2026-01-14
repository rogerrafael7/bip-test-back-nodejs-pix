import { normalizeIspb, isValidIspb } from '../../src/utils/ispb';

describe('normalizeIspb', () => {
  it('should pad numeric string with zeros to 8 digits', () => {
    expect(normalizeIspb('0')).toBe('00000000');
    expect(normalizeIspb('123')).toBe('00000123');
    expect(normalizeIspb('12345678')).toBe('12345678');
  });

  it('should handle number input by converting to string and padding', () => {
    expect(normalizeIspb(0)).toBe('00000000');
    expect(normalizeIspb(123)).toBe('00000123');
    expect(normalizeIspb(12345678)).toBe('12345678');
  });

  it('should handle already padded strings', () => {
    expect(normalizeIspb('00000000')).toBe('00000000');
    expect(normalizeIspb('00416968')).toBe('00416968');
  });
});

describe('isValidIspb', () => {
  it('should return true for valid ISPB formats', () => {
    expect(isValidIspb('0')).toBe(true);
    expect(isValidIspb('00000000')).toBe(true);
    expect(isValidIspb('12345678')).toBe(true);
    expect(isValidIspb('123')).toBe(true);
  });

  it('should return false for invalid ISPB formats', () => {
    expect(isValidIspb('')).toBe(false);
    expect(isValidIspb('123456789')).toBe(false);
    expect(isValidIspb('abcdefgh')).toBe(false);
  });

  it('should handle ISPBs with non-numeric characters by stripping them', () => {
    expect(isValidIspb('123-456')).toBe(true);
    expect(isValidIspb('12.345.678')).toBe(true);
  });
});
