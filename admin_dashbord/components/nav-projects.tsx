"use client"

import {
  Folder,
  Forward,
  MoreHorizontal,
  Trash2,
  type LucideIcon,
} from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import Link from "next/link"

export function NavProjects({
  projects,
}: {
  projects: {
    name: string
    url: string
    icon: LucideIcon
  }[]
}) {
 

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel className="text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider">
        Quick Access
      </SidebarGroupLabel>
      <SidebarMenu className="">
        {projects.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton 
              asChild 
              className="hover:bg-blue-500/20 hover:text-blue-400 transition-all duration-200 data-[active=true]:bg-blue-500/30 data-[active=true]:text-blue-300 rounded-md"
            >
              <Link href={item.url}>
                <item.icon className="h-4 w-4" />
                <span className="font-medium">{item.name}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
       
      </SidebarMenu>
    </SidebarGroup>
  )
}
