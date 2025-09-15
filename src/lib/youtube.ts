export type YouTubeMeta = {
  id: string
  title?: string
  channelTitle?: string
  publishedAt?: string
  url: string
}

export function extractVideoId(url: string): string | null {
  try {
    const u = new URL(url)
    if (u.hostname.includes('youtube.com')) {
      return u.searchParams.get('v')
    }
    if (u.hostname === 'youtu.be') {
      return u.pathname.replace('/', '') || null
    }
    return null
  } catch {
    return null
  }
}

// Minimal metadata using oEmbed (no API key)
export async function fetchYouTubeMeta(url: string): Promise<YouTubeMeta | null> {
  const id = extractVideoId(url)
  if (!id) return null
  try {
    const oembed = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`
    const res = await fetch(oembed)
    if (!res.ok) return { id, url }
    const data = await res.json()
    return {
      id,
      url,
      title: data.title,
      channelTitle: data.author_name,
    }
  } catch {
    return { id, url }
  }
}




