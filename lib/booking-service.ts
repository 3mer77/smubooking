import { Timestamp, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { 
  db, 
  bookingsCollection, 
  roomsCollection, 
  equipmentCollection,
  createBooking, 
  BookingType, 
  BookingStatus, 
  RoomType, 
  EquipmentType 
} from './firebase';

// Check room availability for a specific time slot
export const checkRoomAvailability = async (
  roomId: string,
  startTime: Date,
  endTime: Date
): Promise<boolean> => {
  try {
    // Convert dates to Firestore Timestamps
    const startTimestamp = Timestamp.fromDate(startTime);
    const endTimestamp = Timestamp.fromDate(endTime);

    // Query for bookings that overlap with the requested time slot
    const q = query(
      bookingsCollection,
      where('resourceType', '==', 'room'),
      where('resourceId', '==', roomId),
      where('status', 'in', [BookingStatus.PENDING, BookingStatus.APPROVED]),
      where('endTime', '>', startTimestamp)
    );

    const bookingSnapshot = await getDocs(q);
    
    // Check if any booking overlaps with the requested time
    for (const bookingDoc of bookingSnapshot.docs) {
      const booking = bookingDoc.data() as BookingType;
      if (booking.startTime.toDate() < endTime) {
        // There is an overlap
        return false;
      }
    }

    // No overlapping bookings found
    return true;
  } catch (error) {
    console.error('Error checking room availability:', error);
    throw error;
  }
};

// Check equipment availability for a specific time slot
export const checkEquipmentAvailability = async (
  equipmentId: string,
  startTime: Date,
  endTime: Date
): Promise<boolean> => {
  try {
    // Convert dates to Firestore Timestamps
    const startTimestamp = Timestamp.fromDate(startTime);
    const endTimestamp = Timestamp.fromDate(endTime);

    // Get equipment details to check quantity
    const equipmentDoc = await getDocs(query(equipmentCollection, where('id', '==', equipmentId)));
    if (equipmentDoc.empty) {
      throw new Error('Equipment not found');
    }
    
    const equipment = equipmentDoc.docs[0].data() as EquipmentType;
    
    // Query for bookings that overlap with the requested time slot
    const q = query(
      bookingsCollection,
      where('resourceType', '==', 'equipment'),
      where('resourceId', '==', equipmentId),
      where('status', 'in', [BookingStatus.PENDING, BookingStatus.APPROVED]),
      where('endTime', '>', startTimestamp)
    );

    const bookingSnapshot = await getDocs(q);
    
    // Count how many items are booked during the requested time
    let bookedQuantity = 0;
    for (const bookingDoc of bookingSnapshot.docs) {
      const booking = bookingDoc.data() as BookingType;
      if (booking.startTime.toDate() < endTime) {
        // There is an overlap
        bookedQuantity++;
      }
    }

    // Check if there's enough quantity available
    return bookedQuantity < equipment.quantity;
  } catch (error) {
    console.error('Error checking equipment availability:', error);
    throw error;
  }
};

// Create a new booking
export const createNewBooking = async (
  userId: string,
  resourceType: 'room' | 'equipment',
  resourceId: string,
  startTime: Date,
  endTime: Date,
  reason: string
): Promise<BookingType> => {
  try {
    // Check if the resource requires approval
    let requiresApproval = false;
    
    if (resourceType === 'room') {
      const roomDoc = await getDocs(query(roomsCollection, where('id', '==', resourceId)));
      if (roomDoc.empty) {
        throw new Error('Room not found');
      }
      const roomData = roomDoc.docs[0].data() as RoomType;
      requiresApproval = roomData.requiresApproval;
    } else {
      const equipmentDoc = await getDocs(query(equipmentCollection, where('id', '==', resourceId)));
      if (equipmentDoc.empty) {
        throw new Error('Equipment not found');
      }
      const equipmentData = equipmentDoc.docs[0].data() as EquipmentType;
      requiresApproval = equipmentData.requiresApproval;
    }
    
    // Check availability
    let isAvailable = false;
    if (resourceType === 'room') {
      isAvailable = await checkRoomAvailability(resourceId, startTime, endTime);
    } else {
      isAvailable = await checkEquipmentAvailability(resourceId, startTime, endTime);
    }
    
    if (!isAvailable) {
      throw new Error(`The ${resourceType} is not available for the requested time`);
    }
    
    // Create booking with appropriate status
    const status = requiresApproval ? BookingStatus.PENDING : BookingStatus.APPROVED;
    
    const bookingData = {
      userId,
      resourceType,
      resourceId,
      startTime: Timestamp.fromDate(startTime),
      endTime: Timestamp.fromDate(endTime),
      status,
      reason,
    };
    
    const newBooking = await createBooking(bookingData);
    return newBooking;
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
};

// Cancel a booking
export const cancelBooking = async (bookingId: string, userId: string): Promise<boolean> => {
  try {
    // Get the booking
    const bookingDocs = await getDocs(query(bookingsCollection, where('id', '==', bookingId)));
    
    if (bookingDocs.empty) {
      throw new Error('Booking not found');
    }
    
    const bookingDoc = bookingDocs.docs[0];
    const booking = bookingDoc.data() as BookingType;
    
    // Ensure the user owns this booking
    if (booking.userId !== userId) {
      throw new Error('You can only cancel your own bookings');
    }
    
    // Ensure the booking is in a cancellable state
    if (
      booking.status !== BookingStatus.PENDING && 
      booking.status !== BookingStatus.APPROVED
    ) {
      throw new Error(`Cannot cancel a booking with status: ${booking.status}`);
    }
    
    // Update the booking status
    await updateDoc(doc(db, 'bookings', bookingId), {
      status: BookingStatus.CANCELLED,
      updatedAt: Timestamp.now()
    });
    
    return true;
  } catch (error) {
    console.error('Error cancelling booking:', error);
    throw error;
  }
};

// Approve a booking (admin/staff only)
export const approveBooking = async (bookingId: string, approverId: string): Promise<boolean> => {
  try {
    // Get the booking
    const bookingDocs = await getDocs(query(bookingsCollection, where('id', '==', bookingId)));
    
    if (bookingDocs.empty) {
      throw new Error('Booking not found');
    }
    
    const bookingDoc = bookingDocs.docs[0];
    const booking = bookingDoc.data() as BookingType;
    
    // Ensure the booking is in a pending state
    if (booking.status !== BookingStatus.PENDING) {
      throw new Error(`Cannot approve a booking with status: ${booking.status}`);
    }
    
    // Update the booking status
    await updateDoc(doc(db, 'bookings', bookingId), {
      status: BookingStatus.APPROVED,
      approvedBy: approverId,
      updatedAt: Timestamp.now()
    });
    
    return true;
  } catch (error) {
    console.error('Error approving booking:', error);
    throw error;
  }
};

// Reject a booking (admin/staff only)
export const rejectBooking = async (
  bookingId: string, 
  approverId: string,
  rejectionReason: string
): Promise<boolean> => {
  try {
    // Get the booking
    const bookingDocs = await getDocs(query(bookingsCollection, where('id', '==', bookingId)));
    
    if (bookingDocs.empty) {
      throw new Error('Booking not found');
    }
    
    const bookingDoc = bookingDocs.docs[0];
    const booking = bookingDoc.data() as BookingType;
    
    // Ensure the booking is in a pending state
    if (booking.status !== BookingStatus.PENDING) {
      throw new Error(`Cannot reject a booking with status: ${booking.status}`);
    }
    
    // Update the booking status
    await updateDoc(doc(db, 'bookings', bookingId), {
      status: BookingStatus.REJECTED,
      approvedBy: approverId,
      rejectionReason,
      updatedAt: Timestamp.now()
    });
    
    return true;
  } catch (error) {
    console.error('Error rejecting booking:', error);
    throw error;
  }
};

// Get upcoming bookings for a user
export const getUpcomingBookingsForUser = async (userId: string): Promise<BookingType[]> => {
  try {
    const now = Timestamp.now();
    
    // Query for bookings that are upcoming
    const q = query(
      bookingsCollection,
      where('userId', '==', userId),
      where('status', 'in', [BookingStatus.PENDING, BookingStatus.APPROVED]),
      where('endTime', '>', now)
    );
    
    const bookingSnapshot = await getDocs(q);
    return bookingSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as BookingType);
  } catch (error) {
    console.error('Error getting upcoming bookings:', error);
    throw error;
  }
};

// Get past bookings for a user
export const getPastBookingsForUser = async (userId: string): Promise<BookingType[]> => {
  try {
    const now = Timestamp.now();
    
    // Query for bookings that are in the past
    const q = query(
      bookingsCollection,
      where('userId', '==', userId),
      where('endTime', '<=', now)
    );
    
    const bookingSnapshot = await getDocs(q);
    return bookingSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as BookingType);
  } catch (error) {
    console.error('Error getting past bookings:', error);
    throw error;
  }
};

// Get pending bookings (for admin/staff approval)
export const getPendingBookings = async (): Promise<BookingType[]> => {
  try {
    // Query for bookings that are pending approval
    const q = query(
      bookingsCollection,
      where('status', '==', BookingStatus.PENDING)
    );
    
    const bookingSnapshot = await getDocs(q);
    return bookingSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as BookingType);
  } catch (error) {
    console.error('Error getting pending bookings:', error);
    throw error;
  }
};
