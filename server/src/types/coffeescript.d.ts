declare module 'coffeescript' {
  export interface CompileOptions {
    bare?: boolean
    header?: boolean
    sourceMap?: boolean
    inlineMap?: boolean
    filename?: string
  }

  export function compile(code: string, options?: CompileOptions): string

  const _default: { compile: typeof compile }
  export default _default
}
