export type YouTubeMeta = {
  id: string
  title?: string
  channelTitle?: string
  publishedAt?: string
  url: string
}

export function extractVideoId(url: string): string | null {
  console.log('🔍 [YouTube] 비디오 ID 추출 시도:', {
    url,
    urlLength: url?.length || 0,
    timestamp: new Date().toISOString()
  })

  try {
    const u = new URL(url)
    console.log('📝 [YouTube] URL 파싱 성공:', {
      hostname: u.hostname,
      pathname: u.pathname,
      search: u.search,
      searchParams: Object.fromEntries(u.searchParams.entries())
    })

    if (u.hostname.includes('youtube.com')) {
      const videoId = u.searchParams.get('v')
      console.log('🎬 [YouTube] YouTube.com 형식 감지:', {
        videoId,
        hasVideoParam: !!videoId
      })
      return videoId
    }
    
    if (u.hostname === 'youtu.be') {
      const videoId = u.pathname.replace('/', '') || null
      console.log('🎬 [YouTube] youtu.be 형식 감지:', {
        pathname: u.pathname,
        videoId,
        hasVideoId: !!videoId
      })
      return videoId
    }
    
    console.warn('⚠️ [YouTube] 지원하지 않는 YouTube URL 형식:', {
      hostname: u.hostname,
      url
    })
    return null
  } catch (error) {
    console.error('❌ [YouTube] URL 파싱 실패:', {
      url,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    })
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




