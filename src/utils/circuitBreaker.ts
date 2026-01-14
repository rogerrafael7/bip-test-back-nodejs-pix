import { CircuitBreakerState } from '../types';
import { config } from '../config';
import { logger } from './logger';

class CircuitBreaker {
  private state: CircuitBreakerState = {
    failures: 0,
    lastFailure: null,
    isOpen: false,
  };

  private readonly threshold: number;
  private readonly resetMs: number;

  constructor(threshold: number = config.circuitBreaker.threshold, resetMs: number = config.circuitBreaker.resetMs) {
    this.threshold = threshold;
    this.resetMs = resetMs;
  }

  isOpen(): boolean {
    if (!this.state.isOpen) {
      return false;
    }

    const now = Date.now();
    if (this.state.lastFailure && now - this.state.lastFailure >= this.resetMs) {
      logger.info({ event: 'circuit_breaker_half_open' }, 'Circuit breaker entering half-open state');
      return false;
    }

    return true;
  }

  recordSuccess(): void {
    if (this.state.failures > 0) {
      logger.info({ event: 'circuit_breaker_reset' }, 'Circuit breaker reset after success');
    }
    this.state = {
      failures: 0,
      lastFailure: null,
      isOpen: false,
    };
  }

  recordFailure(): void {
    this.state.failures++;
    this.state.lastFailure = Date.now();

    if (this.state.failures >= this.threshold) {
      this.state.isOpen = true;
      logger.warn(
        { event: 'circuit_breaker_open', failures: this.state.failures },
        'Circuit breaker opened due to failures'
      );
    }
  }

  getState(): CircuitBreakerState {
    return { ...this.state };
  }

  reset(): void {
    this.state = {
      failures: 0,
      lastFailure: null,
      isOpen: false,
    };
  }
}

export const circuitBreaker = new CircuitBreaker();
export { CircuitBreaker };
