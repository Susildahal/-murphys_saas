"use client"

import * as React from "react"
import { Search, Bell, Settings, Moon, Sun, Menu } from "lucide-react"
import { useTheme } from "next-themes"
import { useAppSelector, useAppDispatch } from "@/lib/redux/hooks"
import { getAuth } from "firebase/auth"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { getMee } from "@/lib/redux/slices/meeSlice"
import { useSidebar } from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface AppHeaderProps {
  onSearchChange?: (value: string) => void
  searchValue?: string
}

export function AppHeader({ onSearchChange, searchValue }: AppHeaderProps) {
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const { toggleSidebar } = useSidebar()
  const profileState = useAppSelector((state) => state.profile) as { profile: any; loading: boolean; error: string | null }
  const dispatch = useAppDispatch()
  const profile = Array.isArray(profileState.profile) ? profileState.profile[0] : profileState.profile
  const meeState = useAppSelector((state) => state.mee)
  const mee = meeState?.data
  const noticesState = useAppSelector((state) => state.notices)

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U'
  }

  const userName = profile?.name || profile?.firstName && profile?.lastName
    ? `${profile.firstName} ${profile.lastName}`.trim()
    : "User"
  const userEmail = profile?.email || getAuth().currentUser?.email || "Not available"
  const userAvatar = profile?.profile_image || ""

  React.useEffect(() => {
    if (!mee && userEmail !== "Not available") {
      dispatch(getMee())
    }
  }, [dispatch, userEmail, mee])

  const unreadCount = noticesState?.unreadCount || 0

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm">
      <div className="flex h-16 items-center justify-between gap-4 px-6">

        {/* Left: hamburger */}
        <div className="flex items-center gap-4">
          <button
            className="h-10 w-10 rounded-lg   border-slate-200 dark:border-slate-700 flex items-center justify-center "
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5 text-slate-700 dark:text-slate-200" />
          </button>
        </div>

        {/* Center: search */}
        <div className="flex-1 px-6">
          <div className="relative max-w-[900px] mx-auto">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search or type command..."
              className="w-full h-11 lg:pl-12 pl-2 pr-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 "
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
            />
          </div>
        </div>

        {/* Right: icons */}
        <div className="flex items-center gap-3">
          <button
            className="h-10 w-10 rounded-full  border border-slate-200 dark:border-slate-700 flex items-center justify-center "
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5 text-slate-800 dark:text-white" />
            ) : (
              <Moon className="h-5 w-5 text-slate-700" />
            )}
          </button>

          <button
            className="hidden md:inline-flex relative h-10 w-10 rounded-full  border border-slate-200 dark:border-slate-700 flex items-center justify-center "
            onClick={() => router.push('/admin/contract_messages')}
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5 text-slate-700 dark:text-slate-200" />
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </Badge>
            )}
          </button>
          <DropdownMenu>
          <DropdownMenuTrigger asChild>

          <button
            className="hidden md:inline-flex h-10 w-10 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center "
            onClick={() => router.push('/admin/profile')}
            aria-label="Settings"
          >
            <Settings className="h-5 w-5 text-slate-700 dark:text-slate-200" />
          </button>
          </DropdownMenuTrigger>
            <DropdownMenuContent
              className=" border"
              side="bottom"
              align="end"
              sideOffset={8}
            >
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => router.push('/admin/change_password')} className="cursor-pointer py-2.5">
                  <span>Change password</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/admin/delete_account')} className="cursor-pointer py-2.5">
                  <span>Delete Account</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>


          <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
            <Avatar className="h-10 w-10 cursor-pointer ring-2 ring-white dark:ring-slate-800">
              <AvatarImage src={userAvatar} alt={userName} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {getInitials(userName)}
              </AvatarFallback>
            </Avatar>
          </Button>
        </div>
      </div>
    </header>
  )
}
