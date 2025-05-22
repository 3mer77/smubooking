"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Toaster } from "sonner"
import { seedDatabase } from "@/lib/seed-data"
import { showAuthSuccessToast, showAuthErrorToast } from "@/lib/utils"

export default function SeedPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message?: string }>()
  const router = useRouter()

  const handleSeedDatabase = async () => {
    setIsLoading(true)
    try {
      const seedResult = await seedDatabase()
      setResult({
        success: seedResult.success,
        message: seedResult.success 
          ? "Database seeded successfully!" 
          : `Error: ${seedResult.error}`
      })
      
      if (seedResult.success) {
        showAuthSuccessToast("Database seeded successfully!")
      } else {
        showAuthErrorToast(`Error seeding database: ${seedResult.error}`)
      }
    } catch (error: any) {
      setResult({
        success: false,
        message: `Error: ${error.message}`
      })
      showAuthErrorToast(`Error seeding database: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-white to-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Database Seed Utility</CardTitle>
          <CardDescription className="text-center">
            This utility will populate the database with sample data for testing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-yellow-800 text-sm">
              Warning: This operation will add sample data to your database. It is intended for development and testing purposes only.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button 
            onClick={handleSeedDatabase} 
            className="w-full bg-amber-600 hover:bg-amber-700" 
            disabled={isLoading}
          >
            {isLoading ? "Seeding Database..." : "Seed Database"}
          </Button>
          
          {result && (
            <div className={`p-4 border rounded-md w-full ${
              result.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
            }`}>
              <p className={`text-sm ${
                result.success ? "text-green-800" : "text-red-800"
              }`}>
                {result.message}
              </p>
            </div>
          )}
          
          <Button 
            variant="outline" 
            onClick={() => router.push("/login")} 
            className="w-full"
          >
            Go to Login
          </Button>
        </CardFooter>
      </Card>
      <Toaster />
    </div>
  )
}
