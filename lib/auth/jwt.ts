import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "skilljobs-default-secret-production-key-change-me-123456789";
const secretKey = new TextEncoder().encode(JWT_SECRET);

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  role: "ADMIN" | "AFFILIATE" | "STUDENT";
  status: "ACTIVE" | "SUSPENDED" | "PENDING";
  marketerId?: string;
  referralCode?: string;
}

export async function signToken(payload: SessionPayload, expiresIn = "7d"): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secretKey);
}

export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}
