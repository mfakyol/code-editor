import { useState, type SubmitEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth.store'
import { useI18n } from '@/stores/i18n.store'
import authService from '@/services/auth.service'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Alert from '@/components/ui/Alert'
import { changePasswordSchema, fieldErrors } from '@/schemas/auth.schema'

function Account() {
  const user = useAuthStore((s) => s.user)!
  const { t } = useI18n()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{
    type: 'ok' | 'error'
    text: string
  } | null>(null)

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMessage(null)
    const form = event.currentTarget
    const values = Object.fromEntries(new FormData(form)) as Record<string, string>

    const result = changePasswordSchema.safeParse(values)
    if (!result.success) {
      setErrors(fieldErrors(result.error))
      return
    }
    setErrors({})

    setSaving(true)
    const res = await authService.changePassword(values.current, result.data.next)
    setSaving(false)

    if (res.success) {
      setMessage({ type: 'ok', text: t('account.updated') })
      form.reset()
    } else {
      setMessage({ type: 'error', text: res.error.message })
    }
  }

  return (
    <div className="mx-auto h-full w-full max-w-md overflow-auto px-4 py-8 sm:px-6">
      <h1 className="mb-1 text-2xl font-semibold">{t('account.title')}</h1>
      <p className="mb-6 text-sm text-neutral-500">
        {user.username} · {user.email} ·{' '}
        <Link to={`/u/${user.username}`} className="text-indigo-400 hover:underline">
          {t('account.viewProfile')}
        </Link>
      </p>

      <h2 className="mb-3 text-lg font-medium">{t('account.changePassword')}</h2>

      <Alert type={message?.type === 'ok' ? 'success' : 'error'}>{message?.text}</Alert>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <Input label={t('account.current')} name="current" type="password" autoComplete="current-password" required />
        <Input
          label={t('account.new')}
          name="next"
          type="password"
          autoComplete="new-password"
          error={errors.next && t(errors.next)}
        />
        <Input
          label={t('account.confirm')}
          name="confirm"
          type="password"
          autoComplete="new-password"
          error={errors.confirm && t(errors.confirm)}
        />
        <Button type="submit" loading={saving}>
          {t('account.update')}
        </Button>
      </form>
    </div>
  )
}

export default Account
