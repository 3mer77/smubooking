"use client"

import Link from "next/link"
import { TelegramConfig } from "@/components/telegram-config"
import { TelegramComposer } from "@/components/telegram-composer"
import { MessageHistory } from "@/components/message-history"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Bell, Menu, X } from "lucide-react"
import { useState } from "react"
import { DashboardStats } from "@/components/dashboard-stats"
import { RecentActivity } from "@/components/recent-activity"

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <DashboardStats />
            <div className="mt-6">
              <h2 className="text-xl font-bold mb-4 text-black">Telegram Integration</h2>
              <Tabs defaultValue="compose" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-gray-100 mb-4">
                  <TabsTrigger value="compose" className="data-[state=active]:bg-black data-[state=active]:text-white">
                    Compose Message
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="data-[state=active]:bg-black data-[state=active]:text-white">
                    Settings
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="compose" className="space-y-6">
                  <TelegramComposer />
                </TabsContent>

                <TabsContent value="settings" className="space-y-6">
                  <TelegramConfig />

                  <div className="bg-gray-50 border border-gray-200 rounded-md p-4 text-black">
                    <h3 className="font-medium mb-2">How to set up your Telegram bot</h3>
                    <ol className="list-decimal list-inside space-y-2">
                      <li>Add your bot to the target group or channel as an administrator</li>
                      <li>
                        For groups: Send a message in the group and visit{" "}
                        <code className="bg-gray-100 px-1 py-0.5 rounded">
                          https://api.telegram.org/bot{"{YOUR_BOT_TOKEN}"}/getUpdates
                        </code>{" "}
                        to find the chat ID
                      </li>
                      <li>
                        For channels: Use the format{" "}
                        <code className="bg-gray-100 px-1 py-0.5 rounded">@channelname</code> or get the chat ID from
                        the API
                      </li>
                      <li>Enter the chat ID in the settings above and click "Save & Verify"</li>
                    </ol>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
          <div className="space-y-6">
            <RecentActivity />
            <MessageHistory />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-black backdrop-blur supports-[backdrop-filter]:bg-black/95">
      <div className="container mx-auto">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 overflow-hidden bg-white rounded-full p-1">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-MIU80dpxRKtuTeJHLCI2lMsiDOdSYe.png"
                alt="SMU Logo"
                className="h-full w-full object-contain"
              />
            </div>
            <span className="text-xl font-bold text-white hidden md:inline-block">SMU Telegram Bot</span>
            <span className="text-xl font-bold text-white md:hidden">SMU</span>
          </div>

          {/* Search bar - desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Search messages, channels..."
                className="pl-8 bg-gray-800 border-gray-700 text-white placeholder:text-gray-400 focus:border-gray-600 focus:ring-gray-600"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative text-white hover:bg-gray-800">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-white text-[10px] text-black font-bold">
                3
              </span>
            </Button>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-white hover:bg-gray-800"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>

            {/* Desktop navigation */}
            <div className="hidden md:flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" className="text-white hover:bg-gray-800">
                  Dashboard
                </Button>
              </Link>
              <Link href="/profile">
                <Button className="bg-white text-black hover:bg-gray-200">Profile</Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile menu and search */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 px-2 space-y-4 border-t border-gray-800">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Search..."
                className="pl-8 bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
              />
            </div>
            <div className="flex flex-col space-y-2">
              <Link href="/dashboard" className="text-white hover:bg-gray-800 px-3 py-2 rounded-md">
                Dashboard
              </Link>
              <Link href="/profile" className="text-white hover:bg-gray-800 px-3 py-2 rounded-md">
                Profile
              </Link>
              <Link href="/settings" className="text-white hover:bg-gray-800 px-3 py-2 rounded-md">
                Settings
              </Link>
              <Link href="/logout" className="text-white hover:bg-gray-800 px-3 py-2 rounded-md">
                Logout
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

function Footer() {
  return (
    <footer className="w-full border-t bg-black py-6">
      <div className="container mx-auto px-4 flex flex-col items-center justify-between gap-4 md:flex-row">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 overflow-hidden bg-white rounded-full p-0.5">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-MIU80dpxRKtuTeJHLCI2lMsiDOdSYe.png"
              alt="SMU Logo"
              className="h-full w-full object-contain"
            />
          </div>
          <p className="text-sm text-white">© 2024 St. Mary's University. All rights reserved.</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex gap-4">
            <Link href="#" className="text-sm text-white/80 hover:text-white hover:underline">
              Terms
            </Link>
            <Link href="#" className="text-sm text-white/80 hover:text-white hover:underline">
              Privacy
            </Link>
            <Link href="#" className="text-sm text-white/80 hover:text-white hover:underline">
              Contact
            </Link>
          </div>
          <div className="text-sm text-white/80">Mexico Square, Addis Ababa, Ethiopia | +251-11 5538001</div>
        </div>
      </div>
    </footer>
  )
}
