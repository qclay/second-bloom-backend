import { resolveTranslation, isTranslationRecord, parseAcceptLanguage, t } from './translation.util';

describe('Translation Utilities', () => {
  describe('resolveTranslation', () => {
    const record = {
      en: 'Hello',
      ru: 'Привет',
      uz: 'Salom',
    };

    it('should resolve to English if specified', () => {
      expect(resolveTranslation(record, 'en')).toBe('Hello');
    });

    it('should resolve to Russian if specified', () => {
      expect(resolveTranslation(record, 'ru')).toBe('Привет');
    });

    it('should resolve to Uzbek if specified', () => {
      expect(resolveTranslation(record, 'uz')).toBe('Salom');
    });

    it('should fallback in order if specified locale is missing', () => {
      const partialRecord = { en: 'Hello' };
      expect(resolveTranslation(partialRecord, 'ru')).toBe('Hello');
    });

    it('should return null if record is empty', () => {
      expect(resolveTranslation({}, 'en')).toBeNull();
    });

    it('should return null if record is undefined', () => {
      expect(resolveTranslation(undefined, 'en')).toBeNull();
    });
  });

  describe('isTranslationRecord', () => {
    it('should return true for valid translation records', () => {
      expect(isTranslationRecord({ en: 'Hello' })).toBe(true);
      expect(isTranslationRecord({ ru: 'Привет' })).toBe(true);
      expect(isTranslationRecord({ en: 'A', ru: 'B', uz: 'C' })).toBe(true);
    });

    it('should return false for invalid objects', () => {
      expect(isTranslationRecord({})).toBe(false);
      expect(isTranslationRecord({ fr: 'Bonjour' })).toBe(false);
      expect(isTranslationRecord(null)).toBe(false);
      expect(isTranslationRecord('string')).toBe(false);
      expect(isTranslationRecord([])).toBe(false);
    });
  });

  describe('parseAcceptLanguage', () => {
    it('should parse simple headers', () => {
      expect(parseAcceptLanguage('ru')).toBe('ru');
      expect(parseAcceptLanguage('en-US')).toBe('en');
    });

    it('should parse complex headers', () => {
      expect(parseAcceptLanguage('uz,ru;q=0.9,en;q=0.8')).toBe('uz');
      expect(parseAcceptLanguage('fr-FR,en;q=0.5')).toBe('en');
    });

    it('should return null for unknown languages', () => {
      expect(parseAcceptLanguage('fr,de')).toBeNull();
    });
  });

  describe('t (Translation with Parameters)', () => {
    const dictionary = {
      WELCOME: {
        en: 'Welcome, {{name}}!',
        ru: 'Добро пожаловать, {{name}}!',
        uz: 'Xush kelibsiz, {{name}}!',
      },
      AUCTION_ENDED: {
        en: 'Auction for {{product}} has ended.',
        ru: 'Аукцион по товару {{product}} завершен.',
        uz: '{{product}} boʻyicha auksion yakunlandi.',
      },
    };

    it('should translate and interpolate English', () => {
      const result = t(dictionary, 'WELCOME', { name: 'John' }, 'en');
      expect(result).toBe('Welcome, John!');
    });

    it('should translate and interpolate Russian', () => {
      const result = t(dictionary, 'WELCOME', { name: 'Иван' }, 'ru');
      expect(result).toBe('Добро пожаловать, Иван!');
    });

    it('should translate and interpolate Uzbek', () => {
      const result = t(dictionary, 'WELCOME', { name: 'Ali' }, 'uz');
      expect(result).toBe('Xush kelibsiz, Ali!');
    });

    it('should handle multiple placeholders', () => {
      const dict = {
        MSG: { en: '{{a}} + {{b}} = {{c}}' }
      };
      const result = t(dict, 'MSG', { a: 1, b: 2, c: 3 }, 'en');
      expect(result).toBe('1 + 2 = 3');
    });

    it('should return key if translation is missing', () => {
      expect(t(dictionary, 'MISSING_KEY', {}, 'en')).toBe('MISSING_KEY');
    });

    it('should handle missing parameters gracefully', () => {
      const result = t(dictionary, 'WELCOME', {}, 'en');
      expect(result).toBe('Welcome, {{name}}!');
    });

    it('should handle null/undefined parameters gracefully', () => {
      const result = t(dictionary, 'WELCOME', { name: null as any }, 'en');
      expect(result).toBe('Welcome, {{name}}!');
    });
  });
});
