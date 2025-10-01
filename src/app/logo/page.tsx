'use client'

import Image from 'next/image'
import { useState } from 'react'

export default function LogoPage() {
  const [imageError, setImageError] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-8">
      <div className="bg-white rounded-2xl border p-12 text-center max-w-2xl w-full" style={{ borderColor: '#009FE3' }}>
        <h1 className="text-3xl font-light tracking-tight mb-8" style={{ color: '#003366' }}>
          Logo Hackathon AlphaRamos
        </h1>
        
        <div className="mb-8">
          {!imageError ? (
            <Image
              src="/alpharamos-logo.png"
              alt="Logo AlphaRamos"
              width={400}
              height={200}
              className="mx-auto rounded-lg"
              onError={() => setImageError(true)}
              priority
            />
          ) : (
            <div 
              className="mx-auto rounded-lg border-2 border-dashed flex items-center justify-center"
              style={{ 
                width: '400px', 
                height: '200px', 
                borderColor: '#009FE3',
                backgroundColor: '#F2F2F2'
              }}
            >
              <div className="text-center">
                <div className="text-4xl mb-2">🏢</div>
                <p className="text-sm" style={{ color: '#1A1A1A', opacity: 0.7 }}>
                  Logo no encontrado
                </p>
                <p className="text-xs mt-2" style={{ color: '#1A1A1A', opacity: 0.5 }}>
                  Coloca el archivo: <strong>alpharamos-logo.png</strong>
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded-lg" style={{ backgroundColor: '#F2F2F2' }}>
            <h3 className="font-semibold mb-2" style={{ color: '#003366' }}>
              Instrucciones:
            </h3>
            <p className="text-sm" style={{ color: '#1A1A1A' }}>
              Coloca tu logo en la carpeta <code className="bg-white px-2 py-1 rounded text-xs">/public/</code> con el nombre:
            </p>
            <p className="font-mono text-sm mt-2 p-2 bg-white rounded border">
              alpharamos-logo.png
            </p>
          </div>
          
          <div className="text-xs" style={{ color: '#1A1A1A', opacity: 0.6 }}>
            Formatos soportados: PNG, JPG, JPEG, SVG • Tamaño recomendado: 400x200px
          </div>
        </div>
      </div>
    </div>
  )
}