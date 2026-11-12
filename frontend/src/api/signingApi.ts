export type ApiResolution = { ok: boolean; code?: string; message?: string; asset?: { signId: string; gloss: string; validationStatus: string; animationId: string; durationMs: number } }
const apiBase = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8787'
export async function resolveSigning(input: string, avatarId: string): Promise<ApiResolution> {
  const response = await fetch(`${apiBase}/api/signing/resolve`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ input, avatarId }) })
  return response.json() as Promise<ApiResolution>
}
export async function apiHealth() { const response = await fetch(`${apiBase}/api/health`); return response.json() as Promise<{ ok: boolean; database: string }> }
