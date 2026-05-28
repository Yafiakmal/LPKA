import { prisma } from "@/lib/prisma";
import { Prisma, type products } from "@/lib/generated/prisma/client";
import { ProductRepository } from "@/server/repositories/product.repository";

type ProductCreateInput = Omit<
  products,
  | "id"
  | "created_at"
  | "updated_at"
  | "deleted_at"
  | "borrowed"
  | "borrowed_amount"
>;
type ProductUpdateInput = Partial<
  Omit<products, "id" | "created_at" | "updated_at" | "deleted_at">
>;

export const ProductService = {
  async getAll() {
    return await ProductRepository.findAll();
  },
  async getById(id: number) {
    const product = await ProductRepository.findById(id);
    if (!product) throw new Error(`Product with id ${id} not found`);
    return product;
  },
  async create(data: ProductCreateInput) {
    return await ProductRepository.create({
      name: data.name,
      stock: data.stock,
      unit: {
        connect: {
          id: data.unit_id,
        },
      },
    });
  },
  async update(id: number, data: ProductUpdateInput) {
    return await ProductRepository.update(id, data);
  },
  async delete(id: number) {
    await ProductRepository.softDelete(id);
  },
};
