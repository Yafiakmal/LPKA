import { Prisma, type products } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";

type TransactionClient = Parameters<
  Parameters<typeof prisma.$transaction>[0]
>[0];

export const ProductRepository = {
  async findAll() {
    return prisma.products.findMany({
      where: {
        deleted_at: null,
      },
      include: {
        unit: true,
      },
    });
  },
  async findAllTx(tx: TransactionClient) {
    return tx.products.findMany({
      where: {
        deleted_at: null,
      },
      include: {
        unit: true,
      },
    });
  },
  async findById(id: number) {
    return prisma.products.findUnique({
      where: { id, deleted_at: null },
      include: {
        unit: true,
      },
    });
  },
  async findByIdTx(tx: TransactionClient, id: number) {
    return tx.products.findUnique({
      where: { id, deleted_at: null },
      include: {
        unit: true,
      },
    });
  },

  async create(data: Prisma.productsCreateInput) {
    const newProduct = await prisma.products.create({
      data,
    });
    return newProduct;
  },
  async createTx(tx: TransactionClient, data: Prisma.productsCreateInput) {
    const newProduct = await tx.products.create({
      data,
    });
    return newProduct;
  },

  async update(id: number, data: Prisma.productsUpdateInput) {
    const product = await ProductRepository.findById(id);
    if (!product) throw new Error(`Product with id ${id} not found`);

    const updatedProduct = await prisma.products.update({
      where: { id, deleted_at: null },
      data: {
        ...data,
        updated_at: new Date(),
      },
    });
    return updatedProduct;
  },
  async updateTx(
    tx: TransactionClient,
    id: number,
    data: Prisma.productsUpdateInput,
  ) {
    const product = await tx.products.findUnique({
      where: { id, deleted_at: null },
    });
    if (!product) throw new Error(`Product with id ${id} not found`);

    const updatedProduct = await tx.products.update({
      where: { id, deleted_at: null },
      data: {
        ...data,
        updated_at: new Date(),
      },
    });
    return updatedProduct;
  },

  async softDelete(id: number) {
    const product = await ProductRepository.findById(id);
    if (!product) throw new Error(`Product with id ${id} not found`);
    await prisma.products.update({
      where: { id, deleted_at: null },
      data: { deleted_at: new Date() },
    });
  },

  async softDeleteTx(tx: TransactionClient, id: number) {
    const product = await ProductRepository.findByIdTx(tx, id);
    if (!product) throw new Error(`Product with id ${id} not found`);
    await tx.products.update({
      where: { id, deleted_at: null },
      data: { deleted_at: new Date() },
    });
  },
};
