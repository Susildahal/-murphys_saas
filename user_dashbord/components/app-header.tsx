"use client"

import * as React from "react"
import { Search, Bell, Settings, Moon, Sun, Menu } from "lucide-react"
import { useTheme } from "next-themes"
import { useAppSelector, useAppDispatch } from "@/lib/redux/hooks"
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { NavUser } from "@/components/nav-user"

interface AppHeaderProps {
  onSearchChange?: (value: string) => void
  searchValue?: string
}

export function AppHeader({ onSearchChange, searchValue }: AppHeaderProps) {
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const { toggleSidebar } = useSidebar()

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

  const userName = mee?.name || mee?.firstName && mee ?.lastName
    ? `${mee.firstName} ${mee.lastName}`.trim()
    : "User"
  const userAvatar = mee ?.profile_image || ""

 

  const unreadCount = noticesState?.unreadCount || 0
  const [showMobileSearch, setShowMobileSearch] = React.useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm">
      <div className="flex h-16 items-center justify-between gap-4 px-4 md:px-6 relative">

        {/* Left: hamburger */}
        <div className="flex items-center gap-2 md:gap-4">
          <button
            className="h-10 w-10 rounded-lg cursor-pointer  border-slate-200 dark:border-slate-700 flex items-center justify-center "
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5 text-slate-700 dark:text-slate-200" />
          </button>
          {/* Mobile: search button (opens overlay) */}
          <button
            className="inline-flex md:hidden h-10 w-10 rounded-lg border border-slate-200 dark:border-slate-700 items-center justify-center"
            onClick={() => setShowMobileSearch(true)}
            aria-label="Open search"
          >
            <Search className="h-4 w-4 text-slate-700 dark:text-slate-200" />
          </button>
          

          {/* Center: search (desktop) */}
          <div className="hidden md:flex px-2 flex-1">
            <div className="relative w-full max-w-[500px]  mx-auto">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search or type command..."
                className="w-full h-11 pl-12 pr-4 w-[400px] bg-white shadow-none border border-slate-200 dark:border-slate-700"
                value={searchValue}
                onChange={(e) => onSearchChange?.(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Right: icons */}
        <div className="flex items-center gap-3">
          <button
            className="h-10 w-10 cursor-pointer rounded-full  border border-slate-200 dark:border-slate-700 flex items-center justify-center "
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
            className="hidden md:inline-flex relative h-10 w-10 rounded-full cursor-pointer border border-slate-200 dark:border-slate-700 flex items-center justify-center "
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
            className="hidden md:inline-flex h-10 w-10  cursor-pointer rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center "
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


          {/* User menu (dropdown) */}
          <NavUser />
        </div>
        {/* Mobile search overlay */}
        {showMobileSearch && (
          <div className="absolute left-0 right-0 top-full mt-2 px-4 md:hidden z-40">
            <div className="mx-auto w-full max-w-lg">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search or type command..."
                  className="w-full h-11 pl-10 pr-12 bg-white shadow-sm border border-slate-200 dark:border-slate-700"
                  value={searchValue}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                  autoFocus
                />
                <button
                  onClick={() => setShowMobileSearch(false)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-slate-600"
                  aria-label="Close search"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
