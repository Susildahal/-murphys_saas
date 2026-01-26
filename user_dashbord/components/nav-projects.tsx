"use client"

import {
  type LucideIcon,
} from "lucide-react"
import { usePathname } from 'next/navigation'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
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
    <SidebarGroup className=" ">
      <SidebarGroupLabel className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider px-2 mb-2">
        MENU
      </SidebarGroupLabel>
      <SidebarMenu>
        {projects.map((item) => {
          const itemUrl = normalize(item.url)
          const isActive = !!(item.url && (pathnameNormalized === itemUrl || pathnameNormalized.startsWith(itemUrl + '/')))

          return (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton
                asChild
                tooltip={item.name}
                isActive={isActive as any}
                className="h-9 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Link href={item.url} className="flex items-center gap-3">
                  <item.icon className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                  <span className="font-medium text-slate-900 dark:text-white">{item.name}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
