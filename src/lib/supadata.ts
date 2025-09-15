import axios from 'axios'
import { extractVideoId } from './youtube'

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

  const apiKey = import.meta.env.VITE_SUPADATA_API_KEY
  if (!apiKey) {
    throw new Error('VITE_SUPADATA_API_KEY is not set')
  }

  const search = new URLSearchParams()
  search.set('url', url)
  search.set('lang', lang)
  search.set('text', String(text))
  search.set('mode', mode)

  const { data } = await axios.get<TranscriptResponse>(`${BASE_URL}?${search.toString()}`, {
    headers: {
      'x-api-key': apiKey,
    },
  })
  return data
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
  const id = extractVideoId(url)
  if (!id) return null

  const apiKey = import.meta.env.VITE_SUPADATA_API_KEY
  if (!apiKey) throw new Error('VITE_SUPADATA_API_KEY is not set')

  const apiUrl = 'https://api.supadata.ai/v1/youtube/video'
  const { data } = await axios.get(apiUrl, {
    params: { id },
    headers: { 'x-api-key': apiKey },
  })

  if (!data) return null
  return {
    title: data.title || '',
    description: data.description || '',
    channelTitle: data.channel?.name || '',
    publishedAt: data.uploadDate || '',
    duration: data.duration || '',
    viewCount: data.viewCount || 0,
    likeCount: data.likeCount || 0,
    thumbnail: data.thumbnail || '',
  }
}




