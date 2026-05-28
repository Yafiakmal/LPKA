import type { Metadata } from "next";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "LPKA Kelas 1 Martapura — Inventaris",
  description: "Sistem Inventaris Barang LPKA Kelas 1 Martapura",
};

export default async function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getAuthUser();

  // VALIDASI ASLI
  if (!user) {
    redirect("/login");
  }
  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar />
        <main className="w-full">
          <SidebarTrigger />
          {children}
        </main>
      </SidebarProvider>
    </TooltipProvider>
  );
}
