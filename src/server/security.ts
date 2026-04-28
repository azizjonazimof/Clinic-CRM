import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { createHash, randomBytes } from "crypto";
import type { Role, SessionUser } from "@/types/domain";

const encoder = new TextEncoder();

function secretKey() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET must be set to at least 32 characters in production.");
  }
  return encoder.encode(secret);
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function randomToken(bytes = 32) {
  return randomBytes(bytes).toString("hex");
}

export function tokenHash(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function signAccessToken(user: SessionUser) {
  return new SignJWT({
    role: user.role,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    permissions: user.permissions,
    clinicIds: user.clinicIds,
    branchIds: user.branchIds
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(secretKey());
}

export async function verifyAccessToken(token: string): Promise<SessionUser> {
  const { payload } = await jwtVerify(token, secretKey());
  return {
    id: String(payload.sub),
    email: String(payload.email),
    firstName: String(payload.firstName),
    lastName: String(payload.lastName),
    role: payload.role as Role,
    permissions: Array.isArray(payload.permissions) ? payload.permissions.map(String) : [],
    clinicIds: Array.isArray(payload.clinicIds) ? payload.clinicIds.map(String) : [],
    branchIds: Array.isArray(payload.branchIds) ? payload.branchIds.map(String) : []
  };
}

