"use client"

import { useEffect, useState } from "react"
import {
  Bell,
  Calendar,
  Clock,
  DoorClosed,
  DoorOpen,
  Filter,
  LogOut,
  Search,
  Settings,
  User,
  Menu,
  X,
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"

// Ethiopian academic personnel data
const ethiopianData = {
  faculty: [
    {
      name: "Almaz Ayele",
      faculty: "Engineering",
      faculty_id: "FENG/7912",
    },
    {
      name: "Chaltu Gebre",
      faculty: "Arts",
      faculty_id: "FART/1531",
    },
    {
      name: "Tewodros Seyoum",
      faculty: "Engineering",
      faculty_id: "FENG/5043",
    },
    {
      name: "Isayas Tamirat",
      faculty: "Sciences",
      faculty_id: "FSCI/8148",
    },
    {
      name: "Hirut Demissie",
      faculty: "Business",
      faculty_id: "FBS/4040",
    },
    {
      name: "Fikre Gebre",
      faculty: "Engineering",
      faculty_id: "FENG/1654",
    },
    {
      name: "Almaz Kassa",
      faculty: "Technology",
      faculty_id: "FTCH/2561",
    },
    {
      name: "Girma Kassa",
      faculty: "Engineering",
      faculty_id: "FENG/6084",
    },
    {
      name: "Rahel Kassa",
      faculty: "Sciences",
      faculty_id: "FSCI/4652",
    },
    {
      name: "Fikre Asfaw",
      faculty: "Sciences",
      faculty_id: "FSCI/1600",
    },
  ],
  teachers: [
    {
      name: "Fikre Mengistu",
      department: "Marketing",
      employee_id: "TMK/5930",
    },
    {
      name: "Meles Tesfaye",
      department: "Computer Science",
      employee_id: "TCS/3450",
    },
    {
      name: "Jemal Tesfaye",
      department: "Marketing",
      employee_id: "TMK/7780",
    },
    {
      name: "Isayas Haile",
      department: "Marketing",
      employee_id: "TMK/8210",
    },
    {
      name: "Lulit Tesfaye",
      department: "Computer Science",
      employee_id: "TCS/6276",
    },
    {
      name: "Isayas Demissie",
      department: "Marketing Management",
      employee_id: "TMM/1946",
    },
    {
      name: "Rahel Tamirat",
      department: "Management",
      employee_id: "TMG/7202",
    },
    {
      name: "Tewodros Asfaw",
      department: "Accounting",
      employee_id: "TAC/7607",
    },
    {
      name: "Kebede Seyoum",
      department: "Marketing",
      employee_id: "TMK/9343",
    },
    {
      name: "Abebe Asfaw",
      department: "Accounting",
      employee_id: "TAC/5019",
    },
    {
      name: "Chaltu Seyoum",
      department: "Marketing Management",
      employee_id: "TMM/3360",
    },
    {
      name: "Yared Tesfaye",
      department: "Business",
      employee_id: "TBS/3842",
    },
    {
      name: "Selam Tadesse",
      department: "Management",
      employee_id: "TMG/2219",
    },
    {
      name: "Zewditu Wolde",
      department: "Business",
      employee_id: "TBS/8903",
    },
    {
      name: "Hirut Gebre",
      department: "Marketing",
      employee_id: "TMK/6379",
    },
    {
      name: "Yared Mengistu",
      department: "Accounting",
      employee_id: "TAC/7715",
    },
    {
      name: "Abebe Tamirat",
      department: "Business",
      employee_id: "TBS/8189",
    },
    {
      name: "Desta Gebre",
      department: "Marketing",
      employee_id: "TMK/6302",
    },
    {
      name: "Almaz Mengistu",
      department: "Computer Science",
      employee_id: "TCS/8442",
    },
    {
      name: "Almaz Seyoum",
      department: "Computer Science",
      employee_id: "TCS/4768",
    },
    {
      name: "Nardos Tadesse",
      department: "Marketing Management",
      employee_id: "TMM/7427",
    },
    {
      name: "Eleni Asfaw",
      department: "Computer Science",
      employee_id: "TCS/9752",
    },
    {
      name: "Fikre Tadesse",
      department: "Computer Science",
      employee_id: "TCS/6438",
    },
    {
      name: "Rahel Seyoum",
      department: "Business",
      employee_id: "TBS/4622",
    },
    {
      name: "Almaz Haile",
      department: "Marketing",
      employee_id: "TMK/6633",
    },
    {
      name: "Meles Tadesse",
      department: "Marketing Management",
      employee_id: "TMM/2160",
    },
    {
      name: "Almaz Tadesse",
      department: "Marketing Management",
      employee_id: "TMM/2020",
    },
    {
      name: "Yared Demissie",
      department: "Business",
      employee_id: "TBS/1613",
    },
    {
      name: "Girma Haile",
      department: "Computer Science",
      employee_id: "TCS/7873",
    },
    {
      name: "Lulit Tamirat",
      department: "Marketing",
      employee_id: "TMK/6256",
    },
    {
      name: "Tewodros Worku",
      department: "Computer Science",
      employee_id: "TCS/4516",
    },
    {
      name: "Selam Kassa",
      department: "Business",
      employee_id: "TBS/5153",
    },
    {
      name: "Jemal Tesfaye",
      department: "Marketing Management",
      employee_id: "TMM/9901",
    },
    {
      name: "Kebede Negash",
      department: "Management",
      employee_id: "TMG/2265",
    },
    {
      name: "Selam Asfaw",
      department: "Management",
      employee_id: "TMG/3242",
    },
    {
      name: "Fikre Asfaw",
      department: "Marketing",
      employee_id: "TMK/5323",
    },
    {
      name: "Abebe Seyoum",
      department: "Management",
      employee_id: "TMG/4287",
    },
    {
      name: "Bekele Kassa",
      department: "Management",
      employee_id: "TMG/5796",
    },
    {
      name: "Girma Kassa",
      department: "Marketing Management",
      employee_id: "TMM/9955",
    },
    {
      name: "Jemal Asfaw",
      department: "Marketing Management",
      employee_id: "TMM/2055",
    },
    {
      name: "Eleni Kassa",
      department: "Marketing Management",
      employee_id: "TMM/6377",
    },
    {
      name: "Isayas Gebre",
      department: "Business",
      employee_id: "TBS/3935",
    },
    {
      name: "Meles Gebre",
      department: "Accounting",
      employee_id: "TAC/9422",
    },
    {
      name: "Lulit Tesfaye",
      department: "Management",
      employee_id: "TMG/7708",
    },
    {
      name: "Desta Ayele",
      department: "Marketing",
      employee_id: "TMK/5470",
    },
    {
      name: "Yared Haile",
      department: "Marketing Management",
      employee_id: "TMM/1246",
    },
    {
      name: "Girma Wolde",
      department: "Computer Science",
      employee_id: "TCS/9249",
    },
    {
      name: "Hirut Haile",
      department: "Computer Science",
      employee_id: "TCS/3730",
    },
    {
      name: "Lulit Ayele",
      department: "Business",
      employee_id: "TBS/4827",
    },
    {
      name: "Hirut Kassa",
      department: "Business",
      employee_id: "TBS/3589",
    },
  ],
  students: [
    {
      name: "Kebede Tamirat",
      department: "Marketing",
      registration_number: "RMDCB/4155/2013",
    },
    {
      name: "Lulit Tadesse",
      department: "Marketing",
      registration_number: "RMDCA/2661/2021",
    },
    {
      name: "Selam Asfaw",
      department: "Management",
      registration_number: "RMDGE/3708/2010",
    },
    {
      name: "Abebe Seyoum",
      department: "Computer Science",
      registration_number: "RCDD/7419/2021",
    },
    {
      name: "Tewodros Ayele",
      department: "Marketing",
      registration_number: "RMDCD/7232/2016",
    },
    {
      name: "Abebe Haile",
      department: "Management",
      registration_number: "RMDGB/2168/2022",
    },
    {
      name: "Hirut Kassa",
      department: "Business",
      registration_number: "RBUSB/9478/2023",
    },
    {
      name: "Eleni Wolde",
      department: "Accounting",
      registration_number: "RADA/9851/2013",
    },
    {
      name: "Meles Seyoum",
      department: "Marketing",
      registration_number: "RMDCA/4925/2022",
    },
    {
      name: "Chaltu Ayele",
      department: "Marketing Management",
      registration_number: "RMMME/5087/2023",
    },
    // Note: The full dataset contains 100 students, but I've truncated it for brevity
  ],
}

// Campus building structure
const campusBuildings = {
  mexico: [
    { id: "B1", name: "Building B1" },
    { id: "B2", name: "Building B2" },
    { id: "B3", name: "Building B3" },
    { id: "LAB", name: "Computer Labs" },
  ],
  main: [
    { id: "GR", name: "Green Building (GR)" },
    { id: "NCR", name: "NCR Building" },
    { id: "G", name: "G Building" },
  ],
  new: [
    { id: "NB", name: "New Building" },
    { id: "ANNEX", name: "Annex Building" },
  ],
}

// Room colors by type
const roomColors = {
  Classroom: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-800",
    dark: "bg-blue-900",
  },
  Office: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-800",
    dark: "bg-amber-900",
  },
  "Computer Lab": {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-800",
    dark: "bg-emerald-900",
  },
  "Conference Room": {
    bg: "bg-purple-50",
    border: "border-purple-200",
    text: "text-purple-800",
    dark: "bg-purple-900",
  },
  Library: {
    bg: "bg-indigo-50",
    border: "border-indigo-200",
    text: "text-indigo-800",
    dark: "bg-indigo-900",
  },
  Hall: {
    bg: "bg-rose-50",
    border: "border-rose-200",
    text: "text-rose-800",
    dark: "bg-rose-900",
  },
}

