import { prisma } from "@/lib/prisma";
import { Prisma, type user_sessions } from "@/lib/generated/prisma/client";

export const UserSessionRepositories = {
  async create(data: Prisma.user_sessionsCreateInput) {
    const newSession = await prisma.user_sessions.create({
      data,
    });
    return newSession;
  },

  async findBySelector(selector: string) {
    return await prisma.user_sessions.findFirst({
      where: { selector, revoked_at: null },
    });
  },

  async revoke(selector: string) {
    const session = await UserSessionRepositories.findBySelector(selector);
    if (!session)
      throw new Error(`Session with selector ${selector} not found`);

    await prisma.user_sessions.update({
      where: { selector },
      data: { revoked_at: new Date() },
    });
  },
};
