import { Link } from 'react-router-dom'
import {
  IconArrowRight,
  IconBolt,
  IconWand,
  IconLink,
  IconDeviceFloppy,
  IconWorld,
  IconCode,
  IconGitFork,
  IconHeart,
  IconMessageCircle,
  IconUserCircle,
  IconBrandHtml5,
  IconBrandCss3,
  IconBrandJavascript,
} from '@tabler/icons-react'
import { useAuthStore } from '@/stores/auth.store'
import { useI18n } from '@/stores/i18n.store'

const features = [
  { icon: IconBolt, title: 'home.f.live.title', desc: 'home.f.live.desc' },
  { icon: IconWand, title: 'home.f.pre.title', desc: 'home.f.pre.desc' },
  { icon: IconLink, title: 'home.f.res.title', desc: 'home.f.res.desc' },
  {
    icon: IconDeviceFloppy,
    title: 'home.f.save.title',
    desc: 'home.f.save.desc',
  },
  { icon: IconWorld, title: 'home.f.share.title', desc: 'home.f.share.desc' },
  { icon: IconCode, title: 'home.f.embed.title', desc: 'home.f.embed.desc' },
]

const preprocessors = [
  {
    icon: IconBrandHtml5,
    label: 'HTML',
    color: 'text-orange-400',
    items: ['HTML', 'Pug', 'Markdown', 'Haml'],
  },
  {
    icon: IconBrandCss3,
    label: 'CSS',
    color: 'text-sky-400',
    items: ['CSS', 'Sass', 'SCSS', 'Less', 'Stylus'],
  },
  {
    icon: IconBrandJavascript,
    label: 'JavaScript',
    color: 'text-yellow-400',
    items: ['JavaScript', 'TypeScript', 'Babel / JSX', 'CoffeeScript'],
  },
]

const community = [
  { icon: IconWorld, text: 'home.community.discover' },
  { icon: IconHeart, text: 'home.community.like' },
  { icon: IconMessageCircle, text: 'home.community.comment' },
  { icon: IconGitFork, text: 'home.community.fork' },
  { icon: IconUserCircle, text: 'home.community.profile' },
]

