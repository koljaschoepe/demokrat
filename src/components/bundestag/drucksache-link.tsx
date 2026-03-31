'use client';

import { FileText, ExternalLink } from 'lucide-react';

interface DrucksacheLinkProps {
  dokumentnummer: string | null;
  pdfUrl: string | null;
  datum: string | null;
}

export function DrucksacheLink({
  dokumentnummer,
  pdfUrl,
  datum,
}: DrucksacheLinkProps) {
  if (!dokumentnummer || !pdfUrl) return null;

  return (
    <a
      href={pdfUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3 transition-colors hover:bg-muted/60"
    >
      <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
        <FileText className="size-5" />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate text-sm font-medium">
          Drucksache {dokumentnummer}
        </span>
        <span className="text-xs text-muted-foreground">
          {datum
            ? `Vom ${new Date(datum).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}`
            : 'Original-Dokument'}
        </span>
      </div>

      <ExternalLink className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
    </a>
  );
}
