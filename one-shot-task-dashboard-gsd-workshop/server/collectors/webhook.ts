import { v4 as uuidv4 } from 'uuid';
import type { IntelItem, Severity } from '../../src/lib/types.js';

const VALID_SEVERITIES = new Set(['info', 'low', 'medium', 'high', 'critical']);

export function normalizeWebhookPayload(payload: Record<string, any>): IntelItem {
  const severity = VALID_SEVERITIES.has(payload.severity) ? payload.severity as Severity : 'info';
  return {
    id: uuidv4(),
    source_type: 'custom',
    source_name: payload.source_name || 'webhook',
    title: payload.title || 'Untitled',
    content: payload.content || '',
    url: payload.url || '',
    author: payload.author || null,
    published_at: payload.published_at || new Date().toISOString(),
    collected_at: new Date().toISOString(),
    severity,
    sentiment: 0,
    tags: [],
    geo: payload.geo || null,
    raw_data: JSON.stringify(payload),
  };
}
