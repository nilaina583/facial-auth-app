import { User } from './types'

// Pour le développement, utilisons le localStorage comme base de données temporaire
// En production, nous utiliserons Vercel KV

export class Database {
  private static getUsersFromStorage(): User[] {
    if (typeof window === 'undefined') return []
    
    const users = localStorage.getItem('facial_auth_users')
    return users ? JSON.parse(users) : []
  }

  private static saveUsers(users: User[]): void {
    if (typeof window === 'undefined') return
    
    localStorage.setItem('facial_auth_users', JSON.stringify(users))
  }

  // Créer des utilisateurs de test
  static initTestUsers(): void {
    const existingUsers = this.getUsersFromStorage()
    if (existingUsers.length > 0) return

    const testUsers: User[] = [
      {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        faceDescriptor: Array(128).fill(0).map(() => Math.random() - 0.5), // Descripteur factice
        createdAt: new Date().toISOString()
      },
      {
        id: '2', 
        name: 'Jane Smith',
        email: 'jane@example.com',
        faceDescriptor: Array(128).fill(0).map(() => Math.random() - 0.5),
        createdAt: new Date().toISOString()
      },
      {
        id: '3',
        name: 'Utilisateur Test',
        email: 'test@example.com', 
        faceDescriptor: Array(128).fill(0).map(() => Math.random() - 0.5),
        createdAt: new Date().toISOString()
      }
    ]

    this.saveUsers(testUsers)
    console.log('Utilisateurs de test créés:', testUsers.map(u => u.name))
  }

  // Obtenir tous les utilisateurs
  static getUsers(): User[] {
    return this.getUsersFromStorage()
  }

  // Trouver un utilisateur par ID
  static getUserById(id: string): User | null {
    const users = this.getUsersFromStorage()
    return users.find(user => user.id === id) || null
  }

  // Ajouter un nouvel utilisateur
  static addUser(user: Omit<User, 'id' | 'createdAt'>): User {
    const users = this.getUsersFromStorage()
    const newUser: User = {
      ...user,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    }
    
    users.push(newUser)
    this.saveUsers(users)
    return newUser
  }

  // Comparer les descripteurs faciaux
  static compareFaceDescriptors(descriptor1: number[], descriptor2: number[]): number {
    if (descriptor1.length !== descriptor2.length) return 0

    // Calcul de distance euclidienne simplifiée
    let sum = 0
    for (let i = 0; i < descriptor1.length; i++) {
      sum += Math.pow(descriptor1[i] - descriptor2[i], 2)
    }
    
    const distance = Math.sqrt(sum)
    // Convertir en score de similarité (plus proche de 1 = plus similaire)
    return Math.max(0, 1 - distance / 2)
  }

  // Trouver un utilisateur par descripteur facial
  static findUserByFace(faceDescriptor: number[], threshold: number = 0.6): User | null {
    const users = this.getUsersFromStorage()
    
    for (const user of users) {
      const similarity = this.compareFaceDescriptors(faceDescriptor, user.faceDescriptor)
      console.log(`Similarité avec ${user.name}:`, similarity)
      
      if (similarity > threshold) {
        return user
      }
    }
    
    return null
  }
}