"use client"

import * as React from "react"
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,

  Map,
  PieChart,
  Settings2,
  SquareTerminal,
  LayoutDashboard,
  Briefcase,
  Grid3x3,
  CreditCard,
  Search,
  ShoppingCart,
  Bell,
} from "lucide-react"
import { motion, AnimatePresence } from "motion/react"
import { useRouter } from "next/navigation"
import { useAppSelector } from "@/lib/redux/hooks"

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
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [

   
    {
      title: "Settings",
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
      icon: PieChart,
    },
    {
      name: "Services",
      url: "/admin/services",
      icon: Briefcase,
    },
    {
      name: "Cart",
      url: "/admin/cart",
      icon: ShoppingCart,
    },
    {
      name: "My Services",
      url: "/admin/view_assign_service",
      icon: AudioWaveform,
    },
    {
      name: "Contracts ",
      url: "/admin/contract_messages",
      icon: BookOpen,
    },
    {
    name :" Invite Users",
    url:"/admin/invte_users",
    icon: Bot,
    },
     {
    name :" Billing",
    url:"/admin/billing",
    icon: CreditCard,
    },
    {
    name :" Payment History",
    url:"/admin/billing-history",
    icon: CreditCard,
    },
      {
    name :" Open Tickets",
    url:"/admin/open_ticket",
    icon: CreditCard,
    }
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [searchQuery, setSearchQuery] = React.useState("")
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"
  const router = useRouter()
  const cartState = useAppSelector((s) => s.cart)
  const cartItemCount = cartState.cart?.Services?.length || 0

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
    <Sidebar collapsible="icon" {...props} className="border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(148, 163, 184, 0.5);
        }
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(148, 163, 184, 0.3) transparent;
        }
      `}</style>

      {/* Fixed Header */}
      <SidebarHeader className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 pb-4">
        <motion.div
          className="flex h-14 items-center px-4 pt-2"
          animate={{
            justifyContent: isCollapsed ? "center" : "flex-start"
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={isCollapsed ? "collapsed" : "expanded"}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="flex items-center"
            >
              <Image
                src="/logo.png"
                alt="Murphys Logo"
                width={isCollapsed ? 32 : 130}
                height={isCollapsed ? 32 : 40}
                className="object-contain"
                priority
              />
            </motion.div>
          </AnimatePresence>
        </motion.div>

        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              className="px-4 space-y-3"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <div className="relative group">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors pointer-events-none" />
                <Input
                  type="search"
                  placeholder="Search navigation..."
                  className="h-9 pl-9 bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 shadow-none hover:bg-slate-200 dark:hover:bg-slate-800 focus-visible:bg-white dark:focus-visible:bg-slate-900 focus-visible:border-slate-300 dark:focus-visible:border-slate-700 focus-visible:ring-2 focus-visible:ring-slate-200 dark:focus-visible:ring-slate-800 transition-all rounded-lg text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
             
            </motion.div>
          )}
        </AnimatePresence>

        {isCollapsed && (
          <motion.div
            className="px-2 space-y-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.2 }}
          >
            <div className="relative flex justify-center py-2">
              <Search className="h-5 w-5 text-slate-400 dark:text-slate-500 cursor-pointer hover:text-slate-600 dark:hover:text-slate-300 transition-colors" />
            </div>
          </motion.div>
        )}
      </SidebarHeader>

      {/* Scrollable Content */}
      <SidebarContent className="overflow-y-auto custom-scrollbar flex-1 px-2 py-4">
        <AnimatePresence mode="wait">
          {filteredProjects.length === 0 && filteredNavMain.length === 0 ? (
            <motion.div
              key="no-results"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center justify-center py-8 px-4 text-center"
            >
              <Search className="h-12 w-12 text-slate-300 dark:text-slate-700 mb-3" />
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">No navigation items found</p>
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">Try a different search term</p>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-2"
            >
              <NavProjects projects={filteredProjects} />
              <NavMain items={filteredNavMain} />
            </motion.div>
          )}
        </AnimatePresence>
      </SidebarContent>

      {/* Fixed Footer */}
      <SidebarFooter className="border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-2 mt-auto">
        <NavUser />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}