export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-bold">Offline</h1>
      <p className="text-muted-foreground">
        Du bist gerade nicht mit dem Internet verbunden. Bitte pruefe deine
        Verbindung und versuche es erneut.
      </p>
    </div>
  );
}
