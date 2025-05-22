"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2, MessageSquare } from "lucide-react"

type Message = {
  id: number
  message: string
  chatId: string
  channelName?: string
  timestamp: string
}

export function MessageHistory() {
  const [messages, setMessages] = useState<Message[]>([])
  const [channels, setChannels] = useState<Record<string, string>>({})
  const [visibleMessages, setVisibleMessages] = useState(5)

  useEffect(() => {
    // Load message history from localStorage
    try {
      const history = JSON.parse(window.localStorage.getItem("messageHistory") || "[]")
      setMessages(history)

      // Load channels to get names
      const savedChannels = JSON.parse(window.localStorage.getItem("telegramChannels") || "[]")
      const channelMap: Record<string, string> = {}
      savedChannels.forEach((channel: any) => {
        channelMap[channel.chatId] = channel.name
      })
      setChannels(channelMap)
    } catch (error) {
      console.error("Error loading message history:", error)
      setMessages([])
    }
  }, [])

  const clearHistory = () => {
    try {
      window.localStorage.setItem("messageHistory", "[]")
      setMessages([])
    } catch (error) {
      console.error("Error clearing message history:", error)
    }
  }

  const loadMore = () => {
    setVisibleMessages((prev) => prev + 5)
  }

  if (messages.length === 0) {
    return (
      <Card className="bg-white border-gray-200">
        <CardHeader className="bg-black text-white">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Message History</CardTitle>
              <CardDescription className="text-gray-300">Recent messages sent to Telegram</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 flex flex-col items-center justify-center min-h-[150px] text-center">
          <MessageSquare className="h-10 w-10 text-gray-300 mb-2" />
          <p className="text-gray-500">No messages sent yet</p>
          <p className="text-sm text-gray-400">Messages you send will appear here</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white border-gray-200">
      <CardHeader className="bg-black text-white">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Message History</CardTitle>
            <CardDescription className="text-gray-300">Recent messages sent to Telegram</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={clearHistory}
            className="bg-transparent border-gray-500 text-gray-300 hover:bg-gray-800 hover:text-white"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {messages
            .slice(0, visibleMessages)
            .map((msg) => (
              <div key={msg.id} className="border border-gray-200 rounded-md p-4 bg-gray-50">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                  <span className="text-sm text-gray-600 order-2 sm:order-1">
                    {new Date(msg.timestamp).toLocaleString()}
                  </span>
                  <span className="text-xs bg-gray-200 px-2 py-1 rounded-full text-gray-700 self-start order-1 sm:order-2">
                    {msg.channelName || channels[msg.chatId] || `Chat ID: ${msg.chatId}`}
                  </span>
                </div>
                <p className="whitespace-pre-wrap text-black">{msg.message}</p>
              </div>
            ))
            .reverse()}

          {messages.length > visibleMessages && (
            <div className="flex justify-center pt-2">
              <Button variant="outline" size="sm" onClick={loadMore} className="w-full">
                Load More
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
