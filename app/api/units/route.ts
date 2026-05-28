import { NextRequest } from "next/server";
import { z } from "zod";
import { UnitService } from "@/server/services/unit.service";
import { getAuthUser, ok, unauthorized, forbidden, error } from "@/lib/auth";

const createSchema = z.object({
  name: z.string().min(1),
});

export async function GET() {
  try {
    const units = await UnitService.getAll();
    return ok(units, "Units retrieved successfully");
  } catch (err) {
    return error("Gagal mengambil data unit", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return unauthorized();
    if (user.role !== 1) return forbidden();

    const body = await request.json();
    const result = createSchema.safeParse(body);
    if (!result.success) {
      return error("Data tidak valid", 400, result.error.flatten());
    }

    const unit = await UnitService.create(result.data);
    return ok(unit, "Unit created successfully", 201);
  } catch (err: any) {
    return error(err.message ?? "Gagal membuat unit", err.statusCode ?? 500);
  }
}
