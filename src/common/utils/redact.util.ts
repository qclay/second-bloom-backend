const SENSITIVE_FIELDS = [
  'password',
  'token',
  'secret',
  'apiKey',
  'accessToken',
  'refreshToken',
  'authorization',
  'creditCard',
  'cvv',
  'ssn',
  'pin',
];

export function redactSensitiveFields(
  obj: Record<string, unknown>,
): Record<string, unknown> {
  const redacted = { ...obj };

  for (const key in redacted) {
    const lowerKey = key.toLowerCase();
    const isSensitive = SENSITIVE_FIELDS.some((field) =>
      lowerKey.includes(field),
    );

    if (isSensitive && redacted[key]) {
      redacted[key] = '[REDACTED]';
    } else if (
      typeof redacted[key] === 'object' &&
      redacted[key] !== null &&
      !Array.isArray(redacted[key])
    ) {
      redacted[key] = redactSensitiveFields(
        redacted[key] as Record<string, unknown>,
      );
    } else if (Array.isArray(redacted[key])) {
      redacted[key] = (redacted[key] as unknown[]).map((item) =>
        typeof item === 'object' && item !== null
          ? redactSensitiveFields(item as Record<string, unknown>)
          : item,
      );
    }
  }

  return redacted;
}
