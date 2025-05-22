"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, User, Clock } from "lucide-react"

type Activity = {
  id: number
  type: "message" | "channel" | "login"
  title: string
  description: string
  time: string
}

export function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([])

  useEffect(() => {
    // Generate some sample activities based on real data
    try {
      // Get message history
      const history = JSON.parse(localStorage.getItem("messageHistory") || "[]")

      // Get channels
      const channels = JSON.parse(localStorage.getItem("telegramChannels") || "[]")

      const newActivities: Activity[] = []

      // Add message activities
      history.slice(0, 3).forEach((msg: any, index: number) => {
        newActivities.push({
          id: index,
          type: "message",
          title: "Message Sent",
          description: `Message sent to ${msg.channelName || "channel"}`,
          time: new Date(msg.timestamp).toLocaleString(),
        })
      })

      // Add channel activities
      channels.slice(0, 2).forEach((channel: any, index: number) => {
        newActivities.push({
          id: 100 + index,
          type: "channel",
          title: "Channel Added",
          description: `Connected to ${channel.name}`,
          time: new Date().toLocaleString(),
        })
      })

      // Add login activity
      newActivities.push({
        id: 999,
        type: "login",
        title: "User Login",
        description: "You logged in successfully",
        time: new Date().toLocaleString(),
      })

      // Sort by most recent
      newActivities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())

      setActivities(newActivities.slice(0, 5))
    } catch (error) {
      console.error("Error generating activities:", error)

      // Fallback activities
      setActivities([
        {
          id: 1,
          type: "login",
          title: "User Login",
          description: "You logged in successfully",
          time: new Date().toLocaleString(),
        },
      ])
    }
  }, [])

  return (
    <Card className="border-gray-200">
      <CardHeader className="bg-black text-white">
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription className="text-gray-300">Latest actions in your account</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {activities.length > 0 ? (
            activities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="rounded-full bg-gray-100 p-1.5">
                  {activity.type === "message" && <MessageSquare className="h-4 w-4 text-blue-600" />}
                  {activity.type === "channel" && <User className="h-4 w-4 text-green-600" />}
                  {activity.type === "login" && <Clock className="h-4 w-4 text-amber-600" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-black">{activity.title}</p>
                  <p className="text-xs text-gray-500">{activity.description}</p>
                  <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No recent activity found</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
