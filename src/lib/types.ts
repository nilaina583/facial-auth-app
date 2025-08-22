// Types pour notre système d'authentification
export interface User {
  id: string
  name: string
  email?: string
  faceDescriptor: number[] // Descripteur facial de Face-API.js
  createdAt: string
}

export interface AuthResult {
  success: boolean
  user?: User
  message: string
}

export interface FaceDetectionResult {
  detected: boolean
  confidence: number
  descriptor?: number[]
}