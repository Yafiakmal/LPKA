"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBorrows } from "@/hooks/use-borrows";
import { useProducts } from "@/hooks/use-products";
import { CreateBorrowPayload } from "@/types/borrow";
import { apiFetch } from "@/lib/fetch";

// Nilai default form — user_id diisi saat submit, bukan saat inisialisasi
const EMPTY_FORM: CreateBorrowPayload = {
  user_id: 0,
  product_id: 0,
  amount: 1,
  description: "",
};

export default function PeminjamanPage() {
  const { borrows, isLoading, isError, mutate: mutateBorrows } = useBorrows();
  const { products, mutate: mutateProducts } = useProducts();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CreateBorrowPayload>(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [returningId, setReturningId] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!form.product_id || form.amount < 1) {
      setSubmitError("Barang dan jumlah wajib diisi.");
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError(null);

      // Baca localStorage saat submit (sudah pasti di browser)
      const userId = Number(localStorage.getItem("user_id") ?? "0");

      const res = await apiFetch("/api/borrows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, user_id: userId }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message ?? "Gagal membuat peminjaman");
      }

      await Promise.all([mutateBorrows(), mutateProducts()]);
      setForm(EMPTY_FORM);
      setOpen(false);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReturn = async (id: string) => {
    try {
      setReturningId(id);

      const res = await apiFetch(`/api/borrows/${id}/return`, {
        method: "PUT",
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message ?? "Gagal mengembalikan barang");
      }

      await Promise.all([mutateBorrows(), mutateProducts()]);
    } catch (err) {
      console.error(err);
    } finally {
      setReturningId(null);
    }
  };

  return (
    <div className="w-full p-4 md:p-6 space-y-6">
      {/* Header + tombol */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Peminjaman</h1>
          <p className="text-gray-500 text-sm">
            Riwayat dan pencatatan peminjaman barang
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>+ Buat Peminjaman</Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Buat Peminjaman Baru</DialogTitle>
              <DialogDescription>
                Isi form berikut untuk mencatat peminjaman barang baru.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label>Barang</Label>
                <Select
                  onValueChange={(val) =>
                    setForm((f) => ({ ...f, product_id: Number(val) }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih barang..." />
                  </SelectTrigger>
                  <SelectContent>
                    {(products ?? []).map((p) => (
                      <SelectItem key={p.id} value={String(p.id)}>
                        {p.name}
                        <span className="text-gray-400 text-xs ml-2">
                          (stok: {p.stock} {p.unit.name})
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Jumlah</Label>
                <Input
                  type="number"
                  min={1}
                  value={form.amount}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, amount: Number(e.target.value) }))
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label>Keterangan</Label>
                <Input
                  placeholder="Opsional"
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                />
              </div>

              {submitError && (
                <p className="text-sm text-red-500">{submitError}</p>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={isSubmitting}
                >
                  Batal
                </Button>
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? "Menyimpan..." : "Simpan"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabel riwayat */}
      <div className="bg-white rounded-lg border shadow-sm p-6">
        {isLoading && (
          <p className="text-sm text-gray-400 py-8 text-center">
            Memuat data...
          </p>
        )}
        {isError && (
          <p className="text-sm text-red-500 py-8 text-center">
            Gagal memuat data. Coba refresh halaman.
          </p>
        )}
        {!isLoading && !isError && (
          <Table>
            <TableCaption>Total {borrows.length} data peminjaman</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">ID</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Barang</TableHead>
                <TableHead className="text-right">Jumlah</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Keterangan</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {borrows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center text-gray-400 py-8"
                  >
                    Belum ada data peminjaman
                  </TableCell>
                </TableRow>
              ) : (
                borrows.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="text-gray-400 text-xs">
                      #{item.id}
                    </TableCell>
                    <TableCell className="font-medium">
                      {item.user.username}
                    </TableCell>
                    <TableCell>{item.products.name}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="secondary">{item.amount}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          item.returned
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }
                      >
                        {item.returned ? "Dikembalikan" : "Dipinjam"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-500 text-sm">
                      {item.description || "-"}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {new Date(item.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell>
                      {!item.returned && (
                        <button
                          onClick={() => handleReturn(item.id)}
                          disabled={returningId === item.id}
                          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {returningId === item.id
                            ? "Memproses..."
                            : "Kembalikan"}
                        </button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
