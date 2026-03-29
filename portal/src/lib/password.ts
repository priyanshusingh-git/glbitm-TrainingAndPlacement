import * as crypto from 'crypto';

/**
 * Generates a cryptographically strong password with guaranteed character class diversity.
 * Uses crypto.randomInt() for all randomness (not Math.random()).
 */
export function generateStrongPassword(length = 12): string {
 const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
 const lowercase = 'abcdefghijklmnopqrstuvwxyz';
 const digits = '0123456789';
 const special = '!@#$%^&*()_+';
 const charset = lowercase + uppercase + digits + special;

 // Guarantee at least one character from each class
 let password = '';
 password += uppercase.charAt(crypto.randomInt(0, uppercase.length));
 password += lowercase.charAt(crypto.randomInt(0, lowercase.length));
 password += digits.charAt(crypto.randomInt(0, digits.length));
 password += special.charAt(crypto.randomInt(0, special.length));

 // Fill remaining length from the full charset
 for (let i = 4; i < length; i++) {
 password += charset.charAt(crypto.randomInt(0, charset.length));
 }

 // Fisher-Yates shuffle using crypto.randomInt
 const arr = password.split('');
 for (let i = arr.length - 1; i > 0; i--) {
 const j = crypto.randomInt(0, i + 1);
 [arr[i], arr[j]] = [arr[j], arr[i]];
 }

 return arr.join('');
}
