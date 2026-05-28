import { NextRequest } from "next/server";
import { z } from "zod";
import { ProductService } from "@/server/services/product.service";
import { getAuthUser, ok, unauthorized, forbidden, error } from "@/lib/auth";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  stock: z.number().min(0).optional(),
  unit_id: z.number().positive().optional(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const product = await ProductService.getById(Number(id));
    return ok(product, "Product retrieved successfully");
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
    if (user.role !== 1) return forbidden();

    const { id } = await params;
    const body = await request.json();
    const result = updateSchema.safeParse(body);
    if (!result.success) {
      return error("Data tidak valid", 400, result.error.flatten());
    }

    const product = await ProductService.update(Number(id), result.data);
    return ok(product, "Product updated successfully");
  } catch (err: any) {
    return error(err.message ?? "Gagal update produk", err.statusCode ?? 500);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getAuthUser();
    if (!user) return unauthorized();
    if (user.role !== 1) return forbidden();

    const { id } = await params;
    await ProductService.delete(Number(id));
    return ok(null, "Product deleted successfully");
  } catch (err: any) {
    return error(err.message ?? "Gagal hapus produk", err.statusCode ?? 500);
  }
}
