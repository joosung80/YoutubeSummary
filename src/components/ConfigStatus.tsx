import { AlertCircle, CheckCircle, ExternalLink } from 'lucide-react'
import { useState, useEffect } from 'react'
import { getConfigStatusAsync } from '../lib/config'

export function ConfigStatus() {
  const [isValid, setIsValid] = useState<boolean | null>(null)
  const [errors, setErrors] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function checkConfig() {
      try {
        const status = await getConfigStatusAsync()
        setIsValid(status.isValid)
        setErrors(status.errors)
      } catch (error) {
        console.error('Config check failed:', error)
        setIsValid(false)
        setErrors(['Failed to load configuration'])
      } finally {
        setIsLoading(false)
      }
    }
    
    checkConfig()
  }, [])

  if (isLoading) {
    return (
      <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950">
        <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
          <div className="size-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <span className="text-sm font-medium">Loading configuration...</span>
        </div>
      </div>
    )
  }

  if (isValid) {
    return (
      <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950">
        <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
          <CheckCircle className="size-4" />
          <span className="text-sm font-medium">Configuration OK</span>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
      <div className="flex items-start gap-2 text-red-800 dark:text-red-200">
        <AlertCircle className="size-4 mt-0.5 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <span className="text-sm font-medium">Missing API Keys</span>
          <div className="space-y-1 text-xs">
            {errors.map((error, index) => (
              <div key={index} className="text-red-700 dark:text-red-300">
                {error}
              </div>
            ))}
          </div>
          <div className="mt-3 space-y-2 text-xs">
            <div>
              📋 Copy <code className="bg-red-100 px-1 py-0.5 rounded dark:bg-red-900">.env.example</code> to <code className="bg-red-100 px-1 py-0.5 rounded dark:bg-red-900">.env</code> and add your API keys
            </div>
            <div className="flex items-center gap-4">
              <a 
                href="https://ai.google.dev/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-red-600 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300"
              >
                Get Gemini API Key <ExternalLink className="size-3" />
              </a>
              <a 
                href="https://supadata.ai/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-red-600 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300"
              >
                Get Supadata API Key <ExternalLink className="size-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}