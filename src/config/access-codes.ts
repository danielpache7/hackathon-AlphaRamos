export interface AccessCode {
  code: string
  name: string
  role: 'judge' | 'admin'
}

export interface Judge {
  name: string
  title?: string
}

export const judges: Judge[] = [
  {
    name: 'Carmen J. de Jesús Ángeles G.',
    title: 'Vicepresidente'
  },
  {
    name: 'Herbert Torres Alejandro'
  },
  {
    name: 'Vanessa D. Alba C.'
  },
  {
    name: 'Deinel J. Cárdenas B.'
  },
  {
    name: 'Vitniza M. Torres E.'
  }
]

export const accessCodes: AccessCode[] = [
  // Judges
  {
    code: 'JUDGE001',
    name: 'Carmen J. de Jesús Ángeles G.',
    role: 'judge'
  },
  {
    code: 'JUDGE002',
    name: 'Herbert Torres Alejandro',
    role: 'judge'
  },
  {
    code: 'JUDGE003',
    name: 'Vanessa D. Alba C.',
    role: 'judge'
  },
  {
    code: 'JUDGE004',
    name: 'Deinel J. Cárdenas B.',
    role: 'judge'
  },
  {
    code: 'JUDGE005',
    name: 'Vitniza M. Torres E.',
    role: 'judge'
  },
  // Administrators
  {
    code: 'ADMIN001',
    name: 'Administrator',
    role: 'admin'
  }
]

// Utility functions
export const validateAccessCode = (code: string): AccessCode | null => {
  return accessCodes.find(ac => ac.code === code) || null
}

export const getJudgeByName = (name: string): Judge | null => {
  return judges.find(judge => judge.name === name) || null
}