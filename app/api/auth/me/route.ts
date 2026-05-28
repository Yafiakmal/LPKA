import { getAuthUser, ok, unauthorized } from "@/lib/auth";

export async function GET() {
  const user = await getAuthUser();
  if (!user) return unauthorized();
  return ok({ user }, "User fetched successfully");
}
