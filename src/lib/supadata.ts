import axios from 'axios'
import { extractVideoId } from './youtube'
import { PerformanceTracker, reportError } from './debug'

export type TranscriptResponse = {
  lang?: string
  availableLangs?: string[]
  content?: string
}

const BASE_URL = 'https://api.supadata.ai/v1/transcript'

export async function fetchTranscript(params: {
  url: string
  lang?: string
  text?: boolean
  mode?: 'auto' | 'whisper' | 'caption'
}): Promise<TranscriptResponse> {
  const { url, lang = 'ko', text = true, mode = 'auto' } = params

  console.log('🎬 [Supadata] 자막 추출 시작:', {
    url,
    lang,
    text,
    mode,
    timestamp: new Date().toISOString()
  })

  const { configAsync } = await import('./config')
  const config = await configAsync()
  const apiKey = config.supadataApiKey

  console.log('🔑 [Supadata] API Key 상태:', {
    hasApiKey: !!apiKey,
    keyLength: apiKey?.length || 0,
    keyPrefix: apiKey?.substring(0, 8) + '...' || 'N/A'
  })

  const search = new URLSearchParams()
  search.set('url', url)
  search.set('lang', lang)
  search.set('text', String(text))
  search.set('mode', mode)

  const requestUrl = `${BASE_URL}?${search.toString()}`
  console.log('📡 [Supadata] 요청 URL:', requestUrl)

  try {
    const tracker = new PerformanceTracker('Supadata 자막 추출 API')
    const response = await axios.get<TranscriptResponse>(requestUrl, {
      headers: {
        'x-api-key': apiKey,
      },
    })
    
    const duration = tracker.end({
      status: response.status,
      contentLength: response.data.content?.length || 0,
      availableLangs: response.data.availableLangs,
      detectedLang: response.data.lang
    })

    console.log('✅ [Supadata] 자막 추출 성공:', {
      duration: `${duration.toFixed(2)}ms`,
      status: response.status,
      contentLength: response.data.content?.length || 0,
      availableLangs: response.data.availableLangs,
      detectedLang: response.data.lang
    })

    return response.data
  } catch (error) {
    reportError(error, 'Supadata 자막 추출', {
      url,
      lang,
      mode,
      requestUrl
    })

    if (axios.isAxiosError(error)) {
      console.error('📡 [Supadata] HTTP 에러 상세:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers
        }
      })
    }

    throw error
  }
}

export type VideoMeta = {
  title?: string
  description?: string
  channelTitle?: string
  publishedAt?: string
  duration?: string
  viewCount?: number
  likeCount?: number
  thumbnail?: string
}

export async function fetchVideoMeta(url: string): Promise<VideoMeta | null> {
  console.log('📺 [Supadata] 비디오 메타데이터 추출 시작:', {
    url,
    timestamp: new Date().toISOString()
  })

  const id = extractVideoId(url)
  if (!id) {
    console.error('❌ [Supadata] 유효하지 않은 YouTube URL:', url)
    return null
  }

  console.log('🆔 [Supadata] 추출된 비디오 ID:', id)

  const { configAsync } = await import('./config')
  const config = await configAsync()
  const apiKey = config.supadataApiKey

  console.log('🔑 [Supadata] 메타데이터 API Key 상태:', {
    hasApiKey: !!apiKey,
    keyLength: apiKey?.length || 0,
    keyPrefix: apiKey?.substring(0, 8) + '...' || 'N/A'
  })

  const apiUrl = 'https://api.supadata.ai/v1/youtube/video'
  console.log('📡 [Supadata] 메타데이터 요청 URL:', `${apiUrl}?id=${id}`)

  try {
    const tracker = new PerformanceTracker('Supadata 메타데이터 추출 API')
    const response = await axios.get(apiUrl, {
      params: { id },
      headers: { 'x-api-key': apiKey },
    })
    
    const duration = tracker.end({
      status: response.status,
      hasData: !!response.data,
      title: response.data?.title?.substring(0, 50) + '...' || 'N/A'
    })

    console.log('✅ [Supadata] 메타데이터 추출 성공:', {
      duration: `${duration.toFixed(2)}ms`,
      status: response.status,
      hasData: !!response.data,
      title: response.data?.title?.substring(0, 50) + '...' || 'N/A'
    })

    if (!response.data) {
      console.warn('⚠️ [Supadata] 메타데이터 응답이 비어있음')
      return null
    }

    const meta = {
      title: response.data.title || '',
      description: response.data.description || '',
      channelTitle: response.data.channel?.name || '',
      publishedAt: response.data.uploadDate || '',
      duration: response.data.duration || '',
      viewCount: response.data.viewCount || 0,
      likeCount: response.data.likeCount || 0,
      thumbnail: response.data.thumbnail || '',
    }

    console.log('📊 [Supadata] 파싱된 메타데이터:', {
      title: meta.title?.substring(0, 50) + '...' || 'N/A',
      channelTitle: meta.channelTitle,
      duration: meta.duration,
      viewCount: meta.viewCount,
      likeCount: meta.likeCount,
      hasThumbnail: !!meta.thumbnail,
      descriptionLength: meta.description?.length || 0
    })

    return meta
  } catch (error) {
    reportError(error, 'Supadata 메타데이터 추출', {
      url,
      id,
      apiUrl: `${apiUrl}?id=${id}`
    })

    if (axios.isAxiosError(error)) {
      console.error('📡 [Supadata] 메타데이터 HTTP 에러 상세:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          params: error.config?.params,
          headers: error.config?.headers
        }
      })
    }

    throw error
  }
}




