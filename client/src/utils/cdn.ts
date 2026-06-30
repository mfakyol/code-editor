export type CdnLib = {
  name: string
  latest: string
  version?: string
}

type CdnResponse = {
  results?: { name: string; latest: string; version?: string }[]
}

// Search the cdnjs library catalog. `latest` is a ready-to-use file URL.
export async function searchCdn(query: string): Promise<CdnLib[]> {
  const url = `https://api.cdnjs.com/libraries?search=${encodeURIComponent(
    query,
  )}&limit=12&fields=latest,version`
  const res = await fetch(url)
  if (!res.ok) throw new Error('CDN araması başarısız')
  const data = (await res.json()) as CdnResponse
  return (data.results ?? [])
    .filter((r) => Boolean(r.latest))
    .map((r) => ({ name: r.name, latest: r.latest, version: r.version }))
}
