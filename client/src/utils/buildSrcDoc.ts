function escapeScript(js: string): string {
  return js.replace(/<\/script>/gi, '<\\/script>')
}

function escapeAttr(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;')
}

function buildScriptTags(scripts: string[]): string {
  return scripts
    .map((src) => src.trim())
    .filter(Boolean)
    .map((src) => `<script src="${escapeAttr(src)}"></script>`)
    .join('\n    ')
}

function buildStyleLinks(styles: string[]): string {
  return styles
    .map((href) => href.trim())
    .filter(Boolean)
    .map((href) => `<link rel="stylesheet" href="${escapeAttr(href)}" />`)
    .join('\n    ')
}

type BuildOptions = {
  externalScripts?: string[]
  externalStyles?: string[]
}

export function buildSrcDoc(html: string, css: string, js: string, options: BuildOptions = {}): string {
  const safeJs = escapeScript(js)
  const scriptTags = buildScriptTags(options.externalScripts ?? [])
  const styleLinks = buildStyleLinks(options.externalStyles ?? [])

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    ${styleLinks}
    <style>
      *, *::before, *::after { box-sizing: border-box; }
      body { margin: 0; }
      ${css}
    </style>
  </head>
  <body>
    ${html}
    ${scriptTags}
    <script>
      (function () {
        window.parent.postMessage({ type: 'preview-reset' }, '*')

        const send = (level, args) => {
          window.parent.postMessage({
            type: 'preview-console',
            level,
            message: args
              .map((arg) => {
                if (typeof arg === 'object') {
                  try {
                    return JSON.stringify(arg)
                  } catch {
                    return String(arg)
                  }
                }
                return String(arg)
              })
              .join(' '),
          }, '*')
        }

        const wrap = (level, original) => (...args) => {
          original(...args)
          send(level, args)
        }

        console.log = wrap('log', console.log.bind(console))
        console.warn = wrap('warn', console.warn.bind(console))
        console.error = wrap('error', console.error.bind(console))

        window.addEventListener('error', (event) => {
          send('error', [event.message])
        })

        window.addEventListener('unhandledrejection', (event) => {
          send('error', [event.reason?.message ?? String(event.reason)])
        })


        window.addEventListener('message', (event) => {
          if (!event.data || event.data.type !== 'preview-eval') return
          try {
            const result = eval(event.data.code)
            send('log', [result])
          } catch (error) {
            send('error', [error instanceof Error ? error.message : String(error)])
          }
        })

        try {
          ${safeJs}
        } catch (error) {
          send('error', [error instanceof Error ? error.message : String(error)])
        }
      })()
    </script>
  </body>
</html>`
}
