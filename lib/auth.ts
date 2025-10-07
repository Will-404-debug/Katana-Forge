import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_EXPIRY = "7d";

export type AuthTokenPayload = {
  sub: string;
};

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("Missing JWT_SECRET environment variable");
  }

  return secret;
}

export async function hashPassword(password: string) {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function createAuthToken(userId: string) {
  const payload: AuthTokenPayload = { sub: userId };
  return jwt.sign(payload, getJwtSecret(), { expiresIn: JWT_EXPIRY });
}

export function decodeAuthToken(token: string) {
  try {
    return jwt.verify(token, getJwtSecret()) as AuthTokenPayload;
  } catch {
    return null;
  }
}
