export default async function MdbProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return (
    <div>
      <h1>MdB-Profil {id}</h1>
    </div>
  )
}
