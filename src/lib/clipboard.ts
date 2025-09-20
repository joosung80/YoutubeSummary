// Safe clipboard utilities

export async function safeClipboardWrite(text: string): Promise<boolean> {
  try {
    // Modern Clipboard API (requires HTTPS)
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text)
      console.log('✅ [Clipboard] 클립보드 복사 성공 (Clipboard API)')
      return true
    }

    // Fallback for older browsers or non-HTTPS
    try {
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      
      const successful = document.execCommand('copy')
      document.body.removeChild(textArea)
      
      if (successful) {
        console.log('✅ [Clipboard] 클립보드 복사 성공 (execCommand)')
        return true
      }
    } catch (execError) {
      console.warn('⚠️ [Clipboard] execCommand 실패:', execError)
    }

    console.warn('⚠️ [Clipboard] 클립보드 API를 사용할 수 없습니다')
    return false
  } catch (error) {
    console.error('❌ [Clipboard] 클립보드 복사 실패:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      hasClipboard: !!navigator.clipboard,
      hasWriteText: !!(navigator.clipboard && navigator.clipboard.writeText),
      isSecureContext: window.isSecureContext,
      protocol: window.location.protocol,
      timestamp: new Date().toISOString()
    })
    return false
  }
}

export function getClipboardStatus(): {
  isSupported: boolean
  method: 'clipboard-api' | 'execCommand' | 'none'
  isSecureContext: boolean
  protocol: string
} {
  let method: 'clipboard-api' | 'execCommand' | 'none' = 'none'
  let isSupported = false

  if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    method = 'clipboard-api'
    isSupported = true
  } else {
    // Check if execCommand is available (legacy support)
    method = 'execCommand'
    isSupported = true
  }

  return {
    isSupported,
    method,
    isSecureContext: window.isSecureContext,
    protocol: window.location.protocol
  }
}
