'use client'

import { useEffect, useState } from 'react'
import FacialAuth from '@/components/FacialAuth'
import Dashboard from '@/components/Dashboard'
import ToastProvider from '@/components/ToastProvider'
import { loadFaceApiModels } from '@/lib/faceRecognition'
import { User } from '@/lib/types'

export default function Home() {
  const [modelsLoaded, setModelsLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [authenticatedUser, setAuthenticatedUser] = useState<User | null>(null)

  useEffect(() => {
    const initModels = async () => {
      console.log('Initialisation des modèles...')
      const loaded = await loadFaceApiModels()
      setModelsLoaded(loaded)
      setIsLoading(false)
    }

    initModels()
  }, [])

  const handleAuthSuccess = (user: User) => {
    console.log('Authentification réussie pour:', user.name)
    setAuthenticatedUser(user)
  }

  const handleLogout = () => {
    setAuthenticatedUser(null)
  }

  if (isLoading) {
    return (
      <>
        <main className="container mx-auto p-4 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2">Chargement des modèles...</p>
          </div>
        </main>
        <ToastProvider />
      </>
    )
  }

  if (!modelsLoaded) {
    return (
      <>
        <main className="container mx-auto p-4 flex items-center justify-center min-h-screen">
          <div className="text-center text-red-500">
            <p>Erreur: Impossible de charger les modèles Face-API</p>
            <p className="text-sm mt-2">Vérifiez que les weights sont dans public/weights/</p>
          </div>
        </main>
        <ToastProvider />
      </>
    )
  }

  // Si utilisateur authentifié, afficher le dashboard
  if (authenticatedUser) {
    return (
      <>
        <Dashboard user={authenticatedUser} onLogout={handleLogout} />
        <ToastProvider />
      </>
    )
  }

  // Sinon, afficher la page d'authentification
  return (
    <>
      <main className="container mx-auto p-4 flex items-center justify-center min-h-screen">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Authentification Faciale</h1>
            <p className="text-gray-600">
              Système de reconnaissance faciale sécurisé
            </p>
          </div>
          <FacialAuth onAuthSuccess={handleAuthSuccess} />
        </div>
      </main>
      <ToastProvider />
    </>
  )
}