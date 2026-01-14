export const normalizeIspb = (ispb: string | number): string => {
  const ispbString = String(ispb);
  return ispbString.padStart(8, '0');
};

export const isValidIspb = (ispb: string): boolean => {
  const normalized = ispb.replace(/\D/g, '');
  return normalized.length >= 1 && normalized.length <= 8;
};
