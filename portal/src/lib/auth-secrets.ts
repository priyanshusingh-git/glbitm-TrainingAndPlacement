const REQUIRED_AUTH_SECRETS = [
  "JWT_SECRET",
  "CSRF_SECRET",
  "RESET_TOKEN_SECRET",
  "OTP_HASH_SECRET",
] as const

type AuthSecretName = typeof REQUIRED_AUTH_SECRETS[number]

export function getAuthSecret(name: AuthSecretName) {
  const secret = process.env[name]

  if (!secret || secret.length < 32) {
    throw new Error(`${name} must be configured with at least 32 characters.`)
  }

  return secret
}

export function validateAuthSecrets() {
  for (const name of REQUIRED_AUTH_SECRETS) {
    getAuthSecret(name)
  }
}
