import * as Ably from "ably";
import { NextRequest, NextResponse } from "next/server";
import { authenticate } from "@/lib/auth-middleware";

/**
 * Ably Token Authentication Route.
 * This endpoint provides a temporary token to the frontend, which allows 
 * the frontend to connect to Ably without knowing the Root API Key.
 */
export async function GET(req: NextRequest) {
  // Ensure the user is logged in before issuing a token
  const authResult = await authenticate(req);
  if (authResult instanceof NextResponse) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.ABLY_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Ably API Key not configured on server" }, { status: 500 });
  }

  try {
    const client = new Ably.Rest(apiKey);
    
    // Create a Token Request for the user. We can limit their capability here if needed.
    // For now, we allow them to subscribe to their own user-specific channel and the admin channel.
    const tokenRequestData = await client.auth.createTokenRequest({
      clientId: authResult.id,
    });

    console.log(`Issued Ably token for user: ${authResult.email}`);
    return NextResponse.json(tokenRequestData);
  } catch (error) {
    console.error("Ably Auth Error:", error);
    return NextResponse.json({ error: "Failed to create token request" }, { status: 500 });
  }
}
