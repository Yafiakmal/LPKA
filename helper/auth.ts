import { cookies } from "next/headers";
import { prisma } from "../lib/prisma";
import argon2 from "argon2";
import { NextResponse } from "next/server";

export interface AuthUser {
  id: number;
  username: string;
  role: number;
}

// Ambil user dari cookie auth_token — dipakai di route handlers
export async function getAuthUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    if (!token) return null;

    const [selector, validator] = token.split(".");
    if (!selector || !validator) return null;

    const session = await prisma.user_sessions.findFirst({
      where: { selector, revoked_at: null },
    });
    if (!session) return null;

    if (new Date() > session.expired_at) {
      await prisma.user_sessions.update({
        where: { selector },
        data: { revoked_at: new Date() },
      });
      return null;
    }

    const isValid = await argon2.verify(session.validator_hash, validator);
    if (!isValid) return null;

    const user = await prisma.user.findUnique({
      where: { id: session.user_id, deleted_at: null },
      include: { user_role: { select: { name: true } } },
    });
    if (!user) return null;

    return { id: user.id, username: user.username, role: user.user_role_id };
  } catch {
    return null;
  }
}

// Helper: return 401 response jika tidak authenticated
export function unauthorized() {
  return NextResponse.json(
    { success: false, message: "Unauthorized" },
    { status: 401 },
  );
}

// Helper: return 403 jika bukan admin
export function forbidden() {
  return NextResponse.json(
    { success: false, message: "Forbidden: Admin only" },
    { status: 403 },
  );
}

// Helper: return response sukses
export function ok<T>(data: T, message = "Success", status = 200) {
  return NextResponse.json({ success: true, message, data }, { status });
}

// Helper: return response error
export function error(message: string, status = 500, errors?: unknown) {
  return NextResponse.json({ success: false, message, errors }, { status });
}
