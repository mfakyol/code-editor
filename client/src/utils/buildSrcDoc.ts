function escapeScript(js: string): string {
  return js.replace(/<\/script>/gi, '<\\/script>')
}

export function buildSrcDoc(html: string, css: string, js: string): string {
  const safeJs = escapeScript(js)

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      *, *::before, *::after { box-sizing: border-box; }
      body { margin: 0; }
      ${css}
    </style>
  </head>
  <body>
    ${html}
    <script>
      (function () {
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
