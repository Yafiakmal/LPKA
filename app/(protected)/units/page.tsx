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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUnits } from "@/hooks/use-units";
import { Unit, UnitPayload } from "@/types/unit";
import { createUnit, updateUnit, deleteUnit } from "@/lib/unit-api";

const INITIAL_FORM: UnitPayload = { name: "" };

type ModalMode = "add" | "edit" | null;

export default function UnitPage() {
  const { units, isLoading, isError, mutate } = useUnits();

  // Modal state
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [form, setForm] = useState<UnitPayload>(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Delete state
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const openAdd = () => {
    setForm(INITIAL_FORM);
    setSelectedUnit(null);
    setSubmitError(null);
    setModalMode("add");
  };

  const openEdit = (unit: Unit) => {
    setForm({ name: unit.name });
    setSelectedUnit(unit);
    setSubmitError(null);
    setModalMode("edit");
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedUnit(null);
    setForm(INITIAL_FORM);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      setSubmitError("Nama satuan wajib diisi.");
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError(null);

      if (modalMode === "edit") {
        await updateUnit(selectedUnit!.id, form);
      } else {
        await createUnit(form);
      }

      await mutate();
      closeModal();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setIsDeleting(true);
      await deleteUnit(id);
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
          <h1 className="text-2xl font-bold text-gray-800">Satuan</h1>
          <p className="text-gray-500 text-sm">
            Kelola satuan barang inventaris
          </p>
        </div>
        <Button onClick={openAdd}>+ Tambah Satuan</Button>
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
            <TableCaption>Total {units.length} satuan</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">ID</TableHead>
                <TableHead>Nama Satuan</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {units.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center text-gray-400 py-8"
                  >
                    Belum ada data satuan
                  </TableCell>
                </TableRow>
              ) : (
                units.map((unit) => (
                  <TableRow key={unit.id}>
                    <TableCell className="text-gray-400 text-xs">
                      #{unit.id}
                    </TableCell>
                    <TableCell className="font-medium">{unit.name}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEdit(unit)}
                        >
                          Edit
                        </Button>

                        {deletingId === unit.id ? (
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-500">
                              Yakin?
                            </span>
                            <Button
                              size="sm"
                              variant="destructive"
                              disabled={isDeleting}
                              onClick={() => handleDelete(unit.id)}
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
                            onClick={() => setDeletingId(unit.id)}
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
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {modalMode === "edit" ? "Edit Satuan" : "Tambah Satuan Baru"}
            </DialogTitle>
            <DialogDescription>
              {modalMode === "edit"
                ? "Ubah nama satuan yang sudah ada."
                : "Isi form berikut untuk menambah satuan baru."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>Nama Satuan</Label>
              <Input
                placeholder="contoh: pcs, kg, liter"
                value={form.name}
                onChange={(e) => setForm({ name: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
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
