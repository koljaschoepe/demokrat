import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-grid*4">
        <h1 className="text-3xl font-bold tracking-tight">Demokrat</h1>
        <p className="text-muted-foreground">
          Digitale Demokratie-Plattform
        </p>
        <div className="flex gap-grid*2">
          <Button>Indigo Button</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="secondary">Secondary</Button>
        </div>
      </div>
    </div>
  );
}
