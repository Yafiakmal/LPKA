import { Prisma } from "@/lib/generated/prisma/client";
import { UnitRepository } from "@/server/repositories/unit.repository";

export const UnitService = {
  async getAll() {
    return await UnitRepository.findAll();
  },
  async create(data: { name: string }) {
    return await UnitRepository.create(data);
  },
  async update(id: number, data: { name: string }) {
    return await UnitRepository.update(id, data);
  },
  async delete(id: number) {
    return await UnitRepository.delete(id);
  },
};
