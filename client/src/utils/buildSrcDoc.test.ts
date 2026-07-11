import { describe, it, expect } from 'vitest'
import { buildSrcDoc } from './buildSrcDoc'

describe('buildSrcDoc', () => {
  it('inlines html, css and js into a full document', () => {
    const doc = buildSrcDoc('<h1>hi</h1>', 'h1 { color: red }', 'console.log(1)')
    expect(doc).toContain('<!DOCTYPE html>')
    expect(doc).toContain('<h1>hi</h1>')
    expect(doc).toContain('color: red')
    expect(doc).toContain('console.log(1)')
  })

  it('escapes a closing script tag in user JS to avoid breaking out', () => {
    const doc = buildSrcDoc('', '', 'const s = "</script>"')
    expect(doc).not.toContain('"</script>"')
    expect(doc).toContain('<\\/script>')
  })

  it('adds external scripts and styles with escaped attributes', () => {
    const doc = buildSrcDoc('', '', '', {
      externalScripts: ['https://cdn.test/lib.js'],
      externalStyles: ['https://cdn.test/lib.css'],
    })
    expect(doc).toContain('<script src="https://cdn.test/lib.js">')
    expect(doc).toContain('<link rel="stylesheet" href="https://cdn.test/lib.css" />')
  })

  it('ignores blank external resource entries', () => {
    const doc = buildSrcDoc('', '', '', {
      externalScripts: ['  ', ''],
      externalStyles: [],
    })
    expect(doc).not.toContain('<script src="  "')
  })
})
