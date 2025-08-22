'use client'

import { User } from '@/lib/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Database } from '@/lib/database'
import { useEffect, useState } from 'react'

interface DashboardProps {
  user: User
  onLogout: () => void
}

export default function Dashboard({ user, onLogout }: DashboardProps) {
  const [allUsers, setAllUsers] = useState<User[]>([])

  useEffect(() => {
    const users = Database.getUsers()
    setAllUsers(users)
  }, [])

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Tableau de Bord</h1>
        <Button onClick={onLogout} variant="outline">
          Se déconnecter
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>👋 Bienvenue, {user.name} !</CardTitle>
          <CardDescription>
            Authentification faciale réussie
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Nom</p>
              <p className="font-medium">{user.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">{user.email || 'Non renseigné'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Dernière connexion</p>
              <p className="font-medium">
                {new Date().toLocaleDateString()} à {new Date().toLocaleTimeString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Utilisateurs enregistrés</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">{allUsers.length}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Connexions aujourd&apos;hui</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">1</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Taux de réussite</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-purple-600">100%</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Utilisateurs du système</CardTitle>
          <CardDescription>
            Liste de tous les utilisateurs enregistrés dans la base de données
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {allUsers.map((u) => (
              <div 
                key={u.id} 
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  u.id === user.id ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'
                }`}
              >
                <div>
                  <p className="font-medium">
                    {u.name} 
                    {u.id === user.id && (
                      <span className="ml-2 text-sm text-blue-600">(Vous)</span>
                    )}
                  </p>
                  <p className="text-sm text-gray-500">{u.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">
                    Inscrit le {new Date(u.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
