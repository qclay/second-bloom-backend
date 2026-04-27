import { LocationService } from './location.service';

/** Minimal subset of the DB seed – only the cities needed for assertions */
const MOCK_DB_CITIES = [
  { id: 'uuid-tashkent', name: { en: 'Tashkent', ru: 'Ташкент', uz: 'Toshkent' } },
  { id: 'uuid-samarkand', name: { en: 'Samarqand', ru: 'Самарканд', uz: 'Samarqand' } },
  { id: 'uuid-bukhara', name: { en: 'Bukhara', ru: 'Бухара', uz: 'Buxoro' } },
  { id: 'uuid-namangan', name: { en: 'Namangan', ru: 'Наманган', uz: 'Namangan' } },
  { id: 'uuid-andijan', name: { en: 'Andijan', ru: 'Андижан', uz: 'Andijon' } },
  { id: 'uuid-fergana', name: { en: 'Fergana', ru: 'Фергана', uz: "Farg'ona" } },
  { id: 'uuid-karshi', name: { en: 'Qarshi', ru: 'Карши', uz: 'Qarshi' } },
  { id: 'uuid-nukus', name: { en: 'Nukus', ru: 'Нукус', uz: 'Nukus' } },
  { id: 'uuid-navoi', name: { en: 'Navoiy', ru: 'Навои', uz: 'Navoiy' } },
  { id: 'uuid-termez', name: { en: 'Termiz', ru: 'Термез', uz: 'Termiz' } },
  { id: 'uuid-gulistan', name: { en: 'Guliston', ru: 'Гулистан', uz: 'Guliston' } },
  { id: 'uuid-jizzakh', name: { en: 'Jizzakh', ru: 'Джизак', uz: 'Jizzax' } },
  { id: 'uuid-urgench', name: { en: 'Urgench', ru: 'Ургенч', uz: 'Urganch' } },
];

function makePrismaMock() {
  return {
    city: {
      findMany: jest.fn().mockResolvedValue(MOCK_DB_CITIES),
    },
  };
}

describe('LocationService static cities API', () => {
  let service: LocationService;

  beforeEach(() => {
    service = new LocationService(makePrismaMock() as never);
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

  it('returns full static city lists', async () => {
    const result = await service.getCities();
    const uz = result.find((x) => x.id === 'uzbekistan');
    const kz = result.find((x) => x.id === 'kazakhstan');

    expect(uz?.cities).toHaveLength(14);
    expect(kz?.cities).toHaveLength(18);
  });

  it('replaces city slugs with real DB UUIDs for known cities', async () => {
    const result = await service.getCities(undefined, 'uzbekistan');
    const uz = result[0];

    const tashkent = uz.cities.find((c) => c.name === 'Ташкент');
    expect(tashkent?.id).toBe('uuid-tashkent');

    const samarkand = uz.cities.find((c) => c.name === 'Самарканд');
    expect(samarkand?.id).toBe('uuid-samarkand');
  });

  it('keeps slug as fallback for cities not in DB (e.g. Kazakhstan)', async () => {
    const result = await service.getCities(undefined, 'kazakhstan');
    const kz = result[0];

    const almaty = kz.cities.find((c) => c.name === 'Алматы');
    expect(almaty?.id).toBe('almaty');
  });
});
