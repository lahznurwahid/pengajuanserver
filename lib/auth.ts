
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";

function getSecretKey() {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error("JWT_SECRET is not set. Set JWT_SECRET in your environment.");
    }

    console.warn('JWT_SECRET not set — using development fallback secret. Set JWT_SECRET in .env.local for production.');
    console.warn('Using fallback secret: dev-secret-please-change');
    return new TextEncoder().encode('dev-secret-please-change');
  }

  console.debug('getSecretKey: using JWT_SECRET from env (length:', jwtSecret.length, ')');
  return new TextEncoder().encode(jwtSecret);
}

// Daftar role yang ada di sistem
export const Roles = {
  PEMOHON: "PEMOHON",
  STAF: "STAF",
  KEPALA_LAB: "KEPALA_LAB",
  WADEK: "WADEK",
  DEKAN: "DEKAN",
  ADMIN_SERVER: "ADMIN_SERVER",
} as const;

// Tipe untuk role, diambil dari Roles
export type Role = (typeof Roles)[keyof typeof Roles];

// Tipe untuk payload JWT yang berisi userId dan role
export type AuthPayload = {
  userId: number;
  role: Role;
};

// Fungsi untuk hash password dengan bcrypt
export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

// Fungsi untuk verifikasi password dengan hash yang ada
export async function verifyPassword(password: string, hashed: string) {
  console.log(password, hashed, 'ini dari auth verify password');
  return bcrypt.compare(password, hashed);
}

// Fungsi untuk membuat JWT token dengan payload
export async function signToken(payload: AuthPayload) {
  try {
    console.debug("signToken: creating token for payload:", payload);
    const secret = getSecretKey();
    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("2h")
      .sign(secret);
    console.debug("signToken: token created successfully");
    return token;
  } catch (err) {
    console.debug("signToken: failed to create token:", err instanceof Error ? err.message : err);
    throw err;
  }
}

// Fungsi untuk verifikasi JWT token dan ambil payload
export async function verifyToken(token: string) {
  try {
    console.debug("verifyToken: attempting to verify token");
    const secret = getSecretKey();
    const { payload } = await jwtVerify(token, secret);
    console.debug("verifyToken: token verified successfully, payload:", payload);
    return payload as AuthPayload;
  } catch (err) {
    console.debug("verifyToken: verification failed with error:", err instanceof Error ? err.message : err);
    throw err;
  }
}

// Fungsi untuk autentikasi request dengan ekstrak token dari header
export async function authenticateRequest(request: Request) {
  const token = extractBearerToken(request);

  if (!token) {
    console.debug("authenticateRequest: no bearer token found in request headers");
    return null;
  }

  try {
    const payload = await verifyToken(token);
    console.debug("authenticateRequest: token verified, payload:", payload);
    return payload;
  } catch (err) {
    console.debug("authenticateRequest: token verification failed:", err?.message || err);
    return null;
  }
}

// Fungsi untuk cek apakah payload punya role yang diizinkan
export function hasRole(payload: AuthPayload, roles: Role[]) {
  return roles.includes(payload.role);
}

// Fungsi untuk hapus password dari objek user sebelum dikirim
export function sanitizeUser(user: { password: string } & Record<string, unknown>) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...safeUser } = user;

  return safeUser;
}

// Fungsi untuk ekstrak Bearer token dari header authorization
export function extractBearerToken(request: Request) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader) {
    return null;
  }

  const [type, token] = authHeader.split(" ");

  if (type !== "Bearer" || !token) {
    return null;
  }

  return token;
}
