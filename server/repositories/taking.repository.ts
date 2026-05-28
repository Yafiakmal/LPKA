import { Prisma, type taking } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";

type TransactionClient = Parameters<
  Parameters<typeof prisma.$transaction>[0]
>[0];

export interface FindAllParams {
  // pagination
  page: number;
  limit: number;
  // filtering
  search?: string; // cari nama barang / peminjam
  // sorting
  sortBy?: "created_at" | "updated_at";
  sortOrder?: "asc" | "desc";
}

export const TakingRepository = {
  async findAll({ page, limit, search, sortBy, sortOrder }: FindAllParams) {
    const safePage = Math.max(1, Math.floor(page));
    const safeLimit = Math.min(100, Math.max(1, Math.floor(limit)));
    return await prisma.taking.findMany({
      where: {
        deleted_at: null,
        ...(search && {
          OR: [
            {
              products: {
                name: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            },
            {
              user: {
                username: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            },
          ],
        }),
      },
      skip: (safePage - 1) * safeLimit,
      take: safeLimit,
      orderBy: sortBy ? { [sortBy]: sortOrder ?? "asc" } : undefined,
      include: {
        products: {
          select: { id: true, name: true },
        },
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });
  },

  async findById(id: number) {
    return await prisma.taking.findUnique({
      where: { id, deleted_at: null },
      include: {
        products: {
          select: { id: true, name: true },
        },
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });
  },

  async createTx(tx: TransactionClient, data: Prisma.takingCreateInput) {
    return await tx.taking.create({
      data,
    });
  },

  async updateTx(
    tx: TransactionClient,
    id: number,
    data: Prisma.takingUpdateInput,
  ) {
    return await tx.taking.update({
      where: { id, deleted_at: null },
      data,
    });
  },

  async softDeleteTx(tx: TransactionClient, id: number) {
    return await tx.taking.update({
      where: { id, deleted_at: null },
      data: { deleted_at: new Date() },
    });
  },
};
