import { Shield, Smartphone, Map } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const props = [
  {
    icon: Shield,
    title: 'Transparent & Sicher',
    description:
      'Deine Stimme ist durch kryptographische Hash-Chains gesch\u00fctzt. Jede Abstimmung ist nachvollziehbar.',
  },
  {
    icon: Smartphone,
    title: 'T\u00e4glich 5 Minuten',
    description:
      'Die t\u00e4gliche Session h\u00e4lt dich in 5 Minuten \u00fcber aktuelle Themen auf dem Laufenden.',
  },
  {
    icon: Map,
    title: 'Dein Wahlkreis',
    description:
      'Sieh, wie dein Wahlkreis abstimmt und wie dein Abgeordneter im Bundestag votiert.',
  },
] as const;

export function ValueProps() {
  return (
    <section className="bg-muted/50 py-20">
      <div className="mx-auto max-w-5xl px-4">
        <h2 className="mb-12 text-center text-3xl font-bold tracking-tight text-foreground">
          Warum Demokrat?
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {props.map((prop) => (
            <Card key={prop.title} className="text-center">
              <CardContent className="flex flex-col items-center gap-4 pt-2">
                <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
                  <prop.icon className="size-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  {prop.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {prop.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
