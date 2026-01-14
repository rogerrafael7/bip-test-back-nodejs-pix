import request from 'supertest';
import nock from 'nock';
import { app } from '../../src/app';
import { circuitBreaker } from '../../src/utils/circuitBreaker';

jest.mock('../../src/services/redis', () => {
  const store: Record<string, string> = {};

  const mockRedis = {
    get: jest.fn(async (key: string) => store[key] || null),
    setex: jest.fn(async (key: string, _ttl: number, value: string) => {
      store[key] = value;
      return 'OK';
    }),
    del: jest.fn(async (key: string) => {
      delete store[key];
      return 1;
    }),
    ttl: jest.fn(async (key: string) => (store[key] ? 300 : -2)),
    ping: jest.fn().mockResolvedValue('PONG'),
  };

  return {
    getRedisClient: jest.fn(() => mockRedis),
    connectRedis: jest.fn().mockResolvedValue(undefined),
    disconnectRedis: jest.fn().mockResolvedValue(undefined),
    __store: store,
    __mockRedis: mockRedis,
  };
});

const mockParticipants = [
  {
    ispb: 0,
    nome: 'BANCO DO BRASIL S.A.',
    nome_reduzido: 'BCO DO BRASIL S.A.',
    modalidade_participacao: 'PISP',
    tipo_participacao: 'DIRETO',
    inicio_operacao: '2020-11-16',
  },
  {
    ispb: '00416968',
    nome: 'BANCO INTER S.A.',
    nome_reduzido: 'BCO INTER S.A.',
    modalidade_participacao: 'PISP',
    tipo_participacao: 'DIRETO',
    inicio_operacao: '2020-11-16',
  },
  {
    ispb: 60701190,
    nome: 'ITAU UNIBANCO S.A.',
    nome_reduzido: 'ITAU UNIBANCO S.A.',
    modalidade_participacao: 'PISP',
    tipo_participacao: 'DIRETO',
    inicio_operacao: '2020-11-16',
  },
];

describe('PIX API Integration Tests', () => {
  beforeEach(() => {
    const { __store } = require('../../src/services/redis');
    Object.keys(__store).forEach((key) => delete __store[key]);
    circuitBreaker.reset();
    nock.cleanAll();
  });

  describe('GET /pix/participants/:ispb', () => {
    it('should return participant for valid ISPB with numeric data from BCB', async () => {
      nock('https://www.bcb.gov.br')
        .get('/pix/api/participants')
        .reply(200, mockParticipants);

      const response = await request(app).get('/pix/participants/0');

      expect(response.status).toBe(200);
      expect(response.body.ispb).toBe('00000000');
      expect(response.body.nome).toBe('BANCO DO BRASIL S.A.');
    });

    it('should handle ISPB normalization correctly - fixing the original bug', async () => {
      nock('https://www.bcb.gov.br')
        .get('/pix/api/participants')
        .reply(200, mockParticipants);

      const response = await request(app).get('/pix/participants/00000000');

      expect(response.status).toBe(200);
      expect(response.body.ispb).toBe('00000000');
    });

    it('should find participant with ISPB returned as number by BCB', async () => {
      nock('https://www.bcb.gov.br')
        .get('/pix/api/participants')
        .reply(200, mockParticipants);

      const response = await request(app).get('/pix/participants/60701190');

      expect(response.status).toBe(200);
      expect(response.body.nome).toBe('ITAU UNIBANCO S.A.');
    });

    it('should return 404 for non-existent ISPB', async () => {
      nock('https://www.bcb.gov.br')
        .get('/pix/api/participants')
        .reply(200, mockParticipants);

      const response = await request(app).get('/pix/participants/99999999');

      expect(response.status).toBe(404);
      expect(response.body.code).toBe('PARTICIPANT_NOT_FOUND');
    });

    it('should return 400 for invalid ISPB format', async () => {
      const response = await request(app).get('/pix/participants/invalid');

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('INVALID_ISPB');
    });

    it('should use cache on subsequent requests', async () => {
      const scope = nock('https://www.bcb.gov.br')
        .get('/pix/api/participants')
        .reply(200, mockParticipants);

      await request(app).get('/pix/participants/0');
      await request(app).get('/pix/participants/00416968');

      expect(scope.isDone()).toBe(true);
      expect(nock.pendingMocks()).toHaveLength(0);
    });
  });

  describe('Circuit Breaker', () => {
    it('should return 500 when BCB is unavailable', async () => {
      nock('https://www.bcb.gov.br')
        .get('/pix/api/participants')
        .times(4)
        .reply(500);

      const response = await request(app).get('/pix/participants/0');

      expect(response.status).toBe(500);
    }, 30000);
  });
});
