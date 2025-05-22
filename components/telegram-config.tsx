"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2, Plus, Trash2 } from "lucide-react"
import { getChatInfo } from "@/app/actions/telegram"

type TelegramChannel = {
  id: string
  chatId: string
  name: string
  type?: string
  username?: string
  verified: boolean
}

export function TelegramConfig() {
  const [newChatId, setNewChatId] = useState("")
  const [channels, setChannels] = useState<TelegramChannel[]>([])
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    // Load saved channels from localStorage
    try {
      const savedChannels = window.localStorage.getItem("telegramChannels")
      if (savedChannels) {
        setChannels(JSON.parse(savedChannels))
      }
    } catch (error) {
      console.error("Error accessing localStorage:", error)
    }
  }, [])

  const verifyChatId = async (chatId: string): Promise<TelegramChannel | null> => {
    setIsVerifying(true)
    setError("")
    setSuccess("")

    try {
      const result = await getChatInfo(chatId)

      if (result.success && result.data) {
        const channel: TelegramChannel = {
          id: Date.now().toString(), // Generate a unique ID
          chatId: chatId,
          name: result.data.title || "Unnamed Channel",
          type: result.data.type,
          username: result.data.username,
          verified: true,
        }
        return channel
      } else {
        setError(result.message || "Failed to verify chat ID")
        return null
      }
    } catch (error) {
      console.error("Error verifying chat:", error)
      setError(`Error: ${error instanceof Error ? error.message : "Unknown error occurred"}`)
      return null
    } finally {
      setIsVerifying(false)
    }
  }

  const handleAddChannel = async () => {
    if (!newChatId) {
      setError("Please enter a chat ID")
      return
    }

    // Check if this chat ID already exists
    if (channels.some((channel) => channel.chatId === newChatId)) {
      setError("This chat ID is already added")
      return
    }

    const verifiedChannel = await verifyChatId(newChatId)

    if (verifiedChannel) {
      const updatedChannels = [...channels, verifiedChannel]
      setChannels(updatedChannels)

      try {
        window.localStorage.setItem("telegramChannels", JSON.stringify(updatedChannels))
        setSuccess(`Channel "${verifiedChannel.name}" added successfully!`)
        setNewChatId("") // Clear the input
      } catch (error) {
        console.error("Error saving to localStorage:", error)
        setError("Failed to save channel to browser storage")
      }
    }
  }

  const handleRemoveChannel = (id: string) => {
    const updatedChannels = channels.filter((channel) => channel.id !== id)
    setChannels(updatedChannels)

    try {
      window.localStorage.setItem("telegramChannels", JSON.stringify(updatedChannels))
    } catch (error) {
      console.error("Error saving to localStorage:", error)
    }
  }

  return (
    <Card className="bg-white border-gray-200">
      <CardHeader className="bg-black text-white">
        <CardTitle>Telegram Channels Configuration</CardTitle>
        <CardDescription className="text-gray-300">
          Configure multiple Telegram groups or channels where messages can be posted
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        <div className="space-y-2">
          <Label htmlFor="chatId" className="text-black">
            Add New Channel/Group
          </Label>
          <div className="flex gap-2">
            <Input
              id="chatId"
              placeholder="Enter group/channel ID (e.g., -1001234567890)"
              value={newChatId}
              onChange={(e) => setNewChatId(e.target.value)}
              className="border-gray-300 focus:border-gray-500 focus:ring-gray-500"
            />
            <Button
              onClick={handleAddChannel}
              disabled={isVerifying || !newChatId}
              className="bg-black hover:bg-gray-800 text-white"
            >
              {isVerifying ? "Verifying..." : <Plus className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-sm text-gray-600">
            Enter the ID of a Telegram group or channel. Make sure the bot is added to the group/channel as an admin.
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert variant="default" className="bg-green-50 border-green-200 text-green-800">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {channels.length > 0 && (
          <div className="mt-6">
            <h3 className="font-medium text-black mb-3">Configured Channels ({channels.length})</h3>
            <div className="space-y-3">
              {channels.map((channel) => (
                <div
                  key={channel.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-md bg-gray-50"
                >
                  <div>
                    <div className="font-medium text-black">{channel.name}</div>
                    <div className="text-sm text-gray-600">ID: {channel.chatId}</div>
                    {channel.username && <div className="text-sm text-gray-600">@{channel.username}</div>}
                    <div className="text-xs text-gray-500 mt-1">Type: {channel.type}</div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveChannel(channel.id)}
                    className="border-gray-300 text-gray-700 hover:bg-gray-200"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="bg-gray-50 border-t border-gray-200">
        <div className="text-sm text-gray-600 w-full">
          {channels.length === 0
            ? "No channels configured. Add at least one channel to start sending messages."
            : `${channels.length} channel${channels.length > 1 ? "s" : ""} configured. You can send messages to any or all of these channels.`}
        </div>
      </CardFooter>
    </Card>
  )
}
