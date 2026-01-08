"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redactSensitiveFields = redactSensitiveFields;
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
function redactSensitiveFields(obj) {
    const redacted = { ...obj };
    for (const key in redacted) {
        const lowerKey = key.toLowerCase();
        const isSensitive = SENSITIVE_FIELDS.some((field) => lowerKey.includes(field));
        if (isSensitive && redacted[key]) {
            redacted[key] = '[REDACTED]';
        }
        else if (typeof redacted[key] === 'object' &&
            redacted[key] !== null &&
            !Array.isArray(redacted[key])) {
            redacted[key] = redactSensitiveFields(redacted[key]);
        }
        else if (Array.isArray(redacted[key])) {
            redacted[key] = redacted[key].map((item) => typeof item === 'object' && item !== null
                ? redactSensitiveFields(item)
                : item);
        }
    }
    return redacted;
}
//# sourceMappingURL=redact.util.js.map