"use client"

import * as React from "react"
import {
  AudioWaveform,
  BookOpen,
  Bot,

  Settings2,

  LayoutDashboard,
  Briefcase,
  Grid3x3,
  CreditCard,
  Search,
  ShoppingCart,
  Bell,
  Ticket
} from "lucide-react"
import { motion, AnimatePresence } from "motion/react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import { Input } from "@/components/ui/input"
import Image from "next/image"

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "",
      logo: "",
      plan: "",
    },
  ],
  navMain: [
    {
      title: "Account Settings",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "Change Password",
          url: "/admin/change_password",
        },
        {
          title: "Delete Account",
          url: "/admin/delete_account",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Dashboard",
      url: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Profile",
      url: "/admin/profile",
      icon: User,
    },
    {
      name: "Services",
      url: "/admin/services",
      icon: Briefcase,
    },
    {
      name: "My Services",
      url: "/admin/view_assign_service",
      icon: AudioWaveform,
    },
    {
      name: "Cart",
      url: "/admin/cart",
      icon: ShoppingCart,
    },
    {
      name: "Contracts",
      url: "/admin/contract_messages",
      icon: BookOpen,
    },
    {
      name: "Payment ",
      url: "/admin/billing",
      icon: CreditCard,
    },
    {
      name: "Payment History",
      url: "/admin/billing-history",
      icon: CreditCard,
    },
    {
      name: "Support Tickets",
      url: "/admin/open_ticket",
      icon: Ticket,
    },
    {
      name: "Invite Users",
      url: "/admin/invte_users",
      icon: Bot,
    },
    {
      name: "Invoices",
      url: "/admin/invoices",
      icon: Bot,
    }
  ],
}

import { User } from "lucide-react"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  searchQuery?: string
}

export function AppSidebar({ searchQuery = "", ...props }: AppSidebarProps) {
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  // Filter projects based on search
  const filteredProjects = React.useMemo(() => {
    if (!searchQuery) return data.projects
    return data.projects.filter(project =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [searchQuery])

  // Filter nav items based on search
  const filteredNavMain = React.useMemo(() => {
    if (!searchQuery) return data.navMain
    return data.navMain.map(item => ({
      ...item,
      items: item.items?.filter(subItem =>
        subItem.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    })).filter(item => item.items && item.items.length > 0)
  }, [searchQuery])

  return (
    <Sidebar collapsible="icon" {...props} className="border-r bg-white dark:bg-black text-slate-900 dark:text-white">
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: var(--muted-foreground);
          opacity: 0.2;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          opacity: 0.4;
        }
      `}</style>

      {/* Fixed Header */}
      <SidebarHeader className="bg-background pb-4 pt-4">
        <div className="flex px-4 items-center justify-between">
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2"
              >
                <Image
                  src="/logo.png"
                  alt="Murphys Logo"
                  width={130}
                  height={130}
                  className="object-contain"
                />

              </motion.div>
            )}
          </AnimatePresence>

          {isCollapsed && (
            <div className="flex w-full justify-center">
              <Image
                src="/logo.png"
                alt="Murphys Logo"
                width={32}
                height={32}
                className="object-contain"
              />
            </div>
          )}
        </div>
      </SidebarHeader>

      {/* Scrollable Content */}
      <SidebarContent className="overflow-y-auto custom-scrollbar flex-1 px-3 py-4 gap-6">
        {filteredProjects.length === 0 && filteredNavMain.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
            <Search className="h-8 w-8 opacity-50 mb-2" />
            <p className="text-xs">No matches found</p>
          </div>
        ) : (
          <div className="space-y-6">
            <NavProjects projects={filteredProjects} />
            <NavMain items={filteredNavMain} />
          </div>
        )}
      </SidebarContent>

      {/* Fixed Footer */}
      <SidebarFooter className="p-4 bg-background">
        <NavUser />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}