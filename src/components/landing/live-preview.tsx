import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const mockTopics = [
  {
    source: 'BUNDESTAG' as const,
    title: 'Cannabisgesetz \u2014 \u00c4nderungsantrag',
    votes: '1.247 Stimmen',
    progress: 62,
  },
  {
    source: 'B\u00dcRGER' as const,
    title: 'Tempolimit auf Autobahnen',
    votes: '3.891 Stimmen',
    progress: 78,
  },
] as const;

export function LivePreview() {
  return (
    <section className="bg-background py-20">
      <div className="mx-auto max-w-5xl px-4">
        <h2 className="mb-12 text-center text-3xl font-bold tracking-tight text-foreground">
          Was gerade diskutiert wird
        </h2>
        <div className="mx-auto grid max-w-2xl gap-4">
          {mockTopics.map((topic) => (
            <Card key={topic.title} className="rounded-xl ring-1 ring-foreground/10">
              <CardContent className="flex flex-col gap-3">
                <Badge
                  variant={topic.source === 'BUNDESTAG' ? 'secondary' : 'default'}
                >
                  {topic.source}
                </Badge>
                <p className="text-base font-semibold text-foreground">
                  {topic.title}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {topic.votes}
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${topic.progress}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
