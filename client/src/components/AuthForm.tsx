import Alert from '@/components/ui/Alert'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { useI18n } from '@/stores/i18n.store'
import authService from '@/services/auth.service'
import { useState, type SubmitEvent } from 'react'
import { loginSchema, registerSchema, fieldErrors } from '@/schemas/auth.schema'

type AuthFormProps = {
  mode: 'login' | 'register'
  onSuccess: () => void
}

function AuthForm({ mode, onSuccess }: AuthFormProps) {
  const { t } = useI18n()
  const isRegister = mode === 'register'
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    const values = Object.fromEntries(new FormData(event.currentTarget)) as Record<string, string>

    const result = (isRegister ? registerSchema : loginSchema).safeParse(values)
    if (!result.success) {
      setErrors(fieldErrors(result.error))
      return
    }

    setErrors({})
    setFormError('')
    setSubmitting(true)
    const res = isRegister
      ? await authService.register(result.data.email, values.username, result.data.password)
      : await authService.login(result.data.email, result.data.password)
    setSubmitting(false)

    if (res.success) {
      onSuccess()
    } else {
      setFormError(res.error.message)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <Alert>{formError}</Alert>

      <Input
        label={t('auth.email')}
        name="email"
        type="email"
        autoComplete="email"
        error={errors.email && t(errors.email)}
      />

      {isRegister && (
        <Input
          label={t('auth.username')}
          name="username"
          type="text"
          autoComplete="username"
          error={errors.username && t(errors.username)}
        />
      )}

      <Input
        label={t('auth.password')}
        name="password"
        type="password"
        autoComplete={isRegister ? 'new-password' : 'current-password'}
        error={errors.password && t(errors.password)}
      />

      <Button type="submit" loading={submitting}>
        {t(isRegister ? 'auth.register.title' : 'auth.login.title')}
      </Button>
    </form>
  )
}

export default AuthForm
