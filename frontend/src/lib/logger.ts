/**
 * Development-only logging utility
 * Prevents sensitive error information from appearing in production logs
 */

export const logger = {
 error: (message: string, error?: unknown) => {
 if (process.env.NODE_ENV === 'development') {
 console.error(message, error);
 }
 // In production, you could send to error tracking service (Sentry, etc.)
 },

 warn: (message: string, data?: unknown) => {
 if (process.env.NODE_ENV === 'development') {
 console.warn(message, data);
 }
 },

 info: (message: string, data?: unknown) => {
 if (process.env.NODE_ENV === 'development') {
 console.log(message, data);
 }
 }
};
