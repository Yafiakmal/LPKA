import { NextRequest } from "next/server";
import { z } from "zod";
import { ProductService } from "@/server/services/product.service";
import { getAuthUser, ok, unauthorized, forbidden, error } from "@/lib/auth";

const createSchema = z.object({
  name: z.string().min(1),
  stock: z.number().min(0),
  unit_id: z.number().positive(),
});

export async function GET() {
  try {
    const products = await ProductService.getAll();
    return ok(products, "Products retrieved successfully");
  } catch (err) {
    return error("Gagal mengambil data produk", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return unauthorized();
    if (user.role !== 1) return forbidden(); // role 1 = admin

    const body = await request.json();
    const result = createSchema.safeParse(body);
    if (!result.success) {
      return error("Data tidak valid", 400, result.error.flatten());
    }

    const product = await ProductService.create(result.data);
    return ok(product, "Product created successfully", 201);
  } catch (err: any) {
    return error(err.message ?? "Gagal membuat produk", err.statusCode ?? 500);
  }
}
