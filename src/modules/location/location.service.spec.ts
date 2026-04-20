import { LocationService } from './location.service';

describe('LocationService static cities API', () => {
  let service: LocationService;

  beforeEach(() => {
    service = new LocationService({} as never);
  });

  it('returns only Uzbekistan and Kazakhstan by default', async () => {
    const result = await service.getCities();

    expect(result).toHaveLength(2);
    expect(result.map((x) => x.countryCode)).toEqual(['UZ', 'KZ']);
  });

  it('filters by search query', async () => {
    const result = await service.getCities('казах');

    expect(result).toHaveLength(1);
    expect(result[0].countryCode).toBe('KZ');
  });

  it('filters by country id', async () => {
    const result = await service.getCities(undefined, 'uzbekistan');

    expect(result).toHaveLength(1);
    expect(result[0].countryCode).toBe('UZ');
  });

  it('filters by ISO country code', async () => {
    const result = await service.getCities(undefined, undefined, 'kz');

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('kazakhstan');
  });

  it('filters by dial code', async () => {
    const result = await service.getCities(undefined, undefined, '+998');

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('uzbekistan');
  });

  it('returns full static city lists from team lead', async () => {
    const result = await service.getCities();
    const uz = result.find((x) => x.id === 'uzbekistan');
    const kz = result.find((x) => x.id === 'kazakhstan');

    expect(uz?.cities).toHaveLength(14);
    expect(kz?.cities).toHaveLength(18);
  });
});
