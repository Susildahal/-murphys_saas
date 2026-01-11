"use client"

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Settings,
  User,
  Shield,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useAppSelector } from "@/lib/redux/hooks"
import { getAuth, signOut } from "firebase/auth"
import { auth } from "@/app/config/firebase"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"

export function NavUser() {
  const { isMobile } = useSidebar()
  const router = useRouter()
  const profileState = useAppSelector((state) => state.profile)
  const profile = Array.isArray(profileState.profile) ? profileState.profile[0] : profileState.profile
  
  const userName = profile?.name || profile?.firstName && profile?.lastName 
    ? `${profile.firstName} ${profile.lastName}`.trim() 
    : "User"
  const userEmail = profile?.email || getAuth().currentUser?.email || "Not available"
  const userAvatar = profile?.profile_image || ""
  const userRole = profile?.role_type || "User"
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U'
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="h-12 hover:bg-accent transition-colors rounded-lg data-[state=open]:bg-accent"
            >
              <Avatar className="h-9 w-9 rounded-full border-2 border-border">
                <AvatarImage src={userAvatar} alt={userName} />
                <AvatarFallback className="rounded-full bg-gradient-to-br from-primary/20 to-primary/5 text-primary font-semibold">
                  {getInitials(userName)}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{userName}</span>
                <span className="truncate text-xs text-muted-foreground">{userEmail}</span>
              </div>
              <ChevronsUpDown className="ml-auto h-4 w-4 text-muted-foreground" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-64 rounded-xl shadow-lg border"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={8}
          >
            <DropdownMenuLabel className="p-3 font-normal">
              <div className="flex items-start gap-3">
                <Avatar className="h-12 w-12 rounded-full border-2 border-border">
                  <AvatarImage src={userAvatar} alt={userName} />
                  <AvatarFallback className="rounded-full bg-gradient-to-br from-primary/20 to-primary/5 text-primary font-semibold text-lg">
                    {getInitials(userName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="truncate font-semibold text-sm">{userName}</span>
                  <span className="truncate text-xs text-muted-foreground">{userEmail}</span>
                  <Badge variant="secondary" className="mt-1.5 w-fit text-xs">
                    <Shield className="h-3 w-3 mr-1" />
                    {userRole}
                  </Badge>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => router.push('/admin/profile')} className="cursor-pointer py-2.5">
                <User className="h-4 w-4 mr-2" />
                <span>My Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/admin/settings')} className="cursor-pointer py-2.5">
                <Settings className="h-4 w-4 mr-2" />
                <span>Settings</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive py-2.5">
              <LogOut className="h-4 w-4 mr-2" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
