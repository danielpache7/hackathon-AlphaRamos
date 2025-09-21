import { validateAccessCode } from '@/config/access-codes'

export interface User {
  name: string
  role: 'judge' | 'admin'
  code: string
}

export class AuthService {
  private static currentUser: User | null = null

  static authenticate(): User | null {
    const code = prompt('Ingresa tu código de acceso:')
    
    if (!code) {
      return null
    }

    const accessCode = validateAccessCode(code.toUpperCase())
    
    if (!accessCode) {
      alert('Código inválido. Por favor intenta de nuevo.')
      return null
    }

    this.currentUser = {
      name: accessCode.name,
      role: accessCode.role,
      code: accessCode.code
    }

    return this.currentUser
  }

  static getCurrentUser(): User | null {
    return this.currentUser
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