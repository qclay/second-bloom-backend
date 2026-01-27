import { BadRequestException } from '@nestjs/common';

export function normalizePhoneNumber(phoneNumber: string): string {
  if (!phoneNumber) {
    throw new BadRequestException('Phone number is required');
  }

  let normalized = phoneNumber.replace(/[\s\-\(\)]/g, '');

  if (normalized.startsWith('+998')) {
    normalized = normalized;
  } else if (normalized.startsWith('998')) {
    normalized = '+' + normalized;
  } else if (normalized.startsWith('8') && normalized.length === 10) {
    normalized = '+998' + normalized.substring(1);
  } else if (normalized.length === 9 && /^[0-9]{9}$/.test(normalized)) {
    normalized = '+998' + normalized;
  } else {
    throw new BadRequestException(
      `Invalid phone number format: ${phoneNumber}. Expected format: +998901234567, 998901234567, 8901234567, or 901234567`,
    );
  }

  if (!/^\+998[0-9]{9}$/.test(normalized)) {
    throw new BadRequestException(
      `Invalid phone number format: ${phoneNumber}. Expected format: +998901234567`,
    );
  }

  return normalized;
}

export function normalizePhoneNumberForSearch(
  phoneNumber: string,
): string | null {
  try {
    return normalizePhoneNumber(phoneNumber);
  } catch {
    return null;
  }
}
