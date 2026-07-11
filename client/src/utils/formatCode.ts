import type { Plugin } from 'prettier'
import type { PenSettings, SettingsTab } from '@/types/preprocessors'

type ParserTarget = {
  parser: string
  loadPlugins: () => Promise<Plugin[]>
}

const loadPostcss = async () => [await import('prettier/plugins/postcss')]
const loadHtml = async () => [await import('prettier/plugins/html')]
const loadMarkdown = async () => [await import('prettier/plugins/markdown')]
const loadBabel = async () => [await import('prettier/plugins/babel'), await import('prettier/plugins/estree')]
const loadTypescript = async () => [
  await import('prettier/plugins/typescript'),
  await import('prettier/plugins/estree'),
]

function resolveTarget(panel: SettingsTab, settings: PenSettings): ParserTarget | null {
  if (panel === 'html') {
    if (settings.htmlPreprocessor === 'none') return { parser: 'html', loadPlugins: loadHtml }
    if (settings.htmlPreprocessor === 'markdown') return { parser: 'markdown', loadPlugins: loadMarkdown }
    return null
  }

  if (panel === 'css') {
    if (settings.cssPreprocessor === 'none') return { parser: 'css', loadPlugins: loadPostcss }
    if (settings.cssPreprocessor === 'scss') return { parser: 'scss', loadPlugins: loadPostcss }
    if (settings.cssPreprocessor === 'less') return { parser: 'less', loadPlugins: loadPostcss }
    return null
  }

  if (settings.jsPreprocessor === 'none' || settings.jsPreprocessor === 'babel')
    return { parser: 'babel', loadPlugins: loadBabel }
  if (settings.jsPreprocessor === 'typescript') return { parser: 'typescript', loadPlugins: loadTypescript }
  return null
}

export function canFormat(panel: SettingsTab, settings: PenSettings): boolean {
  return resolveTarget(panel, settings) !== null
}

export async function formatCode(code: string, panel: SettingsTab, settings: PenSettings): Promise<string> {
  const target = resolveTarget(panel, settings)
  if (!target) return code

  const prettier = await import('prettier/standalone')
  const plugins = await target.loadPlugins()
  return prettier.format(code, {
    parser: target.parser,
    plugins,
    semi: true,
    singleQuote: false,
  })
}
