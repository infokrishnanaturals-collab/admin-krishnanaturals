import {
    GoogleAuthProvider,
    signInWithPopup,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    sendSignInLinkToEmail,
    isSignInWithEmailLink,
    signInWithEmailLink,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    sendEmailVerification,
    sendPasswordResetEmail as firebaseSendPasswordResetEmail,
    User,
} from 'firebase/auth';
import { auth } from './config';

// Google One Tap / Popup Sign In
export async function signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const result = await signInWithPopup(auth, provider);
    const idToken = await result.user.getIdToken();
    // Send token to server to create session cookie
    await fetch(process.env.NEXT_PUBLIC_API_URL + '/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
    });
    return result.user;
}

// Email + Password Sign In
export async function signInWithEmail(email: string, password: string) {
    const result = await signInWithEmailAndPassword(auth, email, password);

    // We removed strict email verification for "Extra Easy Login"
    // Now users can log in immediately without verifying their email first.

    const idToken = await result.user.getIdToken();
    await fetch(process.env.NEXT_PUBLIC_API_URL + '/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
    });
    return result.user;
}

export async function signUpWithEmail(email: string, password: string) {
    const result = await createUserWithEmailAndPassword(auth, email, password);

    // Send custom rich-HTML verification email via Resend
    const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/auth/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: result.user.email })
    });

    if (!res.ok) {
        const data = await res.json();
        console.error("Failed to dispatch custom verification email", data);
    }

    // We let them log in immediately (Extra Easy Login)
    const idToken = await result.user.getIdToken();
    await fetch(process.env.NEXT_PUBLIC_API_URL + '/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
    });

    return result.user;
}

// Password Reset
export async function sendPasswordReset(email: string) {
    const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/auth/send-password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to send password reset link");
}

// Magic Link - Send
export async function sendMagicLink(email: string) {
    const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/auth/send-magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to send magic link");
    window.localStorage.setItem('emailForSignIn', email);
}

// Magic Link - Complete
export async function completeMagicLinkSignIn() {
    if (!isSignInWithEmailLink(auth, window.location.href)) return null;
    let email = window.localStorage.getItem('emailForSignIn');
    if (!email) {
        email = window.prompt('Please provide your email for confirmation');
    }
    if (!email) return null;
    const result = await signInWithEmailLink(auth, email, window.location.href);
    window.localStorage.removeItem('emailForSignIn');
    const idToken = await result.user.getIdToken();
    await fetch(process.env.NEXT_PUBLIC_API_URL + '/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
    });
    return result.user;
}

// Sign Out
export async function signOut() {
    await firebaseSignOut(auth);
    await fetch(process.env.NEXT_PUBLIC_API_URL + '/auth/session', { method: 'DELETE' });
}

// Auth State Listener
export function onAuthChange(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, async (user) => {
        if (user) {
            // Auto-refresh the backend session cookie so users stay logged in "forever"
            try {
                const idToken = await user.getIdToken();
                await fetch(process.env.NEXT_PUBLIC_API_URL + '/auth/session', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ idToken }),
                });
            } catch (e) {
                console.error("Auto-session refresh failed", e);
            }
        } else {
            // Ensure backend session is cleared if frontend is logged out
            await fetch(process.env.NEXT_PUBLIC_API_URL + '/auth/session', { method: 'DELETE' });
        }
        callback(user);
    });
}

export { auth };
