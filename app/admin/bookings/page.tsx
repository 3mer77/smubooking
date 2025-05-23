"use client"

import { useState, useEffect } from "react"
import {
  Calendar,
  Check,
  Clock,
  Edit,
  FileText,
  Filter,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  User,
  X,
  Building2
} from "lucide-react"
import { collection, getDocs, doc, deleteDoc, updateDoc, addDoc, getDoc, query, where, orderBy, Timestamp } from "firebase/firestore"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { db, bookingsCollection, BookingType, BookingStatus, roomsCollection, equipmentCollection, usersCollection, RoomType, EquipmentType, UserType } from "@/lib/firebase"
import { showAuthSuccessToast, showAuthErrorToast } from "@/lib/utils"
import { format, isValid } from "date-fns"

// Helper functions for formatting Firestore timestamps
const formatFirestoreTimestamp = (timestamp: any): string => {
  if (!timestamp) return 'N/A'
  
  // Check if it's a Firestore Timestamp
  if (timestamp && typeof timestamp.toDate === 'function') {
    return format(timestamp.toDate(), 'MMM dd, yyyy HH:mm')
  }
  
  // Check if it's a JavaScript Date
  if (timestamp instanceof Date && isValid(timestamp)) {
    return format(timestamp, 'MMM dd, yyyy HH:mm')
  }
  
  // If it's a serialized timestamp with seconds and nanoseconds
  if (timestamp && typeof timestamp === 'object' && 'seconds' in timestamp) {
    const date = new Date(timestamp.seconds * 1000)
    return isValid(date) ? format(date, 'MMM dd, yyyy HH:mm') : 'Invalid date'
  }
  
  return 'Invalid date'
}

const formatFirestoreTimestampDate = (timestamp: any): string => {
  if (!timestamp) return 'N/A'
  
  // Check if it's a Firestore Timestamp
  if (timestamp && typeof timestamp.toDate === 'function') {
    return format(timestamp.toDate(), 'MMM dd, yyyy')
  }
  
  // Check if it's a JavaScript Date
  if (timestamp instanceof Date && isValid(timestamp)) {
    return format(timestamp, 'MMM dd, yyyy')
  }
  
  // If it's a serialized timestamp with seconds and nanoseconds
  if (timestamp && typeof timestamp === 'object' && 'seconds' in timestamp) {
    const date = new Date(timestamp.seconds * 1000)
    return isValid(date) ? format(date, 'MMM dd, yyyy') : 'Invalid date'
  }
  
  return 'Invalid date'
}