function Home() {
  const user = useAuthStore((s) => s.user)
  const { t } = useI18n()

  return (
    <div className="h-full overflow-y-auto bg-neutral-900 text-neutral-100">
      {}
      <section className="relative overflow-hidden px-4 pt-16 pb-20 sm:px-6 sm:pt-24">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 left-1/2 h-72 w-[42rem] max-w-full -translate-x-1/2 rounded-full bg-indigo-600/20 blur-3xl"
        />
        <div className="relative mx-auto max-w-5xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-700 bg-neutral-800/60 px-3 py-1 text-xs font-medium text-neutral-300">
            <IconBolt className="h-3.5 w-3.5 text-indigo-400" stroke={2} />
            {t('home.badge')}
          </span>
          <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-6xl">
            <span className="bg-gradient-to-r from-indigo-400 via-indigo-300 to-sky-300 bg-clip-text text-transparent">
              Code Editor
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-neutral-400 sm:text-lg">{t('home.subtitle')}</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/editor"
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500 sm:text-base"
            >
              {t('home.cta.start')}
              <IconArrowRight className="h-4 w-4" stroke={2} />
            </Link>
            <Link
              to="/explore"
              className="inline-flex items-center gap-2 rounded-lg border border-neutral-700 bg-neutral-800/60 px-5 py-2.5 text-sm font-medium text-neutral-200 transition hover:bg-neutral-800 sm:text-base"
            >
              {t('home.cta.explore')}
            </Link>
          </div>

          {}
          <div className="mx-auto mt-14 max-w-3xl overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950 shadow-2xl shadow-black/40">
            <div className="flex items-center gap-1.5 border-b border-neutral-800 px-4 py-3">
              <span className="h-3 w-3 rounded-full bg-red-500/80" />
              <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
              <span className="h-3 w-3 rounded-full bg-green-500/80" />
              <span className="ml-3 text-xs text-neutral-500">index.html</span>
            </div>
            <div className="grid grid-cols-1 gap-px bg-neutral-800 sm:grid-cols-3">
              {[
                { label: 'HTML', color: 'text-orange-400' },
                { label: 'CSS', color: 'text-sky-400' },
                { label: 'JS', color: 'text-yellow-400' },
              ].map((p) => (
                <div key={p.label} className="bg-neutral-950 p-4">
                  <div className={`mb-3 text-xs font-semibold ${p.color}`}>{p.label}</div>
                  <div className="space-y-2">
                    {[9, 7, 8, 5, 6].map((w, i) => (
                      <div key={i} className="h-2 rounded bg-neutral-800" style={{ width: `${w * 10}%` }} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center border-t border-neutral-800 bg-gradient-to-br from-indigo-500/10 to-sky-500/10 py-8">
              <span className="text-sm text-neutral-400">{t('home.mockup.preview')}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-neutral-800 px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-2xl font-semibold sm:text-3xl">{t('home.features.heading')}</h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-sm text-neutral-400 sm:text-base">
            {t('home.features.sub')}
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-xl border border-neutral-800 bg-neutral-800/30 p-5 transition hover:border-neutral-700 hover:bg-neutral-800/50"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
                  <f.icon className="h-5 w-5" stroke={2} />
                </div>
                <h3 className="mt-4 text-base font-semibold">{t(f.title)}</h3>
                <p className="mt-1.5 text-sm text-neutral-400">{t(f.desc)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-neutral-800 px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-2xl font-semibold sm:text-3xl">{t('home.pre.heading')}</h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-sm text-neutral-400 sm:text-base">{t('home.pre.sub')}</p>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {preprocessors.map((group) => (
              <div key={group.label} className="rounded-xl border border-neutral-800 bg-neutral-800/30 p-5">
                <div className="flex items-center gap-2">
                  <group.icon className={`h-6 w-6 ${group.color}`} stroke={2} />
                  <span className="text-base font-semibold">{group.label}</span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {group.items.map((item) => (
                    <span
                      key={item}
                      className="rounded-md border border-neutral-700 bg-neutral-900 px-2.5 py-1 text-xs text-neutral-300"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-neutral-800 px-4 py-16 sm:px-6">
        <div className="mx-auto grid max-w-5xl items-center gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-semibold sm:text-3xl">{t('home.community.heading')}</h2>
            <p className="mt-3 text-sm text-neutral-400 sm:text-base">{t('home.community.sub')}</p>
            <ul className="mt-6 space-y-3">
              {community.map((c) => (
                <li key={c.text} className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-800 text-indigo-400">
                    <c.icon className="h-4 w-4" stroke={2} />
                  </span>
                  <span className="text-sm text-neutral-300">{t(c.text)}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-neutral-800 bg-gradient-to-br from-indigo-500/10 via-neutral-900 to-sky-500/10 p-8">
            <IconWorld className="h-10 w-10 text-indigo-400" stroke={1.5} />
            <p className="mt-4 text-lg font-medium">{t('home.community.card.title')}</p>
            <p className="mt-2 text-sm text-neutral-400">{t('home.community.card.desc')}</p>
            <Link
              to="/explore"
              className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-indigo-400 hover:text-indigo-300"
            >
              {t('home.community.card.cta')}
              <IconArrowRight className="h-4 w-4" stroke={2} />
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-neutral-800 px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-semibold sm:text-3xl">{t('home.cta2.heading')}</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-neutral-400 sm:text-base">{t('home.cta2.sub')}</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/editor"
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500 sm:text-base"
            >
              {t('home.cta2.open')}
              <IconArrowRight className="h-4 w-4" stroke={2} />
            </Link>
            {!user && (
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-lg border border-neutral-700 bg-neutral-800/60 px-5 py-2.5 text-sm font-medium text-neutral-200 transition hover:bg-neutral-800 sm:text-base"
              >
                {t('home.cta2.register')}
              </Link>
            )}
          </div>
        </div>
      </section>

      <footer className="border-t border-neutral-800 px-4 py-8 sm:px-6">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 sm:flex-row">
          <div className="flex items-center gap-1.5 text-sm font-semibold">
            <IconCode className="h-5 w-5 text-indigo-400" stroke={2} />
            Code Editor
          </div>
          <p className="text-xs text-neutral-500">{t('home.footer.tagline')}</p>
        </div>
      </footer>
    </div>
  )
}

export default Home
