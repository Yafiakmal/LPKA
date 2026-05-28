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
import { useTakings } from "@/hooks/use-takings";
import { useProducts } from "@/hooks/use-products";
import { TakingPayload } from "@/types/taking";
import { createTaking } from "@/lib/taking-api";

// user_id diisi saat submit, bukan saat inisialisasi
const EMPTY_FORM: TakingPayload = {
  user_id: 0,
  product_id: 0,
  amount: 1,
  description: "",
};

export default function PengambilanPage() {
  const { takings, isLoading, isError, mutate: mutateTakings } = useTakings();
  const { products, mutate: mutateProducts } = useProducts();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<TakingPayload>(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const closeModal = () => {
    setOpen(false);
    setForm(EMPTY_FORM);
    setSubmitError(null);
  };

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

      await createTaking({ ...form, user_id: userId });
      await Promise.all([mutateTakings(), mutateProducts()]);
      closeModal();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full p-4 md:p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Pengambilan</h1>
          <p className="text-gray-500 text-sm">
            Riwayat semua pengambilan barang inventaris
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>+ Tambah Pengambilan</Button>
      </div>

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
            <TableCaption>Total {takings.length} data pengambilan</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">ID</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Barang</TableHead>
                <TableHead className="text-right">Jumlah</TableHead>
                <TableHead>Keterangan</TableHead>
                <TableHead>Tanggal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {takings.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-gray-400 py-8"
                  >
                    Belum ada data pengambilan
                  </TableCell>
                </TableRow>
              ) : (
                takings.map((item) => (
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
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={open} onOpenChange={closeModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tambah Pengambilan Baru</DialogTitle>
            <DialogDescription>
              Isi form berikut untuk mencatat pengambilan barang.
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
                  {products.map((p) => (
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
                onClick={closeModal}
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
  );
}
