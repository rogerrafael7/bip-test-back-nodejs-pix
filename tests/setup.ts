import nock from 'nock';

jest.mock('../src/services/redis', () => {
  const mockRedis = {
    get: jest.fn(),
    setex: jest.fn(),
    del: jest.fn(),
    ttl: jest.fn(),
    ping: jest.fn().mockResolvedValue('PONG'),
    connect: jest.fn().mockResolvedValue(undefined),
    quit: jest.fn().mockResolvedValue(undefined),
    on: jest.fn(),
  };

  return {
    getRedisClient: jest.fn(() => mockRedis),
    __mockRedis: mockRedis,
  };
});

beforeAll(() => {
  nock.disableNetConnect();
  nock.enableNetConnect('127.0.0.1');
});

afterEach(() => {
  nock.cleanAll();
  jest.clearAllMocks();
});

afterAll(() => {
  nock.enableNetConnect();
});
