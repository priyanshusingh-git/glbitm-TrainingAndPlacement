import * as admin from 'firebase-admin';

if (!admin.apps.length) {
 let privateKey = process.env.FIREBASE_PRIVATE_KEY;
 if (process.env.FIREBASE_PRIVATE_KEY_B64) {
 privateKey = Buffer.from(process.env.FIREBASE_PRIVATE_KEY_B64, 'base64').toString('ascii').replace(/\\n/g, '\n');
 } else if (privateKey) {
 privateKey = privateKey.replace(/\\n/g, '\n').replace(/"/g, '');
 }

 console.log("=== FIREBASE PRIVATE KEY DEBUG ===");
 console.log("LENGTH:", privateKey?.length);
 console.log("FIRST 20 CHARS:", privateKey?.substring(0, 20));
 console.log("LAST 20 CHARS:", privateKey?.substring(privateKey?.length - 20));
 console.log("==================================");

 admin.initializeApp({
 credential: admin.credential.cert({
 projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
 clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
 privateKey: privateKey,
 }),
 });
}

export const authAdmin = admin.auth();
export const dbAdmin = admin.firestore(); // If needed for metadata or separate sync
