import { useMemo, useState, useEffect } from 'react'
import './App.css'
import { TranscriptPanel } from './components/TranscriptPanel'
import { ReportPanel } from './components/ReportPanel'
import { ConfigStatus } from './components/ConfigStatus'
import { DebugPanel } from './components/DebugPanel'
import { Youtube } from 'lucide-react'
import { logDebugInfo, setupNetworkMonitoring, reportError } from './lib/debug'

function App() {
  const [transcriptForReport, setTranscriptForReport] = useState('')
  const [, setCurrentUrl] = useState('')

  const title = useMemo(() => 'YouTube Summary', [])

  useEffect(() => {
    // 시스템 디버그 정보 로깅
    logDebugInfo()
    
    // 네트워크 모니터링 설정
    setupNetworkMonitoring()

    // 전역 에러 핸들러 추가
    const handleError = (event: ErrorEvent) => {
      reportError(event.error, '전역 JavaScript 에러', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      })
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      reportError(event.reason, '처리되지 않은 Promise 거부', {
        promise: event.promise
      })
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])

  return (
    <div className="min-h-dvh bg-neutral-50 text-neutral-900 antialiased dark:bg-neutral-950 dark:text-neutral-100">
      <header className="sticky top-0 z-10 border-b bg-gradient-to-r from-indigo-50 via-white to-purple-50 backdrop-blur dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-900">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-2 font-semibold">
            <Youtube className="size-5 text-red-500" />
            <span>{title}</span>
          </div>
          <div />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        <ConfigStatus />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <TranscriptPanel
            onTranscript={(t) => setTranscriptForReport(t)}
            onUrlChange={(u) => setCurrentUrl(u)}
            onExtractStart={() => {
              setTranscriptForReport('')
            }}
          />
          <ReportPanel initialInput={transcriptForReport} />
        </div>
      </main>

      <footer className="border-t py-6 text-center text-xs text-neutral-500 dark:text-neutral-400">
        Built for quick video understanding.
      </footer>

      <DebugPanel />
    </div>
  )
}

export default App
