import Redis from 'ioredis';
import { config } from '../config';
import { logger } from '../utils/logger';

let redisClient: Redis | null = null;

export const getRedisClient = (): Redis => {
  if (!redisClient) {
    redisClient = new Redis({
      host: config.redis.host,
      port: config.redis.port,
      retryStrategy: (times) => {
        if (times > 3) {
          logger.error({ event: 'redis_connection_failed', attempts: times }, 'Redis connection failed');
          return null;
        }
        return Math.min(times * 100, 3000);
      },
      lazyConnect: true,
    });

    redisClient.on('connect', () => {
      logger.info({ event: 'redis_connected' }, 'Connected to Redis');
    });

    redisClient.on('error', (error) => {
      logger.error({ event: 'redis_error', error: error.message }, 'Redis error');
    });
  }

  return redisClient;
};
