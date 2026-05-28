"use client";

import * as React from "react";
import { NavProjects } from "@/components/nav-projects";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Archive04Icon,
  Hold02Icon,
  SignLanguageCIcon,
  DashboardSquare01Icon,
} from "@hugeicons/core-free-icons";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import Image from "next/image";

const navItems = [
  {
    name: "Dashboard",
    url: "/dashboard",
    icon: <HugeiconsIcon icon={DashboardSquare01Icon} strokeWidth={2} />,
  },
  {
    name: "Items",
    url: "/items",
    icon: <HugeiconsIcon icon={Archive04Icon} strokeWidth={2} />,
  },
  {
    name: "Peminjaman",
    url: "/borrows",
    icon: <HugeiconsIcon icon={SignLanguageCIcon} strokeWidth={2} />,
  },
  {
    name: "Pengambilan",
    url: "/takings",
    icon: <HugeiconsIcon icon={Hold02Icon} strokeWidth={2} />,
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-2.5 px-2 py-2 cursor-default select-none">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md overflow-hidden group-data-[collapsible=icon]:hidden">
                <Image
                  src="/logo.png"
                  alt="Logo LPKA Kelas 1 Martapura"
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col leading-none overflow-hidden group-data-[collapsible=icon]:hidden">
                <span className="text-sm font-semibold truncate">
                  LPKA Kelas 1 Martapura
                </span>
                <span className="text-[10px] text-muted-foreground font-medium tracking-wide uppercase">
                  Inventory System
                </span>
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent side="right" className="text-xs">
            Lembaga Pembinaan Khusus Anak Kelas 1 Martapura
          </TooltipContent>
        </Tooltip>
      </SidebarHeader>
      <SidebarContent>
        <NavProjects projects={navItems} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
