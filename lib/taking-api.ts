import { apiFetch } from "@/lib/fetch";
import { TakingPayload } from "@/types/taking";

export async function createTaking(payload: TakingPayload) {
  const res = await apiFetch("/api/takings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message ?? "Gagal menambah pengambilan");
  }

  return res.json();
}