// Generate room data for Mexico Campus
const generateMexicoCampusRooms = () => {
  const rooms = []
  let id = 1

  // Mexico Campus - B1, B2, B3 Buildings
  for (const building of ["B1", "B2", "B3"]) {
    const floorsPerBuilding = 5
    const roomsPerFloor = 5

    for (let floor = 1; floor <= floorsPerBuilding; floor++) {
      for (let room = 1; room <= roomsPerFloor; room++) {
        const roomNumber = `${floor}0${room}`
        const isOffice = room > 3 // Last 2 rooms on each floor are offices
        const roomType = isOffice ? "Office" : "Classroom"
        const roomName = `Room ${building}-${roomNumber}`

        // Randomize availability
        const isAvailable = Math.random() > 0.3

        rooms.push({
          id: id++,
          campus: "mexico",
          building: `Building ${building}`,
          floor: `${floor}${getFloorSuffix(floor)} Floor`,
          name: roomName,
          roomNumber: roomNumber,
          type: roomType,
          status: isAvailable ? "available" : "booked",
          time: isAvailable ? "8:00 AM - 6:00 PM" : getRandomTimeSlot(),
          capacity: isOffice ? Math.floor(Math.random() * 5) + 3 : Math.floor(Math.random() * 30) + 20,
          features: getRandomFeatures(roomType),
          ...(isAvailable ? {} : getRandomBookingInfo()),
        })
      }
    }
  }

  // Add special rooms for Mexico Campus
  const specialRooms = [
    {
      id: id++,
      campus: "mexico",
      building: "Building B1",
      floor: "Ground Floor",
      name: "Main Hall B1",
      roomNumber: "G01",
      type: "Hall",
      status: Math.random() > 0.5 ? "available" : "booked",
      time: "8:00 AM - 10:00 PM",
      capacity: 200,
      features: ["Stage", "Sound System", "Projector", "Seating for 200"],
      ...(Math.random() > 0.5 ? {} : getRandomBookingInfo()),
    },
    {
      id: id++,
      campus: "mexico",
      building: "Building B2",
      floor: "1st Floor",
      name: "Library B2-101",
      roomNumber: "101",
      type: "Library",
      status: "available",
      time: "8:00 AM - 8:00 PM",
      capacity: 80,
      features: ["Study Tables", "Reference Books", "Computers", "Quiet Zone"],
    },
    {
      id: id++,
      campus: "mexico",
      building: "Building B2",
      floor: "2nd Floor",
      name: "Library B2-201",
      roomNumber: "201",
      type: "Library",
      status: "available",
      time: "8:00 AM - 8:00 PM",
      capacity: 60,
      features: ["Group Study Rooms", "Journals Section", "Computers"],
    },
    {
      id: id++,
      campus: "mexico",
      building: "Building B3",
      floor: "Ground Floor",
      name: "Library B3-001",
      roomNumber: "001",
      type: "Library",
      status: "available",
      time: "8:00 AM - 8:00 PM",
      capacity: 100,
      features: ["Digital Resources", "Multimedia Section", "Study Carrels"],
    },
  ]

  // Add computer labs
  for (let i = 1; i <= 9; i++) {
    const building = ["B1", "B2", "B3"][Math.floor((i - 1) / 3)]
    const floor = Math.floor(Math.random() * 5) + 1
    const roomNum = `${floor}0${(i % 3) + 1}`
    specialRooms.push({
      id: id++,
      campus: "mexico",
      building: "Computer Labs",
      floor: `${floor}${getFloorSuffix(floor)} Floor`,
      name: `Computer Lab ${building}-${roomNum}`,
      roomNumber: roomNum,
      type: "Computer Lab",
      status: Math.random() > 0.4 ? "available" : "booked",
      time: "8:00 AM - 9:00 PM",
      capacity: 30,
      features: ["Computers", "Projector", "Specialized Software", "Printing Facilities"],
      ...(Math.random() > 0.6 ? {} : getRandomBookingInfo()),
    })
  }

  return [...rooms, ...specialRooms]
}

