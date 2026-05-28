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
import Link from "next/link";
import { useProducts } from "@/hooks/use-products";
import { useUnits } from "@/hooks/use-units";
import { Product, ProductPayload } from "@/types/product";
import { createProduct, updateProduct, deleteProduct } from "@/lib/product-api";

const INITIAL_FORM: ProductPayload = {
  name: "",
  stock: 0,
  unit_id: 0,
};

type ModalMode = "add" | "edit" | null;

export default function ProdukPage() {
  const { products, isLoading, isError, mutate } = useProducts();
  const { units } = useUnits();

  // Modal form state
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductPayload>(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Delete confirm state
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Buka modal tambah
  const openAdd = () => {
    setForm(INITIAL_FORM);
    setSelectedProduct(null);
    setSubmitError(null);
    setModalMode("add");
  };

  // Buka modal edit
  const openEdit = (product: Product) => {
    setForm({
      name: product.name,
      stock: product.stock,
      unit_id: product.unit_id,
    });
    setSelectedProduct(product);
    setSubmitError(null);
    setModalMode("edit");
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedProduct(null);
    setForm(INITIAL_FORM);
  };

  // Submit tambah / edit
  const handleSubmit = async () => {
    if (!form.name || !form.unit_id || form.stock < 0) {
      setSubmitError("Semua field wajib diisi.");
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError(null);

      if (modalMode === "edit") {
        await updateProduct(selectedProduct!.id, form);
      } else {
        await createProduct(form);
      }

      await mutate();
      closeModal();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete
  const handleDelete = async (id: number) => {
    try {
      setIsDeleting(true);
      await deleteProduct(id);
      await mutate();
      setDeletingId(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="w-full p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Barang</h1>
          <p className="text-gray-500 text-sm">Kelola data barang inventaris</p>
        </div>
        <Button onClick={openAdd}>+ Tambah Produk</Button>
      </div>

      {/* Tabel */}
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
            <TableCaption>Total {products.length} produk</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">ID</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Stok</TableHead>
                <TableHead>Satuan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-gray-400 py-8"
                  >
                    Belum ada data produk
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="text-gray-400 text-xs">
                      #{product.id}
                    </TableCell>
                    <TableCell className="font-medium">
                      {product.name}
                    </TableCell>
                    <TableCell>{product.stock}</TableCell>
                    <TableCell>{product.unit.name}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          product.borrowed
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        }
                      >
                        {product.borrowed ? "Dipinjam" : "Tersedia"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEdit(product)}
                        >
                          Edit
                        </Button>

                        {/* Tombol delete + konfirmasi inline */}
                        {deletingId === product.id ? (
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-500">
                              Yakin?
                            </span>
                            <Button
                              size="sm"
                              variant="destructive"
                              disabled={isDeleting}
                              onClick={() => handleDelete(product.id)}
                            >
                              {isDeleting ? "..." : "Ya"}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              disabled={isDeleting}
                              onClick={() => setDeletingId(null)}
                            >
                              Batal
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setDeletingId(product.id)}
                          >
                            Hapus
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Modal Tambah / Edit */}
      <Dialog open={modalMode !== null} onOpenChange={closeModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {modalMode === "edit" ? "Edit Produk" : "Tambah Produk Baru"}
            </DialogTitle>
            <DialogDescription>
              {modalMode === "edit"
                ? "Ubah data produk yang sudah ada."
                : "Isi form berikut untuk menambah produk baru."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>Nama Barang</Label>
              <Input
                placeholder="contoh: Panci"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label>Stok</Label>
              <Input
                type="number"
                min={0}
                value={form.stock}
                onChange={(e) =>
                  setForm((f) => ({ ...f, stock: Number(e.target.value) }))
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label>Satuan</Label>
              <Select
                value={form.unit_id ? String(form.unit_id) : ""}
                onValueChange={(val) =>
                  setForm((f) => ({ ...f, unit_id: Number(val) }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih satuan..." />
                </SelectTrigger>
                <SelectContent>
                  {units.map((u) => (
                    <SelectItem key={u.id} value={String(u.id)}>
                      {u.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-400 mt-1">
                Belum ada satuan?{" "}
                <Link href="/units" className="text-blue-500 underline">
                  Kelola satuan di sini
                </Link>
              </p>
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
