"use client"

import {
  Folder,
  Forward,
  MoreHorizontal,
  Trash2,
  type LucideIcon,
} from "lucide-react"
import { usePathname } from 'next/navigation'
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
  const pathname = usePathname();
  const normalize = (u?: string) => (u || '').replace(/\/+$|(?<!^)\/$/, '')
  const pathnameNormalized = pathname ? pathname.replace(/\/+$|(?<!^)\/$/, '') : ''

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider">
        Quick Access
      </SidebarGroupLabel>
      <SidebarMenu className="">
        {projects.map((item) => {
          const itemUrl = normalize(item.url)
          const isActive = !!(item.url && (pathnameNormalized === itemUrl || pathnameNormalized.startsWith(itemUrl + '/')))
          return (
              <SidebarMenuItem key={item.name}>
              <SidebarMenuButton 
                asChild
                tooltip={item.name}
                isActive={isActive as any}
                className="hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 data-[active=true]:bg-blue-600 data-[active=true]:text-white rounded-md"
              >
                <Link href={item.url}>
                  <item.icon className="h-4 w-4" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
       
      </SidebarMenu>
    </SidebarGroup>
  )
}
