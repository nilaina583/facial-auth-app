import * as faceapi from 'face-api.js'

let isModelsLoaded = false

// Charger les modèles Face-API
export async function loadFaceApiModels(): Promise<boolean> {
  if (isModelsLoaded) return true
  
  try {
    console.log('Chargement des modèles Face-API...')
    
    // Charger les modèles depuis le dossier weights
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri('/weights'),
      faceapi.nets.faceLandmark68Net.loadFromUri('/weights'),
      faceapi.nets.faceRecognitionNet.loadFromUri('/weights'),
    ])
    
    console.log('Modèles Face-API chargés avec succès')
    isModelsLoaded = true
    return true
  } catch (error) {
    console.error('Erreur lors du chargement des modèles:', error)
    return false
  }
}

// Détecter un visage dans un élément vidéo
export async function detectFace(videoElement: HTMLVideoElement) {
  if (!isModelsLoaded) {
    throw new Error('Les modèles ne sont pas chargés')
  }
  
  try {
    const detection = await faceapi
      .detectSingleFace(videoElement, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor()
    
    return detection
  } catch (error) {
    console.error('Erreur lors de la détection:', error)
    return null
  }
}

// Obtenir les options par défaut pour la détection
export const getFaceDetectorOptions = () => {
  return new faceapi.TinyFaceDetectorOptions({
    inputSize: 416,
    scoreThreshold: 0.5
  })
}