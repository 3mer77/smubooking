"use client"

import { useState, useEffect } from "react"
import {
  Edit,
  Filter,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  MonitorSmartphone,
  Computer,
  Camera,
  Speaker,
  PencilRuler,
  Briefcase,
  HardDrive
} from "lucide-react"
import { collection, getDocs, doc, deleteDoc, updateDoc, addDoc, query, where, orderBy } from "firebase/firestore"

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
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { db, equipmentCollection, EquipmentType } from "@/lib/firebase"
import { showAuthSuccessToast, showAuthErrorToast } from "@/lib/utils"
import { Timestamp } from "firebase/firestore"

export default function EquipmentPage() {
  const [equipment, setEquipment] = useState<EquipmentType[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentType | null>(null)
  
  // New equipment form state
  const [newEquipment, setNewEquipment] = useState({
    name: "",
    type: "Projector",
    location: "",
    status: "available" as "available" | "booked" | "maintenance",
    description: "",
    requiresApproval: false,
    quantity: 1,
  })

  // Equipment types
  const equipmentTypes = [
    "Projector",
    "Computer",
    "Camera",
    "Audio Equipment",
    "Stationery",
    "Presentation Tools",
    "Scientific Equipment",
    "Sports Equipment",
    "Other"
  ]

  // Equipment type icons
  const getEquipmentIcon = (type: string) => {
    switch(type) {
      case "Projector":
        return <MonitorSmartphone className="h-4 w-4" />
      case "Computer":
        return <Computer className="h-4 w-4" />
      case "Camera":
        return <Camera className="h-4 w-4" />
      case "Audio Equipment":
        return <Speaker className="h-4 w-4" />
      case "Stationery":
        return <PencilRuler className="h-4 w-4" />
      case "Presentation Tools":
        return <Briefcase className="h-4 w-4" />
      case "Scientific Equipment":
      case "Sports Equipment":
      case "Other":
      default:
        return <HardDrive className="h-4 w-4" />
    }
  }

  useEffect(() => {
    fetchEquipment()
  }, [])

  const fetchEquipment = async () => {
    try {
      setLoading(true)
      const equipmentSnapshot = await getDocs(equipmentCollection)
      const equipmentList = equipmentSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as EquipmentType))
      
      setEquipment(equipmentList)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching equipment:", error)
      showAuthErrorToast("Failed to load equipment")
      setLoading(false)
    }
  }
  
  const filteredEquipment = equipment.filter(item => {
    // Filter by search query
    const matchesSearch = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
    
    // Filter by type
    const matchesType = selectedType === "all" || item.type === selectedType
    
    // Filter by status
    const matchesStatus = selectedStatus === "all" || item.status === selectedStatus
    
    return matchesSearch && matchesType && matchesStatus
  })
  
  const handleAddEquipment = async () => {
    try {
      setLoading(true)
      
      const timestamp = Timestamp.now()
      const equipmentData = {
        ...newEquipment,
        createdAt: timestamp,
        updatedAt: timestamp
      }
      
      await addDoc(equipmentCollection, equipmentData)
      
      // Reset form and close dialog
      setNewEquipment({
        name: "",
        type: "Projector",
        location: "",
        status: "available" as "available" | "booked" | "maintenance",
        description: "",
        requiresApproval: false,
        quantity: 1,
      })
      
      setIsAddDialogOpen(false)
      showAuthSuccessToast("Equipment added successfully")
      
      // Refresh equipment list
      fetchEquipment()
    } catch (error) {
      console.error("Error adding equipment:", error)
      showAuthErrorToast("Failed to add equipment")
      setLoading(false)
    }
  }
  
  const handleUpdateEquipment = async () => {
    if (!selectedEquipment) return
    
    try {
      setLoading(true)
      
      const equipmentRef = doc(db, "equipment", selectedEquipment.id)
      await updateDoc(equipmentRef, {
        ...selectedEquipment,
        updatedAt: Timestamp.now()
      })
      
      setIsEditDialogOpen(false)
      showAuthSuccessToast("Equipment updated successfully")
      
      // Refresh equipment list
      fetchEquipment()
    } catch (error) {
      console.error("Error updating equipment:", error)
      showAuthErrorToast("Failed to update equipment")
      setLoading(false)
    }
  }
  
  const handleDeleteEquipment = async () => {
    if (!selectedEquipment) return
    
    try {
      setLoading(true)
      
      await deleteDoc(doc(db, "equipment", selectedEquipment.id))
      
      setIsDeleteDialogOpen(false)
      showAuthSuccessToast("Equipment deleted successfully")
      
      // Refresh equipment list
      fetchEquipment()
    } catch (error) {
      console.error("Error deleting equipment:", error)
      showAuthErrorToast("Failed to delete equipment")
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
          <h1 className="text-3xl font-bold tracking-tight">Equipment Management</h1>
          <p className="text-gray-500">Manage all equipment and devices available for booking</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-1">
                <Plus className="h-4 w-4" />
                <span>Add New Equipment</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add New Equipment</DialogTitle>
                <DialogDescription>
                  Enter the details for the new equipment. Click save when you're done.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Equipment Name</Label>
                    <Input 
                      id="name" 
                      value={newEquipment.name}
                      onChange={(e) => setNewEquipment({...newEquipment, name: e.target.value})}
                      placeholder="e.g. Sony Projector X100"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Equipment Type</Label>
                    <Select 
                      value={newEquipment.type}
                      onValueChange={(value) => setNewEquipment({...newEquipment, type: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {equipmentTypes.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input 
                      id="location" 
                      value={newEquipment.location}
                      onChange={(e) => setNewEquipment({...newEquipment, location: e.target.value})}
                      placeholder="e.g. IT Department"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input 
                      id="quantity" 
                      type="number" 
                      value={newEquipment.quantity || ""}
                      onChange={(e) => setNewEquipment({...newEquipment, quantity: parseInt(e.target.value) || 1})}
                      placeholder="e.g. 5"
                      min="1"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={newEquipment.status}
                    onValueChange={(value: "available" | "booked" | "maintenance") => setNewEquipment({...newEquipment, status: value})}
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
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    value={newEquipment.description}
                    onChange={(e) => setNewEquipment({...newEquipment, description: e.target.value})}
                    placeholder="Enter equipment description or specifications"
                    rows={3}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="requiresApproval" 
                    checked={newEquipment.requiresApproval}
                    onCheckedChange={(checked) => setNewEquipment({...newEquipment, requiresApproval: !!checked})}
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
                <Button onClick={handleAddEquipment}>Save Equipment</Button>
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
            placeholder="Search equipment..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {equipmentTypes.map(type => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
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
      
      {/* Equipment table */}
      <Card>
        <CardHeader>
          <CardTitle>Equipment</CardTitle>
          <CardDescription>
            {filteredEquipment.length} item{filteredEquipment.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Approval</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">Loading equipment...</TableCell>
                </TableRow>
              ) : filteredEquipment.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">No equipment found. Try adjusting your filters.</TableCell>
                </TableRow>
              ) : (
                filteredEquipment.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getEquipmentIcon(item.type)}
                        <span>{item.type}</span>
                      </div>
                    </TableCell>
                    <TableCell>{item.location}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                    <TableCell>
                      {item.requiresApproval ? (
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
                              setSelectedEquipment(item)
                              setIsEditDialogOpen(true)
                            }}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedEquipment(item)
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
      {selectedEquipment && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit Equipment</DialogTitle>
              <DialogDescription>
                Update the equipment details. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Equipment Name</Label>
                  <Input 
                    id="edit-name" 
                    value={selectedEquipment.name}
                    onChange={(e) => setSelectedEquipment({...selectedEquipment, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-type">Equipment Type</Label>
                  <Select 
                    value={selectedEquipment.type}
                    onValueChange={(value) => setSelectedEquipment({...selectedEquipment, type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {equipmentTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-location">Location</Label>
                  <Input 
                    id="edit-location" 
                    value={selectedEquipment.location}
                    onChange={(e) => setSelectedEquipment({...selectedEquipment, location: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-quantity">Quantity</Label>
                  <Input 
                    id="edit-quantity" 
                    type="number" 
                    value={selectedEquipment.quantity || ""}
                    onChange={(e) => setSelectedEquipment({...selectedEquipment, quantity: parseInt(e.target.value) || 1})}
                    min="1"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select 
                  value={selectedEquipment.status}
                  onValueChange={(value: "available" | "booked" | "maintenance") => setSelectedEquipment({...selectedEquipment, status: value})}
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
              
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea 
                  id="edit-description" 
                  value={selectedEquipment.description || ""}
                  onChange={(e) => setSelectedEquipment({...selectedEquipment, description: e.target.value})}
                  rows={3}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="edit-requiresApproval" 
                  checked={selectedEquipment.requiresApproval}
                  onCheckedChange={(checked) => setSelectedEquipment({...selectedEquipment, requiresApproval: !!checked})}
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
              <Button onClick={handleUpdateEquipment}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Delete confirmation dialog */}
      {selectedEquipment && (
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Equipment</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this equipment? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm font-medium">
                Equipment: <span className="font-bold">{selectedEquipment.name}</span>
              </p>
              <p className="text-sm text-gray-500">
                Type: {selectedEquipment.type}, Quantity: {selectedEquipment.quantity}
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleDeleteEquipment}>Delete Equipment</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
