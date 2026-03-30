
export const checkPasswordStrength = (value: string) => {
 let score = 0
 const requirements = {
 length: value.length >= 8,
 uppercase: /[A-Z]/.test(value),
 lowercase: /[a-z]/.test(value),
 number: /[0-9]/.test(value),
 special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value),
 }

 if (requirements.length) score += 20
 if (requirements.uppercase) score += 20
 if (requirements.lowercase) score += 20
 if (requirements.number) score += 20
 if (requirements.special) score += 20

 return { score, requirements }
}

export const validateStrongPassword = (value: string): string | null => {
 const { requirements } = checkPasswordStrength(value)

 if (!requirements.length) return"Password must be at least 8 characters long."
 if (!requirements.uppercase) return"Include at least one uppercase letter."
 if (!requirements.lowercase) return"Include at least one lowercase letter."
 if (!requirements.number) return"Include at least one number."
 if (!requirements.special) return"Include at least one special character."

 return null
}

/**
 * Common application-wide validators
 */
export const validators = {
 email: (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
 mobile: (mobile: string) => /^[0-9]{10}$/.test(mobile),
 pincode: (pincode: string) => /^[0-9]{6}$/.test(pincode),
 name: (name: string) => /^[a-zA-Z\s]{2,}$/.test(name.trim()), // At least 2 chars, alphabets only
 percentage: (val: string | number) => {
 const num = parseFloat(val.toString());
 return !isNaN(num) && num >= 0 && num <= 100;
 },
 sgpa: (val: string | number) => {
 const num = parseFloat(val.toString());
 return !isNaN(num) && num >= 0 && num <= 10.0;
 },
 marks: (val: string | number) => {
 const num = parseFloat(val.toString());
 return !isNaN(num) && num >= 0;
 }
};
