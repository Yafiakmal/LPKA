"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useBorrows } from "@/hooks/use-borrows";

export default function BorrowTable() {
  const { borrows, isLoading, isError } = useBorrows();

  return (
    <div className="bg-white rounded-xl shadow p-4">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Riwayat Peminjaman</h2>

        <p className="text-sm text-gray-500">Semua data peminjaman barang</p>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Produk</TableHead>
              <TableHead>Jumlah</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Deskripsi</TableHead>
              <TableHead>Tanggal</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {/* Loading */}
            {isLoading && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Loading borrows...
                </TableCell>
              </TableRow>
            )}

            {/* Error */}
            {isError && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-red-500 py-8"
                >
                  Failed to load borrows
                </TableCell>
              </TableRow>
            )}

            {/* Empty */}
            {!isLoading && !isError && borrows?.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-8 text-gray-500"
                >
                  Tidak ada data peminjaman
                </TableCell>
              </TableRow>
            )}

            {/* Data */}
            {borrows?.map((borrow) => (
              <TableRow key={borrow.id}>
                <TableCell>{borrow.id}</TableCell>

                <TableCell className="font-medium">
                  {borrow.user.username}
                </TableCell>

                <TableCell>{borrow.products.name}</TableCell>

                <TableCell>{borrow.amount}</TableCell>

                <TableCell>
                  {borrow.returned ? (
                    <span className="text-green-600 font-medium">Returned</span>
                  ) : (
                    <span className="text-red-500 font-medium">Borrowed</span>
                  )}
                </TableCell>

                <TableCell className="max-w-[200px] truncate">
                  {borrow.description}
                </TableCell>

                <TableCell>
                  {new Date(borrow.created_at).toLocaleDateString("id-ID")}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>

          <TableFooter>
            <TableRow>
              <TableCell colSpan={6}>Total Borrow Records</TableCell>

              <TableCell className="text-right">
                {borrows?.length || 0}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    </div>
  );
}
