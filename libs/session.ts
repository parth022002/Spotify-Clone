import { createHmac } from "crypto";

const SESSION_SECRET = process.env.SESSION_SECRET || "default_spotify_clone_session_secret_key_123456";

export function signSession(userId: string): string {
  const hmac = createHmac("sha256", SESSION_SECRET);
  hmac.update(userId);
  const signature = hmac.digest("hex");
  return `${userId}.${signature}`;
}

export function verifySession(token: string): string | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [userId, signature] = parts;
  
  const hmac = createHmac("sha256", SESSION_SECRET);
  hmac.update(userId);
  const expectedSignature = hmac.digest("hex");
  
  if (signature === expectedSignature) {
    return userId;
  }
  return null;
}
