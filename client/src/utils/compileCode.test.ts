import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { compileAll } from './compileCode'
import { defaultPenSettings, type PenSettings } from '@/types/preprocessors'

const source = { html: '<h1>hi</h1>', css: 'h1{}', js: 'x' }

describe('compileAll', () => {
  afterEach(() => vi.restoreAllMocks())

  it('skips the network when no preprocessors are selected', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    const result = await compileAll(source, defaultPenSettings)
    expect(fetchSpy).not.toHaveBeenCalled()
    expect(result).toEqual({ ...source, errors: [] })
  })

  describe('with a preprocessor set', () => {
    const settings: PenSettings = {
      ...defaultPenSettings,
      cssPreprocessor: 'scss',
    }

    beforeEach(() => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(
          JSON.stringify({
            html: '<h1>hi</h1>',
            css: 'h1 { color: red; }',
            js: 'x',
            errors: [],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        ),
      )
    })

    it('calls the compile API and returns the compiled result', async () => {
      const result = await compileAll(source, settings)
      expect(globalThis.fetch).toHaveBeenCalledOnce()
      expect(result.css).toContain('color: red')
      expect(result.errors).toHaveLength(0)
    })
  })

  it('surfaces server error messages', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ errors: ['CSS: boom'] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )
    const result = await compileAll(source, {
      ...defaultPenSettings,
      cssPreprocessor: 'scss',
    })
    expect(result.errors).toContain('CSS: boom')
  })

  it('falls back gracefully on a network failure', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('offline'))
    const result = await compileAll(source, {
      ...defaultPenSettings,
      jsPreprocessor: 'typescript',
    })
    expect(result.errors[0]).toContain('Network')
    expect(result.html).toBe(source.html)
  })
})
