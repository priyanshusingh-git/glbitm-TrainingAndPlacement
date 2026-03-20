type FirebaseSignInResponse = {
  idToken: string
  localId: string
  email: string
}

type FirebaseCustomTokenResponse = {
  idToken: string
  refreshToken: string
  expiresIn: string
}

export async function signInWithEmailAndPasswordServer(params: {
  email: string
  password: string
}) {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY

  if (!apiKey) {
    throw new Error("Firebase API key is not configured")
  }

  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: params.email,
        password: params.password,
        returnSecureToken: true,
      }),
      cache: "no-store",
    }
  )

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error?.error?.message || "FIREBASE_SIGN_IN_FAILED")
  }

  return response.json() as Promise<FirebaseSignInResponse>
}

export async function signInWithCustomTokenServer(token: string) {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY

  if (!apiKey) {
    throw new Error("Firebase API key is not configured")
  }

  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        returnSecureToken: true,
      }),
      cache: "no-store",
    }
  )

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error?.error?.message || "FIREBASE_CUSTOM_TOKEN_SIGN_IN_FAILED")
  }

  return response.json() as Promise<FirebaseCustomTokenResponse>
}
