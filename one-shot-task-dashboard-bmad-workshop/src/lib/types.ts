export interface IntelItem {
  id: string;
  source_type: 'news' | 'social' | 'technical' | 'custom';
  source_name: string;
  title: string;
  content: string;
  url: string;
  author: string | null;
  published_at: string;
  collected_at: string;
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical';
  sentiment: number;
  tags: string[];
  geo: { lat: number; lng: number } | null;
  raw_data: string;
}

export interface Watchlist {
  id: string;
  name: string;
  keywords: string[];
  sources: string[];
  severity_override: string | null;
  active: boolean;
}

export interface CollectorConfig {
  id: string;
  type: 'rss' | 'twitter' | 'reddit' | 'cve' | 'webhook';
  name: string;
  enabled: boolean;
  interval_seconds: number;
  config: Record<string, unknown>;
}

export interface DashboardStats {
  total_items: number;
  items_last_24h: number;
  severity_counts: Record<string, number>;
  source_counts: Record<string, number>;
  trending_keywords: { keyword: string; count: number }[];
  hourly_activity: { hour: number; day: number; count: number }[];
}

export type SourceType = IntelItem['source_type'];
export type Severity = IntelItem['severity'];
