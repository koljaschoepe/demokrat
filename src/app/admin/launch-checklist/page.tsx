'use client';

import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

/**
 * Phase 199 -- Pre-Launch Checkliste.
 * Admin page showing launch readiness status across categories.
 */

interface CheckItem {
  id: string;
  label: string;
  category: string;
  status: 'pass' | 'fail' | 'warn' | 'unchecked';
  detail?: string;
}

const STATIC_CHECKS: CheckItem[] = [
  // Content
  {
    id: 'topics-50',
    label: '50+ Bundestag-Themen importiert',
    category: 'Content',
    status: 'unchecked',
  },
  {
    id: 'summaries',
    label: 'KI-Zusammenfassungen generiert',
    category: 'Content',
    status: 'unchecked',
  },
  {
    id: 'quiz',
    label: 'Quiz-Fragen vorhanden',
    category: 'Content',
    status: 'unchecked',
  },
  {
    id: 'mdb-data',
    label: 'MdB-Stammdaten vollständig',
    category: 'Content',
    status: 'unchecked',
  },
  // Technical
  {
    id: 'vote-types',
    label: 'Alle Vote-Typen funktional',
    category: 'Technik',
    status: 'unchecked',
  },
  {
    id: 'load-time',
    label: 'Ladezeit < 2 Sekunden',
    category: 'Technik',
    status: 'unchecked',
  },
  {
    id: 'lighthouse',
    label: 'Lighthouse Score > 90',
    category: 'Technik',
    status: 'unchecked',
  },
  {
    id: 'pwa',
    label: 'PWA installierbar',
    category: 'Technik',
    status: 'unchecked',
  },
  {
    id: 'offline',
    label: 'Offline-Fallback funktioniert',
    category: 'Technik',
    status: 'unchecked',
  },
  // Legal
  {
    id: 'wcag',
    label: 'WCAG 2.1 AA konform',
    category: 'Legal',
    status: 'unchecked',
  },
  {
    id: 'dsfa',
    label: 'DSFA dokumentiert',
    category: 'Legal',
    status: 'pass',
    detail: 'Phase 198',
  },
  {
    id: 'legal-pages',
    label: 'Impressum, Datenschutz, AGB online',
    category: 'Legal',
    status: 'pass',
    detail: 'Phase 175',
  },
  {
    id: 'cookie-banner',
    label: 'Cookie-Banner implementiert',
    category: 'Legal',
    status: 'pass',
    detail: 'Phase 176',
  },
  {
    id: 'art9-flow',
    label: 'Art. 9 Einwilligungs-Flow',
    category: 'Legal',
    status: 'pass',
    detail: 'Phase 177',
  },
  // Security
  {
    id: 'csp',
    label: 'CSP Headers konfiguriert',
    category: 'Sicherheit',
    status: 'unchecked',
  },
  {
    id: 'rate-limiting',
    label: 'Rate Limiting aktiv',
    category: 'Sicherheit',
    status: 'unchecked',
  },
  {
    id: 'rls',
    label: 'Row-Level Security auf allen Tabellen',
    category: 'Sicherheit',
    status: 'unchecked',
  },
  {
    id: 'pentest',
    label: 'Basis-Penetrationstest',
    category: 'Sicherheit',
    status: 'unchecked',
  },
  // Infrastructure
  {
    id: 'monitoring',
    label: 'Monitoring & Alerting aktiv',
    category: 'Infrastruktur',
    status: 'unchecked',
  },
  {
    id: 'backups',
    label: 'Datenbank-Backups konfiguriert',
    category: 'Infrastruktur',
    status: 'unchecked',
  },
  {
    id: 'ssl',
    label: 'SSL/TLS konfiguriert',
    category: 'Infrastruktur',
    status: 'unchecked',
  },
  {
    id: 'dns',
    label: 'DNS/Domain konfiguriert',
    category: 'Infrastruktur',
    status: 'unchecked',
  },
];

export default function LaunchChecklistPage() {
  const categories = [...new Set(STATIC_CHECKS.map((c) => c.category))];
  const passCount = STATIC_CHECKS.filter((c) => c.status === 'pass').length;
  const totalCount = STATIC_CHECKS.length;
  const readyPercent = Math.round((passCount / totalCount) * 100);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Pre-Launch Checkliste</h1>
        <Badge variant={readyPercent >= 80 ? 'default' : 'destructive'}>
          {passCount}/{totalCount} ({readyPercent}%)
        </Badge>
      </div>

      {categories.map((cat) => (
        <Card key={cat}>
          <CardHeader>
            <CardTitle className="text-lg">{cat}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {STATIC_CHECKS.filter((c) => c.category === cat).map((check) => (
                <div key={check.id} className="flex items-center gap-3">
                  <StatusIcon status={check.status} />
                  <span className="text-sm">{check.label}</span>
                  {check.detail && (
                    <span className="text-xs text-muted-foreground">
                      ({check.detail})
                    </span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case 'pass':
      return <CheckCircle className="size-4 shrink-0 text-emerald-500" />;
    case 'fail':
      return <XCircle className="size-4 shrink-0 text-red-500" />;
    case 'warn':
      return <AlertCircle className="size-4 shrink-0 text-amber-500" />;
    default:
      return (
        <div className="size-4 shrink-0 rounded-full border-2 border-muted-foreground/30" />
      );
  }
}
