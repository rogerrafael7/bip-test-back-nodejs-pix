import { RedisCacheService } from '../../src/services/cache';
import { getRedisClient } from '../../src/services/redis';

jest.mock('../../src/services/redis', () => {
  const store: Record<string, { value: string; ttl: number; setAt: number }> = {};

  const mockRedis = {
    get: jest.fn(async (key: string) => {
      const item = store[key];
      if (!item) return null;
      const now = Date.now();
      if (now - item.setAt > item.ttl * 1000) {
        delete store[key];
        return null;
      }
      return item.value;
    }),
    setex: jest.fn(async (key: string, ttl: number, value: string) => {
      store[key] = { value, ttl, setAt: Date.now() };
      return 'OK';
    }),
    del: jest.fn(async (key: string) => {
      delete store[key];
      return 1;
    }),
    ttl: jest.fn(async (key: string) => {
      const item = store[key];
      if (!item) return -2;
      const elapsed = Math.floor((Date.now() - item.setAt) / 1000);
      const remaining = item.ttl - elapsed;
      return remaining > 0 ? remaining : -2;
    }),
  };

  return {
    getRedisClient: jest.fn(() => mockRedis),
    __store: store,
    __mockRedis: mockRedis,
  };
});

describe('RedisCacheService', () => {
  let cache: RedisCacheService;

  beforeEach(() => {
    cache = new RedisCacheService(5);
    const { __store } = require('../../src/services/redis');
    Object.keys(__store).forEach((key) => delete __store[key]);
    jest.clearAllMocks();
  });

  it('should return null when cache is empty', async () => {
    const result = await cache.get();
    expect(result).toBeNull();
  });

  it('should return data when cache is valid', async () => {
    const testData = [{ ispb: '00000000', nome: 'Test Bank', nome_reduzido: 'Test', modalidade_participacao: 'PISP', tipo_participacao: 'DIRETO', inicio_operacao: '2020-11-16' }];
    await cache.set(testData);

    const result = await cache.get();
    expect(result).toEqual(testData);
  });

  it('should clear cache', async () => {
    const testData = [{ ispb: '00000000', nome: 'Test Bank', nome_reduzido: 'Test', modalidade_participacao: 'PISP', tipo_participacao: 'DIRETO', inicio_operacao: '2020-11-16' }];
    await cache.set(testData);
    await cache.clear();

    const result = await cache.get();
    expect(result).toBeNull();
  });

  it('should report validity correctly', async () => {
    expect(await cache.isValid()).toBe(false);

    const testData = [{ ispb: '00000000', nome: 'Test Bank', nome_reduzido: 'Test', modalidade_participacao: 'PISP', tipo_participacao: 'DIRETO', inicio_operacao: '2020-11-16' }];
    await cache.set(testData);

    expect(await cache.isValid()).toBe(true);
  });

  it('should call redis setex with correct TTL in seconds', async () => {
    const testData = [{ ispb: '00000000', nome: 'Test Bank', nome_reduzido: 'Test', modalidade_participacao: 'PISP', tipo_participacao: 'DIRETO', inicio_operacao: '2020-11-16' }];
    await cache.set(testData);

    const mockRedis = getRedisClient();
    expect(mockRedis.setex).toHaveBeenCalledWith(
      'pix:participants',
      5,
      JSON.stringify(testData)
    );
  });
});
