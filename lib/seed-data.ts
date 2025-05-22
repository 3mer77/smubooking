import { Timestamp } from 'firebase/firestore';
import { 
  createUser, 
  createRoom, 
  createEquipment, 
  createBooking, 
  createNotificationSettings,
  UserRole,
  BookingStatus
} from './firebase';

// Seed data function to populate the database with initial test data
export const seedDatabase = async () => {
  // Create sample users
  const sampleUsers = [
    {
      uid: 'student1',
      email: 'student1@stu.smu.edu.et',
      displayName: 'Abebe Kebede',
      role: UserRole.STUDENT,
      department: 'Computer Science',
      studentId: 'CS1234/12',
      phoneNumber: '+251911234567'
    },
    {
      uid: 'staff1',
      email: 'staff1@smu.edu.et',
      displayName: 'Dr. Almaz Haile',
      role: UserRole.STAFF,
      department: 'Computer Science',
      staffId: 'STF5678',
      phoneNumber: '+251922345678'
    },
    {
      uid: 'admin1',
      email: 'admin@smu.edu.et',
      displayName: 'Admin User',
      role: UserRole.ADMIN,
      staffId: 'ADM1234',
      phoneNumber: '+251933456789'
    }
  ];

  // Create sample rooms
  const sampleRooms = [
    {
      name: 'Room B1-101',
      building: 'Building B1',
      floor: '1st Floor',
      roomNumber: '101',
      type: 'Classroom',
      capacity: 40,
      features: ['Projector', 'Whiteboard', 'Air Conditioner'],
      campus: 'Mexico',
      requiresApproval: false,
      status: 'available' as const,
    },
    {
      name: 'Room B2-201',
      building: 'Building B2',
      floor: '2nd Floor',
      roomNumber: '201',
      type: 'Laboratory',
      capacity: 30,
      features: ['Computers', 'Projector', 'Specialized Software'],
      campus: 'Mexico',
      requiresApproval: true,
      status: 'available' as const,
    },
    {
      name: 'Conference Room GR-301',
      building: 'Green Building',
      floor: '3rd Floor',
      roomNumber: '301',
      type: 'Conference Room',
      capacity: 20,
      features: ['Video Conferencing', 'Smart Board', 'Round Table'],
      campus: 'Main',
      requiresApproval: true,
      status: 'available' as const,
    },
    {
      name: 'Library Study Room',
      building: 'Library Building',
      floor: '1st Floor',
      roomNumber: 'L101',
      type: 'Study Room',
      capacity: 8,
      features: ['Quiet Zone', 'Wi-Fi', 'Power Outlets'],
      campus: 'Main',
      requiresApproval: false,
      status: 'available' as const,
    },
    {
      name: 'Auditorium',
      building: 'New Building',
      floor: 'Ground Floor',
      roomNumber: 'A001',
      type: 'Hall',
      capacity: 200,
      features: ['Stage', 'Sound System', 'Projector Screen', 'Podium'],
      campus: 'New',
      requiresApproval: true,
      status: 'available' as const,
    }
  ];

  // Create sample equipment
  const sampleEquipment = [
    {
      name: 'Projector 1',
      type: 'Projector',
      location: 'Building B1',
      status: 'available' as const,
      description: 'HDMI & VGA compatible projector',
      requiresApproval: false,
      quantity: 1,
    },
    {
      name: 'Laptop Set',
      type: 'Computer',
      location: 'IT Department',
      status: 'available' as const,
      description: 'Set of 10 laptops for classroom use',
      requiresApproval: true,
      quantity: 10,
    },
    {
      name: 'PA System',
      type: 'Audio Equipment',
      location: 'Auditorium',
      status: 'available' as const,
      description: 'Public Address system with wireless microphones',
      requiresApproval: true,
      quantity: 1,
    },
    {
      name: 'Digital Camera',
      type: 'Camera',
      location: 'Media Department',
      status: 'available' as const,
      description: 'Professional DSLR camera with tripod',
      requiresApproval: true,
      quantity: 2,
    },
    {
      name: 'Whiteboard Markers',
      type: 'Stationery',
      location: 'Supply Store',
      status: 'available' as const,
      description: 'Set of colored whiteboard markers',
      requiresApproval: false,
      quantity: 50,
    }
  ];

  // Create sample bookings
  const createSampleBookings = async (userIds: string[], roomIds: string[], equipmentIds: string[]) => {
    const now = Timestamp.now();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowTimestamp = Timestamp.fromDate(tomorrow);
    
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextWeekTimestamp = Timestamp.fromDate(nextWeek);

    const sampleBookings = [
      {
        userId: userIds[0], // student
        resourceType: 'room' as const,
        resourceId: roomIds[0],
        startTime: tomorrowTimestamp,
        endTime: Timestamp.fromMillis(tomorrowTimestamp.toMillis() + 2 * 60 * 60 * 1000), // 2 hours later
        status: BookingStatus.PENDING,
        reason: 'Study group meeting',
      },
      {
        userId: userIds[1], // staff
        resourceType: 'room' as const,
        resourceId: roomIds[2],
        startTime: nextWeekTimestamp,
        endTime: Timestamp.fromMillis(nextWeekTimestamp.toMillis() + 3 * 60 * 60 * 1000), // 3 hours later
        status: BookingStatus.APPROVED,
        reason: 'Department meeting',
        approvedBy: userIds[2], // admin
      },
      {
        userId: userIds[0], // student
        resourceType: 'equipment' as const,
        resourceId: equipmentIds[0],
        startTime: tomorrowTimestamp,
        endTime: Timestamp.fromMillis(tomorrowTimestamp.toMillis() + 4 * 60 * 60 * 1000), // 4 hours later
        status: BookingStatus.PENDING,
        reason: 'Class presentation',
      }
    ];

    const bookingPromises = sampleBookings.map(booking => createBooking(booking));
    return Promise.all(bookingPromises);
  };

  // Create notification settings
  const createSampleNotificationSettings = async (userIds: string[]) => {
    const notificationSettings = userIds.map(userId => ({
      userId,
      email: true,
      push: true,
      bookingReminders: true,
      bookingUpdates: true,
      systemAnnouncements: userId !== userIds[0], // Only non-students get system announcements
    }));

    const notificationPromises = notificationSettings.map(settings => 
      createNotificationSettings(settings)
    );
    return Promise.all(notificationPromises);
  };

  try {
    // Create users
    const userPromises = sampleUsers.map(user => createUser(user, user.uid));
    const users = await Promise.all(userPromises);
    const userIds = users.map(user => user.uid);
    console.log('Created sample users');

    // Create rooms
    const roomPromises = sampleRooms.map(room => createRoom(room));
    const rooms = await Promise.all(roomPromises);
    const roomIds = rooms.map(room => room.id);
    console.log('Created sample rooms');

    // Create equipment
    const equipmentPromises = sampleEquipment.map(equipment => createEquipment(equipment));
    const equipment = await Promise.all(equipmentPromises);
    const equipmentIds = equipment.map(item => item.id);
    console.log('Created sample equipment');

    // Create bookings
    await createSampleBookings(userIds, roomIds, equipmentIds);
    console.log('Created sample bookings');

    // Create notification settings
    await createSampleNotificationSettings(userIds);
    console.log('Created sample notification settings');

    console.log('Database seeding completed successfully');
    return { success: true };
  } catch (error) {
    console.error('Error seeding database:', error);
    return { success: false, error };
  }
};
