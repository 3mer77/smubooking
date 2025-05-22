import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { auth, createUser, getUserById, UserRole, UserType } from './firebase';

// Authentication error codes
export enum AuthErrorCodes {
  INVALID_EMAIL = 'auth/invalid-email',
  USER_DISABLED = 'auth/user-disabled',
  USER_NOT_FOUND = 'auth/user-not-found',
  WRONG_PASSWORD = 'auth/wrong-password',
  EMAIL_ALREADY_IN_USE = 'auth/email-already-in-use',
  WEAK_PASSWORD = 'auth/weak-password',
}

// Login with university credentials
export const loginWithEmail = async (email: string, password: string) => {
  try {
    // Validate university email
    if (!isUniversityEmail(email)) {
      throw new Error('Please use your university email to login');
    }
    
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    console.error('Login error:', error);
    throw formatAuthError(error);
  }
};

// Register new user with university credentials
export const registerWithEmail = async (
  email: string, 
  password: string, 
  displayName: string, 
  role: UserRole,
  additionalData: {
    department?: string;
    studentId?: string;
    staffId?: string;
    phoneNumber?: string;
  } = {}
) => {
  try {
    // Validate university email
    if (!isUniversityEmail(email)) {
      throw new Error('Please use your university email to register');
    }

    // Create auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const { uid } = userCredential.user;

    // Create user document in Firestore
    const userData: Omit<UserType, 'uid' | 'createdAt' | 'updatedAt'> = {
      email,
      displayName,
      role,
      ...additionalData
    };

    await createUser(userData, uid);
    return userCredential.user;
  } catch (error: any) {
    console.error('Registration error:', error);
    throw formatAuthError(error);
  }
};

// Logout user
export const logout = async () => {
  try {
    await signOut(auth);
    return true;
  } catch (error) {
    console.error('Logout error:', error);
    return false;
  }
};

// Get current user with Firestore data
export const getCurrentUser = async (): Promise<{
  firebaseUser: FirebaseUser | null;
  userData: UserType | null;
}> => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      unsubscribe();
      if (firebaseUser) {
        const userData = await getUserById(firebaseUser.uid);
        resolve({ firebaseUser, userData });
      } else {
        resolve({ firebaseUser: null, userData: null });
      }
    });
  });
};

// Check if user has admin role
export const isAdmin = async (uid: string): Promise<boolean> => {
  try {
    const userData = await getUserById(uid);
    return userData?.role === UserRole.ADMIN;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

// Check if user has staff role
export const isStaff = async (uid: string): Promise<boolean> => {
  try {
    const userData = await getUserById(uid);
    return userData?.role === UserRole.STAFF || userData?.role === UserRole.ADMIN;
  } catch (error) {
    console.error('Error checking staff status:', error);
    return false;
  }
};

// Format authentication errors for better user experience
export const formatAuthError = (error: any): Error => {
  const errorCode = error.code || '';
  let errorMessage = 'An error occurred during authentication';

  switch (errorCode) {
    case AuthErrorCodes.INVALID_EMAIL:
      errorMessage = 'The email address is not valid';
      break;
    case AuthErrorCodes.USER_DISABLED:
      errorMessage = 'This account has been disabled';
      break;
    case AuthErrorCodes.USER_NOT_FOUND:
      errorMessage = 'No account found with this email';
      break;
    case AuthErrorCodes.WRONG_PASSWORD:
      errorMessage = 'Incorrect password';
      break;
    case AuthErrorCodes.EMAIL_ALREADY_IN_USE:
      errorMessage = 'This email is already in use';
      break;
    case AuthErrorCodes.WEAK_PASSWORD:
      errorMessage = 'Password should be at least 6 characters';
      break;
    default:
      errorMessage = error.message || errorMessage;
  }

  return new Error(errorMessage);
};

// Validate if email is from university domain
export const isUniversityEmail = (email: string): boolean => {
  const validDomains = ['smu.edu.et', 'stu.smu.edu.et'];
  return validDomains.some(domain => email.endsWith(`@${domain}`));
};
