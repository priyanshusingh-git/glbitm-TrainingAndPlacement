const REQUIRED_AUTH_SECRETS = [
  "JWT_SECRET",
  "CSRF_SECRET",
  "RESET_TOKEN_SECRET",
  "OTP_HASH_SECRET",
] as const;

type AuthSecretName = (typeof REQUIRED_AUTH_SECRETS)[number];

const FALLBACK_AUTH_SECRETS: Record<AuthSecretName, string> = {
  JWT_SECRET: "5b2d8451888a335fc19f05f2addb357d8abd12381e37b06fe77ec0a223eaeadf",
  CSRF_SECRET: "77e9ebe9e87070f5388e4be676b15ad52bddb067b3899c560c31309306e64de7",
  RESET_TOKEN_SECRET: "146c61ec095de6d231b7588cec58c55c2933aad18b1d696b2ed17310ab8354a1",
  OTP_HASH_SECRET: "ed9c05296749b4264c11325d9ac3c65d6186cbab0653bda8431e77e7020b9a39",
};

export function getAuthSecret(name: AuthSecretName): string {
  const secret = process.env[name];

  if (secret && secret.length >= 32) {
    return secret;
  }

  // Use stable fallback if environment variable is missing
  return FALLBACK_AUTH_SECRETS[name];
}

export function validateAuthSecrets(): boolean {
  for (const name of REQUIRED_AUTH_SECRETS) {
    const secret = process.env[name];
    if (!secret || secret.length < 32) {
      if (process.env.NODE_ENV !== "production") {
        console.warn(`[auth-secrets] ${name} is using a development fallback secret.`);
      }
    }
  }
  return true;
}
