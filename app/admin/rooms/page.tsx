"use client"

import { useState, useEffect } from "react"
import {
  Building,
  Edit,
  MapPin,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle
} from "lucide-react"
import { collection, getDocs, doc, deleteDoc, updateDoc, addDoc, getDoc, query, where, orderBy } from "firebase/firestore"

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
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { db, roomsCollection, RoomType } from "@/lib/firebase"
import { showAuthSuccessToast, showAuthErrorToast } from "@/lib/utils"
import { Timestamp } from "firebase/firestore"

export default function RoomsPage() {
  const [rooms, setRooms] = useState<RoomType[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCampus, setSelectedCampus] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<RoomType | null>(null)
  
  // New room form state
  const [newRoom, setNewRoom] = useState({
    name: "",
    building: "",
    floor: "",
    roomNumber: "",
    type: "Classroom",
    capacity: 0,
    features: [] as string[],
    campus: "Mexico",
    requiresApproval: false,
    status: "available" as "available" | "booked" | "maintenance",
  })

  useEffect(() => {
    fetchRooms()
  }, [])

  const fetchRooms = async () => {
    try {
      setLoading(true)
      const roomsSnapshot = await getDocs(roomsCollection)
      const roomsList = roomsSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as RoomType))
      
      setRooms(roomsList)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching rooms:", error)
      showAuthErrorToast("Failed to load rooms")
      setLoading(false)
    }
  }
  
  const filteredRooms = rooms.filter(room => {
    // Filter by search query
    const matchesSearch = 
      room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.building.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.roomNumber.toLowerCase().includes(searchQuery.toLowerCase())
    
    // Filter by campus
    const matchesCampus = selectedCampus === "all" || room.campus === selectedCampus
    
    // Filter by status
    const matchesStatus = selectedStatus === "all" || room.status === selectedStatus
    
    return matchesSearch && matchesCampus && matchesStatus
  })
  
  const handleAddRoom = async () => {
    try {
      setLoading(true)
      
      const timestamp = Timestamp.now()
      const roomData = {
        ...newRoom,
        createdAt: timestamp,
        updatedAt: timestamp
      }
      
      await addDoc(roomsCollection, roomData)
      
      // Reset form and close dialog
      setNewRoom({
        name: "",
        building: "",
        floor: "",
        roomNumber: "",
        type: "Classroom",
        capacity: 0,
        features: [],
        campus: "Mexico",
        requiresApproval: false,
        status: "available" as "available" | "booked" | "maintenance",
      })
      
      setIsAddDialogOpen(false)
      showAuthSuccessToast("Room added successfully")
      
      // Refresh rooms list
      fetchRooms()
    } catch (error) {
      console.error("Error adding room:", error)
      showAuthErrorToast("Failed to add room")
      setLoading(false)
    }
  }
  
  const handleUpdateRoom = async () => {
    if (!selectedRoom) return
    
    try {
      setLoading(true)
      
      const roomRef = doc(db, "rooms", selectedRoom.id)
      await updateDoc(roomRef, {
        ...selectedRoom,
        updatedAt: Timestamp.now()
      })
      
      setIsEditDialogOpen(false)
      showAuthSuccessToast("Room updated successfully")
      
      // Refresh rooms list
      fetchRooms()
    } catch (error) {
      console.error("Error updating room:", error)
      showAuthErrorToast("Failed to update room")
      setLoading(false)
    }
  }
  
  const handleDeleteRoom = async () => {
    if (!selectedRoom) return
    
    try {
      setLoading(true)
      
      await deleteDoc(doc(db, "rooms", selectedRoom.id))
      
      setIsDeleteDialogOpen(false)
      showAuthSuccessToast("Room deleted successfully")
      
      // Refresh rooms list
      fetchRooms()
    } catch (error) {
      console.error("Error deleting room:", error)
      showAuthErrorToast("Failed to delete room")
      setLoading(false)
    }
  }
  
  const getStatusBadge = (status: string) => {
    switch(status) {
      case "available":
        return <Badge className="bg-green-500 hover:bg-green-600">Available</Badge>
      case "booked":
        return <Badge className="bg-blue-500 hover:bg-blue-600">Booked</Badge>
      case "maintenance":
        return <Badge className="bg-amber-500 hover:bg-amber-600">Maintenance</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rooms Management</h1>
          <p className="text-gray-500">Manage all rooms and spaces across campuses</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-1">
                <Plus className="h-4 w-4" />
                <span>Add New Room</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add New Room</DialogTitle>
                <DialogDescription>
                  Enter the details for the new room. Click save when you're done.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Room Name</Label>
                    <Input 
                      id="name" 
                      value={newRoom.name}
                      onChange={(e) => setNewRoom({...newRoom, name: e.target.value})}
                      placeholder="e.g. Conference Room B1-101"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="roomNumber">Room Number</Label>
                    <Input 
                      id="roomNumber" 
                      value={newRoom.roomNumber}
                      onChange={(e) => setNewRoom({...newRoom, roomNumber: e.target.value})}
                      placeholder="e.g. 101"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="building">Building</Label>
                    <Input 
                      id="building" 
                      value={newRoom.building}
                      onChange={(e) => setNewRoom({...newRoom, building: e.target.value})}
                      placeholder="e.g. Building B1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="floor">Floor</Label>
                    <Input 
                      id="floor" 
                      value={newRoom.floor}
                      onChange={(e) => setNewRoom({...newRoom, floor: e.target.value})}
                      placeholder="e.g. 1st Floor"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="campus">Campus</Label>
                    <Select 
                      value={newRoom.campus}
                      onValueChange={(value) => setNewRoom({...newRoom, campus: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select campus" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Mexico">Mexico Campus</SelectItem>
                        <SelectItem value="Main">Main Campus</SelectItem>
                        <SelectItem value="New">New Campus</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Room Type</Label>
                    <Select 
                      value={newRoom.type}
                      onValueChange={(value) => setNewRoom({...newRoom, type: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Classroom">Classroom</SelectItem>
                        <SelectItem value="Office">Office</SelectItem>
                        <SelectItem value="Computer Lab">Computer Lab</SelectItem>
                        <SelectItem value="Conference Room">Conference Room</SelectItem>
                        <SelectItem value="Library">Library</SelectItem>
                        <SelectItem value="Hall">Hall</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="capacity">Capacity</Label>
                    <Input 
                      id="capacity" 
                      type="number" 
                      value={newRoom.capacity || ""}
                      onChange={(e) => setNewRoom({...newRoom, capacity: parseInt(e.target.value) || 0})}
                      placeholder="e.g. 30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select 
                      value={newRoom.status}
                      onValueChange={(value: "available" | "booked" | "maintenance") => setNewRoom({...newRoom, status: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="booked">Booked</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Features</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {["Projector", "Whiteboard", "Air Conditioner", "Computers", "Smart Board", "Sound System", "Video Conferencing"].map((feature) => (
                      <div key={feature} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`feature-${feature}`} 
                          checked={newRoom.features.includes(feature)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setNewRoom({...newRoom, features: [...newRoom.features, feature]})
                            } else {
                              setNewRoom({...newRoom, features: newRoom.features.filter(f => f !== feature)})
                            }
                          }}
                        />
                        <label
                          htmlFor={`feature-${feature}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {feature}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="requiresApproval" 
                    checked={newRoom.requiresApproval}
                    onCheckedChange={(checked) => setNewRoom({...newRoom, requiresApproval: !!checked})}
                  />
                  <label
                    htmlFor="requiresApproval"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Requires admin approval for booking
                  </label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAddRoom}>Save Room</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* Filters and search */}
      <div className="flex flex-col gap-4 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search rooms..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={selectedCampus} onValueChange={setSelectedCampus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by campus" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Campuses</SelectItem>
            <SelectItem value="Mexico">Mexico Campus</SelectItem>
            <SelectItem value="Main">Main Campus</SelectItem>
            <SelectItem value="New">New Campus</SelectItem>
          </SelectContent>
        </Select>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="booked">Booked</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Rooms table */}
      <Card>
        <CardHeader>
          <CardTitle>Rooms</CardTitle>
          <CardDescription>
            {filteredRooms.length} room{filteredRooms.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Approval</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">Loading rooms...</TableCell>
                </TableRow>
              ) : filteredRooms.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">No rooms found. Try adjusting your filters.</TableCell>
                </TableRow>
              ) : (
                filteredRooms.map((room) => (
                  <TableRow key={room.id}>
                    <TableCell className="font-medium">{room.name}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{room.building}</span>
                        <span className="text-xs text-gray-500">{room.campus} Campus</span>
                      </div>
                    </TableCell>
                    <TableCell>{room.type}</TableCell>
                    <TableCell>{room.capacity}</TableCell>
                    <TableCell>{getStatusBadge(room.status)}</TableCell>
                    <TableCell>
                      {room.requiresApproval ? (
                        <Badge variant="outline" className="border-amber-500 text-amber-600">Required</Badge>
                      ) : (
                        <Badge variant="outline" className="border-green-500 text-green-600">Not Required</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedRoom(room)
                              setIsEditDialogOpen(true)
                            }}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedRoom(room)
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
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Edit dialog */}
      {selectedRoom && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit Room</DialogTitle>
              <DialogDescription>
                Update the room details. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Room Name</Label>
                  <Input 
                    id="edit-name" 
                    value={selectedRoom.name}
                    onChange={(e) => setSelectedRoom({...selectedRoom, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-roomNumber">Room Number</Label>
                  <Input 
                    id="edit-roomNumber" 
                    value={selectedRoom.roomNumber}
                    onChange={(e) => setSelectedRoom({...selectedRoom, roomNumber: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-building">Building</Label>
                  <Input 
                    id="edit-building" 
                    value={selectedRoom.building}
                    onChange={(e) => setSelectedRoom({...selectedRoom, building: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-floor">Floor</Label>
                  <Input 
                    id="edit-floor" 
                    value={selectedRoom.floor}
                    onChange={(e) => setSelectedRoom({...selectedRoom, floor: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-campus">Campus</Label>
                  <Select 
                    value={selectedRoom.campus}
                    onValueChange={(value) => setSelectedRoom({...selectedRoom, campus: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select campus" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mexico">Mexico Campus</SelectItem>
                      <SelectItem value="Main">Main Campus</SelectItem>
                      <SelectItem value="New">New Campus</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-type">Room Type</Label>
                  <Select 
                    value={selectedRoom.type}
                    onValueChange={(value) => setSelectedRoom({...selectedRoom, type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Classroom">Classroom</SelectItem>
                      <SelectItem value="Office">Office</SelectItem>
                      <SelectItem value="Computer Lab">Computer Lab</SelectItem>
                      <SelectItem value="Conference Room">Conference Room</SelectItem>
                      <SelectItem value="Library">Library</SelectItem>
                      <SelectItem value="Hall">Hall</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-capacity">Capacity</Label>
                  <Input 
                    id="edit-capacity" 
                    type="number" 
                    value={selectedRoom.capacity || ""}
                    onChange={(e) => setSelectedRoom({...selectedRoom, capacity: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select 
                    value={selectedRoom.status}
                    onValueChange={(value: "available" | "booked" | "maintenance") => setSelectedRoom({...selectedRoom, status: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="booked">Booked</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Features</Label>
                <div className="grid grid-cols-2 gap-2">
                  {["Projector", "Whiteboard", "Air Conditioner", "Computers", "Smart Board", "Sound System", "Video Conferencing"].map((feature) => (
                    <div key={feature} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`edit-feature-${feature}`} 
                        checked={selectedRoom.features.includes(feature)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedRoom({...selectedRoom, features: [...selectedRoom.features, feature]})
                          } else {
                            setSelectedRoom({...selectedRoom, features: selectedRoom.features.filter(f => f !== feature)})
                          }
                        }}
                      />
                      <label
                        htmlFor={`edit-feature-${feature}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {feature}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="edit-requiresApproval" 
                  checked={selectedRoom.requiresApproval}
                  onCheckedChange={(checked) => setSelectedRoom({...selectedRoom, requiresApproval: !!checked})}
                />
                <label
                  htmlFor="edit-requiresApproval"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Requires admin approval for booking
                </label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleUpdateRoom}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Delete confirmation dialog */}
      {selectedRoom && (
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Room</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this room? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm font-medium">
                Room: <span className="font-bold">{selectedRoom.name}</span>
              </p>
              <p className="text-sm text-gray-500">
                Location: {selectedRoom.building}, {selectedRoom.campus} Campus
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleDeleteRoom}>Delete Room</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
