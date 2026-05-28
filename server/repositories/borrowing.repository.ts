import { prisma } from "@/lib/prisma";
import {
  Prisma,
  PrismaClient,
  type borrowing,
} from "@/lib/generated/prisma/client";

type TransactionClient = Parameters<
  Parameters<typeof prisma.$transaction>[0]
>[0];

export interface FindAllParams {
  // pagination
  page: number;
  limit: number;
  // filtering — ini boleh di repo
  returned?: boolean;
  search?: string; // cari nama barang / peminjam
  // sorting
  sortBy?: "created_at" | "updated_at";
  sortOrder?: "asc" | "desc";
}

export const BorrowingRepository = {
  async findAll({
    page,
    limit,
    returned,
    search,
    sortBy,
    sortOrder,
  }: FindAllParams) {
    const safePage = Math.max(1, Math.floor(page));
    const safeLimit = Math.min(100, Math.max(1, Math.floor(limit)));
    return await prisma.borrowing.findMany({
      where: {
        deleted_at: null,
        ...(returned && { returned }),
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
          select: {
            name: true,
            stock: true,
          },
        },
        user: {
          select: {
            username: true,
          },
        },
      },
    });
  },
  async findAllTx(
    tx: TransactionClient,
    { page, limit, returned, search, sortBy, sortOrder }: FindAllParams,
  ) {
    const safePage = Math.max(1, Math.floor(page));
    const safeLimit = Math.min(100, Math.max(1, Math.floor(limit)));
    return await tx.borrowing.findMany({
      where: {
        deleted_at: null,
        ...(returned && { returned }),
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
          select: {
            name: true,
            stock: true,
          },
        },
        user: {
          select: {
            username: true,
          },
        },
      },
    });
  },
  async findById(id: bigint) {
    return await prisma.borrowing.findUnique({
      where: { id, deleted_at: null },
    });
  },

  async findByIdTx(tx: TransactionClient, id: bigint) {
    return await tx.borrowing.findUnique({
      where: { id, deleted_at: null },
    });
  },

  async createTx(tx: TransactionClient, data: Prisma.borrowingCreateInput) {
    return await tx.borrowing.create({
      data,
    });
  },

  async updateTx(
    tx: TransactionClient,
    id: bigint,
    data: Prisma.borrowingUpdateInput,
  ) {
    return await tx.borrowing.update({
      where: { id, deleted_at: null },
      data,
    });
  },

  async deleteTx(tx: TransactionClient, id: bigint) {
    return await tx.borrowing.update({
      where: { id, deleted_at: null },
      data: { deleted_at: new Date() },
    });
  },
};
