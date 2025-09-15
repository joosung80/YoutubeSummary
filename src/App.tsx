import { useMemo, useState } from 'react'
import './App.css'
import { TranscriptPanel } from './components/TranscriptPanel'
import { ReportPanel } from './components/ReportPanel'
import { Youtube } from 'lucide-react'

function App() {
  const [transcriptForReport, setTranscriptForReport] = useState('')
  const [, setCurrentUrl] = useState('')

  const title = useMemo(() => 'YouTube Summary', [])

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

      <main className="mx-auto grid max-w-5xl grid-cols-1 gap-6 px-4 py-6 md:grid-cols-2">
        <TranscriptPanel
          onTranscript={(t) => setTranscriptForReport(t)}
          onUrlChange={(u) => setCurrentUrl(u)}
          onExtractStart={() => {
            setTranscriptForReport('')
          }}
        />
        <ReportPanel initialInput={transcriptForReport} />
      </main>

      <footer className="border-t py-6 text-center text-xs text-neutral-500 dark:text-neutral-400">
        Built for quick video understanding.
      </footer>
    </div>
  )
}

export default App
