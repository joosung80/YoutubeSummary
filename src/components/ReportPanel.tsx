import { useMemo, useState, useEffect } from 'react'
import { Check, Loader2, Wand2 } from 'lucide-react'
import { generateReport, type LLMResult } from '../lib/llm'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Button } from './ui/button'

type Mode = 'general' | 'scqa' | 'full'

const modeOptions: { value: Mode; label: string }[] = [
  { value: 'general', label: 'General Summary' },
  { value: 'scqa', label: 'SCQA Summary' },
  { value: 'full', label: 'Full Report' },
]

export function ReportPanel({ initialInput }: { initialInput?: string }) {
  const [mode, setMode] = useState<Mode>('general')
  const [input, setInput] = useState('')
  const [report, setReport] = useState('')
  const [llmMeta, setLlmMeta] = useState<LLMResult['meta'] | undefined>(undefined)
  const [preview, setPreview] = useState<'markdown' | 'text'>('markdown')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (typeof initialInput !== 'string') return
    setInput(initialInput || '')
    if (initialInput === '') {
      // Reset report view completely on new URL extract start
      setReport('')
      setLlmMeta(undefined)
      setPreview('markdown')
      return
    }
    // auto copy transcript when it arrives
    navigator.clipboard.writeText(initialInput).catch(() => {})
  }, [initialInput])

  const placeholder = useMemo(
    () => '좌측 자막을 붙여넣거나 입력 후 리포트를 생성하세요.',
    [],
  )

  const onGenerate = async () => {
    setError(null)
    setLoading(true)
    try {
      const res = await generateReport({ transcript: input, mode })
      setReport(res.text)
      setLlmMeta(res.meta)
    } catch (e: any) {
      setError(e?.message || 'Failed to generate report')
    } finally {
      setLoading(false)
    }
  }

  const onCopy = async () => {
    if (!report) return
    await navigator.clipboard.writeText(report)
    setCopied(true)
    setTimeout(() => setCopied(false), 1200)
  }

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">리포트</h2>
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setPreview('markdown')}
            className={`rounded border px-2 py-1 ${preview === 'markdown' ? 'bg-indigo-50 border-indigo-300 text-indigo-700' : 'border-neutral-300'}`}
          >
            Preview
          </button>
          <button
            onClick={() => setPreview('text')}
            className={`rounded border px-2 py-1 ${preview === 'text' ? 'bg-indigo-50 border-indigo-300 text-indigo-700' : 'border-neutral-300'}`}
          >
            Text
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value as Mode)}
          className="rounded-md border bg-white px-2 py-1.5 text-sm dark:border-neutral-700 dark:bg-neutral-900"
        >
          {modeOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <div className="ml-auto" />
        <Button
          type="button"
          onClick={() => setInput('')}
          size="sm"
          variant="ghost"
        >
          CLEAR
        </Button>
        <Button onClick={onGenerate} disabled={loading || !input} variant="primary">
          {loading ? <Loader2 className="size-4 animate-spin" /> : <Wand2 className="size-4" />}
          리포트
        </Button>
      </div>

      {error && (
        <div className="rounded-md border border-red-300 bg-red-50 p-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
          {error}
        </div>
      )}

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={placeholder}
        className="min-h-28 rounded-md border bg-white p-3 text-sm leading-relaxed dark:border-neutral-700 dark:bg-neutral-900 overflow-y-auto"
        style={{ maxHeight: 'calc(60 * 1.25em)' }}
      />

      {preview === 'text' ? (
        <textarea
          value={report}
          onChange={(e) => setReport(e.target.value)}
          placeholder="여기에 결과 리포트가 표시됩니다."
          className="min-h-64 flex-1 rounded-md border bg-white p-3 text-sm leading-relaxed dark:border-neutral-700 dark:bg-neutral-900 overflow-y-auto"
          style={{ maxHeight: 'calc(60 * 1.25em)' }}
        />
      ) : (
        <div className="markdown-body min-h-64 whitespace-pre-wrap rounded-md border bg-white p-4 text-sm leading-tight dark:border-neutral-700 dark:bg-neutral-900 overflow-y-auto" style={{ maxHeight: 'calc(60 * 1.25em)' }}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{report || '미리보기 없음'}</ReactMarkdown>
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-neutral-500">
        <span>
          📝 {report.length.toLocaleString()}자
          {llmMeta ? (
            <>
              {' '}· ⏱ {(llmMeta.latencyMs / 1000).toFixed(1)}s
              {llmMeta.tokens ? (
                <> · 🔤 in {llmMeta.tokens.input ?? '-'} / out {llmMeta.tokens.output ?? '-'} / total {llmMeta.tokens.total ?? '-'} </>
              ) : null}
            </>
          ) : null}
        </span>
        <Button onClick={onCopy} disabled={!report} size="sm" variant="secondary">
          {copied ? <Check className="size-4" /> : null}
          {copied ? '복사됨' : '복사'}
        </Button>
      </div>
    </section>
  )
}


