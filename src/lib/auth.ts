import { validateAccessCode } from '@/config/access-codes'

export interface User {
  name: string
  role: 'judge' | 'admin'
  code: string
}

export interface AuthCallbacks {
  showAuthModal: () => Promise<string | null>
}

export class AuthService {
  private static currentUser: User | null = null
  private static callbacks: AuthCallbacks | null = null

  static setCallbacks(callbacks: AuthCallbacks) {
    this.callbacks = callbacks
  }

  static async authenticate(): Promise<User | null> {
    let attempts = 0
    const maxAttempts = 3

    while (attempts < maxAttempts) {
      try {
        let code: string | null = null

        if (this.callbacks && this.callbacks.showAuthModal) {
          console.log('Using custom auth modal, attempt:', attempts + 1)
          code = await this.callbacks.showAuthModal()
          console.log('Custom auth modal returned:', code)
        } else {
          // Fallback to native prompt
          console.log('Using native prompt for authentication')
          code = prompt('Enter your access code:')
        }
        
        if (!code) {
          console.log('No code provided, cancelling authentication')
          return null
        }

        const accessCode = validateAccessCode(code.toUpperCase())
        
        if (!accessCode) {
          attempts++
          console.log('Invalid code, attempt:', attempts)
          if (attempts < maxAttempts) {
            console.log('Will retry authentication')
            continue
          } else {
            console.log('Max attempts reached')
            return null
          }
        }

        this.currentUser = {
          name: accessCode.name,
          role: accessCode.role,
          code: accessCode.code
        }

        console.log('Authentication successful:', this.currentUser)
        return this.currentUser
      } catch (error) {
        console.error('Authentication error:', error)
        attempts++
        if (attempts >= maxAttempts) {
          // Final fallback to native prompt
          const code = prompt('Enter your access code:')
          
          if (!code) {
            return null
          }

          const accessCode = validateAccessCode(code.toUpperCase())
          
          if (!accessCode) {
            alert('Invalid code. Please try again.')
            return null
          }

          this.currentUser = {
            name: accessCode.name,
            role: accessCode.role,
            code: accessCode.code
          }

          return this.currentUser
        }
      }
    }

    return null
  }

  static getCurrentUser(): User | null {
    return this.currentUser
  }

  static setCurrentUser(user: User): void {
    this.currentUser = user
  }

  static logout(): void {
    this.currentUser = null
  }

  static isAuthenticated(): boolean {
    return this.currentUser !== null
  }

  static isAdmin(): boolean {
    return this.currentUser?.role === 'admin'
  }

  static isJudge(): boolean {
    return this.currentUser?.role === 'judge'
  }
}