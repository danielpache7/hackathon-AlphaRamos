export interface Criterion {
  id: string
  name: string
  description: string
  weight: number
}

export const evaluationCriteria: Criterion[] = [
  {
    id: 'solution',
    name: 'Solución al problema (Valor)',
    description: 'Responde al reto y aporta valor al usuario',
    weight: 20
  },
  {
    id: 'creativity',
    name: 'Creatividad e innovación',
    description: 'Enfoque novedoso o creativo en tecnología o propuesta comercial',
    weight: 15
  },
  {
    id: 'functionality',
    name: 'Funcionalidad técnica',
    description: 'Prototipo funcional o simulación clara',
    weight: 15
  },
  {
    id: 'viability',
    name: 'Viabilidad / Factibilidad',
    description: 'Realista y posible con recursos razonables',
    weight: 15
  },
  {
    id: 'ux',
    name: 'Experiencia del usuario (UX)',
    description: 'Interfaz clara e intuitiva o propuesta que conecta con el cliente final',
    weight: 10
  },
  {
    id: 'impact',
    name: 'Potencial de impacto comercial/operativo',
    description: 'Posible impacto en ventas, marca o eficiencia',
    weight: 15
  },
  {
    id: 'communication',
    name: 'Comunicación de la propuesta',
    description: 'Claridad al presentar idea, valor y funcionamiento',
    weight: 10
  }
]

// Utility function to get total weight (should be 100)
export const getTotalWeight = (): number => {
  return evaluationCriteria.reduce((total, criterion) => total + criterion.weight, 0)
}