import * as faceapi from 'face-api.js'
import { Database } from './database'
import { AuthResult } from './types'

let isModelsLoaded = false

export async function loadFaceApiModels(): Promise<boolean> {
  if (isModelsLoaded) return true
  
  try {
    console.log("Chargement des modèles Face-API...")
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri('/weights'),
      faceapi.nets.faceLandmark68Net.loadFromUri('/weights'),
      faceapi.nets.faceRecognitionNet.loadFromUri('/weights'),
    ])
    console.log("Modèles Face-API chargés avec succès")
    Database.initTestUsers()
    isModelsLoaded = true
    return true
  } catch (error) {
    console.error("Erreur lors du chargement des modèles:", error)
    return false
  }
}

export async function detectFace(videoElement: HTMLVideoElement) {
  if (!isModelsLoaded) {
    throw new Error("Les modèles ne sont pas chargés")
  }
  
  try {
    const detection = await faceapi
      .detectSingleFace(videoElement, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor()
    return detection
  } catch (error) {
    console.error("Erreur lors de la détection:", error)
    return null
  }
}

export async function authenticateUser(videoElement: HTMLVideoElement): Promise<AuthResult> {
  try {
    const detection = await detectFace(videoElement)
    if (!detection) {
      return { success: false, message: "Aucun visage détecté" }
    }

    const confidence = detection.detection.score
    console.log("Score de confiance détection:", confidence)
    
    if (confidence < 0.7) {
      return { success: false, message: "Qualité de détection insuffisante" }
    }

    const faceDescriptor = Array.from(detection.descriptor)
    const matchedUser = Database.findUserByFace(faceDescriptor, 0.4)
    
    if (matchedUser) {
      return { success: true, user: matchedUser, message: `Bienvenue ${matchedUser.name}!` }
    } else {
      return { success: false, message: "Visage non reconnu dans la base de données" }
    }
  } catch (error) {
    console.error("Erreur authentification:", error)
    return { success: false, message: "Erreur lors de l'authentification" }
  }
}

export const getFaceDetectorOptions = () => {
  return new faceapi.TinyFaceDetectorOptions({
    inputSize: 416,
    scoreThreshold: 0.5
  })
}
