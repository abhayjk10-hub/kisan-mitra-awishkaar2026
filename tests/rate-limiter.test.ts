import { describe, it, expect } from 'vitest';
import { checkRateLimit } from '@/lib/rate-limiter';

describe('Rate Limiter (H13)', () => {
  it('allows requests within limit and rejects when threshold exceeded', () => {
    const key = `test_ip_${Date.now()}`;
    const limit = 3;
    const windowSeconds = 60;

    // Request 1: Allowed
    const res1 = checkRateLimit(key, limit, windowSeconds);
    expect(res1.allowed).toBe(true);
    expect(res1.remaining).toBe(2);

    // Request 2: Allowed
    const res2 = checkRateLimit(key, limit, windowSeconds);
    expect(res2.allowed).toBe(true);
    expect(res2.remaining).toBe(1);

    // Request 3: Allowed (last allowed)
    const res3 = checkRateLimit(key, limit, windowSeconds);
    expect(res3.allowed).toBe(true);
    expect(res3.remaining).toBe(0);

    // Request 4: Rejected
    const res4 = checkRateLimit(key, limit, windowSeconds);
    expect(res4.allowed).toBe(false);
    expect(res4.remaining).toBe(0);
    expect(res4.resetSeconds).toBeGreaterThan(0);
  });
});

