"use client"

import * as React from "react"
import {
  Package,
  BookOpen,
  LayoutDashboard,
  Briefcase,
  CreditCard,
  User,
  UserPlus,
  FileText,
  Search,
  ShoppingCart,
  Ticket
} from "lucide-react"
import { motion, AnimatePresence } from "motion/react"
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
      icon: Package,
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
      icon: UserPlus,
    },
    {
      name: "Invoices",
      url: "/admin/invoices",
      icon: FileText,
    }
  ],
}



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



  return (
    <Sidebar collapsible="icon" {...props} className=" bg-white dark:bg-black text-slate-900 dark:text-white">
   

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
              <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-gray-900 to-violet-600 dark:from-white dark:to-violet-400 bg-clip-text text-transparent">
                MT
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      {/* Scrollable Content */}
      <SidebarContent className="overflow-y-auto custom-scrollbar flex-1 px-3 py-4 gap-6">
        {filteredProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
            <Search className="h-8 w-8 opacity-50 mb-2" />
            <p className="text-xs">No matches found</p>
          </div>
        ) : (
          <div className="space-y-6">
            <NavProjects projects={filteredProjects} />
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