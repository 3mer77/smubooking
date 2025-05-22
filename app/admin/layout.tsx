"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { 
  BookOpen, 
  Building2, 
  ChevronDown, 
  ClipboardList, 
  HomeIcon, 
  LogOut, 
  Menu, 
  MessageSquare, 
  Monitor, 
  Settings, 
  Users, 
  X 
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { auth, UserRole } from "@/lib/firebase"
import { logout } from "@/lib/auth"
import { Toaster } from "sonner"

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user)
      } else {
        // Redirect to login if not authenticated
        router.push('/login')
      }
    })

    return () => unsubscribe()
  }, [router])

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  const navItems = [
    {
      title: "Overview",
      href: "/admin",
      icon: HomeIcon,
    },
    {
      title: "Rooms",
      href: "/admin/rooms",
      icon: Building2,
    },
    {
      title: "Equipment",
      href: "/admin/equipment",
      icon: Monitor,
    },
    {
      title: "Bookings",
      href: "/admin/bookings",
      icon: ClipboardList,
    },
    {
      title: "Users",
      href: "/admin/users",
      icon: Users,
    },
    {
      title: "Reports",
      href: "/admin/reports",
      icon: BookOpen,
    },
  ]

  return (
    <div className="flex min-h-screen w-full flex-col bg-gray-50">
      {/* Top navigation bar */}
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-black px-4 md:px-6">
        <div className="flex items-center gap-2">
          <Sheet open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-white hover:bg-gray-800"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="pr-0 sm:max-w-xs">
              <MobileNav
                navItems={navItems}
                pathname={pathname}
                setIsOpen={setIsMobileNavOpen}
              />
            </SheetContent>
          </Sheet>
          <Link href="/admin" className="flex items-center gap-2">
            <div className="h-8 w-8 overflow-hidden bg-white rounded-full p-1">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-MIU80dpxRKtuTeJHLCI2lMsiDOdSYe.png"
                alt="SMU Logo"
                className="h-full w-full object-contain"
              />
            </div>
            <span className="text-xl font-bold text-white">
              SMU Admin Panel
            </span>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-gray-800"
            >
              <MessageSquare className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white font-bold">
                4
              </span>
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="gap-2 text-white hover:bg-gray-800"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden md:inline-block">Logout</span>
          </Button>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Desktop sidebar navigation */}
        <aside className="hidden w-64 shrink-0 border-r bg-gray-100 md:block">
          <ScrollArea className="h-[calc(100vh-4rem)] py-6">
            <nav className="grid gap-2 px-4 text-lg font-medium">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-gray-200 hover:text-gray-900",
                    pathname === item.href
                      ? "bg-gray-200 text-gray-900"
                      : "text-gray-500"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.title}
                </Link>
              ))}
            </nav>
            <Separator className="my-6" />
            <div className="px-4">
              <h3 className="mb-2 text-lg font-semibold tracking-tight">
                Settings
              </h3>
              <nav className="grid gap-2 text-lg font-medium">
                <Link
                  href="/admin/settings"
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-gray-200 hover:text-gray-900",
                    pathname === "/admin/settings"
                      ? "bg-gray-200 text-gray-900"
                      : "text-gray-500"
                  )}
                >
                  <Settings className="h-5 w-5" />
                  Settings
                </Link>
              </nav>
            </div>
          </ScrollArea>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
      <Toaster />
    </div>
  )
}

interface MobileNavProps {
  navItems: {
    title: string
    href: string
    icon: React.ComponentType<{ className?: string }>
  }[]
  pathname: string
  setIsOpen: (open: boolean) => void
}

function MobileNav({ navItems, pathname, setIsOpen }: MobileNavProps) {
  return (
    <div className="flex flex-col gap-6 p-4">
      <Link href="/admin" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
        <div className="h-8 w-8 overflow-hidden bg-white rounded-full p-1">
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-MIU80dpxRKtuTeJHLCI2lMsiDOdSYe.png"
            alt="SMU Logo"
            className="h-full w-full object-contain"
          />
        </div>
        <span className="text-xl font-bold">SMU Admin</span>
      </Link>
      <ScrollArea className="h-[calc(100vh-10rem)]">
        <nav className="grid gap-2 text-lg font-medium">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-gray-100 hover:text-gray-900",
                pathname === item.href
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-500"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.title}
            </Link>
          ))}
        </nav>
        <Separator className="my-6" />
        <div>
          <h3 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Settings
          </h3>
          <nav className="grid gap-2 text-lg font-medium">
            <Link
              href="/admin/settings"
              onClick={() => setIsOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-gray-100 hover:text-gray-900",
                pathname === "/admin/settings"
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-500"
              )}
            >
              <Settings className="h-5 w-5" />
              Settings
            </Link>
          </nav>
        </div>
      </ScrollArea>
    </div>
  )
}
