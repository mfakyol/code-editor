import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { IconChevronDown } from '@tabler/icons-react'
import { useI18n } from '@/stores/i18n.store'
import { useAuthStore } from '@/stores/auth.store'
import authService from '@/services/auth.service'
import { useOutsideClick } from '@/hooks/useOutsideClick'

const itemClass = 'block w-full rounded px-3 py-2 text-left text-sm text-neutral-300 hover:bg-neutral-800'

function AccountMenu() {
  const { t } = useI18n()
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useOutsideClick(ref, () => setOpen(false), open)

  if (!user) return null

  const handleLogout = async () => {
    setOpen(false)
    await authService.logout()
    navigate('/')
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="true"
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-md px-1.5 py-1 text-sm text-neutral-200 hover:bg-neutral-800"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs font-medium text-white">
          {user.username.charAt(0).toUpperCase()}
        </span>
        <span className="hidden max-w-[8rem] truncate sm:inline">{user.username}</span>
        <IconChevronDown className="h-3.5 w-3.5 text-neutral-400" stroke={2} />
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-52 rounded-md border border-neutral-700 bg-neutral-900 p-1 shadow-xl">
          <div className="border-b border-neutral-800 px-3 py-2">
            <p className="truncate text-sm font-medium text-neutral-100">{user.username}</p>
            <p className="truncate text-xs text-neutral-500">{user.email}</p>
          </div>
          <Link to={`/u/${user.username}`} onClick={() => setOpen(false)} className={itemClass}>
            {t('nav.profile')}
          </Link>
          <Link to="/pens" onClick={() => setOpen(false)} className={itemClass}>
            {t('nav.myPens')}
          </Link>
          <Link to="/account" onClick={() => setOpen(false)} className={itemClass}>
            {t('nav.account')}
          </Link>
          <button type="button" onClick={handleLogout} className={`${itemClass} text-rose-400 hover:bg-rose-600/10`}>
            {t('nav.logout')}
          </button>
        </div>
      )}
    </div>
  )
}

export default AccountMenu
