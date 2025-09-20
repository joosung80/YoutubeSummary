// Debug utilities for YouTube Summary App

export interface DebugInfo {
  timestamp: string
  userAgent: string
  url: string
  env: string
  apiKeysStatus: {
    hasGemini: boolean
    hasSupadata: boolean
    geminiKeyLength: number
    supadataKeyLength: number
  }
  networkInfo?: {
    connection?: any
    onLine: boolean
  }
}

export function getDebugInfo(): DebugInfo {
  const geminiKey = import.meta.env.VITE_GEMINI_API_KEY
  const supadataKey = import.meta.env.VITE_SUPADATA_API_KEY

  return {
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
    env: import.meta.env.MODE || 'unknown',
    apiKeysStatus: {
      hasGemini: !!geminiKey && geminiKey !== 'your_gemini_api_key_here',
      hasSupadata: !!supadataKey && supadataKey !== 'your_supadata_api_key_here',
      geminiKeyLength: geminiKey?.length || 0,
      supadataKeyLength: supadataKey?.length || 0
    },
    networkInfo: {
      connection: (navigator as any).connection,
      onLine: navigator.onLine
    }
  }
}

export function logDebugInfo() {
  const info = getDebugInfo()
  console.log('🔍 [Debug] 시스템 정보:', info)
  return info
}

export function createDebugReport(error?: any, context?: string): string {
  const info = getDebugInfo()
  const report = {
    context: context || 'Unknown',
    error: error ? {
      message: error.message,
      name: error.name,
      stack: error.stack
    } : null,
    debugInfo: info,
    timestamp: new Date().toISOString()
  }
  
  return JSON.stringify(report, null, 2)
}

// 네트워크 상태 모니터링
export function setupNetworkMonitoring() {
  const logNetworkChange = (status: string) => {
    console.log(`🌐 [Debug] 네트워크 상태 변경: ${status}`, {
      onLine: navigator.onLine,
      timestamp: new Date().toISOString()
    })
  }

  window.addEventListener('online', () => logNetworkChange('온라인'))
  window.addEventListener('offline', () => logNetworkChange('오프라인'))

  // Connection API 지원 시 추가 정보
  if ('connection' in navigator) {
    const connection = (navigator as any).connection
    if (connection) {
      console.log('📶 [Debug] 연결 정보:', {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
        saveData: connection.saveData
      })
    }
  }
}

// API 호출 성능 측정
export class PerformanceTracker {
  private startTime: number
  private name: string

  constructor(name: string) {
    this.name = name
    this.startTime = performance.now()
    console.log(`⏱️ [Performance] ${name} 시작`)
  }

  end(additionalInfo?: any) {
    const duration = performance.now() - this.startTime
    console.log(`⏱️ [Performance] ${this.name} 완료: ${duration.toFixed(2)}ms`, additionalInfo)
    return duration
  }
}

// 에러 리포팅
export function reportError(error: any, context: string, additionalInfo?: any) {
  const report = {
    context,
    error: {
      message: error?.message || 'Unknown error',
      name: error?.name || 'Unknown',
      stack: error?.stack
    },
    additionalInfo,
    debugInfo: getDebugInfo(),
    timestamp: new Date().toISOString()
  }

  console.error(`❌ [Error Report] ${context}:`, report)
  
  // 프로덕션에서는 에러 리포팅 서비스로 전송 가능
  if (import.meta.env.PROD) {
    // TODO: 에러 리포팅 서비스 연동
  }

  return report
}
