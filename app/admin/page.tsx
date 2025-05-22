"use client"

import { useState, useEffect } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { 
  CalendarDays, 
  ChevronDown, 
  ClipboardCheck, 
  Clock, 
  Dot, 
  FileWarning, 
  HelpCircle, 
  Info, 
  User, 
  Building2, 
  MonitorSmartphone,
  MapPin
} from "lucide-react"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { db, bookingsCollection, BookingStatus, RoomType, EquipmentType } from "@/lib/firebase"
import { collection, getDocs, query, where, Timestamp } from "firebase/firestore"

// Dashboard data types
interface StatsData {
  totalRooms: number
  totalEquipment: number
  totalBookings: number
  pendingApprovals: number
  availableRooms: number
  maintenanceItems: number
}

interface BookingData {
  status: string
  count: number
  color: string
}

export default function AdminDashboardPage() {
  const [statsData, setStatsData] = useState<StatsData>({
    totalRooms: 0,
    totalEquipment: 0,
    totalBookings: 0,
    pendingApprovals: 0,
    availableRooms: 0,
    maintenanceItems: 0
  })
  
  const [bookingStats, setBookingStats] = useState<BookingData[]>([])
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState("week")

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        
        // Fetch rooms data
        const roomsSnapshot = await getDocs(collection(db, 'rooms'))
        const totalRooms = roomsSnapshot.size
        
        // Count available rooms
        const availableRooms = roomsSnapshot.docs.filter(
          doc => (doc.data() as RoomType).status === 'available'
        ).length
        
        // Fetch equipment data
        const equipmentSnapshot = await getDocs(collection(db, 'equipment'))
        const totalEquipment = equipmentSnapshot.size
        
        // Count maintenance items
        const maintenanceItems = roomsSnapshot.docs.filter(
          doc => (doc.data() as RoomType).status === 'maintenance'
        ).length + equipmentSnapshot.docs.filter(
          doc => (doc.data() as EquipmentType).status === 'maintenance'
        ).length
        
        // Fetch bookings data
        const bookingsSnapshot = await getDocs(collection(db, 'bookings'))
        const totalBookings = bookingsSnapshot.size
        
        // Count pending approvals
        const pendingApprovalsQuery = query(
          bookingsCollection,
          where("status", "==", BookingStatus.PENDING)
        )
        const pendingApprovalsSnapshot = await getDocs(pendingApprovalsQuery)
        const pendingApprovals = pendingApprovalsSnapshot.size
        
        // Set stats data
        setStatsData({
          totalRooms,
          totalEquipment,
          totalBookings,
          pendingApprovals,
          availableRooms,
          maintenanceItems
        })
        
        // Generate booking stats for pie chart
        const approvedBookings = bookingsSnapshot.docs.filter(
          doc => doc.data().status === BookingStatus.APPROVED
        ).length
        
        const rejectedBookings = bookingsSnapshot.docs.filter(
          doc => doc.data().status === BookingStatus.REJECTED
        ).length
        
        const cancelledBookings = bookingsSnapshot.docs.filter(
          doc => doc.data().status === BookingStatus.CANCELLED
        ).length
        
        const completedBookings = bookingsSnapshot.docs.filter(
          doc => doc.data().status === BookingStatus.COMPLETED
        ).length
        
        setBookingStats([
          { status: "Pending", count: pendingApprovals, color: "#f59e0b" },
          { status: "Approved", count: approvedBookings, color: "#10b981" },
          { status: "Rejected", count: rejectedBookings, color: "#ef4444" },
          { status: "Cancelled", count: cancelledBookings, color: "#6b7280" },
          { status: "Completed", count: completedBookings, color: "#3b82f6" }
        ])
        
        setLoading(false)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        setLoading(false)
      }
    }
    
    fetchDashboardData()
  }, [])

  // Sample data for the usage chart
  const usageData = [
    { name: "Mon", rooms: 12, equipment: 8 },
    { name: "Tue", rooms: 19, equipment: 10 },
    { name: "Wed", rooms: 15, equipment: 12 },
    { name: "Thu", rooms: 22, equipment: 15 },
    { name: "Fri", rooms: 28, equipment: 20 },
    { name: "Sat", rooms: 10, equipment: 5 },
    { name: "Sun", rooms: 6, equipment: 3 }
  ]

  // Campus utilization data
  const campusData = [
    { name: "Mexico Campus", usage: 68 },
    { name: "Main Campus", usage: 82 },
    { name: "New Campus", usage: 45 }
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-gray-500">Overview of the SMU Booking System</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1">
            <CalendarDays className="h-4 w-4" />
            <span>Today</span>
          </Button>
          <Button variant="outline" size="sm" className="gap-1">
            <Clock className="h-4 w-4" />
            <span>This Month</span>
          </Button>
          <Button variant="outline" size="sm" className="gap-1">
            <FileWarning className="h-4 w-4" />
            <span>Export</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Rooms</CardTitle>
            <Building2 className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsData.totalRooms}</div>
            <p className="text-xs text-gray-500">
              {statsData.availableRooms} available
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Equipment</CardTitle>
            <MonitorSmartphone className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsData.totalEquipment}</div>
            <p className="text-xs text-gray-500">
              {statsData.maintenanceItems} in maintenance
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsData.totalBookings}</div>
            <p className="text-xs text-gray-500">
              Across all facilities
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <HelpCircle className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsData.pendingApprovals}</div>
            <p className="text-xs text-gray-500">
              Requires your attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Resource Usage</CardTitle>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-sm">
                <Dot className="h-4 w-4 text-blue-500" />
                <span>Rooms</span>
              </div>
              <div className="flex items-center gap-1 text-sm">
                <Dot className="h-4 w-4 text-green-500" />
                <span>Equipment</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={usageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="rooms" fill="#3b82f6" />
                <Bar dataKey="equipment" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Booking Status</CardTitle>
            <CardDescription>Distribution of all bookings</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={bookingStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="count"
                  label={({ status, count }) => `${status}: ${count}`}
                >
                  {bookingStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Campus Utilization */}
      <Card>
        <CardHeader>
          <CardTitle>Campus Utilization</CardTitle>
          <CardDescription>Resource usage across different campuses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {campusData.map((campus) => (
              <div key={campus.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">{campus.name}</span>
                  </div>
                  <span className="text-sm font-medium">{campus.usage}%</span>
                </div>
                <Progress value={campus.usage} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
