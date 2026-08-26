'use client'

import React, { createContext, useContext } from 'react'

interface AdminUser {
  id: string
  name: string
  email: string
  role: 'admin' | 'cs' | 'vendas'
}

interface AdminAuthContextType {
  user: AdminUser | null
  isAuthenticated: boolean
  isAdmin: boolean
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined)

interface AdminAuthProviderProps {
  children: React.ReactNode
  mockUser?: AdminUser | null
}

export const AdminAuthProvider: React.FC<AdminAuthProviderProps> = ({
  children,
  mockUser,
}) => {
  // Em produção, isso viria de useSession() ou equivalente
  const user = mockUser || {
    id: 'user-123',
    name: 'Admin User',
    email: 'admin@interasis.ai',
    role: 'admin',
  }

  const value: AdminAuthContextType = {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
  }

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export const useAdminAuth = (): AdminAuthContextType => {
  const context = useContext(AdminAuthContext)
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider')
  }
  return context
}
