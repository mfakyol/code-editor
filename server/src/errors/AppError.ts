export class AppError extends Error {
  status: number
  code: string
  errors: string[]

  constructor(status: number, message: string, code: string, errors: string[] = []) {
    super(message)
    this.status = status
    this.code = code
    this.errors = errors
  }
}
