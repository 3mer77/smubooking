"use server"

import { revalidatePath } from "next/cache"

type SendMessageResult = {
  success: boolean
  message: string
}

export async function sendTelegramMessage(formData: FormData): Promise<SendMessageResult> {
  try {
    const message = formData.get("message") as string
    const chatId = formData.get("chatId") as string

    if (!message || !chatId) {
      return {
        success: false,
        message: "Message and Chat ID are required",
      }
    }

    // Get the bot token from environment variables
    const botToken = process.env.TELEGRAM_BOT_TOKEN

    if (!botToken) {
      return {
        success: false,
        message: "Bot token is not configured",
      }
    }

    // Send message to Telegram
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "HTML", // Support HTML formatting
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error("Telegram API error:", data)
      return {
        success: false,
        message: `Error: ${data.description || "Failed to send message"}`,
      }
    }

    revalidatePath("/")
    return {
      success: true,
      message: "Message sent successfully!",
    }
  } catch (error) {
    console.error("Error sending message:", error)
    return {
      success: false,
      message: `Error: ${error instanceof Error ? error.message : "Unknown error occurred"}`,
    }
  }
}

export async function getChatInfo(chatId: string) {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN

    if (!botToken || !chatId) {
      return {
        success: false,
        message: "Bot token or Chat ID is not provided",
      }
    }

    // Get chat information from Telegram
    const response = await fetch(`https://api.telegram.org/bot${botToken}/getChat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error("Telegram API error:", data)
      return {
        success: false,
        message: `Error: ${data.description || "Failed to get chat info"}`,
      }
    }

    return {
      success: true,
      data: data.result,
    }
  } catch (error) {
    console.error("Error getting chat info:", error)
    return {
      success: false,
      message: `Error: ${error instanceof Error ? error.message : "Unknown error occurred"}`,
    }
  }
}