const formatFirestoreTimestampTime = (timestamp: any): string => {
  if (!timestamp) return ''
  
  // Check if it's a Firestore Timestamp
  if (timestamp && typeof timestamp.toDate === 'function') {
    return format(timestamp.toDate(), 'HH:mm')
  }
  
  // Check if it's a JavaScript Date
  if (timestamp instanceof Date && isValid(timestamp)) {
    return format(timestamp, 'HH:mm')
  }
  
  // If it's a serialized timestamp with seconds and nanoseconds
  if (timestamp && typeof timestamp === 'object' && 'seconds' in timestamp) {
    const date = new Date(timestamp.seconds * 1000)
    return isValid(date) ? format(date, 'HH:mm') : ''
  }
  
  return ''
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<BookingType[]>([])
  const [users, setUsers] = useState<Record<string, UserType>>({})
  const [rooms, setRooms] = useState<Record<string, RoomType>>({})
  const [equipment, setEquipment] = useState<Record<string, EquipmentType>>({})
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [selectedResourceType, setSelectedResourceType] = useState<string>("all")
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false)
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<BookingType | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch bookings
      const bookingsSnapshot = await getDocs(bookingsCollection)
      const bookingsList = bookingsSnapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data
        } as BookingType
      })
      
      // Fetch rooms
      const roomsSnapshot = await getDocs(roomsCollection)
      const roomsData: Record<string, RoomType> = {}
      roomsSnapshot.docs.forEach(doc => {
        roomsData[doc.id] = { id: doc.id, ...doc.data() } as RoomType
      })
      
      // Fetch equipment
      const equipmentSnapshot = await getDocs(equipmentCollection)
      const equipmentData: Record<string, EquipmentType> = {}
      equipmentSnapshot.docs.forEach(doc => {
        equipmentData[doc.id] = { id: doc.id, ...doc.data() } as EquipmentType
      })
      
      // Fetch users
      const usersSnapshot = await getDocs(usersCollection)
      const usersData: Record<string, UserType> = {}
      usersSnapshot.docs.forEach(doc => {
        usersData[doc.id] = { uid: doc.id, ...doc.data() } as UserType
      })
      
      setBookings(bookingsList)
      setRooms(roomsData)
      setEquipment(equipmentData)
      setUsers(usersData)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching data:", error)
      showAuthErrorToast("Failed to load bookings")
      setLoading(false)
    }
  }
  
  const filteredBookings = bookings.filter(booking => {
    // Filter by search query (user name, resource name, booking id)
    const user = users[booking.userId]
    const resourceName = booking.resourceType === 'room' 
      ? rooms[booking.resourceId]?.name 
      : equipment[booking.resourceId]?.name
    
    const matchesSearch = 
      (user?.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      (resourceName?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      booking.id.toLowerCase().includes(searchQuery.toLowerCase())
    
    // Filter by status
    const matchesStatus = selectedStatus === "all" || booking.status === selectedStatus
    
    // Filter by resource type
    const matchesResourceType = selectedResourceType === "all" || booking.resourceType === selectedResourceType
    
    return matchesSearch && matchesStatus && matchesResourceType
  })
  
  const handleApproveBooking = async () => {
    if (!selectedBooking) return
    
    try {
      setLoading(true)
      
      // Update booking status
      const bookingRef = doc(db, 'bookings', selectedBooking.id)
      await updateDoc(bookingRef, {
        status: BookingStatus.APPROVED,
        approvedBy: "admin", // In a real app, use the actual admin user ID
        updatedAt: Timestamp.now()
      })
      
      // Refresh data
      await fetchData()
      setIsApproveDialogOpen(false)
      showAuthSuccessToast("Booking approved successfully")
    } catch (error) {
      console.error("Error approving booking:", error)
      showAuthErrorToast("Failed to approve booking")
      setLoading(false)
    }
  }
  
  const handleRejectBooking = async () => {
    if (!selectedBooking) return
    
    try {
      setLoading(true)
      
      // Update booking status
      const bookingRef = doc(db, 'bookings', selectedBooking.id)
      await updateDoc(bookingRef, {
        status: BookingStatus.REJECTED,
        rejectionReason,
        updatedAt: Timestamp.now()
      })
      
      // Refresh data
      await fetchData()
      setIsRejectDialogOpen(false)
      setRejectionReason("")
      showAuthSuccessToast("Booking rejected")
    } catch (error) {
      console.error("Error rejecting booking:", error)
      showAuthErrorToast("Failed to reject booking")
      setLoading(false)
    }
  }
  
  const handleDeleteBooking = async () => {
    if (!selectedBooking) return
    
    try {
      setLoading(true)
      
      // Delete booking
      await deleteDoc(doc(db, 'bookings', selectedBooking.id))
      
      // Refresh data
      await fetchData()
      setIsDeleteDialogOpen(false)
      showAuthSuccessToast("Booking deleted successfully")
    } catch (error) {
      console.error("Error deleting booking:", error)
      showAuthErrorToast("Failed to delete booking")
      setLoading(false)
    }
  }
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case BookingStatus.PENDING:
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-600 border-yellow-200">Pending</Badge>
      case BookingStatus.APPROVED:
        return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">Approved</Badge>
      case BookingStatus.REJECTED:
        return <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">Rejected</Badge>
      case BookingStatus.CANCELLED:
        return <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">Cancelled</Badge>
      case BookingStatus.COMPLETED:
        return <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">Completed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }
  
  const getResourceName = (booking: BookingType) => {
    if (booking.resourceType === 'room') {
      const room = rooms[booking.resourceId]
      return room ? `${room.name} (${room.building})` : 'Unknown room'
    } else {
      const item = equipment[booking.resourceId]
      return item ? item.name : 'Unknown equipment'
    }
  }
  
  const getResourceTypeIcon = (resourceType: string) => {
    return resourceType === 'room' 
      ? <Building2 className="h-4 w-4" /> 
      : <Clock className="h-4 w-4" />
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Bookings</h1>
      </div>
      
      {/* Filters and search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search bookings..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-sm">Status:</span>
          <Select
            value={selectedStatus}
            onValueChange={setSelectedStatus}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value={BookingStatus.PENDING}>Pending</SelectItem>
              <SelectItem value={BookingStatus.APPROVED}>Approved</SelectItem>
              <SelectItem value={BookingStatus.REJECTED}>Rejected</SelectItem>
              <SelectItem value={BookingStatus.CANCELLED}>Cancelled</SelectItem>
              <SelectItem value={BookingStatus.COMPLETED}>Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-sm">Resource:</span>
          <Select
            value={selectedResourceType}
            onValueChange={setSelectedResourceType}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="All Resources" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Resources</SelectItem>
              <SelectItem value="room">Rooms</SelectItem>
              <SelectItem value="equipment">Equipment</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Bookings table */}
      <Card>
        <CardHeader>
          <CardTitle>All Bookings</CardTitle>
          <CardDescription>
            Manage all bookings across the campus
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">
              <p>Loading bookings...</p>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              <p>No bookings found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Resource</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">{booking.id.substring(0, 8)}...</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span>{users[booking.userId]?.displayName || 'Unknown user'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getResourceTypeIcon(booking.resourceType)}
                        <span>{getResourceName(booking)}</span>
                      </div>
                    </TableCell>
                    <TableCell>{booking.startTime ? formatFirestoreTimestamp(booking.startTime) : 'N/A'}</TableCell>
                    <TableCell>{booking.endTime ? formatFirestoreTimestamp(booking.endTime) : 'N/A'}</TableCell>
                    <TableCell>{getStatusBadge(booking.status)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedBooking(booking)
                              setIsDetailsDialogOpen(true)
                            }}
                          >
                            <FileText className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          
                          {booking.status === BookingStatus.PENDING && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedBooking(booking)
                                  setIsApproveDialogOpen(true)
                                }}
                              >
                                <Check className="mr-2 h-4 w-4" />
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedBooking(booking)
                                  setIsRejectDialogOpen(true)
                                }}
                              >
                                <X className="mr-2 h-4 w-4" />
                                Reject
                              </DropdownMenuItem>
                            </>
                          )}
                          
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedBooking(booking)
                              setIsDeleteDialogOpen(true)
                            }}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      {/* Booking details dialog */}
      {selectedBooking && (
        <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Booking Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Booking ID</h3>
                <p>{selectedBooking.id}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">User</h3>
                <p>{users[selectedBooking.userId]?.displayName || 'Unknown user'}</p>
                <p className="text-sm text-gray-500">
                  {users[selectedBooking.userId]?.email || 'No email'}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Resource</h3>
                <div className="flex items-center gap-2">
                  {getResourceTypeIcon(selectedBooking.resourceType)}
                  <span>{getResourceName(selectedBooking)}</span>
                </div>
                <p className="text-sm text-gray-500 capitalize">
                  {selectedBooking.resourceType}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Start Time</h3>
                  <p>{selectedBooking.startTime ? formatFirestoreTimestampDate(selectedBooking.startTime) : 'N/A'}</p>
                  <p className="text-sm text-gray-500">
                    {selectedBooking.startTime ? formatFirestoreTimestampTime(selectedBooking.startTime) : ''}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">End Time</h3>
                  <p>{selectedBooking.endTime ? formatFirestoreTimestampDate(selectedBooking.endTime) : 'N/A'}</p>
                  <p className="text-sm text-gray-500">
                    {selectedBooking.endTime ? formatFirestoreTimestampTime(selectedBooking.endTime) : ''}
                  </p>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Status</h3>
                <div className="mt-1">{getStatusBadge(selectedBooking.status)}</div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Reason</h3>
                <p className="text-sm mt-1">{selectedBooking.reason || 'No reason provided'}</p>
              </div>
              
              {selectedBooking.status === BookingStatus.REJECTED && selectedBooking.rejectionReason && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Rejection Reason</h3>
                  <p className="text-sm mt-1">{selectedBooking.rejectionReason}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                <div>
                  <h3 className="text-sm font-medium">Created</h3>
                  <p>{selectedBooking.createdAt ? formatFirestoreTimestamp(selectedBooking.createdAt) : 'N/A'}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium">Last Updated</h3>
                  <p>{selectedBooking.updatedAt ? formatFirestoreTimestamp(selectedBooking.updatedAt) : 'N/A'}</p>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Approve booking dialog */}
      {selectedBooking && (
        <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Approve Booking</DialogTitle>
              <DialogDescription>
                Are you sure you want to approve this booking?
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm font-medium">
                Resource: <span className="font-bold">{getResourceName(selectedBooking)}</span>
              </p>
              <p className="text-sm text-gray-500">
                User: {users[selectedBooking.userId]?.displayName || 'Unknown user'}
              </p>
              <p className="text-sm text-gray-500">
                Time: {selectedBooking.startTime && format(selectedBooking.startTime.toDate(), 'MMM dd, yyyy HH:mm')} - {selectedBooking.endTime && format(selectedBooking.endTime.toDate(), 'HH:mm')}
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsApproveDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleApproveBooking}>Approve Booking</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Reject booking dialog */}
      {selectedBooking && (
        <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Booking</DialogTitle>
              <DialogDescription>
                Please provide a reason for rejecting this booking.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm font-medium">
                Resource: <span className="font-bold">{getResourceName(selectedBooking)}</span>
              </p>
              <p className="text-sm text-gray-500">
                User: {users[selectedBooking.userId]?.displayName || 'Unknown user'}
              </p>
              <p className="text-sm text-gray-500">
                Time: {selectedBooking.startTime && format(selectedBooking.startTime.toDate(), 'MMM dd, yyyy HH:mm')} - {selectedBooking.endTime && format(selectedBooking.endTime.toDate(), 'HH:mm')}
              </p>
              
              <div className="mt-4 space-y-2">
                <Label htmlFor="rejectionReason">Rejection Reason</Label>
                <Textarea 
                  id="rejectionReason" 
                  placeholder="Enter reason for rejection"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>Cancel</Button>
              <Button 
                variant="destructive" 
                onClick={handleRejectBooking}
                disabled={!rejectionReason.trim()}
              >
                Reject Booking
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Delete confirmation dialog */}
      {selectedBooking && (
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Booking</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this booking? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm font-medium">
                Resource: <span className="font-bold">{getResourceName(selectedBooking)}</span>
              </p>
              <p className="text-sm text-gray-500">
                User: {users[selectedBooking.userId]?.displayName || 'Unknown user'}
              </p>
              <p className="text-sm text-gray-500">
                Time: {selectedBooking.startTime && format(selectedBooking.startTime.toDate(), 'MMM dd, yyyy HH:mm')} - {selectedBooking.endTime && format(selectedBooking.endTime.toDate(), 'HH:mm')}
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleDeleteBooking}>Delete Booking</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
