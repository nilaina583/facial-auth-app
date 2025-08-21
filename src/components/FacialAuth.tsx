'use client'

import { useRef, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { detectFace } from '@/lib/faceRecognition'
import { toast } from 'sonner'

interface FacialAuthProps {
  onAuthSuccess: (userName: string) => void
}

export default function FacialAuth({ onAuthSuccess }: FacialAuthProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isVideoReady, setIsVideoReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [faceDetected, setFaceDetected] = useState(false)

  // Initialiser la caméra
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 } 
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = () => {
          setIsVideoReady(true)
          // Démarrer la détection une fois la vidéo prête
          setTimeout(detectFaceInVideo, 1000)
        }
      }
    } catch (err) {
      setError('Impossible d\'accéder à la caméra')
      console.error('Erreur caméra:', err)
    }
  }

  // Arrêter la caméra
  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
      tracks.forEach(track => track.stop())
      videoRef.current.srcObject = null
      setIsVideoReady(false)
    }
  }

  // Fonction pour détecter les visages en temps réel
  const detectFaceInVideo = async () => {
    if (!videoRef.current || !isVideoReady) return

    try {
      const detection = await detectFace(videoRef.current)
      setFaceDetected(!!detection)
      
      if (detection) {
        console.log('Visage détecté:', detection.detection.score)
      }
    } catch (error) {
      console.error('Erreur détection:', error)
    }

    // Répéter la détection toutes les 100ms
    if (isVideoReady) {
      setTimeout(detectFaceInVideo, 100)
    }
  }

  // Authentification avec détection faciale réelle
  const handleAuth = async () => {
    if (!videoRef.current || !isVideoReady) {
      toast.error('Caméra non prête')
      return
    }

    setIsLoading(true)
    
    try {
      const detection = await detectFace(videoRef.current)
      
      if (!detection) {
        toast.error('Aucun visage détecté')
        setIsLoading(false)
        return
      }

      // Simulation d'une comparaison avec la base de données
      const confidence = detection.detection.score
      console.log('Score de confiance:', confidence)
      
      if (confidence > 0.7) {
        toast.success('Authentification réussie!')
        onAuthSuccess('Utilisateur Reconnu')
      } else {
        toast.error('Visage non reconnu')
      }
    } catch (error) {
      console.error('Erreur authentification:', error)
      toast.error('Erreur lors de l\'authentification')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    return () => {
      stopCamera() // Nettoyage à la fermeture du composant
    }
  }, [])

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Authentification Faciale</CardTitle>
        <CardDescription>
          Positionnez votre visage devant la caméra
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-64 bg-gray-100 rounded-lg object-cover"
          />
          {!isVideoReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
              <p className="text-sm text-gray-500">Caméra non activée</p>
            </div>
          )}
          {isVideoReady && (
            <div className="absolute top-2 right-2">
              <div className={`w-3 h-3 rounded-full ${faceDetected ? 'bg-green-500' : 'bg-red-500'}`} />
            </div>
          )}
        </div>

        {isVideoReady && (
          <div className="text-sm text-center">
            {faceDetected ? (
              <span className="text-green-600">✓ Visage détecté</span>
            ) : (
              <span className="text-orange-600">⚠ Positionnez votre visage</span>
            )}
          </div>
        )}

        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}

        <div className="flex gap-2">
          {!isVideoReady ? (
            <Button onClick={startCamera} className="flex-1">
              Activer la caméra
            </Button>
          ) : (
            <>
              <Button 
                onClick={handleAuth} 
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? 'Authentification...' : 'S\'authentifier'}
              </Button>
              <Button 
                onClick={stopCamera} 
                variant="outline"
              >
                Arrêter
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}