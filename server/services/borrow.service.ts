import { NotFoundError } from "@/server/utils/AppError";
import { prisma } from "@/lib/prisma";
import { Prisma, type borrowing } from "@/lib/generated/prisma/client";
import {
  BorrowingRepository,
  FindAllParams,
} from "@/server/repositories/borrowing.repository";
import { ProductRepository } from "@/server/repositories/product.repository";

// description shoud be optional, because user might not want to provide description when borrowing a product
type BorrowingCreateInput = Omit<
  borrowing,
  | "id"
  | "created_at"
  | "updated_at"
  | "deleted_at"
  | "returned"
  | "user_id"
  | "description"
> & { description?: string | null };

type BorrowingUpdateInput = Partial<
  Pick<borrowing, "product_id" | "amount" | "description" | "returned">
>;

export const BorrowService = {
  async getAll(params: FindAllParams | undefined) {
    if (params) return await BorrowingRepository.findAll(params);
    return await BorrowingRepository.findAll({
      limit: 10,
      page: 1,
    });
  },
  async getById(id: bigint) {
    const borrowing = await BorrowingRepository.findById(id);
    if (!borrowing)
      throw new NotFoundError(`Borrowing with id ${id} not found`);
    return borrowing;
  },
  async create(user_id: number, data: BorrowingCreateInput) {
    return await prisma.$transaction(async (tx) => {
      const borrow = await BorrowingRepository.createTx(tx, {
        amount: data.amount,
        products: {
          connect: {
            id: data.product_id,
          },
        },
        user: {
          connect: {
            id: user_id,
          },
        },
        description: data.description,
      });

      if (!borrow)
        throw new Error(
          `Failed to create borrowing record for product id ${data.product_id}`,
        );

      const product = await ProductRepository.findByIdTx(tx, data.product_id);

      if (!product)
        throw new NotFoundError(`Product with id ${data.product_id} not found`);

      if (product.stock < data.amount)
        throw new Error(
          `Not enough stock for product with id ${data.product_id}`,
        );

      await ProductRepository.updateTx(tx, data.product_id, {
        stock: product.stock - data.amount,
        borrowed: true,
        borrowed_amount: product.borrowed_amount + data.amount,
        updated_at: new Date(),
      });
      return borrow;
    });
  },
  async returnBorrowing(user_id: number, borrow_id: bigint) {
    return await prisma.$transaction(async (tx) => {
      const existingBorrowing = await BorrowingRepository.findByIdTx(
        tx,
        borrow_id,
      );
      if (!existingBorrowing)
        throw new NotFoundError(`Borrowing with id ${borrow_id} not found`);
      if (existingBorrowing.returned)
        throw new Error(
          `Borrowing with id ${borrow_id} has already been returned`,
        );
      if (existingBorrowing.user_id !== user_id)
        throw new Error(
          `Borrowing with id ${borrow_id} cannot be returned with current user`,
        );

      const borrow = await BorrowingRepository.updateTx(tx, borrow_id, {
        returned: true,
      });

      const product = await ProductRepository.findByIdTx(
        tx,
        existingBorrowing.product_id,
      );
      if (!product) {
        throw new NotFoundError(
          `Product with id ${existingBorrowing.product_id} not found`,
        );
      }
      await ProductRepository.updateTx(tx, existingBorrowing.product_id, {
        stock: product.stock + existingBorrowing.amount,
        borrowed: product.borrowed_amount - existingBorrowing.amount > 0, // set borrowed false jika borrowed_amount tidak lebih besar dari 0
        borrowed_amount: product.borrowed_amount - existingBorrowing.amount,
        updated_at: new Date(),
      });
      return borrow;
    });
  },
  async update(user_id: number, id: bigint, data: BorrowingUpdateInput) {
    return await prisma.$transaction(async (tx) => {
      const existingBorrowing = await BorrowingRepository.findByIdTx(tx, id);
      if (!existingBorrowing)
        throw new NotFoundError(`Borrowing with id ${id} not found`);
      if (existingBorrowing.user_id !== user_id)
        throw new Error(
          `Borrowing with id ${id} cannot be updated with current user`,
        );

      const borrow = await BorrowingRepository.updateTx(tx, id, data);

      if (data.amount !== undefined || data.product_id !== undefined) {
        const newProductId = data.product_id ?? existingBorrowing.product_id;
        const newAmount = data.amount ?? existingBorrowing.amount;
        const productChanged =
          data.product_id && data.product_id !== existingBorrowing.product_id;

        if (productChanged) {
          // 1. Kembalikan stock produk LAMA
          const oldProduct = await ProductRepository.findByIdTx(
            tx,
            existingBorrowing.product_id,
          );
          if (!oldProduct) throw new NotFoundError(`Old product not found`);
          await ProductRepository.updateTx(tx, existingBorrowing.product_id, {
            stock: oldProduct.stock + existingBorrowing.amount, // kembalikan penuh
            updated_at: new Date(),
          });

          // 2. Kurangi stock produk BARU
          const newProduct = await ProductRepository.findByIdTx(
            tx,
            newProductId,
          );
          if (!newProduct) throw new NotFoundError(`New product not found`);
          if (newProduct.stock - newAmount < 0)
            throw new Error(
              `Not enough stock for product with id ${newProductId}`,
            );
          await ProductRepository.updateTx(tx, newProductId, {
            stock: newProduct.stock - newAmount,
            updated_at: new Date(),
          });
        } else if (
          data.amount !== undefined &&
          data.amount !== existingBorrowing.amount
        ) {
          // Produk sama, hanya amount berubah
          const product = await ProductRepository.findByIdTx(
            tx,
            existingBorrowing.product_id,
          );
          if (!product) throw new NotFoundError(`Product not found`);

          const stockChange = existingBorrowing.amount - data.amount; // + kalau dikurangi, - kalau ditambah
          if (product.stock + stockChange < 0)
            throw new Error(
              `Not enough stock for product with id ${existingBorrowing.product_id}`,
            );

          await ProductRepository.updateTx(tx, existingBorrowing.product_id, {
            stock: product.stock + stockChange,
            updated_at: new Date(),
          });
        }
      }
    });
  },
  async delete(user_id: number, id: bigint) {
    return await prisma.$transaction(async (tx) => {
      const existingBorrowing = await BorrowingRepository.findByIdTx(tx, id);
      if (!existingBorrowing)
        throw new NotFoundError(`Borrowing with id ${id} not found`);
      if (existingBorrowing.user_id !== user_id)
        throw new Error(
          `Borrowing with id ${id} cannot be deleted with current user`,
        );

      const borrow = await BorrowingRepository.deleteTx(tx, id);

      const product = await ProductRepository.findByIdTx(
        tx,
        existingBorrowing.product_id,
      );
      if (product) {
        await ProductRepository.updateTx(tx, existingBorrowing.product_id, {
          stock: product.stock + existingBorrowing.amount,
          updated_at: new Date(),
        });
      }
      return borrow;
    });
  },
};
