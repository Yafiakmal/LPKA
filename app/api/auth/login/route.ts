import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { z } from "zod";
import { AuthService } from "@/server/services/auth.service";
import { ok, error } from "@/lib/auth";

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

// Durasi session: 7 hari (sama dengan auth.service.ts)
const SESSION_DURATION = 60 * 60 * 24 * 7;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return error(
        "Username dan password wajib diisi",
        400,
        result.error.flatten(),
      );
    }

    const { username, password } = result.data;
    const token = await AuthService.login(username, password);
    const user = await AuthService.me(token);

    const cookieStore = await cookies();
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      maxAge: SESSION_DURATION,
      path: "/",
    };

    // Cookie utama — token untuk autentikasi
    cookieStore.set("auth_token", token, cookieOptions);

    // Cookie expiry — dibaca middleware untuk cek expired tanpa query DB
    // Isi: Unix timestamp (detik) kapan token expired
    const expiresAt = Math.floor(Date.now() / 1000) + SESSION_DURATION;
    cookieStore.set("auth_expires", String(expiresAt), cookieOptions);

    return ok({ user }, "Login successfully");
  } catch (err: any) {
    if (err.statusCode === 404) {
      return error("Username atau password salah", 401);
    }
    return error("Internal server error", 500);
  }
}
