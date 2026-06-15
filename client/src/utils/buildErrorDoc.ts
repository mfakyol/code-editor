export function buildErrorDoc(errors: string[]): string {
  const message = errors.join('\n')

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <style>
      body {
        margin: 0;
        padding: 1.5rem;
        font-family: ui-monospace, monospace;
        background: #1a1a1a;
        color: #f87171;
        white-space: pre-wrap;
      }
    </style>
  </head>
  <body>${message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</body>
</html>`
}
