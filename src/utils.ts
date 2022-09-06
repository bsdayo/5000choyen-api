export function error(code: number, message: string) {
  return JSON.stringify({
    code,
    message,
  })
}
