import Link from 'next/link';
import { MapPin, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function WahlkreisContribution() {
  const percentage = 15;
  const progressWidth = 100 - percentage; // Top 15% = 85% of the bar filled

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="size-4 text-primary" />
          Dein Beitrag zu Wahlkreis 42
        </CardTitle>
        <CardDescription>Berlin-Mitte</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Dein Rang</span>
            <span className="font-medium">Top {percentage}%</span>
          </div>
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                'h-full rounded-full bg-primary transition-[width] duration-500',
                'motion-reduce:transition-none',
              )}
              style={{ width: `${progressWidth}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Du bist unter den Top {percentage}% der aktivsten Bürger
          </p>
        </div>

        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground">42</strong> von{' '}
          <strong className="text-foreground">156</strong> Bürgern in deinem
          Wahlkreis sind aktiv
        </p>

        <Button
          variant="outline"
          size="sm"
          className="w-fit"
          render={<Link href="/map" />}
        >
          Auf der Karte ansehen
          <ArrowRight className="size-3.5" />
        </Button>
      </CardContent>
    </Card>
  );
}
