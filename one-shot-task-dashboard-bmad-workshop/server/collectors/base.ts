import type { IntelItem } from '../../src/lib/types.js';

export interface Collector {
  id: string;
  type: string;
  collect(): Promise<IntelItem[]>;
}

export interface CollectorConstructorOpts {
  id: string;
  name: string;
  config: Record<string, unknown>;
}
