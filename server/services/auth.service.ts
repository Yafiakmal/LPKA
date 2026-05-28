import argon2 from "argon2";
import crypto from "crypto";
import {
  NotFoundError,
  DatabaseError,
  ConflictError,
  UnauthorizedError,
} from "@/server/utils/AppError";
import { UserRepositories } from "@/server/repositories/user.repository";
import { UserSessionRepositories } from "@/server/repositories/userSession.repository";
import { Prisma, type user } from "@/lib/generated/prisma/client";

export const AuthService = {
  async me(
    token: string,
  ): Promise<{ id: number; username: string; role: number }> {
    console.info("AuthServie me --");
    const [selector, validator] = token.split(".");

    if (!selector || !validator) {
      throw new UnauthorizedError("Format token tidak valid");
    }

    const session = await UserSessionRepositories.findBySelector(selector);
    if (!session) throw new UnauthorizedError("Session tidak ditemukan");

    if (new Date() > session.expired_at) {
      await UserSessionRepositories.revoke(selector);
      throw new UnauthorizedError("Session sudah expired");
    }

    const isValid = await argon2.verify(session.validator_hash, validator);
    if (!isValid) throw new UnauthorizedError("Token tidak valid");

    const user = await UserRepositories.findById(session.user_id);
    if (!user) throw new NotFoundError("User tidak ditemukan");

    return {
      id: user.id,
      username: user.username,
      role: user.user_role_id,
    };
  },
  async login(username: string, password: string): Promise<string> {
    try {
      const user = await UserRepositories.findByUsername(username);
      if (!user) throw new NotFoundError("User not found");

      const isPasswordValid = await argon2.verify(
        user.hashed_password,
        password,
      );
      if (!isPasswordValid) {
        throw new UnauthorizedError("Invalid credentials");
      }

      // Create a new session
      const selector = crypto.randomBytes(8).toString("hex");
      const validator = crypto.randomBytes(32).toString("hex");

      const validatorHash = await argon2.hash(validator);

      // kirim ke client: selector.validator
      const token = `${selector}.${validator}`;
      const SESSION_DURATION = 60 * 60 * 24 * 7;

      const expiredAt = new Date(Date.now() + SESSION_DURATION * 1000);
      await UserSessionRepositories.create({
        selector,
        validator_hash: validatorHash,
        expired_at: expiredAt,
        user: { connect: { id: user.id } },
      });
      return token;
    } catch (error) {
      throw error;
    }
  },

  async register(username: string, password: string): Promise<user> {
    try {
      // Check if username already exists
      const existingUser = await UserRepositories.findByUsername(username);
      if (existingUser) throw new ConflictError("Username already taken");
      const hashedPassword = await argon2.hash(password);
      const newUser = await UserRepositories.create({
        username,
        hashed_password: hashedPassword,
      });
      return newUser;
    } catch (error) {
      throw error;
    }
  },

  async deleteUser(id: number, password: string): Promise<void> {
    const user = await UserRepositories.findById(id);
    if (!user) throw new NotFoundError("User not found");

    const isPasswordValid = await argon2.verify(user.hashed_password, password);
    if (!isPasswordValid) throw new NotFoundError("Invalid credentials");

    try {
      await UserRepositories.softDelete(id);
    } catch (error) {
      throw new DatabaseError("Failed to delete user");
    }
  },

  async updateUser(
    id: number,
    data: Omit<Prisma.userUpdateInput, "id" | "hashed_password">,
  ): Promise<user> {
    const user = await UserRepositories.findById(id);
    if (!user) throw new NotFoundError("User not found");

    try {
      const updatedUser = await UserRepositories.update(id, data);
      return updatedUser;
    } catch (error) {
      throw new DatabaseError("Failed to update user");
    }
  },
};
