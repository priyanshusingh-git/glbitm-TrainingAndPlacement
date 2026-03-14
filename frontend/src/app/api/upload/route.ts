import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth-middleware';
import { PutObjectCommand } from"@aws-sdk/client-s3";
import { r2 } from"@/lib/r2";

const ALLOWED_TYPES = [
 'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
 'application/pdf',
 'application/msword',
 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
 'application/vnd.ms-excel',
 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export async function POST(req: NextRequest) {
 // 1. Authentication check
 const authResult = await authenticate(req);
 if (authResult instanceof NextResponse) return authResult;

 try {
 const formData = await req.formData();
 const file = formData.get('file') as File;
 const type = formData.get('type') as string || 'uploads'; // profile-images, resumes, company-logos, etc.

 if (!file) {
 return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
 }

 // 2. File type validation
 if (!ALLOWED_TYPES.includes(file.type)) {
 return NextResponse.json(
 { error: `File type"${file.type}" is not allowed. Accepted: images, PDFs, and documents.` },
 { status: 400 }
 );
 }

 // 3. File size validation
 if (file.size > MAX_FILE_SIZE) {
 return NextResponse.json(
 { error: `File size exceeds the 5 MB limit.` },
 { status: 400 }
 );
 }

 // 4. Determine key structure
 const fileExt = file.name.split('.').pop();
 const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

 let key = `${type}/${fileName}`;
 if (type === 'profile-images' || type === 'resumes') {
 key = `${type}/${authResult.id}/${fileName}`;
 }

 // 5. Upload to Cloudflare R2
 const buffer = Buffer.from(await file.arrayBuffer());

 await r2.send(
 new PutObjectCommand({
 Bucket: process.env.R2_BUCKET_NAME!,
 Key: key,
 Body: buffer,
 ContentType: file.type,
 })
 );

 // 6. Return the key (or public URL if configured)
 // Note: For R2, often we store the key in DB and serve via a custom worker or public domain
 // For simplicity, we'll return the key which can be used to construct the URL
 return NextResponse.json({
 key,
 url: `https://pub-eb3f518e384b4c7ca56b8e6cd7d7e6d2.r2.dev/${key}` // Example public URL (should be env var)
 });

 } catch (error: any) {
 console.error('R2 Upload Error:', error);
 return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
 }
}
