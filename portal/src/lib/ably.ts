import * as Ably from "ably";

/**
 * Ably Server-side client for API routes.
 * Used to trigger (publish) events from the backend to the frontend.
 * NOTE: The browser-side singleton lives in @/contexts/ably-context.tsx (getAblyClient).
 */
export const getAblyServerClient = () => {
  const apiKey = process.env.ABLY_API_KEY;
  if (!apiKey) {
    console.error("ABLY_API_KEY is not defined. Real-time updates will be skipped.");
    return null;
  }
  return new Ably.Rest({ key: apiKey });
};

