import { describe, it, expect, beforeAll } from 'vitest'
import request from 'supertest'
import type { Express } from 'express'
import { getApp } from './helpers'

let app: Express
beforeAll(async () => {
  app = await getApp()
})

const none = {
  htmlPreprocessor: 'none',
  cssPreprocessor: 'none',
  jsPreprocessor: 'none',
  externalScripts: [],
  externalStyles: [],
}

describe('POST /api/compile', () => {
  it('compiles SCSS to CSS', async () => {
    const res = await request(app)
      .post('/api/compile')
      .send({
        html: '',
        css: '$c: red;\nh1 { color: $c; }',
        js: '',
        settings: { ...none, cssPreprocessor: 'scss' },
      })
    expect(res.status).toBe(200)
    expect(res.body.css).toContain('color: red')
    expect(res.body.errors).toHaveLength(0)
  })

  it('renders Markdown to HTML', async () => {
    const res = await request(app)
      .post('/api/compile')
      .send({
        html: '# Hi',
        css: '',
        js: '',
        settings: { ...none, htmlPreprocessor: 'markdown' },
      })
    expect(res.body.html).toContain('<h1>Hi</h1>')
  })

  it('transpiles TypeScript to JS', async () => {
    const res = await request(app)
      .post('/api/compile')
      .send({
        html: '',
        css: '',
        js: 'const x: number = 1',
        settings: { ...none, jsPreprocessor: 'typescript' },
      })
    // Types are stripped; the value declaration survives.
    expect(res.body.js).toContain('const x = 1')
    expect(res.body.js).not.toContain(': number')
  })

  it('reports a compile error instead of throwing', async () => {
    const res = await request(app)
      .post('/api/compile')
      .send({
        html: '',
        css: 'h1 { color: ',
        js: '',
        settings: { ...none, cssPreprocessor: 'scss' },
      })
    expect(res.status).toBe(200)
    expect(res.body.errors.length).toBeGreaterThan(0)
    expect(res.body.errors[0]).toContain('CSS')
  })

  it('rejects a malformed body with 400', async () => {
    const res = await request(app)
      .post('/api/compile')
      .send({ html: '', css: '', js: '' }) // missing settings
    expect(res.status).toBe(400)
  })
})
