// Configuration with GCP Secret Manager integration
import { getApiKeys } from './secret-manager'

interface Config {
  geminiApiKey: string
  supadataApiKey: string
}

let configCache: Config | null = null
let configPromise: Promise<Config> | null = null

async function validateConfig(): Promise<Config> {
  // Return cached config if available
  if (configCache) {
    return configCache
  }

  // Return existing promise if already in progress
  if (configPromise) {
    return configPromise
  }

  console.log('🔧 [Config] API 키 검증 시작:', {
    timestamp: new Date().toISOString(),
    env: import.meta.env.MODE || 'unknown'
  })

  configPromise = (async () => {
    try {
      // Try to get API keys from GCP Secret Manager first
      const { geminiApiKey, supadataApiKey } = await getApiKeys()

      console.log('✅ [Config] API 키 검증 성공:', {
        hasGeminiKey: !!geminiApiKey,
        geminiKeyLength: geminiApiKey?.length || 0,
        geminiKeyPrefix: geminiApiKey?.substring(0, 8) + '...' || 'N/A',
        hasSupadataKey: !!supadataApiKey,
        supadataKeyLength: supadataApiKey?.length || 0,
        supadataKeyPrefix: supadataApiKey?.substring(0, 8) + '...' || 'N/A',
        source: 'GCP Secret Manager or Environment Variables'
      })

      const config: Config = { geminiApiKey, supadataApiKey }
      configCache = config
      return config
    } catch (error) {
      console.error('❌ [Config] API 키 검증 실패:', error)
      throw new Error(
        `Failed to load API keys: ${error instanceof Error ? error.message : 'Unknown error'}\n\n` +
        'Please ensure GCP Secret Manager is configured or environment variables are set.'
      )
    }
  })()

  return configPromise
}

// Legacy synchronous function for backward compatibility
function validateConfigSync(): Config {
  console.warn('⚠️ [Config] validateConfigSync is deprecated, use validateConfigAsync instead')
  
  const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY
  const supadataApiKey = import.meta.env.VITE_SUPADATA_API_KEY

  console.log('🔍 [Config] 환경변수 상태 확인 (Sync):', {
    hasGeminiKey: !!geminiApiKey,
    geminiKeyLength: geminiApiKey?.length || 0,
    geminiKeyPrefix: geminiApiKey?.substring(0, 8) + '...' || 'N/A',
    isGeminiDefault: geminiApiKey === 'your_gemini_api_key_here',
    hasSupadataKey: !!supadataApiKey,
    supadataKeyLength: supadataApiKey?.length || 0,
    supadataKeyPrefix: supadataApiKey?.substring(0, 8) + '...' || 'N/A',
    isSupadataDefault: supadataApiKey === 'your_supadata_api_key_here',
    allEnvVars: Object.keys(import.meta.env).filter(key => key.startsWith('VITE_'))
  })

  const errors: string[] = []

  if (!geminiApiKey || geminiApiKey === 'your_gemini_api_key_here') {
    errors.push('VITE_GEMINI_API_KEY is not configured. Get your API key from https://ai.google.dev/')
    console.error('❌ [Config] Gemini API Key 누락 또는 기본값')
  }

  if (!supadataApiKey || supadataApiKey === 'your_supadata_api_key_here') {
    errors.push('VITE_SUPADATA_API_KEY is not configured. Get your API key from https://supadata.ai/')
    console.error('❌ [Config] Supadata API Key 누락 또는 기본값')
  }

  if (errors.length > 0) {
    console.error('❌ [Config] 설정 검증 실패:', {
      errorCount: errors.length,
      errors,
      timestamp: new Date().toISOString()
    })
    throw new Error(
      `Missing required API keys:\n\n${errors.join('\n')}\n\n` +
      'Please check your .env file or environment variables.\n' +
      'Copy .env.example to .env and fill in your API keys.'
    )
  }

  console.log('✅ [Config] 설정 검증 성공 (Sync):', {
    geminiKeyValid: true,
    supadataKeyValid: true,
    timestamp: new Date().toISOString()
  })
  
  return {
    geminiApiKey,
    supadataApiKey,
  }
}

// Export async config function
export const config = validateConfig()

// Export async version for new code
export const configAsync = validateConfig

// Export sync version for backward compatibility
export const configSync = validateConfigSync

export function getConfigStatus(): { isValid: boolean; errors: string[] } {
  try {
    validateConfigSync()
    return { isValid: true, errors: [] }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown configuration error'
    return { 
      isValid: false, 
      errors: message.split('\n').filter(line => line.trim()) 
    }
  }
}

export async function getConfigStatusAsync(): Promise<{ isValid: boolean; errors: string[] }> {
  try {
    await validateConfig()
    return { isValid: true, errors: [] }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown configuration error'
    return { 
      isValid: false, 
      errors: message.split('\n').filter(line => line.trim()) 
    }
  }
}