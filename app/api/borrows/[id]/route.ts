import { NextRequest } from "next/server";
import { z } from "zod";
import { BorrowService } from "@/server/services/borrow.service";
import { getAuthUser, ok, unauthorized, error } from "@/lib/auth";

const updateSchema = z.object({
  amount: z.number().positive().optional(),
  product_id: z.number().positive().optional(),
  description: z.string().nullable().optional(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const borrow = await BorrowService.getById(BigInt(id));
    return ok(borrow, "Borrow retrieved successfully");
  } catch (err: any) {
    return error(err.message ?? "Tidak ditemukan", err.statusCode ?? 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getAuthUser();
    if (!user) return unauthorized();

    const { id } = await params;
    const body = await request.json();
    const result = updateSchema.safeParse(body);
    if (!result.success) {
      return error("Data tidak valid", 400, result.error.flatten());
    }

    const borrow = await BorrowService.update(user.id, BigInt(id), result.data);
    return ok(borrow, "Borrow updated successfully");
  } catch (err: any) {
    return error(err.message ?? "Gagal update peminjaman", err.statusCode ?? 500);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getAuthUser();
    if (!user) return unauthorized();

    const { id } = await params;
    await BorrowService.delete(user.id, BigInt(id));
    return ok(null, "Borrow deleted successfully");
  } catch (err: any) {
    return error(err.message ?? "Gagal hapus peminjaman", err.statusCode ?? 500);
  }
}
