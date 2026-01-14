import { CircuitBreaker } from '../../src/utils/circuitBreaker';

describe('CircuitBreaker', () => {
  let cb: CircuitBreaker;

  beforeEach(() => {
    cb = new CircuitBreaker(3, 1000);
  });

  it('should start with closed state', () => {
    expect(cb.isOpen()).toBe(false);
    expect(cb.getState().failures).toBe(0);
  });

  it('should open after threshold failures', () => {
    cb.recordFailure();
    cb.recordFailure();
    expect(cb.isOpen()).toBe(false);

    cb.recordFailure();
    expect(cb.isOpen()).toBe(true);
  });

  it('should reset after success', () => {
    cb.recordFailure();
    cb.recordFailure();
    cb.recordSuccess();

    expect(cb.getState().failures).toBe(0);
    expect(cb.isOpen()).toBe(false);
  });

  it('should transition to half-open after reset timeout', async () => {
    cb = new CircuitBreaker(1, 50);
    cb.recordFailure();
    expect(cb.isOpen()).toBe(true);

    await new Promise((resolve) => setTimeout(resolve, 60));
    expect(cb.isOpen()).toBe(false);
  });

  it('should reset state when reset() is called', () => {
    cb.recordFailure();
    cb.recordFailure();
    cb.recordFailure();
    expect(cb.isOpen()).toBe(true);

    cb.reset();
    expect(cb.isOpen()).toBe(false);
    expect(cb.getState().failures).toBe(0);
  });
});
