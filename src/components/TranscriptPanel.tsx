import { useState } from 'react'
import { Check, Loader2, Upload } from 'lucide-react'
import { fetchTranscript, fetchVideoMeta, type VideoMeta } from '../lib/supadata'
import { Button } from './ui/button'
import { extractVideoId } from '../lib/youtube'

export function TranscriptPanel({ onTranscript, onUrlChange, onExtractStart }: { onTranscript?: (text: string) => void; onUrlChange?: (url: string) => void; onExtractStart?: () => void }) {
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [transcript, setTranscript] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [metaLoading, setMetaLoading] = useState(false)
  const [videoMeta, setVideoMeta] = useState<VideoMeta | null>(null)
  const videoId = extractVideoId(youtubeUrl)

  const onExtract = async () => {
    setError(null)
    // clear whole sections immediately
    onExtractStart?.()
    setTranscript('')
    setVideoMeta(null)
    onTranscript?.('')
    setLoading(true)
    try {
      setMetaLoading(true)
      const [res, meta] = await Promise.all([
        fetchTranscript({ url: youtubeUrl }),
        fetchVideoMeta(youtubeUrl),
      ])
      const text = res.content || ''
      setTranscript(text)
      onTranscript?.(text)
      if (meta) setVideoMeta(meta)
    } catch (e: any) {
      setError(e?.message || 'Failed to fetch transcript')
    } finally {
      setLoading(false)
      setMetaLoading(false)
    }
  }

  const onCopy = async () => {
    if (!transcript) return
    const payload = {
      url: youtubeUrl,
      id: videoId,
      meta: videoMeta,
      transcript,
      lengths: {
        transcriptChars: transcript.length,
        descriptionChars: videoMeta?.description?.length || 0,
      },
    }
    await navigator.clipboard.writeText(JSON.stringify(payload, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 1200)
  }

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">자막 추출</h2>
      <div className="flex gap-2">
        <input
          value={youtubeUrl}
          onChange={(e) => {
            setYoutubeUrl(e.target.value)
            onUrlChange?.(e.target.value)
          }}
          placeholder="YouTube URL 입력"
          className="flex-1 rounded-md border bg-white px-3 py-2 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:border-neutral-700 dark:bg-neutral-900 dark:focus:ring-neutral-600"
        />
        <Button onClick={onExtract} disabled={loading || !youtubeUrl} variant="primary">
          {loading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
          자막추출
        </Button>
      </div>

      {/* Meta Section: header row (thumb + info), bottom merged description area */}
      <div className="rounded-lg border bg-white p-3 text-left dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex gap-3">
          {videoId ? (
            <img
              src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
              alt="thumbnail"
              className="h-32 w-56 rounded object-cover"
            />
          ) : null}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start gap-2">
              <span className="inline-flex max-w-full items-center gap-1 truncate rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs text-indigo-800 dark:border-indigo-900 dark:bg-neutral-800 dark:text-indigo-200">
                <span>🎬</span>
                <span className="truncate">{metaLoading && !videoMeta?.title ? '불러오는 중…' : videoMeta?.title || '제목 -'}</span>
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-fuchsia-200 bg-fuchsia-50 px-3 py-1 text-xs text-fuchsia-800 dark:border-fuchsia-900 dark:bg-neutral-800 dark:text-fuchsia-200">
                <span>📺</span>
                <span>{videoMeta?.channelTitle || '-'}</span>
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs text-emerald-800 dark:border-emerald-900 dark:bg-neutral-800 dark:text-emerald-200">
                <span>📅</span>
                <span>{videoMeta?.publishedAt ? new Date(videoMeta.publishedAt).toLocaleDateString() : '-'}</span>
              </span>
              {videoMeta?.duration ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs text-amber-800 dark:border-amber-900 dark:bg-neutral-800 dark:text-amber-200">
                  <span>⏱️</span>
                  <span>{videoMeta.duration}</span>
                </span>
              ) : null}
              {typeof videoMeta?.viewCount === 'number' ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs text-sky-800 dark:border-sky-900 dark:bg-neutral-800 dark:text-sky-200">
                  <span>👀</span>
                  <span>{Intl.NumberFormat().format(videoMeta.viewCount)} views</span>
                </span>
              ) : null}
              {typeof videoMeta?.likeCount === 'number' ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs text-rose-800 dark:border-rose-900 dark:bg-neutral-800 dark:text-rose-200">
                  <span>👍</span>
                  <span>{Intl.NumberFormat().format(videoMeta.likeCount)}</span>
                </span>
              ) : null}
            </div>
          </div>
        </div>
        {videoMeta?.description ? (
          <div className="mt-3 max-h-56 overflow-y-auto rounded-md border border-neutral-200 bg-neutral-50 p-2 text-xs leading-relaxed text-neutral-700 dark:border-neutral-700 dark:bg-neutral-800/60 dark:text-neutral-300">
            <span className="mr-1">📝</span>
            <span className="align-top">{videoMeta.description}</span>
          </div>
        ) : null}
      </div>
      {error && (
        <div className="rounded-md border border-red-300 bg-red-50 p-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
          {error}
        </div>
      )}
      <textarea
        value={transcript}
        onChange={(e) => setTranscript(e.target.value)}
        placeholder="추출된 자막이 여기 표시됩니다."
        className="min-h-64 flex-1 rounded-md border bg-white p-3 text-sm leading-relaxed dark:border-neutral-700 dark:bg-neutral-900 overflow-y-auto"
        style={{ maxHeight: 'calc(50 * 1.25em)' }}
      />
      <div className="flex items-center justify-between text-xs text-neutral-500">
        <span>자막 길이: {transcript.length.toLocaleString()}자</span>
      </div>
      <div className="flex justify-end">
        <Button onClick={onCopy} disabled={!transcript} size="sm" variant="secondary">
          {copied ? <Check className="size-4" /> : null}
          {copied ? '복사됨' : '복사(JSON)'}
        </Button>
      </div>
    </section>
  )
}


