import {config} from '../config';
import {logger} from '../utils/logger';
import {getRedisClient} from './redis';
import {PixParticipant} from '../types';

const CACHE_KEY = 'pix:participants';

class RedisCacheService {
  private ttlSeconds: number;

  constructor(ttlSeconds: number = config.cacheTtlSeconds) {
    this.ttlSeconds = ttlSeconds;
  }

  async get(): Promise<PixParticipant[] | null> {
    try {
      const redis = getRedisClient();
      const data = await redis.get(CACHE_KEY);

      if (!data) {
        logger.debug({ event: 'cache_miss' }, 'Cache miss');
        return null;
      }

      logger.debug({ event: 'cache_hit' }, 'Cache hit');
      return JSON.parse(data) as PixParticipant[];
    } catch (error) {
      logger.error({ event: 'cache_get_error', error: (error as Error).message }, 'Error getting from cache');
      return null;
    }
  }

  async set(data: PixParticipant[]): Promise<void> {
    try {
      const redis = getRedisClient();
      await redis.setex(CACHE_KEY, this.ttlSeconds, JSON.stringify(data));
      logger.info({ event: 'cache_set', ttl: this.ttlSeconds }, 'Cache updated in Redis');
    } catch (error) {
      logger.error({ event: 'cache_set_error', error: (error as Error).message }, 'Error setting cache');
    }
  }

  async clear(): Promise<void> {
    try {
      const redis = getRedisClient();
      await redis.del(CACHE_KEY);
      logger.info({ event: 'cache_cleared' }, 'Cache cleared');
    } catch (error) {
      logger.error({ event: 'cache_clear_error', error: (error as Error).message }, 'Error clearing cache');
    }
  }

  async isValid(): Promise<boolean> {
    try {
      const redis = getRedisClient();
      const ttl = await redis.ttl(CACHE_KEY);
      return ttl > 0;
    } catch (error) {
      return false;
    }
  }
}

export const participantsCache = new RedisCacheService();
export { RedisCacheService };
