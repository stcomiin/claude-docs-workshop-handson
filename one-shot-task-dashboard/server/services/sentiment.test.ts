import { describe, it, expect } from 'vitest';
import { analyzeSentiment } from './sentiment.js';

describe('analyzeSentiment', () => {
  it('returns positive score for positive text', () => {
    const score = analyzeSentiment('This is a wonderful amazing great product');
    expect(score).toBeGreaterThan(0);
  });

  it('returns negative score for negative text', () => {
    const score = analyzeSentiment('This is a terrible awful horrible disaster');
    expect(score).toBeLessThan(0);
  });

  it('returns 0 for neutral text', () => {
    const score = analyzeSentiment('The server processed the request at noon');
    expect(score).toBe(0);
  });

  it('clamps score to [-1, 1]', () => {
    const score = analyzeSentiment('great great great great great great great great great great');
    expect(score).toBeLessThanOrEqual(1);
    expect(score).toBeGreaterThanOrEqual(-1);
  });

  it('handles empty string', () => {
    const score = analyzeSentiment('');
    expect(score).toBe(0);
  });
});
