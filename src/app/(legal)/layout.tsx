export default function LegalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="prose mx-auto max-w-3xl px-4 py-8">{children}</div>
  )
}
