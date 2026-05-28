import { NextRequest } from "next/server";
import { z } from "zod";

import { AuthService } from "@/server/services/auth.service";
import { ok, error } from "@/lib/auth";
import { ConflictError } from "@/server/utils/AppError";

const registerSchema = z.object({
  username: z
    .string()
    .min(3, "Username minimal 3 karakter")
    .max(100, "Username terlalu panjang"),

  password: z
    .string()
    .min(8, "Password minimal 8 karakter")
    .max(100, "Password terlalu panjang"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return error("Validasi gagal", 400, result.error.flatten());
    }

    const { username, password } = result.data;

    await AuthService.register(username, password);

    return ok(null, "Register berhasil", 201);
  } catch (err: any) {
    if (err instanceof ConflictError) {
      return error("Username sudah digunakan", 409);
    }
    console.info(err);
    return error("Internal server error", 500, err);
  }
}
