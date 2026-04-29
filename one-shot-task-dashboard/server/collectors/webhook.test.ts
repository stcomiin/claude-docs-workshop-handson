import { describe, it, expect } from 'vitest';
import { normalizeWebhookPayload } from './webhook.js';

describe('normalizeWebhookPayload', () => {
  it('normalizes a valid webhook payload', () => {
    const payload = {
      title: 'External Alert',
      content: 'Suspicious traffic detected.',
      url: 'https://external-tool.com/alert/1',
      severity: 'high',
      source_name: 'custom-scanner',
    };
    const item = normalizeWebhookPayload(payload);
    expect(item.source_type).toBe('custom');
    expect(item.title).toBe('External Alert');
    expect(item.severity).toBe('high');
  });

  it('defaults severity to info when not provided', () => {
    const item = normalizeWebhookPayload({ title: 'Test' });
    expect(item.severity).toBe('info');
  });

  it('defaults source_name to webhook', () => {
    const item = normalizeWebhookPayload({ title: 'Test' });
    expect(item.source_name).toBe('webhook');
  });
});
