declare module 'haml' {
  interface Haml {
    (code: string, config?: unknown): string
    render(code: string, options?: Record<string, unknown>): string
    compile(code: string, options?: Record<string, unknown>): string
    html_escape(value: unknown): string
  }

  const haml: Haml
  export default haml
  export const render: Haml['render']
  export const compile: Haml['compile']
  export const html_escape: Haml['html_escape']
}
