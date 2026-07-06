import * as admin from 'firebase-admin';
import { cookies } from 'next/headers';
import * as fs from 'fs';
import * as path from 'path';

export function getAdminAuth() {
    if (!admin.apps.length) {
        try {
            // Try loading from the service account JSON file first (most reliable for local dev,
            // avoids .env.local private key escaping issues that corrupt the PEM key)
            const serviceAccountPath = path.join(process.cwd(), 'krishna-naturals-62da4-firebase-adminsdk-fbsvc-c478f7b2cc.json');

            if (fs.existsSync(serviceAccountPath)) {
                 
                const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
                if (serviceAccount.private_key) {
                    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
                }
                admin.initializeApp({
                    credential: admin.credential.cert(serviceAccount),
                });
                console.log("Firebase Admin Initialized successfully (from service account JSON file).");
            } else {
                // Fall back to environment variables (production deployments)
                let privateKey = process.env.FIREBASE_PRIVATE_KEY || '';
                if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
                    privateKey = privateKey.slice(1, -1);
                }
                privateKey = privateKey.replace(/\\n/g, '\n');

                admin.initializeApp({
                    credential: admin.credential.cert({
                        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
                        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                        privateKey: privateKey,
                    }),
                });
                console.log("Firebase Admin Initialized successfully (from env vars).");
            }
        } catch (error) {
            console.error("Firebase Admin Initialization Error", error);
        }
    }
    return admin.auth();
}

export async function verifySessionUser() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('__admin_session')?.value;
        if (!token) return null;
        
        const decodedToken = await getAdminAuth().verifySessionCookie(token, true);
        return decodedToken;
    } catch (error) {
        console.error("Failed to verify session token:", error);
        return null;
    }
}

export function isAdminEmail(email?: string) {
    if (!email) return false;
    const cleanEmail = email.toLowerCase().trim();
    const adminDomain = (process.env.NEXT_PUBLIC_ADMIN_DOMAIN || "@krishnanaturals.co.in").toLowerCase().trim();
    const envAdmin = process.env.NEXT_PUBLIC_ADMIN_EMAIL?.toLowerCase().trim();
    const allowedEmails = envAdmin ? [envAdmin] : [];
    
    return (
        cleanEmail.endsWith(adminDomain) ||
        allowedEmails.includes(cleanEmail)
    );
}

export async function verifyApiToken(req: Request) {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) return null;
    
    const token = authHeader.split('Bearer ')[1];
    try {
        const decodedToken = await getAdminAuth().verifyIdToken(token);
        return decodedToken;
    } catch (error) {
        console.error("Failed to verify API token:", error);
        return null;
    }
}
