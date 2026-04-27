import { isValidPhoneNumber } from 'libphonenumber-js';

export function isValidPhone(phone?: string) {
  if (!phone) return false;

  return isValidPhoneNumber(phone);
}