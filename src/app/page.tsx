'use client'

import { useEffect, useState } from 'react'
import FacialAuth from '@/components/FacialAuth'
import ToastProvider from '@/components/ToastProvider'
import { loadFaceApiModels } from '@/lib/faceRecognition'

export default function Home() {
  const [modelsLoaded, setModelsLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initModels = async () => {
      console.log('Initialisation des modèles...')
      const loaded = await loadFaceApiModels()
      setModelsLoaded(loaded)
      setIsLoading(false)
    }

    initModels()
  }, [])

  const handleAuthSuccess = (userName: string) => {
    console.log('Authentification réussie pour:', userName)
    // Ici nous redirigerons vers le dashboard
  }

  if (isLoading) {
    return (
      <main className="container mx-auto p-4 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2">Chargement des modèles...</p>
        </div>
      </main>
    )
  }

  if (!modelsLoaded) {
    return (
      <main className="container mx-auto p-4 flex items-center justify-center min-h-screen">
        <div className="text-center text-red-500">
          <p>Erreur: Impossible de charger les modèles Face-API</p>
          <p className="text-sm mt-2">Vérifiez que les weights sont dans public/weights/</p>
        </div>
      </main>
    )
  }

  return (
    <>
      <main className="container mx-auto p-4 flex items-center justify-center min-h-screen">
        <FacialAuth onAuthSuccess={handleAuthSuccess} />
      </main>
      <ToastProvider />
    </>
  )
}