// Generate room data for Main Campus
const generateMainCampusRooms = () => {
  const rooms = []
  let id = 1000 // Start from 1000 to avoid ID conflicts

  // Main Campus - Green Building (GR)
  const floorsInGreenBuilding = 6 // Ground + 5
  const classroomsPerFloor = 6

  for (let floor = 0; floor <= floorsInGreenBuilding - 1; floor++) {
    const floorName = floor === 0 ? "Ground Floor" : `${floor}${getFloorSuffix(floor)} Floor`

    // Classrooms
    for (let room = 1; room <= classroomsPerFloor; room++) {
      const roomNumber = floor === 0 ? `G0${room}` : `${floor}0${room}`
      const roomName = `Room GR-${roomNumber}`

      rooms.push({
        id: id++,
        campus: "main",
        building: "Green Building (GR)",
        floor: floorName,
        name: roomName,
        roomNumber: roomNumber,
        type: "Classroom",
        status: Math.random() > 0.4 ? "available" : "booked",
        time: Math.random() > 0.4 ? "8:00 AM - 6:00 PM" : getRandomTimeSlot(),
        capacity: Math.floor(Math.random() * 20) + 30,
        features: getRandomFeatures("Classroom"),
        ...(Math.random() > 0.6 ? {} : getRandomBookingInfo()),
      })
    }

    // Computer lab for each floor
    if (floor > 0) {
      // No lab on ground floor
      rooms.push({
        id: id++,
        campus: "main",
        building: "Green Building (GR)",
        floor: floorName,
        name: `Computer Lab GR-${floor}07`,
        roomNumber: `${floor}07`,
        type: "Computer Lab",
        status: Math.random() > 0.5 ? "available" : "booked",
        time: "8:00 AM - 9:00 PM",
        capacity: 30,
        features: ["Computers", "Projector", "Specialized Software", "Printing Facilities"],
        ...(Math.random() > 0.5 ? {} : getRandomBookingInfo()),
      })
    }
  }

  // NCR Building
  const floorsInNCR = 4
  const roomsPerFloorNCR = 8

  for (let floor = 0; floor < floorsInNCR; floor++) {
    const floorName = floor === 0 ? "Ground Floor" : `${floor}${getFloorSuffix(floor)} Floor`

    for (let room = 1; room <= roomsPerFloorNCR; room++) {
      const roomNumber = floor === 0 ? `G0${room}` : `${floor}0${room}`
      const roomName = `Room NCR-${roomNumber}`
      const roomType = room > 6 ? "Office" : "Classroom"

      rooms.push({
        id: id++,
        campus: "main",
        building: "NCR Building",
        floor: floorName,
        name: roomName,
        roomNumber: roomNumber,
        type: roomType,
        status: Math.random() > 0.3 ? "available" : "booked",
        time: Math.random() > 0.3 ? "8:00 AM - 6:00 PM" : getRandomTimeSlot(),
        capacity: roomType === "Office" ? Math.floor(Math.random() * 5) + 3 : Math.floor(Math.random() * 25) + 25,
        features: getRandomFeatures(roomType),
        ...(Math.random() > 0.7 ? {} : getRandomBookingInfo()),
      })
    }
  }

  // G Building
  const floorsInG = 3
  const roomsPerFloorG = 10

  for (let floor = 0; floor < floorsInG; floor++) {
    const floorName = floor === 0 ? "Ground Floor" : `${floor}${getFloorSuffix(floor)} Floor`

    for (let room = 1; room <= roomsPerFloorG; room++) {
      const roomNumber = floor === 0 ? `G0${room}` : `${floor}0${room}`
      const roomName = `Room G-${roomNumber}`

      rooms.push({
        id: id++,
        campus: "main",
        building: "G Building",
        floor: floorName,
        name: roomName,
        roomNumber: roomNumber,
        type: "Classroom",
        status: Math.random() > 0.3 ? "available" : "booked",
        time: Math.random() > 0.3 ? "8:00 AM - 6:00 PM" : getRandomTimeSlot(),
        capacity: Math.floor(Math.random() * 15) + 35,
        features: getRandomFeatures("Classroom"),
        ...(Math.random() > 0.7 ? {} : getRandomBookingInfo()),
      })
    }
  }

  // Main Library
  rooms.push({
    id: id++,
    campus: "main",
    building: "Green Building (GR)",
    floor: "Ground Floor",
    name: "Main Library",
    roomNumber: "G10",
    type: "Library",
    status: "available",
    time: "8:00 AM - 10:00 PM",
    capacity: 200,
    features: ["Study Areas", "Reference Section", "Digital Resources", "Group Study Rooms", "Quiet Zones"],
  })

  return rooms
}

