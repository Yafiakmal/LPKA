import { NextRequest } from "next/server";
import { z } from "zod";
import { BorrowService } from "@/server/services/borrow.service";
import { getAuthUser, ok, unauthorized, error } from "@/lib/auth";

const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  sortBy: z.enum(["created_at", "updated_at"]).default("updated_at"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

const createSchema = z.object({
  amount: z.number().positive(),
  product_id: z.number().positive(),
  description: z.string().nullable().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const params = querySchema.parse(Object.fromEntries(searchParams));
    const borrows = await BorrowService.getAll(params);
    return ok(borrows, "Borrows retrieved successfully");
  } catch (err) {
    console.info(err);
    return error("Gagal mengambil data peminjaman", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return unauthorized();

    const body = await request.json();
    const result = createSchema.safeParse(body);
    if (!result.success) {
      return error("Data tidak valid", 400, result.error.flatten());
    }

    const borrow = await BorrowService.create(user.id, result.data);
    return ok(borrow, "Borrow created successfully", 201);
  } catch (err: any) {
    return error(
      err.message ?? "Gagal membuat peminjaman",
      err.statusCode ?? 500,
    );
  }
}
