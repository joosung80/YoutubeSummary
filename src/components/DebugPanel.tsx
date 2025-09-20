import { useState, useEffect } from 'react'
import { Bug, ChevronDown, Copy, Check } from 'lucide-react'
import { getDebugInfo, createDebugReport, type DebugInfo } from '../lib/debug'
import { Button } from './ui/button'
import { safeClipboardWrite, getClipboardStatus } from '../lib/clipboard'

export function DebugPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setDebugInfo(getDebugInfo())
    }
  }, [isOpen])

  const handleCopyDebugInfo = async () => {
    if (!debugInfo) return
    
    const report = createDebugReport(null, '사용자 요청 디버그 정보')
    console.log('📋 [DebugPanel] 디버그 정보 복사 시도')
    
    const success = await safeClipboardWrite(report)
    if (success) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } else {
      console.error('❌ [DebugPanel] 클립보드 복사 실패')
      alert('클립보드 복사에 실패했습니다. 브라우저가 HTTPS를 요구하거나 클립보드 권한이 없을 수 있습니다.')
    }
  }

  const handleRefresh = () => {
    setDebugInfo(getDebugInfo())
  }

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          variant="secondary"
          className="rounded-full p-3 shadow-lg"
          title="디버그 정보 보기"
        >
          <Bug className="size-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-h-96 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-xl overflow-hidden">
      <div className="flex items-center justify-between p-3 border-b border-neutral-200 dark:border-neutral-700">
        <div className="flex items-center gap-2">
          <Bug className="size-4 text-blue-500" />
          <span className="font-medium text-sm">디버그 정보</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            onClick={handleRefresh}
            variant="ghost"
            size="sm"
            className="p-1 h-auto"
            title="새로고침"
          >
            🔄
          </Button>
          <Button
            onClick={handleCopyDebugInfo}
            variant="ghost"
            size="sm"
            className="p-1 h-auto"
            title="디버그 정보 복사"
          >
            {copied ? <Check className="size-3 text-green-500" /> : <Copy className="size-3" />}
          </Button>
          <Button
            onClick={() => setIsOpen(false)}
            variant="ghost"
            size="sm"
            className="p-1 h-auto"
          >
            <ChevronDown className="size-4" />
          </Button>
        </div>
      </div>

      <div className="p-3 overflow-y-auto max-h-80 text-xs space-y-3">
        {debugInfo && (
          <>
            <div>
              <h4 className="font-medium text-neutral-700 dark:text-neutral-300 mb-1">환경 정보</h4>
              <div className="bg-neutral-50 dark:bg-neutral-800 p-2 rounded text-xs">
                <div>환경: {debugInfo.env}</div>
                <div>URL: {debugInfo.url}</div>
                <div>온라인: {navigator.onLine ? '✅' : '❌'}</div>
                <div>시간: {new Date(debugInfo.timestamp).toLocaleString()}</div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-neutral-700 dark:text-neutral-300 mb-1">API 키 상태</h4>
              <div className="bg-neutral-50 dark:bg-neutral-800 p-2 rounded text-xs">
                <div className="flex items-center gap-2">
                  <span>Gemini:</span>
                  {debugInfo.apiKeysStatus.hasGemini ? (
                    <span className="text-green-600">✅ 설정됨 ({debugInfo.apiKeysStatus.geminiKeyLength}자)</span>
                  ) : (
                    <span className="text-red-600">❌ 누락</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span>Supadata:</span>
                  {debugInfo.apiKeysStatus.hasSupadata ? (
                    <span className="text-green-600">✅ 설정됨 ({debugInfo.apiKeysStatus.supadataKeyLength}자)</span>
                  ) : (
                    <span className="text-red-600">❌ 누락</span>
                  )}
                </div>
              </div>
            </div>

            {debugInfo.networkInfo?.connection && (
              <div>
                <h4 className="font-medium text-neutral-700 dark:text-neutral-300 mb-1">네트워크 정보</h4>
                <div className="bg-neutral-50 dark:bg-neutral-800 p-2 rounded text-xs">
                  <div>연결 타입: {debugInfo.networkInfo.connection.effectiveType || 'N/A'}</div>
                  <div>다운링크: {debugInfo.networkInfo.connection.downlink || 'N/A'} Mbps</div>
                  <div>RTT: {debugInfo.networkInfo.connection.rtt || 'N/A'} ms</div>
                  <div>데이터 절약: {debugInfo.networkInfo.connection.saveData ? '✅' : '❌'}</div>
                </div>
              </div>
            )}

            <div>
              <h4 className="font-medium text-neutral-700 dark:text-neutral-300 mb-1">클립보드 지원</h4>
              <div className="bg-neutral-50 dark:bg-neutral-800 p-2 rounded text-xs">
                {(() => {
                  const clipboardStatus = getClipboardStatus()
                  return (
                    <>
                      <div>지원 여부: {clipboardStatus.isSupported ? '✅' : '❌'}</div>
                      <div>방식: {clipboardStatus.method}</div>
                      <div>보안 컨텍스트: {clipboardStatus.isSecureContext ? '✅' : '❌'}</div>
                      <div>프로토콜: {clipboardStatus.protocol}</div>
                    </>
                  )
                })()}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-neutral-700 dark:text-neutral-300 mb-1">브라우저 정보</h4>
              <div className="bg-neutral-50 dark:bg-neutral-800 p-2 rounded text-xs break-all">
                {debugInfo.userAgent}
              </div>
            </div>

            <div className="text-xs text-neutral-500 dark:text-neutral-400">
              💡 문제가 발생하면 '복사' 버튼을 눌러 이 정보를 개발자에게 전달해주세요.
            </div>
          </>
        )}
      </div>
    </div>
  )
}
