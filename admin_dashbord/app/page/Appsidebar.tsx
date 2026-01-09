"use client"
import { AppSidebar } from "@/components/app-sidebar"
import { usePathname } from "next/navigation"
import { ModeToggle } from "@/components/mode-toggle"
import { Separator } from "@/components/ui/separator"
import { NavUser } from "@/components/nav-user"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

interface SidebarProps {
  children: React.ReactNode;
}

export default function Sidebar({ children }: SidebarProps) {
  const pathname = usePathname()
  const pathSegments = pathname.split('/').filter(Boolean)
  const currentPage = pathSegments[pathSegments.length - 1]
  const formattedPage = currentPage ? currentPage.charAt(0).toUpperCase() + currentPage.slice(1) : 'Dashboard'
const data = {
  user: {
    name: "",
    email: "",
    avatar: "/avatars/shadcn.jpg",
  },
 
}
  return (
    <SidebarProvider> 
      <div className=" ">
      <AppSidebar  />
      </div>
      <SidebarInset>
        <header className="flex mb-4 h-16 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 px-4 justify-between">
          <div className="flex items-center gap-2">
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/admin/dashboard">Admin</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{formattedPage}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="flex items-center gap-2">
                <NavUser user={data.user } />
            <ModeToggle />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