// Generate room data for New Building
const generateNewBuildingRooms = () => {
  const rooms = []
  let id = 2000 // Start from 2000 to avoid ID conflicts

  // New Building
  const floors = 10 // Ground + 9
  const roomsPerFloor = 6

  for (let floor = 0; floor < floors; floor++) {
    const floorName = floor === 0 ? "Ground Floor" : `${floor}${getFloorSuffix(floor)} Floor`

    for (let room = 1; room <= roomsPerFloor; room++) {
      const roomNumber = floor === 0 ? `G0${room}` : `${floor}0${room}`
      const roomName = `Room NB-${roomNumber}`
      const roomType = room === roomsPerFloor ? "Conference Room" : "Classroom"

      rooms.push({
        id: id++,
        campus: "new",
        building: "New Building",
        floor: floorName,
        name: roomName,
        roomNumber: roomNumber,
        type: roomType,
        status: Math.random() > 0.3 ? "available" : "booked",
        time: Math.random() > 0.3 ? "8:00 AM - 8:00 PM" : getRandomTimeSlot(),
        capacity:
          roomType === "Conference Room" ? Math.floor(Math.random() * 10) + 15 : Math.floor(Math.random() * 20) + 40,
        features: getRandomFeatures(roomType),
        ...(Math.random() > 0.7 ? {} : getRandomBookingInfo()),
      })
    }

    // Add a computer lab on even floors
    if (floor % 2 === 0 && floor > 0) {
      rooms.push({
        id: id++,
        campus: "new",
        building: "New Building",
        floor: floorName,
        name: `Computer Lab NB-${floor}07`,
        roomNumber: `${floor}07`,
        type: "Computer Lab",
        status: Math.random() > 0.5 ? "available" : "booked",
        time: "8:00 AM - 9:00 PM",
        capacity: 40,
        features: ["High-Performance Computers", "Dual Monitors", "Specialized Software", "Printing Facilities"],
        ...(Math.random() > 0.5 ? {} : getRandomBookingInfo()),
      })
    }
  }

  // Annex Building
  const floorsInAnnex = 4
  const roomsPerFloorAnnex = 5

  for (let floor = 0; floor < floorsInAnnex; floor++) {
    const floorName = floor === 0 ? "Ground Floor" : `${floor}${getFloorSuffix(floor)} Floor`

    for (let room = 1; room <= roomsPerFloorAnnex; room++) {
      const roomNumber = floor === 0 ? `G0${room}` : `${floor}0${room}`
      const roomName = `Room ANNEX-${roomNumber}`

      rooms.push({
        id: id++,
        campus: "new",
        building: "Annex Building",
        floor: floorName,
        name: roomName,
        roomNumber: roomNumber,
        type: "Classroom",
        status: Math.random() > 0.4 ? "available" : "booked",
        time: Math.random() > 0.4 ? "8:00 AM - 6:00 PM" : getRandomTimeSlot(),
        capacity: Math.floor(Math.random() * 20) + 30,
        features: getRandomFeatures("Classroom"),
        ...(Math.random() > 0.6 ? {} : getRandomBookingInfo()),
      })
    }
  }

  return rooms
}

// Helper functions
function getFloorSuffix(floor) {
  if (floor === 1) return "st"
  if (floor === 2) return "nd"
  if (floor === 3) return "rd"
  return "th"
}

function getRandomTimeSlot() {
  const startHours = [8, 9, 10, 11, 12, 13, 14, 15, 16]
  const startHour = startHours[Math.floor(Math.random() * startHours.length)]
  const endHour = startHour + 1 + Math.floor(Math.random() * 3)

  const startTime = `${startHour}:00 ${startHour < 12 ? "AM" : "PM"}`
  const endTime = `${endHour > 12 ? endHour - 12 : endHour}:00 ${endHour < 12 ? "AM" : "PM"}`

  return `${startTime} - ${endTime}`
}

function getRandomFeatures(roomType) {
  const classroomFeatures = [
    "Projector",
    "Whiteboard",
    "Computer",
    "Smart Board",
    "Air Conditioning",
    "Sound System",
    "Video Conferencing",
    "Tiered Seating",
    "Podium",
    "Wheelchair Accessible",
  ]

  const officeFeatures = [
    "Computer",
    "Phone",
    "Desk",
    "Meeting Table",
    "Air Conditioning",
    "Printer Access",
    "Video Conferencing",
    "Whiteboard",
  ]

  const conferenceFeatures = [
    "Projector",
    "Video Conferencing",
    "Sound System",
    "Whiteboard",
    "Smart Board",
    "Air Conditioning",
    "Catering Area",
    "Presentation System",
    "Modular Furniture",
  ]

  const features =
    roomType === "Classroom" ? classroomFeatures : roomType === "Office" ? officeFeatures : conferenceFeatures

  const numFeatures = Math.floor(Math.random() * 4) + 2
  const selectedFeatures = []

  for (let i = 0; i < numFeatures; i++) {
    const feature = features[Math.floor(Math.random() * features.length)]
    if (!selectedFeatures.includes(feature)) {
      selectedFeatures.push(feature)
    }
  }

  return selectedFeatures
}

// Use real Ethiopian data for booking information
function getRandomBookingInfo() {
  // Randomly select a person type (faculty, teacher, or student)
  const personTypes = ["faculty", "teacher", "student"]
  const personType = personTypes[Math.floor(Math.random() * personTypes.length)]

  // Get the correct array key - "faculty" doesn't have an "s" in the data structure
  const arrayKey = personType === "faculty" ? "faculty" : personType + "s"

  // Get a random person from the selected type
  const personArray = ethiopianData[arrayKey]
  if (!personArray || !personArray.length) {
    // Fallback if data is not available
    return {
      bookedBy: "Unknown User",
      userType: "Staff",
      department: "General",
      reason: "Meeting",
    }
  }

  const person = personArray[Math.floor(Math.random() * personArray.length)]

  // Determine user type based on the person type
  const userType = personType === "faculty" ? "Faculty" : personType === "teacher" ? "Staff" : "Student"

  // Get department or faculty
  const department = person.department || person.faculty

  // Generate a reason based on the person type and department
  const reasons = {
    faculty: ["Faculty Meeting", "Research Work", "Department Meeting", "Student Consultation", "Thesis Defense"],
    teacher: ["Lecture", "Office Hours", "Department Meeting", "Exam Preparation", "Student Advising"],
    student: ["Group Study", "Project Work", "Club Meeting", "Exam Preparation", "Presentation Practice"],
  }

  const reasonList = reasons[personType]
  const reason = reasonList[Math.floor(Math.random() * reasonList.length)]

  // For faculty and teachers, include their ID in the display name
  const displayName =
    personType === "student"
      ? person.name
      : `${person.name} (${personType === "faculty" ? person.faculty_id : person.employee_id})`

  return {
    bookedBy: displayName,
    userType: userType,
    department: department,
    reason: reason,
  }
}

