import { LocationService } from './location.service';

describe('LocationService country selection', () => {
  let service: LocationService;

  beforeEach(() => {
    service = new LocationService({} as never);
  });

  it('returns only Uzbekistan and Kazakhstan by default', () => {
    const result = service.getCountrySelection();

    expect(result).toHaveLength(2);
    expect(result.map((x) => x.countryCode)).toEqual(['UZ', 'KZ']);
  });

  it('filters by search query', () => {
    const result = service.getCountrySelection({ search: 'kaza' });

    expect(result).toHaveLength(1);
    expect(result[0].countryCode).toBe('KZ');
  });

  it('filters by country id', () => {
    const result = service.getCountrySelection({ id: 'uzbekistan' });

    expect(result).toHaveLength(1);
    expect(result[0].countryCode).toBe('UZ');
  });

  it('filters by ISO country code', () => {
    const result = service.getCountrySelection({ countryCode: 'kz' });

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('kazakhstan');
  });

  it('filters by dial code', () => {
    const result = service.getCountrySelection({ countryCode: '+998' });

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('uzbekistan');
  });
});
