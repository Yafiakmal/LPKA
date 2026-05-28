import { NextRequest } from "next/server";
import { z } from "zod";
import { TakingService } from "@/server/services/taking.service";
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
    const taking = await TakingService.getById(Number(id));
    return ok(taking, "Taking retrieved successfully");
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

    const taking = await TakingService.update(user.id, Number(id), result.data);
    return ok(taking, "Taking updated successfully");
  } catch (err: any) {
    return error(err.message ?? "Gagal update pengambilan", err.statusCode ?? 500);
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
    await TakingService.delete(user.id, Number(id));
    return ok(null, "Taking deleted successfully");
  } catch (err: any) {
    return error(err.message ?? "Gagal hapus pengambilan", err.statusCode ?? 500);
  }
}
