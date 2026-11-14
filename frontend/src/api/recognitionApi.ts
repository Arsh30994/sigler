export type RecognitionReadiness = {
  ready: boolean
  modelVersion: string
  reason?: string
}

const recognitionApiBase = import.meta.env.VITE_RECOGNITION_API_URL ?? 'http://127.0.0.1:8000'

export async function getRecognitionReadiness(signal?: AbortSignal): Promise<RecognitionReadiness> {
  const response = await fetch(`${recognitionApiBase}/ready`, { signal })
  if (!response.ok) throw new Error(`Recognition service returned ${response.status}`)
  const data = (await response.json()) as { ready: boolean; model_version: string; reason?: string | null }
  return { ready: data.ready, modelVersion: data.model_version, reason: data.reason ?? undefined }
}
