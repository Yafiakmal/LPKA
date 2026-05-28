import { prisma } from "@/lib/prisma";
import { Prisma, type unit } from "@/lib/generated/prisma/client";

export const UnitRepository = {
  async findAll() {
    return await prisma.unit.findMany();
  },
  async findById(id: number) {
    return await prisma.unit.findUnique({
      where: { id },
    });
  },
  async create(data: Prisma.unitCreateInput) {
    return await prisma.unit.create({
      data,
    });
  },
  async update(id: number, data: Prisma.unitUpdateInput) {
    return await prisma.unit.update({
      where: { id },
      data,
    });
  },
  async delete(id: number) {
    return await prisma.unit.delete({
      where: { id },
    });
  },
};
