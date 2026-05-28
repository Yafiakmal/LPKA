import { prisma } from "@/lib/prisma";
import { Prisma, type user } from "@/lib/generated/prisma/client";

export const UserRepositories = {
  async findAll() {
    return await prisma.user.findMany({
      where: {
        deleted_at: null,
      },
    });
  },

  async findById(id: number) {
    return await prisma.user.findUnique({
      where: { id, deleted_at: null },
      include: {
        user_role: {
          select: {
            name: true,
          },
        },
      },
    });
  },
  async findByUsername(username: string) {
    return await prisma.user.findFirst({
      where: { username, deleted_at: null },
      include: {
        user_role: {
          select: {
            name: true,
          },
        },
      },
    });
  },

  async create(data: Prisma.userCreateInput) {
    const newUser = await prisma.user.create({
      data,
    });
    // Exclude hashed_password from the returned user object
    const { hashed_password, ...userWithoutPassword } = newUser;
    return userWithoutPassword as user;
  },

  async update(id: number, data: Prisma.userUpdateInput) {
    const user = await UserRepositories.findById(id);
    if (!user) throw new Error(`User with id ${id} not found`);

    const updatedUser = await prisma.user.update({
      where: { id, deleted_at: null },
      data: {
        ...data,
        updated_at: new Date(),
      },
    });
    return updatedUser;
  },

  async softDelete(id: number) {
    const user = await UserRepositories.findById(id);
    if (!user) throw new Error(`User with id ${id} not found`);
    await prisma.user.update({
      where: { id, deleted_at: null },
      data: { deleted_at: new Date() },
    });
  },
};
