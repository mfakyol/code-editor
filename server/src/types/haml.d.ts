declare module 'haml' {
  export function render(
    code: string,
    options?: Record<string, unknown>,
  ): string
  export function compile(
    code: string,
    options?: Record<string, unknown>,
  ): (locals?: Record<string, unknown>) => string

  const _default: {
    render: typeof render
    compile: typeof compile
  }
  export default _default
}
