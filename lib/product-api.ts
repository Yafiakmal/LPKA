import { apiFetch } from "@/lib/fetch";
import { ProductPayload } from "@/types/product";

export async function createProduct(payload: ProductPayload) {
  const res = await apiFetch("/api/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message ?? "Gagal menambah produk");
  }

  return res.json();
}

export async function updateProduct(id: number, payload: ProductPayload) {
  const res = await apiFetch(`/api/products/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message ?? "Gagal mengupdate produk");
  }

  return res.json();
}

export async function deleteProduct(id: number) {
  const res = await apiFetch(`/api/products/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message ?? "Gagal menghapus produk");
  }

  return res.json();
}