// Generate equipment data
const generateEquipment = () => {
  const equipment = []
  const campuses = ["mexico", "main", "new"]
  const equipmentTypes = [
    { type: "Projector", locations: ["Tech Center", "Library", "Computer Lab", "Media Room"] },
    { type: "Laptop", locations: ["Tech Center", "Library", "IT Department"] },
    { type: "Camera", locations: ["Media Center", "IT Department", "Journalism Lab"] },
    { type: "Microphone", locations: ["Auditorium", "Conference Room", "Media Center"] },
    { type: "Tablet", locations: ["Tech Center", "Library", "IT Department"] },
    { type: "Speaker", locations: ["Auditorium", "Student Center", "Media Center"] },
    { type: "Document Camera", locations: ["Classroom", "Conference Room", "Media Center"] },
    { type: "Video Conference System", locations: ["Conference Room", "Meeting Room", "International Office"] },
    { type: "Sound System", locations: ["Auditorium", "Main Hall", "Event Space"] },
    { type: "Interactive Whiteboard", locations: ["Smart Classroom", "Conference Room", "Training Room"] },
  ]

  let id = 1

  for (const campus of campuses) {
    // Get the buildings for this campus
    const buildings = campusBuildings[campus] || []

    for (const equipType of equipmentTypes) {
      const count = Math.floor(Math.random() * 5) + 2 // 2-6 items of each type per campus

      for (let i = 1; i <= count; i++) {
        const location = equipType.locations[Math.floor(Math.random() * equipType.locations.length)]
        const building = buildings[Math.floor(Math.random() * buildings.length)]
        const buildingPrefix = building ? `${building.name} - ` : ""

        equipment.push({
          id: id++,
          campus: campus,
          type: equipType.type,
          name: `${equipType.type} #${i}`,
          status: Math.random() > 0.4 ? "available" : "booked",
          location: `${buildingPrefix}${location}`,
          ...(Math.random() > 0.6 ? {} : getRandomBookingInfo()),
          ...(Math.random() > 0.6 ? {} : { time: `Until ${Math.floor(Math.random() * 12) + 1}:00 PM` }),
        })
      }
    }
  }

  return equipment
}

// Generate all room data
const allRooms = [...generateMexicoCampusRooms(), ...generateMainCampusRooms(), ...generateNewBuildingRooms()]

// Generate equipment data
const allEquipment = generateEquipment()

