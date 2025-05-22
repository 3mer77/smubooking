"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpRight, MessageSquare, Users, Send, Clock } from "lucide-react"

export function DashboardStats() {
  const [stats, setStats] = useState({
    totalMessages: 0,
    channels: 0,
    sentToday: 0,
    scheduledMessages: 0,
  })

  useEffect(() => {
    // Calculate stats from localStorage
    try {
      // Get message history
      const history = JSON.parse(localStorage.getItem("messageHistory") || "[]")

      // Get channels
      const channels = JSON.parse(localStorage.getItem("telegramChannels") || "[]")

      // Calculate messages sent today
      const today = new Date().toDateString()
      const sentToday = history.filter((msg: any) => new Date(msg.timestamp).toDateString() === today).length

      setStats({
        totalMessages: history.length,
        channels: channels.length,
        sentToday,
        scheduledMessages: 0, // For future implementation
      })
    } catch (error) {
      console.error("Error calculating stats:", error)
    }
  }, [])

  return (
    <div>
      <h2 className="text-xl font-bold mb-4 text-black">Dashboard Overview</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Messages"
          value={stats.totalMessages.toString()}
          description="Messages sent"
          icon={<MessageSquare className="h-5 w-5 text-blue-600" />}
          trend="up"
        />
        <StatCard
          title="Channels"
          value={stats.channels.toString()}
          description="Connected channels"
          icon={<Users className="h-5 w-5 text-green-600" />}
        />
        <StatCard
          title="Sent Today"
          value={stats.sentToday.toString()}
          description="Messages today"
          icon={<Send className="h-5 w-5 text-purple-600" />}
          trend="up"
        />
        <StatCard
          title="Scheduled"
          value={stats.scheduledMessages.toString()}
          description="Pending messages"
          icon={<Clock className="h-5 w-5 text-amber-600" />}
        />
      </div>
    </div>
  )
}

interface StatCardProps {
  title: string
  value: string
  description: string
  icon: React.ReactNode
  trend?: "up" | "down"
}

function StatCard({ title, value, description, icon, trend }: StatCardProps) {
  return (
    <Card className="border-gray-200">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
        <div className="rounded-full bg-gray-100 p-1">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-black">{value}</div>
        <p className="text-xs text-gray-500 mt-1">{description}</p>
        {trend && (
          <div className={`flex items-center mt-2 text-xs ${trend === "up" ? "text-green-600" : "text-red-600"}`}>
            <ArrowUpRight className="h-3 w-3 mr-1" />
            <span>{trend === "up" ? "Increased" : "Decreased"} from last period</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
