import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { IconCode, IconMenu2, IconX } from '@tabler/icons-react'
import { useAuthStore } from '@/stores/auth.store'
import { useI18n } from '@/stores/i18n.store'
import authService from '@/services/auth.service'
import LanguageSelect from '@/components/LanguageSelect'
import AccountMenu from '@/components/AccountMenu'
import { useOutsideClick } from '@/hooks/useOutsideClick'

const linkClass = 'text-sm text-neutral-400 hover:text-neutral-100'
const mobileItem = 'block w-full rounded px-3 py-2 text-left text-sm text-neutral-300 hover:bg-neutral-800'

function Header() {
  const user = useAuthStore((s) => s.user)
  const { t } = useI18n()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLElement>(null)

  useOutsideClick(ref, () => setOpen(false), open)

  const close = () => setOpen(false)

  const handleLogout = async () => {
    close()
    await authService.logout()
    navigate('/')
  }

  return (
    <nav className="relative border-b border-neutral-800" ref={ref}>
      <div className="flex items-center gap-3 px-3 py-2.5 sm:gap-4 sm:px-4 sm:py-3">
        <Link to="/" className="flex items-center gap-1.5 text-sm font-semibold sm:text-base">
          <IconCode className="h-5 w-5 text-indigo-400" stroke={2} />
          Code Editor
        </Link>

        <div className="hidden items-center gap-4 sm:flex">
          <Link to="/pen" className={linkClass}>
            {t('nav.editor')}
          </Link>
          <Link to="/explore" className={linkClass}>
            {t('nav.explore')}
          </Link>
          {user && (
            <Link to="/pens" className={linkClass}>
              {t('nav.myPens')}
            </Link>
          )}
        </div>

        <div className="ml-auto flex items-center gap-3 sm:gap-4">
          <div className="hidden items-center gap-3 sm:flex sm:gap-4">
            <LanguageSelect />
            {user ? (
              <AccountMenu />
            ) : (
              <>
                <Link to="/login" className={linkClass}>
                  {t('nav.login')}
                </Link>
                <Link
                  to="/register"
                  className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium hover:bg-indigo-500"
                >
                  {t('nav.register')}
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-label={t('nav.menu')}
            aria-expanded={open}
            className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-300 hover:bg-neutral-800 sm:hidden"
          >
            {open ? <IconX className="h-5 w-5" stroke={1.75} /> : <IconMenu2 className="h-5 w-5" stroke={1.75} />}
          </button>
        </div>
      </div>

      {open && (
        <div
          className="absolute inset-x-0 top-full z-40 h-screen bg-black/50 sm:hidden"
          onClick={close}
          aria-hidden="true"
        />
      )}

      {open && (
        <div className="absolute inset-x-0 top-full z-50 flex flex-col gap-1 border-b border-neutral-800 bg-neutral-900 p-2 shadow-xl sm:hidden">
          <Link to="/pen" onClick={close} className={mobileItem}>
            {t('nav.editor')}
          </Link>
          <Link to="/explore" onClick={close} className={mobileItem}>
            {t('nav.explore')}
          </Link>

          <div className="my-1 h-px bg-neutral-800" />

          {user ? (
            <>
              <Link to="/pens" onClick={close} className={mobileItem}>
                {t('nav.myPens')}
              </Link>
              <Link to={`/u/${user.username}`} onClick={close} className={mobileItem}>
                {t('nav.profile')}
              </Link>
              <Link to="/account" onClick={close} className={mobileItem}>
                {t('nav.account')}
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className={`${mobileItem} text-rose-400 hover:bg-rose-600/10`}
              >
                {t('nav.logout')}
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={close} className={mobileItem}>
                {t('nav.login')}
              </Link>
              <Link to="/register" onClick={close} className={mobileItem}>
                {t('nav.register')}
              </Link>
            </>
          )}

          <div className="my-1 h-px bg-neutral-800" />

          <div className="p-1">
            <LanguageSelect className="w-full" />
          </div>
        </div>
      )}
    </nav>
  )
}

export default Header
