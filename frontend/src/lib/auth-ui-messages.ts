type AuthErrorLike = {
  code?: string
  status?: number
  retryAfter?: number
  requestId?: string
  detail?: string
  message?: string
}

type Role = "STUDENT" | "ADMIN" | "TRAINER" | "RECRUITER"
type AuthFlow = "login" | "forgot-password" | "verify-otp" | "reset-password" | "change-password"

const ROLE_LABELS: Record<Role, string> = {
  STUDENT: "Student",
  ADMIN: "T&P Admin",
  TRAINER: "CDC Trainer",
  RECRUITER: "Recruiter",
}

function formatRetryAfter(retryAfter?: number) {
  if (!retryAfter || retryAfter <= 0) {
    return null
  }

  if (retryAfter < 60) {
    return `${retryAfter} second${retryAfter === 1 ? "" : "s"}`
  }

  const minutes = Math.ceil(retryAfter / 60)
  if (minutes < 60) {
    return `${minutes} minute${minutes === 1 ? "" : "s"}`
  }

  const hours = Math.ceil(minutes / 60)
  return `${hours} hour${hours === 1 ? "" : "s"}`
}

function appendRequestId(message: string, requestId?: string) {
  if (!requestId) {
    return message
  }

  return `${message} Reference ID: ${requestId}.`
}

export function consumeSessionExpiredFlag() {
  if (typeof window === "undefined") {
    return false
  }

  const expired = sessionStorage.getItem("sessionExpired") === "true"
  if (expired) {
    sessionStorage.removeItem("sessionExpired")
  }

  return expired
}

export function getAuthErrorMessage(
  error: AuthErrorLike | null | undefined,
  options: {
    flow: AuthFlow
    role?: Role
  }
) {
  const code = error?.code
  const retryAfter = formatRetryAfter(error?.retryAfter)

  switch (options.flow) {
    case "login": {
      const roleLabel = options.role ? ROLE_LABELS[options.role] : "selected"

      switch (code) {
        case "AUTH_FAILED":
          return `We could not sign you in to the ${roleLabel} portal. Check your email and password and try again.`
        case "ROLE_MISMATCH":
          return `This account is not registered for the ${roleLabel} portal. Choose the correct portal and try again.`
        case "CAPTCHA_REQUIRED":
          return "Complete the security challenge and try signing in again."
        case "CSRF_INVALID":
          return "Your security check expired. Refresh the page and try signing in again."
        case "RATE_LIMITED":
          return retryAfter
            ? `Too many sign-in attempts were detected. Try again in about ${retryAfter}.`
            : "Too many sign-in attempts were detected. Please wait a bit and try again."
        case "ACCOUNT_SUSPENDED":
          return error?.detail || "This account is suspended. Contact the T&P office for help."
        case "UNAUTHORIZED":
        case "INVALID_SESSION":
          return "Your session has expired. Please sign in again."
        case "VALIDATION_ERROR":
          return "Enter a valid email address and password before signing in."
        case "INTERNAL_ERROR":
          return appendRequestId(
            "We could not complete sign-in right now. Please try again in a moment.",
            error?.requestId
          )
        default:
          return error?.detail || error?.message || "We could not sign you in right now. Please try again."
      }
    }

    case "forgot-password":
      switch (code) {
        case "CSRF_INVALID":
          return "Your security check expired. Refresh the page and request a new verification code."
        case "VALIDATION_ERROR":
          return "Enter the email address registered with your account."
        case "RATE_LIMITED":
          return retryAfter
            ? `Too many reset requests were made. Try again in about ${retryAfter}.`
            : "Too many reset requests were made. Please wait before trying again."
        case "ACCOUNT_SUSPENDED":
          return "This account is currently restricted. Contact the T&P office for help."
        case "INTERNAL_ERROR":
          return appendRequestId(
            "We could not start password recovery right now. Please try again shortly.",
            error?.requestId
          )
        default:
          return error?.detail || error?.message || "We could not start password recovery right now."
      }

    case "verify-otp":
      switch (code) {
        case "CSRF_INVALID":
          return "Your security check expired. Refresh the page and request a new verification code."
        case "VALIDATION_ERROR":
          return "Enter your registered email address and the full 6-digit verification code."
        case "OTP_INVALID":
          return "The verification code is invalid or has expired. Request a new code and try again."
        case "INTERNAL_ERROR":
          return appendRequestId(
            "We could not verify your code right now. Please try again.",
            error?.requestId
          )
        default:
          return error?.detail || error?.message || "We could not verify that code. Please try again."
      }

    case "reset-password":
    case "change-password":
      switch (code) {
        case "CSRF_INVALID":
          return "Your security check expired. Refresh the page and submit the form again."
        case "VALIDATION_ERROR":
          return "Review the required fields and try again."
        case "PASSWORD_WEAK":
          return error?.detail || "Choose a stronger password and try again."
        case "PASSWORD_PWNED":
          return "This password has appeared in known data breaches. Choose a different password."
        case "PASSWORD_EMAIL_MATCH":
          return "Your password cannot be the same as your email address."
        case "PASSWORD_VALIDATION_UNAVAILABLE":
        case "PASSWORD_CHECK_UNAVAILABLE":
          return "Password safety checks are temporarily unavailable. Please try again shortly."
        case "RESET_TOKEN_INVALID":
          return "Your reset link or verification session is no longer valid. Start the password reset process again."
        case "PASSWORD_CHANGE_FAILED":
          return appendRequestId(
            "We could not update your password right now. Please try again shortly.",
            error?.requestId
          )
        case "UNAUTHORIZED":
        case "INVALID_SESSION":
          return "Your session has expired. Please sign in again."
        case "INTERNAL_ERROR":
          return appendRequestId(
            "We could not complete this password update right now. Please try again shortly.",
            error?.requestId
          )
        default:
          return error?.detail || error?.message || "We could not update your password right now."
      }
  }
}
