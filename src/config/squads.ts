export interface Squad {
  id: string
  name: string
  members: string[]
  mentor: string
  challenge: string
}

export const squads: Squad[] = [
  {
    id: 'checkout-x',
    name: 'CheckOutX',
    members: ['Aaron Rafael Beltré', 'Coral Judith Pérez García', 'Isbel Peña', 'Rody Castro Cuello'],
    mentor: 'Laura Hernández',
    challenge: 'Nuevo producto WALA para jóvenes'
  },
  {
    id: 'ai-retailers',
    name: 'AI Retailers',
    members: ['Cheyci Elaine Pérez', 'José Manuel Rivas Tineo', 'Juan David Taveras Dorville'],
    mentor: 'Mariella Martínez',
    challenge: 'Promoción estacional de productos Grupo Ramos'
  },
  {
    id: 'code-cart',
    name: 'Code Cart',
    members: ['Christopher Ciprián', 'Ivette Roa Puente', 'Rayner Rodríguez', 'Sarah Veloz'],
    mentor: 'Pamela Henríquez',
    challenge: 'Fila rápida y digital'
  },
  {
    id: 'data-booster',
    name: 'DataBooster',
    members: ['Abel Andrés De Peña Núñez', 'Delio Lorenzo Rodríguez López', 'Hendry Gustavo Peguero Valdez', 'Juan Manuel Rodríguez Bello'],
    mentor: 'Juana Martínez',
    challenge: 'Reservas inteligentes en el DELI'
  },
  {
    id: 'market-minds',
    name: 'MarketMinds',
    members: ['Acelis Melissa García Figuereo', 'Eduardo Hernández', 'Saul Lithgow', 'Tiffany Bertola'],
    mentor: 'Jennifer Terrero',
    challenge: 'Campaña creativa sobre el plan de expansión'
  },
  {
    id: 'nextgen-retailers',
    name: 'NextGen Retailers',
    members: ['Adalberto Banks Mendoza', 'Claudia Margarita Pérez Pérez', 'Hansel Alexander Contreras Tavárez', 'Nayeli González'],
    mentor: 'Licarly Yarina',
    challenge: 'Experiencia de marca WALA en tienda'
  },
  {
    id: 'omni-squad',
    name: 'OmniSquad',
    members: ['Cristhian Rosa', 'Diego Alejandro Morel Yérmenos', 'Rachel Montes'],
    mentor: 'Jennifer Terrero',
    challenge: 'Campaña creativa para WALA en redes sociales'
  },
  {
    id: 'retail-revolution',
    name: 'Retail Revolution',
    members: ['Albert Sanfle', 'Briana Mesa', 'Ismael Armando Polanco García', 'Mariana Berrio'],
    mentor: 'Jennifer Colón',
    challenge: 'Atención al cliente inteligente'
  },
  {
    id: 'shelf-hackers',
    name: 'ShelfHackers',
    members: ['Alan Tubert', 'Emil Echavarría', 'Juan Israel Gómez Torres', 'Luis Alburquerque'],
    mentor: 'Victoria Feliz',
    challenge: 'Encuentra tu producto fácilmente en góndolas'
  },
  {
    id: 'tech4shoppers',
    name: 'Tech4Shoppers',
    members: ['Ana Florentino', 'Ángel Emilio Aquino', 'Huáscar Espinal', 'Luis Zadkiel Durán'],
    mentor: 'Santa Del Villar',
    challenge: 'Experiencia digital inteligente en lavandería'
  },
  {
    id: 'visionarios360',
    name: 'Visionarios360',
    members: ['Diego Arturo Marte Toledo', 'Eduardo Marine', 'Lina Isabella López Aquino', 'Rosaura Mejía Sufront', 'Thomas Alberto Félix Rosario'],
    mentor: 'Ricardo Gómez',
    challenge: 'Productos sugeridos e inteligentes'
  },
  {
    id: 'logi-coders',
    name: 'LogiCoders',
    members: ['Gaspar', 'Kazi Arman Ahed', 'Mason Morris', 'Patrick Pashna'],
    mentor: 'Pamela Zorrilla',
    challenge: 'Nuevo producto cosméticos para jóvenes'
  }
]