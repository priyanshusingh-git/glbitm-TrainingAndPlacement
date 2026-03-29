import { NextRequest, NextResponse } from 'next/server';
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { r2 } from "@/lib/r2";
import { authenticate } from "@/lib/auth-middleware";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> | { path: string[] } }
) {
    // 0. Handle potentially asynchronous params (Next.js 15+)
    const resolvedParams = await params;
    const pathSegments = resolvedParams.path;
    
    if (!pathSegments || pathSegments.length === 0) {
        return new NextResponse('No path provided', { status: 400 });
    }

    const path = pathSegments.join('/');
    console.log(`[R2 Proxy] Fetching: ${path}`);
    
    // 1. Security Logic
    // Profile images and company logos are public
    // Profile images, company logos, and general uploads are public
    const isPublic = path.startsWith('profile-images/') || 
                     path.startsWith('company-logos/') || 
                     path.startsWith('uploads/');
    
    if (!isPublic) {
        console.log(`[R2 Proxy] Private file requested, authenticating...`);
        // Require authentication for everything else (resumes, etc.)
        const authResult = await authenticate(request);
        if (authResult instanceof NextResponse) {
            console.log(`[R2 Proxy] Authentication failed`);
            return authResult;
        }
    }

    try {
        const command = new GetObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME!,
            Key: path,
        });

        const response = await r2.send(command);

        if (!response.Body) {
            console.error(`[R2 Proxy] File not found in bucket: ${path}`);
            return new NextResponse('File not found', { status: 404 });
        }

        // Convert ReadableStream to Response
        const stream = response.Body as ReadableStream;
        
        return new NextResponse(stream, {
            headers: {
                'Content-Type': response.ContentType || 'application/octet-stream',
                'Cache-Control': 'public, max-age=31536000, immutable',
                'Content-Length': response.ContentLength?.toString() || '',
            },
        });
    } catch (error: any) {
        console.error(`[R2 Proxy] Error fetching ${path}:`, error.message);
        return new NextResponse('Error fetching file', { status: 500 });
    }
}
