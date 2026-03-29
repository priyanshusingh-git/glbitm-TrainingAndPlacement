# Problem 002: Email Validation Fired on Page Load

**Date**: March 2026  
**Severity**: UX / User Shaming  
**Affected Files**: `src/app/(auth)/login/page.tsx`

## Problem
When a student opened the login page and clicked anywhere on the screen (not even the email field), the email input immediately displayed "Please provide a valid email" error message. This "User Shaming" pattern made the form feel aggressive and broken before the user had even started typing.

## Root Cause
The form validation was using an **eager validation** strategy — the `onChange` or `onFocus` events were triggering validation checks immediately. On some browsers, autofocus on the email field would also trigger a validation cycle, causing the error to flash on page load.

## Fix Applied: "Lazy Validation" (Blur-Event Logic)
Replaced eager validation with a **blur-event + touched-state** pattern:

```tsx
// Only show error AFTER user has interacted with the field AND left it
const handleEmailBlur = () => {
  if (email.trim().length > 0) {
    setTouched((prev) => ({ ...prev, email: true }))
    setFieldErrors((prev) => ({ ...prev, email: validateEmail(email) }))
  }
}
```

**Key Rules:**
1. Errors only appear **after the user has typed something AND moved away** (blur event).
2. If the user clicks in and out without typing, **no error is shown** (preventing the "empty shame" issue).
3. On form submit, all fields are force-marked as `touched` and validated simultaneously.

## Result
The form now feels supportive and "patient." Errors only appear when they are genuinely helpful (after the user has attempted input), not as a preemptive accusation.
