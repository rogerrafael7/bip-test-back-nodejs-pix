export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  bcbPixUrl: process.env.BCB_PIX_URL || 'https://www.bcb.gov.br/pix/api/participants',
  cacheTtlSeconds: parseInt(process.env.CACHE_TTL_SECONDS || '300', 10),
  requestTimeoutMs: parseInt(process.env.REQUEST_TIMEOUT_MS || '10000', 10),
  maxRetries: parseInt(process.env.MAX_RETRIES || '3', 10),
  circuitBreaker: {
    threshold: parseInt(process.env.CIRCUIT_BREAKER_THRESHOLD || '5', 10),
    resetMs: parseInt(process.env.CIRCUIT_BREAKER_RESET_MS || '30000', 10),
  },
  logLevel: process.env.LOG_LEVEL || 'info',
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
  },
};
