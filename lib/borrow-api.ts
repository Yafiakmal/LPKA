import { apiFetch } from "@/lib/fetch";
import { CreateBorrowPayload } from "@/types/borrow";

export async function createBorrow(payload: CreateBorrowPayload) {
  const res = await apiFetch("/api/borrows", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message ?? "Gagal membuat peminjaman");
  }

  return res.json();
}

export async function returnBorrow(id: string) {
  const res = await apiFetch(`/api/borrows/${id}/return`, {
    method: "PUT",
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message ?? "Gagal mengembalikan barang");
  }

  return res.json();
}
