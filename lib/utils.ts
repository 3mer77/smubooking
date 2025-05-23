import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { toast } from "sonner"
import { UserRole } from "./firebase"
import { format } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Authentication utilities
export const formatAuthError = (error: any): string => {
  const errorCode = error.code || ''
  const errorMessage = error.message || ''

  switch (errorCode) {
    case 'auth/invalid-email':
      return 'The email address is not valid.'
    case 'auth/user-disabled':
      return 'This account has been disabled.'
    case 'auth/user-not-found':
      return 'No account found with this email.'
    case 'auth/wrong-password':
      return 'Incorrect password.'
    case 'auth/email-already-in-use':
      return 'This email is already in use.'
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.'
    default:
      return errorMessage || 'An error occurred during authentication.'
  }
}

// Format university email properly
export const formatUniversityEmail = (email: string, role: UserRole): string => {
  const cleanEmail = email.trim().toLowerCase()
  
  // If already has a domain, return as is
  if (cleanEmail.includes('@')) {
    return cleanEmail
  }
  
  // Add appropriate domain based on role
  if (role === UserRole.STUDENT) {
    return `${cleanEmail}@stu.smu.edu.et`
  }
  
  return `${cleanEmail}@smu.edu.et`
}

// Toast notifications for auth events
export const showAuthSuccessToast = (message: string) => {
  toast.success(message, {
    duration: 3000,
    position: 'top-center'
  })
}

export const showAuthErrorToast = (error: string) => {
  toast.error(error, {
    duration: 5000,
    position: 'top-center'
  })
}

// Validate university ID format
export const isValidUniversityId = (id: string, role: UserRole): boolean => {
  if (!id) return false
  
  if (role === UserRole.STUDENT) {
    // Student IDs typically follow a specific format
    return /^[A-Z]+\/\d+\/\d+$/.test(id)
  }
  
  if (role === UserRole.STAFF || role === UserRole.ADMIN) {
    // Staff IDs might follow a different format
    return /^[A-Z]+\/\d+$/.test(id)
  }
  
  return false
}

// Format date for display
export const formatDate = (date: Date | null | undefined): string => {
  if (!date) return 'N/A'
  return format(date, 'MMM dd, yyyy HH:mm')
}
