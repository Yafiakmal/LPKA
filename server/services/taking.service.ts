import { NotFoundError } from "@/server/utils/AppError";
import { prisma } from "@/lib/prisma";
import { type taking } from "@/lib/generated/prisma/client";
import {
  TakingRepository,
  type FindAllParams,
} from "@/server/repositories/taking.repository";
import { ProductRepository } from "@/server/repositories/product.repository";

export const TakingService = {
  async getAll(params: FindAllParams | undefined) {
    if (params) return await TakingRepository.findAll(params);
    return await TakingRepository.findAll({
      limit: 10,
      page: 1,
    });
  },
  async getById(id: number) {
    return await TakingRepository.findById(id);
  },
  async create(
    user_id: number,
    data: Pick<taking, "amount" | "product_id"> & {
      description?: string;
    },
  ) {
    console.info("taking service");
    return await prisma.$transaction(async (tx) => {
      const newTaking = await TakingRepository.createTx(tx, {
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
      // decrease product stock
      const existingProduct = await ProductRepository.findByIdTx(
        tx,
        data.product_id,
      );

      if (!existingProduct)
        throw new NotFoundError(`Product with id ${data.product_id} not found`);
      // if data.amount > 0, it means we are taking the product, so we need to decrease the stock
      if (data.amount > 0) {
        if (existingProduct.stock < data.amount) {
          throw new Error(
            `Insufficient stock for product id ${data.product_id}`,
          );
        }
        if (existingProduct.stock - data.amount < 0) {
          throw new Error(
            `Stock cannot be negative for product id ${data.product_id}`,
          );
        }
        //
        await ProductRepository.updateTx(tx, data.product_id, {
          stock: existingProduct.stock - data.amount,
          updated_at: new Date(),
        });
      }
    });
  },
  async update(
    user_id: number,
    id: number,
    data: Partial<
      Omit<taking, "id" | "created_at" | "updated_at" | "deleted_at">
    >,
  ) {
    return await prisma.$transaction(async (tx) => {
      const taking = await TakingRepository.findById(id);
      if (!taking) throw new NotFoundError(`Taking with id ${id} not found`);
      if (taking.user.id !== user_id)
        throw new Error(`current user not allowed to update this record`);
      const updatedTaking = await TakingRepository.updateTx(tx, id, data);
      return updatedTaking;
    });
  },
  async delete(user_id: number, id: number) {
    return await prisma.$transaction(async (tx) => {
      const taking = await TakingRepository.findById(id);
      if (!taking) throw new NotFoundError(`Taking with id ${id} not found`);
      if (taking.user.id !== user_id)
        throw new Error(`current user not allowed to delete this record`);
      await tx.taking.update({
        where: { id },
        data: { deleted_at: new Date() },
      });
    }); // async exportToExcel(): Promise<Buffer> {
    //   const borrows = await prisma.pengambilan.findMany();

    //   const workbook = new ExcelJS.Workbook();
    //   const sheet = workbook.addWorksheet("Pengambilan");

    //   sheet.columns = [
    //     { header: "Nama Barang", key: "nama_barang", width: 20 },
    //     { header: "Jumlah", key: "jumlah", width: 10 },
    //     { header: "Unit", key: "unit", width: 10 },
    //     { header: "Nama Pengambil", key: "nama_pengambil", width: 20 },
    //     { header: "Tgl Ambil", key: "tgl_ambil", width: 15 },
    //     { header: "Keterangan", key: "keterangan", width: 25 },
    //   ];

    //   borrows.forEach((b) => sheet.addRow(b));

    //   return Buffer.from(await workbook.xlsx.writeBuffer());
    // },
  },

  // async exportToExcel(): Promise<Buffer> {
  //   const borrows = await prisma.pengambilan.findMany();

  //   const workbook = new ExcelJS.Workbook();
  //   const sheet = workbook.addWorksheet("Pengambilan");

  //   sheet.columns = [
  //     { header: "Nama Barang", key: "nama_barang", width: 20 },
  //     { header: "Jumlah", key: "jumlah", width: 10 },
  //     { header: "Unit", key: "unit", width: 10 },
  //     { header: "Nama Pengambil", key: "nama_pengambil", width: 20 },
  //     { header: "Tgl Ambil", key: "tgl_ambil", width: 15 },
  //     { header: "Keterangan", key: "keterangan", width: 25 },
  //   ];

  //   borrows.forEach((b) => sheet.addRow(b));

  //   return Buffer.from(await workbook.xlsx.writeBuffer());
  // },
};
