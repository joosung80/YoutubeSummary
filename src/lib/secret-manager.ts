// Google Cloud Secret Manager integration
import { SecretManagerServiceClient } from '@google-cloud/secret-manager'

const client = new SecretManagerServiceClient()

interface SecretCache {
  geminiApiKey?: string
  supadataApiKey?: string
  lastFetch?: number
}

// Cache secrets for 5 minutes to avoid excessive API calls
const CACHE_DURATION = 5 * 60 * 1000
let secretCache: SecretCache = {}

export async function getSecret(secretName: string): Promise<string> {
  try {
    const projectId = process.env.GOOGLE_CLOUD_PROJECT || 'pearlplaygroud'
    const name = `projects/${projectId}/secrets/${secretName}/versions/latest`
    
    console.log(`🔐 [SecretManager] Fetching secret: ${secretName}`)
    
    const [version] = await client.accessSecretVersion({ name })
    
    if (!version.payload?.data) {
      throw new Error(`Secret ${secretName} not found or empty`)
    }
    
    const secretValue = version.payload.data.toString()
    console.log(`✅ [SecretManager] Successfully fetched ${secretName}`)
    
    return secretValue
  } catch (error) {
    console.error(`❌ [SecretManager] Failed to fetch ${secretName}:`, error)
    throw error
  }
}

export async function getGeminiApiKey(): Promise<string> {
  // Check cache first
  const now = Date.now()
  if (secretCache.geminiApiKey && secretCache.lastFetch && (now - secretCache.lastFetch) < CACHE_DURATION) {
    console.log('📋 [SecretManager] Using cached Gemini API key')
    return secretCache.geminiApiKey
  }
  
  const key = await getSecret('gemini-api-key')
  secretCache.geminiApiKey = key
  secretCache.lastFetch = now
  return key
}

export async function getSupadataApiKey(): Promise<string> {
  // Check cache first
  const now = Date.now()
  if (secretCache.supadataApiKey && secretCache.lastFetch && (now - secretCache.lastFetch) < CACHE_DURATION) {
    console.log('📋 [SecretManager] Using cached Supadata API key')
    return secretCache.supadataApiKey
  }
  
  const key = await getSecret('supadata-api-key')
  secretCache.supadataApiKey = key
  secretCache.lastFetch = now
  return key
}

// Priority: Environment variables first, then GCP Secret Manager
export async function getApiKeys(): Promise<{ geminiApiKey: string; supadataApiKey: string }> {
  // First, check environment variables
  const geminiApiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY
  const supadataApiKey = process.env.VITE_SUPADATA_API_KEY || process.env.SUPADATA_API_KEY
  
  if (geminiApiKey && supadataApiKey) {
    console.log('📋 [SecretManager] Using environment variables for API keys')
    return { geminiApiKey, supadataApiKey }
  }
  
  // If environment variables are not available, try GCP Secret Manager
  console.log('🔐 [SecretManager] Environment variables not found, trying GCP Secret Manager')
  
  try {
    const [gcpGeminiKey, gcpSupadataKey] = await Promise.all([
      getGeminiApiKey(),
      getSupadataApiKey()
    ])
    
    console.log('✅ [SecretManager] Successfully loaded API keys from GCP Secret Manager')
    return { geminiApiKey: gcpGeminiKey, supadataApiKey: gcpSupadataKey }
  } catch (error) {
    console.error('❌ [SecretManager] Failed to load from GCP Secret Manager:', error)
    
    // If both environment variables and GCP fail, throw error
    const missingKeys = []
    if (!geminiApiKey) missingKeys.push('Gemini API Key')
    if (!supadataApiKey) missingKeys.push('Supadata API Key')
    
    throw new Error(
      `API keys not available:\n` +
      `- Missing: ${missingKeys.join(', ')}\n` +
      `- GCP Secret Manager: Failed\n` +
      `Please set environment variables or configure GCP Secret Manager access.`
    )
  }
}
