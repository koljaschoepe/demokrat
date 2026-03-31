import { Vote, BarChart3, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

const steps = [
  {
    number: 1,
    icon: Vote,
    title: 'Abstimmen',
    description:
      'Stimme zu aktuellen Bundestagsthemen ab \u2014 Ja, Nein oder Enthaltung.',
  },
  {
    number: 2,
    icon: BarChart3,
    title: 'Vergleichen',
    description:
      'Sieh, wie deine Stimme im Vergleich zum Bundestag steht.',
  },
  {
    number: 3,
    icon: Users,
    title: 'Mitgestalten',
    description:
      'Erstelle eigene Themen und diskutiere mit anderen B\u00fcrgern.',
  },
] as const;

export function HowItWorks() {
  return (
    <section id="so-funktionierts" className="bg-background py-20">
      <div className="mx-auto max-w-5xl px-4">
        <h2 className="mb-12 text-center text-3xl font-bold tracking-tight text-foreground">
          So funktioniert&apos;s
        </h2>
        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((step) => (
            <div key={step.number} className="flex flex-col items-center gap-4 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                {step.number}
              </div>
              <step.icon className="size-8 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">
                {step.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
