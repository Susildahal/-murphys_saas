"use client"

import * as React from "react"
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
  LayoutDashboard,
  Briefcase,
  Grid3x3,
  CreditCard,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
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
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
   
    {
      title: "Users",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Invite Users",
          url: "/admin/invte_users",
        },
        {
          title: "Get All users",
          url: "/admin/get_all_users",
        },
         {
          title: "Admin Users",
          url: "/admin/admin_users",
        },
          {
          title: "Clients Users",
          url: "/admin/clients_users",
        },
      
      ],
    },
    {
      title: "User Services",
      url: "#",
      icon: Bot,
      items: [
        {
          title: " View Assigned Services",
          url: "/admin/view_assign_service",
        },
        {
          title: "Explorer",
          url: "#",
        },
        {
          title: "Quantum",
          url: "#",
        },
      ],
    },
  
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "Site Settings",
          url: "/admin/settings",
        },
        {
          title: "Team",
          url: "#",
        },
        {
          title: "Billing",
          url: "#",
        },
        {
          title: "Limits",
          url: "#",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Dashboard ",
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
      name: "Categories",
      url: "/admin/categories",
      icon: Grid3x3,
    },
    {
      name:" Payment",
      url:"/admin/payment",
      icon:CreditCard,
    },

   
    {
      name: "Role and Permission",
      url: "/admin/roles",
      icon: Map,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar  collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex flex-col gap-4">
          <Image
          src="/logo.png"
          alt="Murphys Logo"
          width={150}
          height={50}
          className="mt-4 mb-2 px-2"
          />
          
         
       
        </div>
      </SidebarHeader>
      <SidebarContent className="">
         <NavProjects projects={data.projects} />
        <NavMain items={data.navMain} />
       
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
