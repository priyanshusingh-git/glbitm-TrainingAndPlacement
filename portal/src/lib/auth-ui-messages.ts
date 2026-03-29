type AuthErrorLike = {
  code?: string
  status?: number
  retryAfter?: number
  requestId?: string
  detail?: string
  message?: string
}

type AuthFlow = "login" | "forgot-password" | "verify-otp" | "reset-password" | "change-password"

function formatRetryAfter(retryAfter?: number) {
  if (!retryAfter || retryAfter <= 0) return null
  if (retryAfter < 60) return `${retryAfter} second${retryAfter === 1 ? "" : "s"}`
  const minutes = Math.ceil(retryAfter / 60)
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"}`
  const hours = Math.ceil(minutes / 60)
  return `${hours} hour${hours === 1 ? "" : "s"}`
}

function appendRequestId(message: string, requestId?: string) {
  if (!requestId) return message
  return `${message} (Ref: ${requestId})`
}

export function consumeSessionExpiredFlag() {
  if (typeof window === "undefined") return false
  const expired = sessionStorage.getItem("sessionExpired") === "true"
  if (expired) sessionStorage.removeItem("sessionExpired")
  return expired
}

/**
 * Industry-standard error messages.
 *
 * Key principles:
 *  1. Never reveal whether an email exists (enumeration protection)
 *  2. Never expose internal system details (role names, DB errors)
 *  3. Always provide a clear next-step for the user
 *  4. Use consistent, human-friendly language
 */
export function getAuthErrorMessage(
  error: AuthErrorLike | null | undefined,
  options: { flow: AuthFlow }
) {
  const code = error?.code
  const retryAfter = formatRetryAfter(error?.retryAfter)

  switch (options.flow) {
    case "login": {
      switch (code) {
        case "AUTH_FAILED":
          return "The email or password you entered is incorrect. Please try again."
        case "CAPTCHA_REQUIRED":
          return "Please complete the security challenge to continue."
        case "CSRF_INVALID":
          return "Your session security token has expired. Please refresh the page and try again."
        case "RATE_LIMITED":
          return retryAfter
            ? `Too many sign-in attempts. Please try again in ${retryAfter}.`
            : "Too many sign-in attempts. Please wait a moment and try again."
        case "ACCOUNT_SUSPENDED":
          return error?.detail || "Your account has been temporarily locked. Please contact support."
        case "UNAUTHORIZED":
        case "INVALID_SESSION":
          return "Your session has expired. Please sign in again."
        case "VALIDATION_ERROR":
          return "Please enter a valid email address and password."
        case "INTERNAL_ERROR":
          return appendRequestId(
            "Something went wrong on our end. Please try again in a moment.",
            error?.requestId
          )
        default:
          return error?.detail || "Something went wrong. Please try again."
      }
    }

    case "forgot-password":
      switch (code) {
        case "CSRF_INVALID":
          return "Your session security token has expired. Please refresh the page and try again."
        case "VALIDATION_ERROR":
          return "Please enter the email address associated with your account."
        case "RATE_LIMITED":
          return retryAfter
            ? `Too many reset requests. Please try again in ${retryAfter}.`
            : "Too many reset requests. Please wait before trying again."
        case "ACCOUNT_SUSPENDED":
          return "This account has been temporarily locked. Please contact support."
        case "INTERNAL_ERROR":
          return appendRequestId(
            "Something went wrong on our end. Please try again shortly.",
            error?.requestId
          )
        default:
          return error?.detail || "Something went wrong. Please try again."
      }

    case "verify-otp":
      switch (code) {
        case "CSRF_INVALID":
          return "Your session security token has expired. Please refresh the page and request a new code."
        case "VALIDATION_ERROR":
          return "Please enter your email address and the full 6-digit verification code."
        case "OTP_INVALID":
          return "The verification code is incorrect or has expired. Please request a new one."
        case "INTERNAL_ERROR":
          return appendRequestId(
            "Something went wrong verifying your code. Please try again.",
            error?.requestId
          )
        default:
          return error?.detail || "Verification failed. Please try again."
      }

    case "reset-password":
    case "change-password":
      switch (code) {
        case "CSRF_INVALID":
          return "Your session security token has expired. Please refresh the page and try again."
        case "VALIDATION_ERROR":
          return "Please review the form fields and try again."
        case "PASSWORD_WEAK":
          return error?.detail || "Please choose a stronger password."
        case "PASSWORD_PWNED":
          return "This password has appeared in a known data breach. Please choose a different one."
        case "PASSWORD_EMAIL_MATCH":
          return "Your password cannot be the same as your email address."
        case "PASSWORD_VALIDATION_UNAVAILABLE":
        case "PASSWORD_CHECK_UNAVAILABLE":
          return "Password safety checks are temporarily unavailable. Please try again shortly."
        case "RESET_TOKEN_INVALID":
          return "This reset link has expired or is no longer valid. Please start the password reset process again."
        case "PASSWORD_CHANGE_FAILED":
          return appendRequestId(
            "We couldn't update your password right now. Please try again shortly.",
            error?.requestId
          )
        case "UNAUTHORIZED":
        case "INVALID_SESSION":
          return "Your session has expired. Please sign in again."
        case "INTERNAL_ERROR":
          return appendRequestId(
            "Something went wrong on our end. Please try again shortly.",
            error?.requestId
          )
        default:
          return error?.detail || "Something went wrong. Please try again."
      }
  }
}
