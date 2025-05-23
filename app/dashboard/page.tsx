"use client"

import { useEffect, useState } from "react"
import {
  Bell, Calendar, Clock, DoorClosed, DoorOpen, Filter, LogOut, Search, Settings, User, Menu, X,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet" // Assuming you use shadcn/ui Sheet

// Import Firebase config and Firestore functions
import { db, auth } from "@/lib/firebase"; // Adjust the path to your firebase.js file
import { collection, getDocs, doc, getDoc, updateDoc, addDoc, serverTimestamp, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

// Room colors (can remain or be fetched if dynamic)
const roomColors = {
  Classroom: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-800", dark: "bg-blue-900" },
  Office: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-800", dark: "bg-amber-900" },
  "Computer Lab": { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-800", dark: "bg-emerald-900" },
  "Conference Room": { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-800", dark: "bg-purple-900" },
  Library: { bg: "bg-indigo-50", border: "border-indigo-200", text: "text-indigo-800", dark: "bg-indigo-900" },
  Hall: { bg: "bg-rose-50", border: "border-rose-200", text: "text-rose-800", dark: "bg-rose-900" },
};

// --- REMOVE HARDCODED MOCK DATA AND GENERATION FUNCTIONS ---
// const ethiopianData = { ... };
// const campusBuildings = { ... };
// const generateMexicoCampusRooms = () => { ... };
// ... other generate functions ...
// const allRooms = [...];
// const allEquipment = generateEquipment();

// Helper functions (some might still be useful, adjust as needed)
function getFloorSuffix(floor: number) {
  if (floor === 1) return "st"
  if (floor === 2) return "nd"
  if (floor === 3) return "rd"
  return "th"
}

// This function will need to be re-thought. Booking info should come from the 'rooms' or 'equipment' documents.
// If you still need to *randomly assign* a simulated booker from your fetched users for display purposes (not actual booking):
async function getRandomBookingInfoFromFetched(
    fetchedFaculty: any[],
    fetchedTeachers: any[],
    fetchedStudents: any[]
) {
    const personTypes = [];
    if (fetchedFaculty.length > 0) personTypes.push("faculty");
    if (fetchedTeachers.length > 0) personTypes.push("teacher");
    if (fetchedStudents.length > 0) personTypes.push("student");

    if (personTypes.length === 0) {
        return { bookedBy: "N/A", userType: "N/A", department: "N/A", reason: "N/A" };
    }

    const personType = personTypes[Math.floor(Math.random() * personTypes.length)];
    let personArray: any[] = [];
    let idField = '';

    if (personType === "faculty") {
        personArray = fetchedFaculty;
        idField = 'faculty_id';
    } else if (personType === "teacher") {
        personArray = fetchedTeachers;
        idField = 'employee_id';
    } else {
        personArray = fetchedStudents;
        idField = 'registration_number';
    }

    if (!personArray || personArray.length === 0) {
        return { bookedBy: "N/A", userType: "N/A", department: "N/A", reason: "N/A" };
    }

    const person = personArray[Math.floor(Math.random() * personArray.length)];
    const userTypeDisplay = personType.charAt(0).toUpperCase() + personType.slice(1);
    const department = person.department || person.faculty || "N/A";
    const reasons: { [key: string]: string[] } = {
        faculty: ["Faculty Meeting", "Research Work", "Department Meeting"],
        teacher: ["Lecture", "Office Hours", "Department Meeting"],
        student: ["Group Study", "Project Work", "Club Meeting"],
    };
    const reason = reasons[personType]?.[Math.floor(Math.random() * reasons[personType].length)] || "General Use";
    const displayName = `${person.name} (${person[idField] || 'N/A'})`;

    return {
        bookedBy: displayName,
        userType: userTypeDisplay,
        department: department,
        reason: reason,
    };
}


// Define types for your data (optional but recommended for better TypeScript support)
interface FacultyMember { id: string; name: string; faculty: string; faculty_id: string; [key: string]: any; }
interface Teacher { id: string; name: string; department: string; employee_id: string; [key: string]: any; }
interface Student { id: string; name: string; department: string; registration_number: string; [key: string]: any; }
interface Room { id: string; campus: string; building: string; floor: string; name: string; roomNumber: string; type: string; status: "available" | "booked"; time?: string; capacity: number; features: string[]; bookedBy?: string; userType?: string; department?: string; reason?: string; [key: string]: any; }
interface Equipment { id: string; campus: string; type: string; name: string; status: "available" | "booked"; location: string; bookedBy?: string; userType?: string; department?: string; time?: string; reason?: string; [key: string]: any; }
interface CampusBuilding { id: string; name: string; } // Example, adjust as per your Firestore structure for campusBuildings


export default function DashboardPage() {
  // State for fetched data
  const [ethiopianData, setEthiopianData] = useState<{ faculty: FacultyMember[], teachers: Teacher[], students: Student[] }>({ faculty: [], teachers: [], students: [] });
  const [campusBuildingsData, setCampusBuildingsData] = useState<{ [key: string]: CampusBuilding[] }>({}); // e.g. { mexico: [{id:'B1', name:'Building B1'}], ...}
  const [allRooms, setAllRooms] = useState<Room[]>([]);
  const [allEquipment, setAllEquipment] = useState<Equipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedCampus, setSelectedCampus] = useState("mexico");
  const [selectedBuilding, setSelectedBuilding] = useState("all");
  const [selectedFloor, setSelectedFloor] = useState("all");
  const [selectedRoomType, setSelectedRoomType] = useState("all");
  const [selectedDepartment, setSelectedDepartment] = useState("all"); // For filtering bookings
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [bookingType, setBookingType] = useState<"room" | "equipment">("room");
  const [bookingDate, setBookingDate] = useState("");
  const [bookingStartTime, setBookingStartTime] = useState("");
  const [bookingEndTime, setBookingEndTime] = useState("");
  const [bookingReason, setBookingReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false); // Renamed from showFilters for clarity
  const [availableOnly, setAvailableOnly] = useState(false);
  const [visibleRooms, setVisibleRooms] = useState(20);
  const [visibleEquipment, setVisibleEquipment] = useState(20);
  const [buildings, setBuildings] = useState<string[]>([]); // For filter dropdown: unique building names
  const [floors, setFloors] = useState<string[]>([]);       // For filter dropdown: unique floor names
  const [roomTypes, setRoomTypes] = useState<string[]>([]); // For filter dropdown: unique room types
  const [departments, setDepartments] = useState<string[]>([]); // For filter dropdown: unique dept names from personnel
  const [currentUser, setCurrentUser] = useState<any>(null); // Adjust 'any' to a more specific user type
  const [availableBuildingsForFilter, setAvailableBuildingsForFilter] = useState<CampusBuilding[]>([]); // For building filter dropdown based on selected campus
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")


  // Add effect for user authentication
  useEffect(() => {
    // Set up an authentication state observer
    const unsubscribeAuth = onAuthStateChanged(auth, async (user: any) => {
      if (user) {
        // User is signed in
        // Fetch user profile from Firestore based on user's role
        try {
          const userEmail = user.email;
          let userProfile: any = null;
          let userRole = '';
          
          // Try to find the user in students collection
          const studentQuery = query(collection(db, 'users'), where('email', '==', userEmail), where('role', '==', 'student'));
          const studentSnapshot = await getDocs(studentQuery);
          
          if (!studentSnapshot.empty) {
            userProfile = { id: studentSnapshot.docs[0].id, ...studentSnapshot.docs[0].data() };
            userRole = 'Student';
          } else {
            // Try to find the user in staff collection
            const staffQuery = query(collection(db, 'users'), where('email', '==', userEmail), where('role', '==', 'staff'));
            const staffSnapshot = await getDocs(staffQuery);
            
            if (!staffSnapshot.empty) {
              userProfile = { id: staffSnapshot.docs[0].id, ...staffSnapshot.docs[0].data() };
              userRole = 'Staff';
            } else {
              // Try to find the user in admin collection
              const adminQuery = query(collection(db, 'users'), where('email', '==', userEmail), where('role', '==', 'admin'));
              const adminSnapshot = await getDocs(adminQuery);
              
              if (!adminSnapshot.empty) {
                userProfile = { id: adminSnapshot.docs[0].id, ...adminSnapshot.docs[0].data() };
                userRole = 'Admin';
              }
            }
          }
          
          if (userProfile) {
            setCurrentUser({
              ...userProfile,
              userType: userRole,
              email: userEmail,
              uid: user.uid,
            });
          } else {
            // User is authenticated but profile not found
            setCurrentUser({
              name: user.displayName || 'User',
              email: user.email,
              userType: 'Guest',
              uid: user.uid,
            });
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setCurrentUser({
            name: user.displayName || 'User',
            email: user.email,
            userType: 'Guest',
            uid: user.uid,
          });
        }
      } else {
        // User is signed out, redirect to login page
        window.location.href = '/login';
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribeAuth();
  }, []);
  
  // Fetch all data from Firebase on component mount
  useEffect(() => {
    let unsubscribeRooms: () => void;
    let unsubscribeEquipment: () => void;
    
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch Faculty
        const facultySnapshot = await getDocs(collection(db, "faculty"));
        const facultyList = facultySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FacultyMember));

        // Fetch Teachers
        const teachersSnapshot = await getDocs(collection(db, "teachers"));
        const teachersList = teachersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Teacher));

        // Fetch Students
        const studentsSnapshot = await getDocs(collection(db, "students"));
        const studentsList = studentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student));

        setEthiopianData({ faculty: facultyList, teachers: teachersList, students: studentsList });

        // Fetch Campus Buildings Data
        const campusNames = ["mexico", "main", "new"];
        const fetchedCampusBuildings: { [key: string]: CampusBuilding[] } = {};
        
        // Default building data to use when no data exists in Firebase
        const defaultBuildings: { [key: string]: CampusBuilding[] } = {
          "mexico": [
            { id: "mex-1", name: "Main Building" },
            { id: "mex-2", name: "Science Block" },
            { id: "mex-3", name: "Library" }
          ],
          "main": [
            { id: "main-1", name: "Administration" },
            { id: "main-2", name: "Engineering" },
            { id: "main-3", name: "Social Sciences" }
          ],
          "new": [
            { id: "new-1", name: "Technology Hub" },
            { id: "new-2", name: "Health Sciences" },
            { id: "new-3", name: "Business School" }
          ]
        };
        
        for (const campusName of campusNames) {
          const campusDocRef = doc(db, "campusBuildingInfo", campusName); 
          const campusDocSnap = await getDoc(campusDocRef);
          if (campusDocSnap.exists() && campusDocSnap.data().buildings) {
            fetchedCampusBuildings[campusName] = campusDocSnap.data().buildings as CampusBuilding[];
          } else {
            // Use default data instead of showing warnings
            fetchedCampusBuildings[campusName] = defaultBuildings[campusName];
            console.log(`Using default building data for campus: ${campusName}`);
          }
        }
        setCampusBuildingsData(fetchedCampusBuildings);

        // Set up real-time listener for rooms
        // Using only a single orderBy to avoid needing a composite index
        const roomsQuery = query(collection(db, "rooms"), orderBy("building"));
        unsubscribeRooms = onSnapshot(roomsQuery, (snapshot: any) => {
          const roomsList = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as Room));
          // Sort rooms by roomNumber client-side since we removed the second orderBy
          roomsList.sort((a: Room, b: Room) => (a.roomNumber || '').localeCompare(b.roomNumber || ''));
          setAllRooms(roomsList);
          
          // Extract unique buildings, floors, and room types for filters
          const uniqueBuildings = [...new Set(roomsList.map((room: Room) => room.building))];
          const uniqueFloors = [...new Set(roomsList.map((room: Room) => room.floor))];
          const uniqueRoomTypes = [...new Set(roomsList.map((room: Room) => room.type))];
          
          setBuildings(uniqueBuildings as string[]);
          setFloors(uniqueFloors as string[]);
          setRoomTypes(uniqueRoomTypes as string[]);
        });

        // Set up real-time listener for equipment
        const equipmentQuery = query(collection(db, "equipment"), orderBy("type"));
        unsubscribeEquipment = onSnapshot(equipmentQuery, (snapshot: any) => {
          const equipmentList = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as Equipment));
          setAllEquipment(equipmentList);
        });

      } catch (error) {
        console.error("Error fetching data from Firebase:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    
    // Cleanup listeners on unmount
    return () => {
      if (unsubscribeRooms) unsubscribeRooms();
      if (unsubscribeEquipment) unsubscribeEquipment();
    };
  }, []); // Empty dependency array means this runs once on mount


  // Update filter options when data loads or selectedCampus changes
  useEffect(() => {
    if (isLoading) return;

    // Update available buildings for filter when campus changes
    const currentCampusBuildings = campusBuildingsData[selectedCampus] || [];
    setAvailableBuildingsForFilter(currentCampusBuildings);
    if (selectedCampus !== "all" && !currentCampusBuildings.find(b => b.name === selectedBuilding)) {
        setSelectedBuilding("all"); // Reset if current building not in new campus
    }


    const campusRooms = allRooms.filter(room => selectedCampus === "all" || room.campus === selectedCampus);

    const uniqueBuildingsFromRooms = Array.from(new Set(campusRooms.map(room => room.building))).sort();
    setBuildings(uniqueBuildingsFromRooms);


    let roomsForFloorFilter = campusRooms;
    if (selectedBuilding !== "all") {
        roomsForFloorFilter = campusRooms.filter(room => room.building === selectedBuilding);
    }
    const uniqueFloors = Array.from(new Set(roomsForFloorFilter.map(room => room.floor))).sort();
    setFloors(uniqueFloors);
    if (selectedBuilding !== "all" && !uniqueFloors.includes(selectedFloor)) {
        setSelectedFloor("all"); // Reset if current floor not in new building
    }


    const uniqueRoomTypes = Array.from(new Set(allRooms.map(room => room.type))).sort(); // Show all types regardless of campus filter for now
    setRoomTypes(uniqueRoomTypes);

    const depts: string[] = [];
    ethiopianData.faculty.forEach(f => { if (f.faculty && !depts.includes(f.faculty)) depts.push(f.faculty) });
    ethiopianData.teachers.forEach(t => { if (t.department && !depts.includes(t.department)) depts.push(t.department) });
    ethiopianData.students.forEach(s => { if (s.department && !depts.includes(s.department)) depts.push(s.department) });
    setDepartments(Array.from(new Set(depts)).sort());

  }, [isLoading, selectedCampus, selectedBuilding, allRooms, ethiopianData, campusBuildingsData]);


  const handleOpenBookingDialog = (item: Room | Equipment, type: "room" | "equipment") => {
    setBookingType(type);
    if (type === "room") {
      setSelectedRoom(item as Room);
      setSelectedEquipment(null);
    } else {
      setSelectedEquipment(item as Equipment);
      setSelectedRoom(null);
    }
    setBookingDate(new Date().toISOString().split('T')[0]); // Default to today
    setBookingStartTime("");
    setBookingEndTime("");
    setBookingReason("");
    setBookingDialogOpen(true);
  };

  const handleCloseBookingDialog = () => {
    setBookingDialogOpen(false);
    setSelectedRoom(null);
    setSelectedEquipment(null);
  };

  // Define filtering logic for rooms and equipment outside of the handlers
  const filteredRooms = allRooms
    .filter(room => selectedCampus === "all" || room.campus === selectedCampus)
    .filter(room => selectedBuilding === "all" || room.building === selectedBuilding)
    .filter(room => selectedFloor === "all" || room.floor === selectedFloor)
    .filter(room => selectedRoomType === "all" || room.type === selectedRoomType)
    .filter(room => availableOnly ? room.status === "available" : true)
    .filter(room => {
      if (!searchQuery) return true;
      const searchLower = searchQuery.toLowerCase();
      // Check bookingInfo if it exists and status is booked
      const bookingInfo = room.bookingInfo || { bookedBy: room.bookedBy, department: room.department };
      const bookedByMatch = room.status === 'booked' && bookingInfo.bookedBy?.toLowerCase().includes(searchLower);
      const departmentMatch = room.status === 'booked' && bookingInfo.department?.toLowerCase().includes(searchLower);

      return (
        room.name?.toLowerCase().includes(searchLower) ||
        room.roomNumber?.toLowerCase().includes(searchLower) ||
        room.building?.toLowerCase().includes(searchLower) ||
        room.type?.toLowerCase().includes(searchLower) ||
        room.features?.some(feature => feature.toLowerCase().includes(searchLower)) ||
        bookedByMatch ||
        departmentMatch
      );
    })
    // Additional filter for department if a department is selected for filtering bookings
    .filter(room => {
      if (selectedDepartment === "all" || room.status === "available") return true;
      const bookingInfo = room.bookingInfo || { department: room.department };
      return bookingInfo.department === selectedDepartment;
    });


  const filteredEquipment = allEquipment
    .filter(equip => selectedCampus === "all" || equip.campus === selectedCampus)
    .filter(equip => availableOnly ? equip.status === "available" : true)
    .filter(equip => {
      if (!searchQuery) return true;
      const searchLower = searchQuery.toLowerCase();
      const bookingInfo = equip.bookingInfo || { bookedBy: equip.bookedBy, department: equip.department };
      const bookedByMatch = equip.status === 'booked' && bookingInfo.bookedBy?.toLowerCase().includes(searchLower);
      const departmentMatch = equip.status === 'booked' && bookingInfo.department?.toLowerCase().includes(searchLower);
      return (
        equip.name?.toLowerCase().includes(searchLower) ||
        equip.type?.toLowerCase().includes(searchLower) ||
        equip.location?.toLowerCase().includes(searchLower) ||
        bookedByMatch ||
        departmentMatch
      );
    })
    .filter(equip => {
      if (selectedDepartment === "all" || equip.status === "available") return true;
      const bookingInfo = equip.bookingInfo || { department: equip.department };
      return bookingInfo.department === selectedDepartment;
    });

  const loadMoreRooms = () => setVisibleRooms(prev => prev + 20);
  const loadMoreEquipment = () => setVisibleEquipment(prev => prev + 20);
  
  // Actual booking submission handler
  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Get the booking data based on the booking type
      const bookingData = {
        date: bookingDate,
        startTime: bookingStartTime,
        endTime: bookingEndTime,
        reason: bookingReason,
        userId: auth.currentUser?.uid,
        userEmail: auth.currentUser?.email,
        createdAt: serverTimestamp(),
        status: "pending" // Could be 'pending', 'approved', 'rejected'
      };
      
      if (bookingType === "room" && selectedRoom) {
        await addDoc(collection(db, "bookings"), {
          ...bookingData,
          itemType: "room",
          itemId: selectedRoom.id,
          roomName: selectedRoom.name,
          building: selectedRoom.building,
          floor: selectedRoom.floor,
          roomNumber: selectedRoom.roomNumber
        });
        
        // Update room status if you want to show it as booked immediately
        // await updateDoc(doc(db, "rooms", selectedRoom.id), { status: "booked" });
      } else if (bookingType === "equipment" && selectedEquipment) {
        await addDoc(collection(db, "bookings"), {
          ...bookingData,
          itemType: "equipment",
          itemId: selectedEquipment.id,
          equipmentName: selectedEquipment.name,
          equipmentType: selectedEquipment.type,
          location: selectedEquipment.location
        });
        
        // Update equipment status if you want to show it as booked immediately
        // await updateDoc(doc(db, "equipment", selectedEquipment.id), { status: "booked" });
      }
      
      // Close dialog and reset form
      handleCloseBookingDialog();
      alert("Booking request submitted successfully. It will be reviewed by an administrator.");
    } catch (error) {
      console.error("Error creating booking:", error);
      alert("There was an error creating your booking. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Clock className="w-12 h-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading Dashboard Data...</p>
      </div>
    );
  }

  // Filter rendering function
  const renderFilters = (isMobile = false) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Filters <Filter className="h-5 w-5 text-muted-foreground" />
        </CardTitle>
       {!isMobile && <CardDescription>Refine your search for rooms and equipment.</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor={`campus-select${isMobile ? '-mobile' : ''}`} className="text-sm font-semibold">Campus</Label>
          <Select value={selectedCampus} onValueChange={setSelectedCampus}>
            <SelectTrigger id={`campus-select${isMobile ? '-mobile' : ''}`}><SelectValue placeholder="Select Campus" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Campuses</SelectItem>
              <SelectItem value="mexico">Mexico Campus</SelectItem>
              <SelectItem value="main">Main Campus</SelectItem>
              <SelectItem value="new">New Campus</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {availableBuildingsForFilter.length > 0 && (
          <div>
            <Label htmlFor={`building-select${isMobile ? '-mobile' : ''}`} className="text-sm font-semibold">Building</Label>
            <Select value={selectedBuilding} onValueChange={setSelectedBuilding} disabled={selectedCampus === "all" && availableBuildingsForFilter.length === 0}>
              <SelectTrigger id={`building-select${isMobile ? '-mobile' : ''}`}><SelectValue placeholder="Select Building" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Buildings</SelectItem>
                {availableBuildingsForFilter.map(building => (
                  <SelectItem key={building.id || building.name} value={building.name}>
                    {building.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {floors.length > 0 && (
          <div>
            <Label htmlFor={`floor-select${isMobile ? '-mobile' : ''}`} className="text-sm font-semibold">Floor</Label>
            <Select value={selectedFloor} onValueChange={setSelectedFloor} disabled={selectedBuilding === "all" && floors.length === 0}>
              <SelectTrigger id={`floor-select${isMobile ? '-mobile' : ''}`}><SelectValue placeholder="Select Floor" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Floors</SelectItem>
                {floors.map(floor => (<SelectItem key={floor} value={floor}>{floor}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
        )}

        {roomTypes.length > 0 && (
          <div>
            <Label htmlFor={`room-type-select${isMobile ? '-mobile' : ''}`} className="text-sm font-semibold">Room Type</Label>
            <Select value={selectedRoomType} onValueChange={setSelectedRoomType}>
              <SelectTrigger id={`room-type-select${isMobile ? '-mobile' : ''}`}><SelectValue placeholder="Select Room Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Room Types</SelectItem>
                {roomTypes.map(type => (<SelectItem key={type} value={type}>{type}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
        )}

         {departments.length > 0 && (
           <div>
            <Label htmlFor={`department-select${isMobile ? '-mobile' : ''}`} className="text-sm font-semibold">Booked By Department</Label>
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger id={`department-select${isMobile ? '-mobile' : ''}`}><SelectValue placeholder="Filter by Department" /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
           </div>
        )}

        <div className="flex items-center space-x-2 pt-2">
          <Checkbox id={`available-only${isMobile ? '-mobile' : ''}`} checked={availableOnly} onCheckedChange={checked => setAvailableOnly(Boolean(checked))} />
          <Label htmlFor={`available-only${isMobile ? '-mobile' : ''}`} className="text-sm font-medium">Show Available Only</Label>
        </div>
      </CardContent>
    </Card>
  );


  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      {/* Sidebar placeholder if you have one, adjust layout if needed */}
      {/* <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">...</aside> */}

      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14"> {/* Adjust sm:pl-14 if you have a fixed sidebar */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <Sheet open={showMobileFilters} onOpenChange={setShowMobileFilters}>
            <SheetTrigger asChild>
              <Button size="icon" variant="outline" className="sm:hidden">
                <Filter className="h-5 w-5" /> {/* Changed icon to Filter for mobile trigger */}
                <span className="sr-only">Toggle Filters</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="sm:max-w-xs w-4/5 overflow-y-auto">
              <nav className="grid gap-6 text-lg font-medium pt-4">
                <h2 className="text-xl font-semibold pl-4">Filters</h2>
                 {renderFilters(true)}
              </nav>
            </SheetContent>
          </Sheet>

          <div className="relative ml-auto flex-1 md:grow-0">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search rooms, equipment, bookings..."
              className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="overflow-hidden rounded-full">
                <Avatar>
                  <AvatarImage src={currentUser?.avatarUrl || `https://avatar.vercel.sh/${currentUser?.name || 'guest'}.png`} alt={currentUser?.name} />
                  <AvatarFallback>{currentUser?.name ? currentUser.name.substring(0, 2).toUpperCase() : "GU"}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{currentUser?.name || "Guest User"}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>My Bookings (Not Implemented)</DropdownMenuItem>
              <DropdownMenuItem>Settings (Not Implemented)</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Logout (Not Implemented)</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
            <div className="hidden lg:block lg:col-span-1">
              {renderFilters()}
            </div>

            <div className="lg:col-span-3">
              <Tabs defaultValue="rooms">
                <div className="flex items-center justify-between mb-4">
                  <TabsList>
                    <TabsTrigger value="rooms">Rooms ({filteredRooms.length})</TabsTrigger>
                    <TabsTrigger value="equipment">Equipment ({filteredEquipment.length})</TabsTrigger>
                  </TabsList>
                   <div className="flex items-center gap-2">
                        <Button variant={viewMode === 'grid' ? 'secondary' : 'outline'} size="sm" onClick={() => setViewMode('grid')}>Grid</Button>
                        <Button variant={viewMode === 'list' ? 'secondary' : 'outline'} size="sm" onClick={() => setViewMode('list')}>List</Button>
                    </div>
                </div>

                <TabsContent value="rooms">
                  <div className={`gap-4 ${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'space-y-4'}`}>
                    {filteredRooms.slice(0, visibleRooms).map(room => {
                      const colors = roomColors[room.type as keyof typeof roomColors] || roomColors.Classroom;
                      const bookingInfo = room.bookingInfo || { bookedBy: room.bookedBy, userType: room.userType, department: room.department, reason: room.reason, time: room.time };
                      return (
                        <Card key={room.id} className={`w-full overflow-hidden transition-all hover:shadow-lg ${colors.border}`}>
                          <CardHeader className={`p-4 ${colors.bg} dark:${colors.dark}`}>
                            <div className="flex items-center justify-between">
                              <CardTitle className={`text-lg font-semibold ${colors.text}`}>{room.name}</CardTitle>
                              <Badge variant={room.status === "available" ? "outline" : "destructive"}>
                                {room.status === "available" ? <DoorOpen className="mr-1 h-4 w-4" /> : <DoorClosed className="mr-1 h-4 w-4" />}
                                {room.status}
                              </Badge>
                            </div>
                            <CardDescription className={`${colors.text} opacity-80`}>
                              {room.building} - {room.floor} - #{room.roomNumber}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="p-4 space-y-2">
                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                              <span>Type: <Badge variant="outline">{room.type}</Badge></span>
                              <span>Capacity: {room.capacity}</span>
                            </div>
                            {room.status === "booked" && bookingInfo.bookedBy && (
                              <div className="text-xs p-2 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                                <p><strong>Booked by:</strong> {bookingInfo.bookedBy} ({bookingInfo.userType || 'N/A'})</p>
                                <p><strong>Department:</strong> {bookingInfo.department || 'N/A'}</p>
                                <p><strong>Time:</strong> {bookingInfo.time || 'N/A'}</p>
                                <p><strong>Reason:</strong> {bookingInfo.reason || 'N/A'}</p>
                              </div>
                            )}
                            {room.status === "available" && room.time && (
                               <p className="text-sm text-muted-foreground">Default Availability: {room.time}</p>
                            )}
                            {room.features && room.features.length > 0 && (
                              <div>
                                <h4 className="text-xs font-semibold mb-1">Features:</h4>
                                <div className="flex flex-wrap gap-1">
                                  {room.features.slice(0,3).map(feature => (
                                    <Badge key={feature} variant="secondary" className="text-xs">{feature}</Badge>
                                  ))}
                                  {room.features.length > 3 && <Badge variant="secondary" className="text-xs">+{room.features.length - 3} more</Badge>}
                                </div>
                              </div>
                            )}
                            <Button
                              className="w-full mt-2"
                              onClick={() => handleOpenBookingDialog(room, "room")}
                              disabled={room.status === "booked"}
                            >
                              {room.status === "available" ? "Book Room" : "Currently Booked"}
                            </Button>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                  {visibleRooms < filteredRooms.length && (
                    <Button onClick={loadMoreRooms} variant="outline" className="w-full mt-4">Load More Rooms</Button>
                  )}
                  {filteredRooms.length === 0 && <p className="text-center text-muted-foreground py-8">No rooms match your criteria.</p>}
                </TabsContent>

                <TabsContent value="equipment">
                  <div className={`gap-4 ${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'space-y-4'}`}>
                    {filteredEquipment.slice(0, visibleEquipment).map(equip => {
                       const bookingInfo = equip.bookingInfo || { bookedBy: equip.bookedBy, userType: equip.userType, department: equip.department, reason: equip.reason, time: equip.time };
                      return (
                        <Card key={equip.id} className="w-full overflow-hidden transition-all hover:shadow-lg">
                          <CardHeader className="p-4 bg-gray-50 dark:bg-gray-800">
                           <div className="flex items-center justify-between">
                            <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200">{equip.name}</CardTitle>
                            <Badge variant={equip.status === "available" ? "outline" : "destructive"}>
                               {equip.status === "available" ? <DoorOpen className="mr-1 h-4 w-4" /> : <DoorClosed className="mr-1 h-4 w-4" />}
                               {equip.status}
                            </Badge>
                           </div>
                           <CardDescription className="text-gray-600 dark:text-gray-400">
                            Type: {equip.type} | Location: {equip.location}
                           </CardDescription>
                          </CardHeader>
                          <CardContent className="p-4 space-y-2">
                          {equip.status === "booked" && bookingInfo.bookedBy && (
                            <div className="text-xs p-2 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                                <p><strong>Booked by:</strong> {bookingInfo.bookedBy} ({bookingInfo.userType || 'N/A'})</p>
                                <p><strong>Department:</strong> {bookingInfo.department || 'N/A'}</p>
                                {bookingInfo.time && <p><strong>Time:</strong> {bookingInfo.time}</p>}
                                {bookingInfo.reason && <p><strong>Reason:</strong> {bookingInfo.reason}</p>}
                            </div>
                          )}
                           <Button
                            className="w-full mt-2"
                            onClick={() => handleOpenBookingDialog(equip, "equipment")}
                            disabled={equip.status === "booked"}
                           >
                            {equip.status === "available" ? "Book Equipment" : "Currently Booked"}
                           </Button>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                  {visibleEquipment < filteredEquipment.length && (
                    <Button onClick={loadMoreEquipment} variant="outline" className="w-full mt-4">Load More Equipment</Button>
                  )}
                  {filteredEquipment.length === 0 && <p className="text-center text-muted-foreground py-8">No equipment matches your criteria.</p>}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>
      </div>

      <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Book {bookingType === "room" ? selectedRoom?.name : selectedEquipment?.name}</DialogTitle>
            <DialogDescription>
              {bookingType === "room"
                ? `For ${selectedRoom?.building} - ${selectedRoom?.floor} - Room ${selectedRoom?.roomNumber}`
                : `For ${selectedEquipment?.type} - ${selectedEquipment?.location}`}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitBooking}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="booking-date" className="text-right">Date</Label>
                <Input id="booking-date" type="date" value={bookingDate} onChange={e => setBookingDate(e.target.value)} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="booking-start-time" className="text-right">Start Time</Label>
                <Input id="booking-start-time" type="time" value={bookingStartTime} onChange={e => setBookingStartTime(e.target.value)} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="booking-end-time" className="text-right">End Time</Label>
                <Input id="booking-end-time" type="time" value={bookingEndTime} onChange={e => setBookingEndTime(e.target.value)} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="booking-reason" className="text-right">Reason</Label>
                <Textarea id="booking-reason" value={bookingReason} onChange={e => setBookingReason(e.target.value)} className="col-span-3" placeholder="e.g., Team Meeting, Study Session" required />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseBookingDialog}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Clock className="mr-2 h-4 w-4 animate-spin" /> : null}
                Confirm Booking
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
