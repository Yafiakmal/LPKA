import { NextRequest } from "next/server";
import { z } from "zod";
import { UnitService } from "@/server/services/unit.service";
import { getAuthUser, ok, unauthorized, forbidden, error } from "@/lib/auth";

const updateSchema = z.object({
  name: z.string().min(1),
});

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

    await UnitService.update(Number(id), result.data);
    return ok(null, "Unit updated successfully");
  } catch (err: any) {
    return error(err.message ?? "Gagal update unit", err.statusCode ?? 500);
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
    await UnitService.delete(Number(id));
    return ok(null, "Unit deleted successfully");
  } catch (err: any) {
    return error(err.message ?? "Gagal hapus unit", err.statusCode ?? 500);
  }
}
