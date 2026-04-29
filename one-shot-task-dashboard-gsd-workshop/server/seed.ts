import path from 'path';
import { fileURLToPath } from 'url';
import { Database } from './db/database.js';
import { v4 as uuidv4 } from 'uuid';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database(path.join(__dirname, '..', 'data', 'osint.db'));

db.createCollector({
  id: uuidv4(),
  type: 'rss',
  name: 'Hacker News',
  enabled: true,
  interval_seconds: 300,
  config: { urls: ['https://hnrss.org/newest?points=50'] },
});

db.createCollector({
  id: uuidv4(),
  type: 'reddit',
  name: 'Reddit Security',
  enabled: true,
  interval_seconds: 120,
  config: { subreddits: ['netsec', 'cybersecurity'] },
});

db.createCollector({
  id: uuidv4(),
  type: 'cve',
  name: 'NVD CVE Feed',
  enabled: true,
  interval_seconds: 600,
  config: {},
});

db.createWatchlist({
  id: uuidv4(),
  name: 'Critical Threats',
  keywords: ['ransomware', 'zero-day', 'critical', 'exploit', 'breach'],
  sources: ['all'],
  severity_override: 'high',
  active: true,
});

db.createWatchlist({
  id: uuidv4(),
  name: 'Supply Chain',
  keywords: ['supply chain', 'dependency', 'npm', 'pypi', 'package'],
  sources: ['all'],
  severity_override: 'medium',
  active: true,
});

const now = new Date();
const sampleItems = [
  { source_type: 'news' as const, source_name: 'Hacker News', title: 'Critical OpenSSL Vulnerability Discovered', content: 'A new critical vulnerability has been found in OpenSSL affecting versions 3.0.x, allowing remote code execution through crafted certificates.', severity: 'critical' as const, tags: ['critical', 'exploit'], sentiment: -0.6 },
  { source_type: 'social' as const, source_name: 'Reddit Security', title: 'PSA: New ransomware strain targeting healthcare', content: 'Multiple hospitals reporting a new ransomware variant that exploits unpatched VPN appliances. Patch immediately.', severity: 'high' as const, tags: ['ransomware'], sentiment: -0.8 },
  { source_type: 'technical' as const, source_name: 'NVD CVE Feed', title: 'CVE-2026-1234', content: 'Buffer overflow in libxml2 before 2.12.0 allows remote attackers to execute arbitrary code via crafted XML input.', severity: 'high' as const, tags: ['exploit', 'critical'], sentiment: -0.4 },
  { source_type: 'news' as const, source_name: 'Hacker News', title: 'Show HN: Open-source SIEM alternative', content: 'We built an open-source security information and event management tool that scales to 100k events per second.', severity: 'info' as const, tags: [], sentiment: 0.5 },
  { source_type: 'social' as const, source_name: 'Reddit Security', title: 'npm supply chain attack discovered in popular package', content: 'A popular npm package with 2M weekly downloads was found to contain a supply chain backdoor. The package has been removed.', severity: 'medium' as const, tags: ['supply chain', 'npm'], sentiment: -0.7 },
  { source_type: 'technical' as const, source_name: 'NVD CVE Feed', title: 'CVE-2026-5678', content: 'Cross-site scripting vulnerability in WordPress plugin Contact Form 7 allows injection of arbitrary web script.', severity: 'medium' as const, tags: [], sentiment: -0.3 },
  { source_type: 'news' as const, source_name: 'Hacker News', title: 'CISA warns of active exploitation of Cisco IOS vulnerability', content: 'CISA has added a Cisco IOS vulnerability to its Known Exploited Vulnerabilities catalog after confirmed active exploitation.', severity: 'high' as const, tags: ['exploit', 'critical'], sentiment: -0.5 },
  { source_type: 'social' as const, source_name: 'Reddit Security', title: 'Free CTF platform for learning web security', content: 'Just launched a free capture-the-flag platform focused on modern web application security. Great for beginners.', severity: 'info' as const, tags: [], sentiment: 0.7 },
];

for (let i = 0; i < sampleItems.length; i++) {
  const item = sampleItems[i];
  const offset = (sampleItems.length - i) * 15 * 60 * 1000;
  db.insertItem({
    id: uuidv4(),
    ...item,
    url: `https://example.com/item-${i}`,
    author: null,
    published_at: new Date(now.getTime() - offset).toISOString(),
    collected_at: new Date(now.getTime() - offset + 5000).toISOString(),
    geo: null,
    raw_data: '{}',
  });
}

db.close();
console.log('Seed data inserted: 3 collectors, 2 watchlists, 8 sample items');
