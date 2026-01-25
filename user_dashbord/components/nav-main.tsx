"use client"

import { ChevronRight, type LucideIcon } from "lucide-react"
import { usePathname } from 'next/navigation'

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import Link from "next/link"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    items?: {
      title: string
      url: string
    }[]
  }[]
}) {
  const pathname = usePathname();
  const normalize = (u?: string) => (u || '').replace(/\/+$|(?<!^)\/$/, '')
  const pathnameNormalized = pathname ? pathname.replace(/\/+$|(?<!^)\/$/, '') : ''

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2 mb-2">
        Account Management
      </SidebarGroupLabel>
      <SidebarMenu className="space-y-1">
        {items.map((item) => {
          const itemUrl = normalize(item.url)
          const itemIsActive = !!item.isActive || (!!item.url && item.url !== '#' && (
            pathnameNormalized === itemUrl || pathnameNormalized.startsWith(itemUrl + '/')
          )) || (item.items || []).some(sub => {
            const subUrl = normalize(sub.url)
            return !!sub.url && (pathnameNormalized === subUrl || pathnameNormalized.startsWith(subUrl + '/'))
          })

          return (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={itemIsActive}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    tooltip={item.title}
                    isActive={itemIsActive}
                    className="h-9 transition-colors hover:bg-muted"
                  >
                    {item.icon && <item.icon className="h-4 w-4 text-muted-foreground" />}
                    <span className="flex-1">{item.title}</span>
                    <ChevronRight className="ml-auto h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub className="mr-0 border-l border-muted ml-3.5 pl-3 mt-1 space-y-0.5">
                    {item.items?.map((subItem) => {
                      const subUrl = normalize(subItem.url)
                      const subIsActive = !!subItem.url && (pathnameNormalized === subUrl || pathnameNormalized.startsWith(subUrl + '/'))
                      return (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={subIsActive}
                            className="h-8 hover:bg-muted"
                          >
                            <Link href={subItem.url}>
                              <span className="text-sm">{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      )
                    })}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
