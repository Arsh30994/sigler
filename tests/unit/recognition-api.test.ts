import { afterEach, describe, expect, it, vi } from 'vitest'

import { getRecognitionReadiness } from '../../frontend/src/api/recognitionApi'

describe('VSRS recognition API client', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('maps the service readiness contract to frontend naming', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ ready: true, model_version: 'vsrs-v1', reason: null }), { status: 200 })))
    await expect(getRecognitionReadiness()).resolves.toEqual({ ready: true, modelVersion: 'vsrs-v1', reason: undefined })
  })

  it('rejects an unavailable service response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('', { status: 503 })))
    await expect(getRecognitionReadiness()).rejects.toThrow('Recognition service returned 503')
  })
})
