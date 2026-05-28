import { apiFetch } from "@/lib/fetch";
import { UnitPayload } from "@/types/unit";

export async function createUnit(payload: UnitPayload) {
  const res = await apiFetch("/api/units", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message ?? "Gagal menambah unit");
  }

  return res.json();
}

export async function updateUnit(id: number, payload: UnitPayload) {
  const res = await apiFetch(`/api/units/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message ?? "Gagal mengupdate unit");
  }

  return res.json();
}

export async function deleteUnit(id: number) {
  const res = await apiFetch(`/api/units/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message ?? "Gagal menghapus unit");
  }

  return res.json();
}
