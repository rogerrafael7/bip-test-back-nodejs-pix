import { logger } from './logger';
import { config } from '../config';

export interface RetryOptions {
  maxRetries?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
}

export const withRetry = async <T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> => {
  const { maxRetries = config.maxRetries, baseDelayMs = 1000, maxDelayMs = 10000 } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxRetries) {
        logger.error(
          { event: 'retry_exhausted', attempt, error: lastError.message },
          'All retry attempts exhausted'
        );
        break;
      }

      const delay = Math.min(baseDelayMs * Math.pow(2, attempt), maxDelayMs);
      logger.warn(
        { event: 'retry_attempt', attempt: attempt + 1, nextDelay: delay, error: lastError.message },
        'Retrying after failure'
      );

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
};
