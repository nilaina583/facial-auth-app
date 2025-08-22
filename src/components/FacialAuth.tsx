'use client'

import { useRef, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { detectFace, authenticateUser } from '@/lib/faceRecognition'
import { toast } from 'sonner'
import { User } from '@/lib/types'

interface FacialAuthProps {
  onAuthSuccess: (user: User) => void
}

export default function FacialAuth({ onAuthSuccess }: FacialAuthProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isVideoReady, setIsVideoReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [faceDetected, setFaceDetected] = useState(false)
  const [demoMode, setDemoMode] = useState(false)

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 } 
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = () => {
          setIsVideoReady(true)
          setTimeout(detectFaceInVideo, 1000)
        }
      }
    } catch (err) {
      setError("Impossible d'accéder à la caméra")
      console.error("Erreur caméra:", err)
    }
  }

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
      tracks.forEach(track => track.stop())
      videoRef.current.srcObject = null
      setIsVideoReady(false)
    }
  }

  const detectFaceInVideo = async () => {
    if (!videoRef.current || !isVideoReady) return

    try {
      const detection = await detectFace(videoRef.current)
      setFaceDetected(!!detection)
      
      if (detection) {
        console.log("Visage détecté:", detection.detection.score)
      }
    } catch (error) {
      console.error("Erreur détection:", error)
    }

    if (isVideoReady) {
      setTimeout(detectFaceInVideo, 100)
    }
  }

  const handleAuth = async () => {
    if (!videoRef.current || !isVideoReady) {
      toast.error("Caméra non prête")
      return
    }

    setIsLoading(true)
    
    try {
      const result = await authenticateUser(videoRef.current)
      
      if (result.success && result.user) {
        toast.success(result.message)
        onAuthSuccess(result.user)
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      console.error("Erreur authentification:", error)
      toast.error("Erreur lors de l'authentification")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    return () => {
      stopCamera()
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

        <div className="flex gap-2 flex-col">
          <Button 
            onClick={() => setDemoMode(!demoMode)} 
            variant="outline"
            className="mb-2"
          >
            {demoMode ? "Mode Normal" : "Mode Démo (sans caméra)"}
          </Button>
          
          {!demoMode ? (
            <>
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
                    {isLoading ? "Authentification..." : "S'authentifier"}
                  </Button>
                  <Button 
                    onClick={stopCamera} 
                    variant="outline"
                  >
                    Arrêter
                  </Button>
                </>
              )}
            </>
          ) : (
            <Button 
              onClick={() => {
                setIsLoading(true)
                toast.success("Mode démo activé!")
                setTimeout(() => {
                  setIsLoading(false)
                  const demoUser = {
                    id: "demo",
                    name: "Utilisateur Démo",
                    email: "demo@example.com",
                    faceDescriptor: [],
                    createdAt: new Date().toISOString()
                  }
                  onAuthSuccess(demoUser)
                }, 2000)
              }}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? "Authentification démo..." : "Tester authentification"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
