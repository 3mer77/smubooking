"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2, ImageIcon, Send } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { sendTelegramMessage } from "@/app/actions/telegram"

type TelegramChannel = {
  id: string
  chatId: string
  name: string
  type?: string
  username?: string
  verified: boolean
}

export function TelegramComposer() {
  const [message, setMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [channels, setChannels] = useState<TelegramChannel[]>([])
  const [selectedChannels, setSelectedChannels] = useState<string[]>([])
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    // Load channels from localStorage
    try {
      const savedChannels = window.localStorage.getItem("telegramChannels")
      if (savedChannels) {
        const parsedChannels = JSON.parse(savedChannels)
        setChannels(parsedChannels)

        // By default, select all channels
        setSelectedChannels(parsedChannels.map((channel: TelegramChannel) => channel.id))
      }
    } catch (error) {
      console.error("Error accessing localStorage:", error)
    }
  }, [])

  const toggleChannel = (channelId: string) => {
    setSelectedChannels((prev) =>
      prev.includes(channelId) ? prev.filter((id) => id !== channelId) : [...prev, channelId],
    )
  }

  const selectAllChannels = () => {
    setSelectedChannels(channels.map((channel) => channel.id))
  }

  const deselectAllChannels = () => {
    setSelectedChannels([])
  }

  const handleSubmit = async (formData: FormData) => {
    setIsSending(true)
    setError("")
    setSuccess("")

    try {
      if (selectedChannels.length === 0) {
        setError("Please select at least one channel to send to")
        setIsSending(false)
        return
      }

      // Get the selected channel IDs
      const selectedChatIds = channels
        .filter((channel) => selectedChannels.includes(channel.id))
        .map((channel) => channel.chatId)

      if (selectedChatIds.length === 0) {
        setError("No valid channels selected")
        setIsSending(false)
        return
      }

      // Send to each selected channel
      const results = await Promise.all(
        selectedChatIds.map(async (chatId) => {
          const channelFormData = new FormData()
          channelFormData.append("message", message)
          channelFormData.append("chatId", chatId)
          return sendTelegramMessage(channelFormData)
        }),
      )

      // Check if all messages were sent successfully
      const allSuccessful = results.every((result) => result.success)
      const successCount = results.filter((result) => result.success).length

      if (allSuccessful) {
        setSuccess(`Message sent successfully to ${successCount} channel${successCount !== 1 ? "s" : ""}!`)
      } else if (successCount > 0) {
        setSuccess(`Message sent to ${successCount} out of ${selectedChatIds.length} channels`)
        setError("Some channels failed. Please check your configuration.")
      } else {
        setError("Failed to send message to any channel. Please check your configuration.")
      }

      // Clear the message input on any success
      if (successCount > 0) {
        setMessage("")
        formRef.current?.reset()

        // Save to message history
        try {
          const history = JSON.parse(window.localStorage.getItem("messageHistory") || "[]")

          // Add an entry for each successful channel
          results.forEach((result, index) => {
            if (result.success) {
              history.push({
                id: Date.now() + index,
                message: message,
                chatId: selectedChatIds[index],
                channelName: channels.find((c) => c.chatId === selectedChatIds[index])?.name || "Unknown",
                timestamp: new Date().toISOString(),
              })
            }
          })

          window.localStorage.setItem("messageHistory", JSON.stringify(history.slice(-20))) // Keep last 20 messages
        } catch (error) {
          console.error("Error saving message history:", error)
        }
      }
    } catch (error) {
      setError(`Error: ${error instanceof Error ? error.message : "Unknown error occurred"}`)
    }

    setIsSending(false)
  }

  return (
    <Card className="bg-white border-gray-200">
      <CardHeader className="bg-black text-white">
        <CardTitle>Post to Telegram</CardTitle>
        <CardDescription className="text-gray-300">
          Compose a message to post to your Telegram groups or channels
        </CardDescription>
      </CardHeader>
      <form ref={formRef} action={handleSubmit}>
        <CardContent className="space-y-4 pt-6">
          {channels.length === 0 ? (
            <Alert className="bg-yellow-50 border-yellow-200 text-yellow-800">
              <AlertCircle className="h-4 w-4 text-yellow-800" />
              <AlertTitle>No Channels Configured</AlertTitle>
              <AlertDescription>
                Please go to the Settings tab and add at least one Telegram channel first.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-black font-medium">Select channels to send to:</Label>
                <div className="space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={selectAllChannels}
                    className="text-xs h-7 border-gray-300"
                  >
                    Select All
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={deselectAllChannels}
                    className="text-xs h-7 border-gray-300"
                  >
                    Deselect All
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {channels.map((channel) => (
                  <div key={channel.id} className="flex items-center space-x-2 border border-gray-200 rounded-md p-2">
                    <Checkbox
                      id={`channel-${channel.id}`}
                      checked={selectedChannels.includes(channel.id)}
                      onCheckedChange={() => toggleChannel(channel.id)}
                    />
                    <Label htmlFor={`channel-${channel.id}`} className="flex-1 cursor-pointer text-sm">
                      <div className="font-medium">{channel.name}</div>
                      <div className="text-xs text-gray-500">
                        {channel.type} {channel.username ? `• @${channel.username}` : ""}
                      </div>
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-2">
            <Label htmlFor="message" className="text-black font-medium">
              Message:
            </Label>
            <Textarea
              id="message"
              name="message"
              placeholder="Type your message here..."
              className="min-h-[150px] mt-2 border-gray-300 focus:border-gray-500 focus:ring-gray-500"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <p className="text-sm text-gray-600 mt-1">
              You can use HTML formatting:{" "}
              <code className="bg-gray-100 px-1 py-0.5 rounded">&lt;b&gt;bold&lt;/b&gt;</code>,{" "}
              <code className="bg-gray-100 px-1 py-0.5 rounded">&lt;i&gt;italic&lt;/i&gt;</code>,{" "}
              <code className="bg-gray-100 px-1 py-0.5 rounded">&lt;a href="..."&gt;link&lt;/a&gt;</code>
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
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-between gap-3 bg-gray-50 border-t border-gray-200">
          <Button type="button" variant="outline" disabled className="border-gray-300 text-gray-700 w-full sm:w-auto">
            <ImageIcon className="mr-2 h-4 w-4" />
            Add Media (Coming Soon)
          </Button>
          <Button
            type="submit"
            disabled={isSending || !message.trim() || selectedChannels.length === 0 || channels.length === 0}
            className="bg-black hover:bg-gray-800 text-white w-full sm:w-auto"
          >
            <Send className="mr-2 h-4 w-4" />
            {isSending
              ? "Sending..."
              : `Send to ${selectedChannels.length} channel${selectedChannels.length !== 1 ? "s" : ""}`}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
