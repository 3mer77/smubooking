// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, getDoc, setDoc, query, where, Timestamp } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, User } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCQBg5075SsOn-xZ4D8O7KelfvZ2_YXz_k",
    authDomain: "smuproject12-645b4.firebaseapp.com",
    projectId: "smuproject12-645b4",
    storageBucket: "smuproject12-645b4.firebasestorage.app",
    messagingSenderId: "977472397040",
    appId: "1:977472397040:web:f77e9b91feb20172bc2c35",
    measurementId: "G-WT7RC50GV2"
}; // charge this from .env file

// Initialize Firebase
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

// Define collection references
const usersCollection = collection(db, 'users');
const roomsCollection = collection(db, 'rooms');
const equipmentCollection = collection(db, 'equipment');
const bookingsCollection = collection(db, 'bookings');
const notificationsCollection = collection(db, 'notifications');

// Export collection references
export { usersCollection, roomsCollection, equipmentCollection, bookingsCollection, notificationsCollection };

// Define types for the collections

// User roles
export enum UserRole {
    STUDENT = 'student',
    STAFF = 'staff',
    ADMIN = 'admin'
}

// User type
export interface UserType {
    uid: string;
    email: string;
    displayName: string;
    role: UserRole;
    department?: string;
    studentId?: string;
    staffId?: string;
    phoneNumber?: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

// Room type
export interface RoomType {
    id: string;
    name: string;
    building: string;
    floor: string;
    roomNumber: string;
    type: string;
    capacity: number;
    features: string[];
    campus: string;
    requiresApproval: boolean;
    status: 'available' | 'booked' | 'maintenance';
    images?: string[];
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

// Equipment type
export interface EquipmentType {
    id: string;
    name: string;
    type: string;
    location: string;
    status: 'available' | 'booked' | 'maintenance';
    description?: string;
    requiresApproval: boolean;
    quantity: number;
    images?: string[];
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

// Booking status
export enum BookingStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected',
    CANCELLED = 'cancelled',
    COMPLETED = 'completed'
}

// Booking type
export interface BookingType {
    id: string;
    userId: string;
    resourceType: 'room' | 'equipment';
    resourceId: string;
    startTime: Timestamp;
    endTime: Timestamp;
    status: BookingStatus;
    reason: string;
    approvedBy?: string;
    rejectionReason?: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

// Notification settings type
export interface NotificationSettingsType {
    userId: string;
    email: boolean;
    push: boolean;
    bookingReminders: boolean;
    bookingUpdates: boolean;
    systemAnnouncements: boolean;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

// Helper functions for working with the collections

// User functions
export const createUser = async (userData: Omit<UserType, 'uid' | 'createdAt' | 'updatedAt'>, uid: string) => {
    const timestamp = Timestamp.now();
    const newUser: UserType = {
        ...userData,
        uid,
        createdAt: timestamp,
        updatedAt: timestamp
    };
    
    await setDoc(doc(usersCollection, uid), newUser);
    return newUser;
};

export const getUserById = async (uid: string) => {
    const userDoc = await getDoc(doc(usersCollection, uid));
    return userDoc.exists() ? userDoc.data() as UserType : null;
};

// Room functions
export const createRoom = async (roomData: Omit<RoomType, 'id' | 'createdAt' | 'updatedAt'>) => {
    const timestamp = Timestamp.now();
    const newRoom = {
        ...roomData,
        createdAt: timestamp,
        updatedAt: timestamp
    };
    
    const docRef = await addDoc(roomsCollection, newRoom);
    return { id: docRef.id, ...newRoom };
};

export const getRooms = async () => {
    const roomSnapshot = await getDocs(roomsCollection);
    return roomSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as RoomType);
};

// Equipment functions
export const createEquipment = async (equipmentData: Omit<EquipmentType, 'id' | 'createdAt' | 'updatedAt'>) => {
    const timestamp = Timestamp.now();
    const newEquipment = {
        ...equipmentData,
        createdAt: timestamp,
        updatedAt: timestamp
    };
    
    const docRef = await addDoc(equipmentCollection, newEquipment);
    return { id: docRef.id, ...newEquipment };
};

export const getEquipment = async () => {
    const equipmentSnapshot = await getDocs(equipmentCollection);
    return equipmentSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as EquipmentType);
};

// Booking functions
export const createBooking = async (bookingData: Omit<BookingType, 'id' | 'createdAt' | 'updatedAt'>) => {
    const timestamp = Timestamp.now();
    const newBooking = {
        ...bookingData,
        createdAt: timestamp,
        updatedAt: timestamp
    };
    
    const docRef = await addDoc(bookingsCollection, newBooking);
    return { id: docRef.id, ...newBooking };
};

export const getBookingsByUser = async (userId: string) => {
    const q = query(bookingsCollection, where("userId", "==", userId));
    const bookingSnapshot = await getDocs(q);
    return bookingSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as BookingType);
};

// Notification settings functions
export const createNotificationSettings = async (settingsData: Omit<NotificationSettingsType, 'createdAt' | 'updatedAt'>) => {
    const timestamp = Timestamp.now();
    const newSettings = {
        ...settingsData,
        createdAt: timestamp,
        updatedAt: timestamp
    };
    
    await setDoc(doc(notificationsCollection, settingsData.userId), newSettings);
    return newSettings;
};

export const getNotificationSettings = async (userId: string) => {
    const settingsDoc = await getDoc(doc(notificationsCollection, userId));
    return settingsDoc.exists() ? settingsDoc.data() as NotificationSettingsType : null;
};

export { app, db, auth, storage };