export default function DashboardPage() {
  const [selectedCampus, setSelectedCampus] = useState("mexico")
  const [selectedBuilding, setSelectedBuilding] = useState("all")
  const [selectedFloor, setSelectedFloor] = useState("all")
  const [selectedRoomType, setSelectedRoomType] = useState("all")
  const [selectedDepartment, setSelectedDepartment] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRoom, setSelectedRoom] = useState<any>(null)
  const [selectedEquipment, setSelectedEquipment] = useState<any>(null)
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false)
  const [bookingType, setBookingType] = useState<"room" | "equipment">("room")
  const [bookingDate, setBookingDate] = useState("")
  const [bookingStartTime, setBookingStartTime] = useState("")
  const [bookingEndTime, setBookingEndTime] = useState("")
  const [bookingReason, setBookingReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [availableOnly, setAvailableOnly] = useState(false)
  const [visibleRooms, setVisibleRooms] = useState(20) // Initial number of rooms to show
  const [visibleEquipment, setVisibleEquipment] = useState(20) // Initial number of equipment to show
  const [buildings, setBuildings] = useState<string[]>([])
  const [floors, setFloors] = useState<string[]>([])
  const [roomTypes, setRoomTypes] = useState<string[]>([])
  const [departments, setDepartments] = useState<string[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [availableBuildings, setAvailableBuildings] = useState<any[]>([])
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  // Set a random current user on component mount
  useEffect(() => {
    try {
      // Randomly select a user type (faculty, teacher, or student)
      const userTypes = ["faculty", "teacher", "student"]
      const userType = userTypes[Math.floor(Math.random() * userTypes.length)]

      // Get the correct array key - "faculty" doesn't have an "s" in the data structure
      const arrayKey = userType === "faculty" ? "faculty" : userType + "s"

      // Get the array and check if it exists
      const personArray = ethiopianData[arrayKey]
      if (!personArray || !personArray.length) {
        // Fallback if data is not available
        setCurrentUser({
          name: "Guest User",
          userType: "Guest",
          email: "guest@smu.edu.et",
          id: "GUEST/0000",
        })
        return
      }

      // Get a random user from the selected type
      const user = personArray[Math.floor(Math.random() * personArray.length)]

      // Set user with additional information
      setCurrentUser({
        ...user,
        userType: userType === "faculty" ? "Faculty" : userType === "teacher" ? "Staff" : "Student",
        email: `${user.name.toLowerCase().replace(/\s+/g, ".")}@smu.edu.et`,
        id: user.faculty_id || user.employee_id || user.registration_number,
      })
    } catch (error) {
      console.error("Error setting current user:", error)
      // Fallback user
      setCurrentUser({
        name: "Guest User",
        userType: "Guest",
        email: "guest@smu.edu.et",
        id: "GUEST/0000",
      })
    }
  }, [])

  // Update available buildings when campus changes
  useEffect(() => {
    try {
      // Get buildings for the selected campus
      const campusSpecificBuildings = campusBuildings[selectedCampus] || []
      setAvailableBuildings(campusSpecificBuildings)

      // Reset building selection when campus changes
      setSelectedBuilding("all")
      setSelectedFloor("all")

      // Get unique buildings from rooms data for the selected campus
      const campusRooms = allRooms.filter((room) => selectedCampus === "all" || room.campus === selectedCampus)
      const uniqueBuildings = Array.from(new Set(campusRooms.map((room) => room.building)))
      setBuildings(uniqueBuildings)

      // Get unique room types
      const uniqueRoomTypes = Array.from(new Set(campusRooms.map((room) => room.type)))
      setRoomTypes(uniqueRoomTypes)

      // Get unique departments from the Ethiopian data - with safety checks
      const departmentsList = []

      // Add faculty departments if available
      if (ethiopianData.faculty && ethiopianData.faculty.length) {
        ethiopianData.faculty.forEach((f) => {
          if (f.faculty) departmentsList.push(f.faculty)
        })
      }

      // Add teacher departments if available
      if (ethiopianData.teachers && ethiopianData.teachers.length) {
        ethiopianData.teachers.forEach((t) => {
          if (t.department) departmentsList.push(t.department)
        })
      }

      // Add student departments if available
      if (ethiopianData.students && ethiopianData.students.length) {
        ethiopianData.students.forEach((s) => {
          if (s.department) departmentsList.push(s.department)
        })
      }

      // Create a unique list of departments
      const allDepartments = Array.from(new Set(departmentsList))
      setDepartments(allDepartments)
    } catch (error) {
      console.error("Error updating filters:", error)
      // Set defaults
      setAvailableBuildings([])
      setBuildings([])
      setRoomTypes([])
      setDepartments([])
    }
  }, [selectedCampus, allRooms])

  // Update available floors when building changes
  useEffect(() => {
    const buildingRooms = allRooms.filter(
      (room) =>
        (selectedCampus === "all" || room.campus === selectedCampus) &&
        (selectedBuilding === "all" || room.building === selectedBuilding),
    )

    const uniqueFloors = Array.from(new Set(buildingRooms.map((room) => room.floor)))
    setFloors(uniqueFloors)
  }, [selectedCampus, selectedBuilding])

  const handleRoomClick = (room: any) => {
    setSelectedRoom(room)
    setBookingType("room")
    setBookingDialogOpen(true)
  }

  const handleEquipmentClick = (equipment: any) => {
    setSelectedEquipment(equipment)
    setBookingType("equipment")
    setBookingDialogOpen(true)
  }

  const handleBookingSubmit = () => {
    setIsSubmitting(true)

    // Simulate booking submission
    setTimeout(() => {
      setIsSubmitting(false)
      setBookingDialogOpen(false)
      // Reset form
      setBookingDate("")
      setBookingStartTime("")
      setBookingEndTime("")
      setBookingReason("")
    }, 1500)
  }

  const filteredRooms = allRooms.filter((room) => {
    if (selectedCampus !== "all" && room.campus !== selectedCampus) return false
    if (selectedBuilding !== "all" && room.building !== selectedBuilding) return false
    if (selectedFloor !== "all" && room.floor !== selectedFloor) return false
    if (selectedRoomType !== "all" && room.type !== selectedRoomType) return false
    if (availableOnly && room.status !== "available") return false
    if (
      selectedDepartment !== "all" &&
      room.bookedBy &&
      (!room.department || !room.department.includes(selectedDepartment))
    )
      return false

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        room.name.toLowerCase().includes(query) ||
        room.building.toLowerCase().includes(query) ||
        room.floor.toLowerCase().includes(query) ||
        room.type.toLowerCase().includes(query) ||
        (room.bookedBy && room.bookedBy.toLowerCase().includes(query))
      )
    }

    return true
  })

  const filteredEquipment = allEquipment.filter((item) => {
    if (selectedCampus !== "all" && item.campus !== selectedCampus) return false
    if (availableOnly && item.status !== "available") return false
    if (
      selectedDepartment !== "all" &&
      item.bookedBy &&
      (!item.department || !item.department.includes(selectedDepartment))
    )
      return false

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        item.name.toLowerCase().includes(query) ||
        item.type.toLowerCase().includes(query) ||
        item.location.toLowerCase().includes(query) ||
        (item.bookedBy && item.bookedBy.toLowerCase().includes(query))
      )
    }

    return true
  })

  const loadMoreRooms = () => {
    setVisibleRooms((prev) => prev + 20)
  }

  const loadMoreEquipment = () => {
    setVisibleEquipment((prev) => prev + 20)
  }

  // Get room color based on type
  const getRoomColor = (type: string) => {
    return (
      roomColors[type] || {
        bg: "bg-gray-50",
        border: "border-gray-200",
        text: "text-gray-800",
        dark: "bg-gray-900",
      }
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-black backdrop-blur supports-[backdrop-filter]:bg-black/95">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 overflow-hidden bg-white rounded-full p-1">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-MIU80dpxRKtuTeJHLCI2lMsiDOdSYe.png"
                alt="SMU Logo"
                className="h-full w-full object-contain"
              />
            </div>
            <span className="text-xl font-bold text-white hidden md:inline-block">SMU Booking System</span>
            <span className="text-xl font-bold text-white md:hidden">SMU</span>
          </div>

          {/* Search bar - desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Search rooms, equipment, or bookings..."
                className="pl-8 bg-gray-800 border-gray-700 text-white placeholder:text-gray-400 focus:border-gray-600 focus:ring-gray-600"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative text-white hover:bg-gray-800">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-white text-[10px] text-black font-bold">
                3
              </span>
            </Button>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-white hover:bg-gray-800"
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8 border-2 border-white">
                    <AvatarImage src="/placeholder-user.jpg" alt="User" />
                    <AvatarFallback className="bg-white text-black">
                      {currentUser
                        ? currentUser.name
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")
                        : "JD"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{currentUser?.name || "Jane Doe"}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {currentUser?.email || "jane.doe@smu.edu.et"}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground mt-1">
                      {currentUser?.userType} - {currentUser?.department || currentUser?.faculty}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground mt-1">ID: {currentUser?.id}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Calendar className="mr-2 h-4 w-4" />
                  <span>My Bookings</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile menu and search */}
        {showFilters && (
          <div className="md:hidden py-4 px-4 space-y-4 border-t border-gray-800">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Search..."
                className="pl-8 bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="building" className="text-white">
                  Building
                </Label>
                <Select value={selectedBuilding} onValueChange={setSelectedBuilding} className="col-span-2">
                  <SelectTrigger id="building" className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue placeholder="Select Building" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Buildings</SelectItem>
                    {availableBuildings.map((building) => (
                      <SelectItem key={building.id} value={building.name}>
                        {building.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="floor" className="text-white">
                  Floor
                </Label>
                <Select value={selectedFloor} onValueChange={setSelectedFloor} className="col-span-2">
                  <SelectTrigger id="floor" className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue placeholder="Select Floor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Floors</SelectItem>
                    {floors.map((floor) => (
                      <SelectItem key={floor} value={floor}>
                        {floor}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                  id="available-only-mobile"
                  checked={availableOnly}
                  onCheckedChange={(checked) => setAvailableOnly(checked as boolean)}
                />
                <label
                  htmlFor="available-only-mobile"
                  className="text-sm font-medium leading-none text-white peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Show available only
                </label>
              </div>
            </div>
          </div>
        )}
      </header>
      <main className="flex-1 p-4 md:p-6 bg-gray-50">
        <div className="container">
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div>
              <h1 className="text-2xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground">Book rooms and equipment across campus</p>
            </div>
            <div className="flex items-center gap-2">
              <Select value={selectedCampus} onValueChange={setSelectedCampus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select Campus" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Campuses</SelectItem>
                  <SelectItem value="mexico">Mexico Campus</SelectItem>
                  <SelectItem value="main">Main Campus</SelectItem>
                  <SelectItem value="new">New Building</SelectItem>
                </SelectContent>
              </Select>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="icon" className="hidden md:flex">
                    <Filter className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium leading-none">Filters</h4>
                      <p className="text-sm text-muted-foreground">Refine your search with additional filters</p>
                    </div>
                    <Separator />
                    <div className="grid gap-2">
                      <div className="grid grid-cols-3 items-center gap-4">
                        <Label htmlFor="building">Building</Label>
                        <Select value={selectedBuilding} onValueChange={setSelectedBuilding} className="col-span-2">
                          <SelectTrigger id="building">
                            <SelectValue placeholder="Select Building" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Buildings</SelectItem>
                            {availableBuildings.map((building) => (
                              <SelectItem key={building.id} value={building.name}>
                                {building.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-3 items-center gap-4">
                        <Label htmlFor="floor">Floor</Label>
                        <Select value={selectedFloor} onValueChange={setSelectedFloor} className="col-span-2">
                          <SelectTrigger id="floor">
                            <SelectValue placeholder="Select Floor" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Floors</SelectItem>
                            {floors.map((floor) => (
                              <SelectItem key={floor} value={floor}>
                                {floor}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-3 items-center gap-4">
                        <Label htmlFor="room-type">Room Type</Label>
                        <Select value={selectedRoomType} onValueChange={setSelectedRoomType} className="col-span-2">
                          <SelectTrigger id="room-type">
                            <SelectValue placeholder="Select Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            {roomTypes.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-3 items-center gap-4">
                        <Label htmlFor="department">Department</Label>
                        <Select value={selectedDepartment} onValueChange={setSelectedDepartment} className="col-span-2">
                          <SelectTrigger id="department">
                            <SelectValue placeholder="Select Department" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Departments</SelectItem>
                            {departments.map((dept) => (
                              <SelectItem key={dept} value={dept}>
                                {dept}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center space-x-2 pt-2">
                        <Checkbox
                          id="available-only"
                          checked={availableOnly}
                          onCheckedChange={(checked) => setAvailableOnly(checked as boolean)}
                        />
                        <label
                          htmlFor="available-only"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Show available only
                        </label>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              <div className="flex items-center gap-2 ml-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className={viewMode === "grid" ? "bg-black hover:bg-gray-800 text-white" : ""}
                >
                  Grid
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className={viewMode === "list" ? "bg-black hover:bg-gray-800 text-white" : ""}
                >
                  List
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-6"></div>

          <div className="mt-6">
            <Tabs defaultValue="rooms" className="mt-6">
              <TabsList className="grid w-full grid-cols-2 md:w-[400px] bg-gray-100">
                <TabsTrigger value="rooms" className="data-[state=active]:bg-black data-[state=active]:text-white">
                  Rooms ({filteredRooms.length})
                </TabsTrigger>
                <TabsTrigger value="equipment" className="data-[state=active]:bg-black data-[state=active]:text-white">
                  Equipment ({filteredEquipment.length})
                </TabsTrigger>
              </TabsList>
              <TabsContent value="rooms" className="mt-6">
                <div className="mb-4 flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Showing {Math.min(visibleRooms, filteredRooms.length)} of {filteredRooms.length} rooms
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowFilters(!showFilters)}
                      className="md:hidden"
                    >
                      {showFilters ? "Hide Filters" : "Show Filters"}
                    </Button>
                  </div>
                </div>

                <ScrollArea className="h-[calc(100vh-280px)]">
                  {viewMode === "grid" ? (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {filteredRooms.slice(0, visibleRooms).map((room) => {
                        const roomColor = getRoomColor(room.type)
                        return (
                          <div
                            key={room.id}
                            className={`cursor-pointer transition-all hover:shadow-lg ${
                              room.status === "available" ? "hover:scale-[1.02]" : "opacity-80"
                            }`}
                            onClick={() => room.status === "available" && handleRoomClick(room)}
                          >
                            <div
                              className={`relative h-full rounded-lg overflow-hidden shadow-md ${roomColor.border} border-2 bg-white`}
                            >
                              {/* Door frame */}
                              <div className="absolute inset-0 border-8 border-gray-200 rounded-lg pointer-events-none"></div>

                              {/* Room number plate */}
                              <div className="absolute top-3 right-3 bg-gray-800 text-white px-3 py-1 rounded-md font-mono text-sm font-bold shadow-md">
                                {room.roomNumber}
                              </div>

                              {/* Door handle */}
                              <div className="absolute left-3 top-1/2 w-3 h-12 bg-gray-400 rounded-full transform -translate-y-1/2 shadow-md"></div>

                              {/* Status indicator */}
                              <div className="absolute left-10 top-1/2 transform -translate-y-1/2">
                                {room.status === "available" ? (
                                  <DoorOpen className="h-8 w-8 text-green-600" />
                                ) : (
                                  <DoorClosed className="h-8 w-8 text-smu-red" />
                                )}
                              </div>

                              {/* Content */}
                              <div className="p-5 pl-16">
                                <div className="mb-2">
                                  <h3 className="text-lg font-bold">{room.name}</h3>
                                  <p className="text-sm text-gray-600">
                                    {room.building} - {room.floor}
                                  </p>
                                </div>

                                <div className="flex items-center justify-between mb-2">
                                  <Badge
                                    variant={room.status === "available" ? "outline" : "secondary"}
                                    className={
                                      room.status === "available"
                                        ? "border-green-500 text-green-600"
                                        : "border-smu-red text-smu-red"
                                    }
                                  >
                                    {room.status === "available" ? "Available" : "Booked"}
                                  </Badge>
                                  <div className="flex items-center text-xs text-muted-foreground">
                                    <Clock className="mr-1 h-3 w-3" />
                                    {room.time}
                                  </div>
                                </div>

                                <div className="flex items-center justify-between mb-2">
                                  <span className={`text-xs px-2 py-1 rounded-full ${roomColor.bg} ${roomColor.text}`}>
                                    {room.type}
                                  </span>
                                  <span className="text-xs text-muted-foreground">Capacity: {room.capacity}</span>
                                </div>

                                {room.status === "booked" && (
                                  <div className="mt-3 rounded-md bg-gray-50 p-2">
                                    <div className="text-xs font-medium">{room.bookedBy}</div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs text-muted-foreground">{room.userType}</span>
                                      <span className="text-xs text-muted-foreground">{room.department}</span>
                                    </div>
                                    <div className="text-xs text-muted-foreground">{room.reason}</div>
                                  </div>
                                )}

                                <div className="mt-3">
                                  <div className="flex flex-wrap gap-1">
                                    {room.features.slice(0, 3).map((feature, index) => (
                                      <Badge key={index} variant="secondary" className="text-xs">
                                        {feature}
                                      </Badge>
                                    ))}
                                    {room.features.length > 3 && (
                                      <Badge variant="outline" className="text-xs">
                                        +{room.features.length - 3} more
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredRooms.slice(0, visibleRooms).map((room) => {
                        const roomColor = getRoomColor(room.type)
                        return (
                          <div
                            key={room.id}
                            className={`cursor-pointer transition-all hover:shadow-md ${
                              room.status === "available" ? "hover:bg-gray-50" : "opacity-90"
                            }`}
                            onClick={() => room.status === "available" && handleRoomClick(room)}
                          >
                            <div className="flex items-center border rounded-lg p-3 bg-white">
                              <div className="mr-4 relative">
                                {room.status === "available" ? (
                                  <DoorOpen className="h-8 w-8 text-green-600" />
                                ) : (
                                  <DoorClosed className="h-8 w-8 text-smu-red" />
                                )}
                                <div className="absolute -top-2 -right-2 bg-gray-800 text-white px-1.5 py-0.5 rounded text-xs font-mono">
                                  {room.roomNumber}
                                </div>
                              </div>

                              <div className="flex-1">
                                <div className="flex justify-between">
                                  <h3 className="font-bold">{room.name}</h3>
                                  <Badge
                                    variant={room.status === "available" ? "outline" : "secondary"}
                                    className={
                                      room.status === "available"
                                        ? "border-green-500 text-green-600"
                                        : "border-smu-red text-smu-red"
                                    }
                                  >
                                    {room.status === "available" ? "Available" : "Booked"}
                                  </Badge>
                                </div>

                                <div className="flex justify-between text-sm text-gray-600">
                                  <span>
                                    {room.building} - {room.floor}
                                  </span>
                                  <span className="flex items-center">
                                    <Clock className="mr-1 h-3 w-3" />
                                    {room.time}
                                  </span>
                                </div>

                                <div className="flex justify-between mt-1">
                                  <span
                                    className={`text-xs px-2 py-0.5 rounded-full ${roomColor.bg} ${roomColor.text}`}
                                  >
                                    {room.type}
                                  </span>
                                  <span className="text-xs text-muted-foreground">Capacity: {room.capacity}</span>
                                </div>

                                {room.status === "booked" && (
                                  <div className="mt-1 text-xs text-gray-600">
                                    Booked by: {room.bookedBy} • {room.reason}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {visibleRooms < filteredRooms.length && (
                    <div className="mt-6 flex justify-center">
                      <Button variant="outline" onClick={loadMoreRooms}>
                        Load More
                      </Button>
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
              <TabsContent value="equipment" className="mt-6">
                <div className="mb-4 flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Showing {Math.min(visibleEquipment, filteredEquipment.length)} of {filteredEquipment.length} items
                  </div>
                </div>

                <ScrollArea className="h-[calc(100vh-280px)]">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredEquipment.slice(0, visibleEquipment).map((item) => (
                      <Card
                        key={item.id}
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          item.status === "available" ? "border-green-200 hover:border-green-300" : "border-gray-200"
                        }`}
                        onClick={() => item.status === "available" && handleEquipmentClick(item)}
                      >
                        <CardHeader className="p-4 pb-2">
                          <CardTitle className="text-base">{item.name}</CardTitle>
                          <CardDescription>{item.type}</CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <div className="flex items-center justify-between">
                            <Badge
                              variant={item.status === "available" ? "outline" : "secondary"}
                              className={
                                item.status === "available"
                                  ? "border-green-500 text-green-600"
                                  : "border-smu-red text-smu-red"
                              }
                            >
                              {item.status === "available" ? "Available" : "Booked"}
                            </Badge>
                            <div className="text-xs text-muted-foreground">{item.location}</div>
                          </div>

                          {item.status === "booked" && (
                            <div className="mt-3 rounded-md bg-gray-50 p-2 dark:bg-gray-800">
                              <div className="text-xs font-medium">{item.bookedBy}</div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">{item.userType}</span>
                                <span className="text-xs text-muted-foreground">{item.department}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">{item.reason}</span>
                                <span className="text-xs text-muted-foreground">{item.time}</span>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {visibleEquipment < filteredEquipment.length && (
                    <div className="mt-6 flex justify-center">
                      <Button variant="outline" onClick={loadMoreEquipment}>
                        Load More
                      </Button>
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader className="bg-black text-white p-4 rounded-t-lg">
            <DialogTitle>Book {bookingType === "room" ? selectedRoom?.name : selectedEquipment?.name}</DialogTitle>
            <DialogDescription className="text-gray-300">
              Fill in the details to request a booking. All bookings require admin approval.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 px-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="booking-date">Date</Label>
                <Input
                  id="booking-date"
                  type="date"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  required
                  className="border-gray-300 focus:border-gray-500 focus:ring-gray-500"
                />
              </div>
              {bookingType === "room" && (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="booking-start-time">Start Time</Label>
                    <Input
                      id="booking-start-time"
                      type="time"
                      value={bookingStartTime}
                      onChange={(e) => setBookingStartTime(e.target.value)}
                      required
                      className="border-gray-300 focus:border-gray-500 focus:ring-gray-500"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="booking-end-time">End Time</Label>
                    <Input
                      id="booking-end-time"
                      type="time"
                      value={bookingEndTime}
                      onChange={(e) => setBookingEndTime(e.target.value)}
                      required
                      className="border-gray-300 focus:border-gray-500 focus:ring-gray-500"
                    />
                  </div>
                </>
              )}
              {bookingType === "equipment" && (
                <div className="grid gap-2">
                  <Label htmlFor="booking-return-time">Return Time</Label>
                  <Input
                    id="booking-return-time"
                    type="time"
                    value={bookingEndTime}
                    onChange={(e) => setBookingEndTime(e.target.value)}
                    required
                    className="border-gray-300 focus:border-gray-500 focus:ring-gray-500"
                  />
                </div>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="booking-reason">Reason for Booking</Label>
              <Textarea
                id="booking-reason"
                placeholder="Please provide a brief description of why you need this resource"
                value={bookingReason}
                onChange={(e) => setBookingReason(e.target.value)}
                required
                className="border-gray-300 focus:border-gray-500 focus:ring-gray-500"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              <p>Note: Your booking will be pending until approved by an administrator.</p>
            </div>
          </div>
          <DialogFooter className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <Button variant="outline" onClick={() => setBookingDialogOpen(false)} className="border-gray-300">
              Cancel
            </Button>
            <Button
              onClick={handleBookingSubmit}
              disabled={isSubmitting}
              className="bg-black hover:bg-gray-800 text-white"
            >
              {isSubmitting ? "Submitting..." : "Submit Booking Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <footer className="w-full border-t bg-black py-6">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 overflow-hidden bg-white rounded-full p-0.5">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-MIU80dpxRKtuTeJHLCI2lMsiDOdSYe.png"
                alt="SMU Logo"
                className="h-full w-full object-contain"
              />
            </div>
            <p className="text-sm text-white">© 2024 St. Mary's University. All rights reserved.</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex gap-4">
              <a href="#" className="text-sm text-white/80 hover:text-white hover:underline">
                Terms
              </a>
              <a href="#" className="text-sm text-white/80 hover:text-white hover:underline">
                Privacy
              </a>
              <a href="#" className="text-sm text-white/80 hover:text-white hover:underline">
                Contact
              </a>
            </div>
            <div className="text-sm text-white/80">Mexico Square, Addis Ababa, Ethiopia | +251-11 5538001</div>
          </div>
        </div>
      </footer>
    </div>
  )
}
