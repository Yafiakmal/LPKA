import { NextRequest } from "next/server";
import { BorrowService } from "@/server/services/borrow.service";
import { getAuthUser, ok, unauthorized, error } from "@/lib/auth";

export async function PUT(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getAuthUser();
    if (!user) return unauthorized();

    const { id } = await params;
    const borrow = await BorrowService.returnBorrowing(user.id, BigInt(id));
    return ok(borrow, "Borrow returned successfully");
  } catch (err: any) {
    return error(err.message ?? "Gagal mengembalikan barang", err.statusCode ?? 500);
  }
}
