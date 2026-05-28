import { ok, error } from "@/lib/auth";
import { getDashboardSummary } from "@/server/services/dashboard.service";

export async function GET() {
  try {
    const data = await getDashboardSummary();
    return ok(data, "Dashboard summary retrieved successfully");
  } catch (err) {
    return error("Gagal mengambil data dashboard", 500);
  }
}
