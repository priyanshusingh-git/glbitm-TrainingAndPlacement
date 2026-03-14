import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

/**
 * [MIGRATED] This route is now mostly handled client-side by Firebase.
 * We return a 404 or a redirect as Firebase's standard password reset flow is used.
 * If the application has a custom reset UI, it should use Firebase's confirmPasswordReset.
 */
export async function POST(req: NextRequest) {
 logger.info('Reset Password request received. Redirecting to standard Firebase flow or handled client-side.');
 return NextResponse.json({
 message: 'Please use the password reset link sent to your email to reset your password via the official flow.'
 }, { status: 200 });
}
