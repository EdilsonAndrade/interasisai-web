'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import { FollowUpQueueEntry, FollowUpFilters } from '../types'

interface FollowUpContextType {
  entries: FollowUpQueueEntry[]
  filters: FollowUpFilters
  loading: boolean
  error: string | null
  setEntries: (entries: FollowUpQueueEntry[]) => void
  setFilters: (filters: FollowUpFilters) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  updateEntryStatus: (id: string, status: FollowUpQueueEntry['status']) => void
}

const FollowUpContext = createContext<FollowUpContextType | undefined>(undefined)

interface FollowUpProviderProps {
  children: React.ReactNode
}

export const FollowUpProvider: React.FC<FollowUpProviderProps> = ({ children }) => {
  const [entries, setEntries] = useState<FollowUpQueueEntry[]>([])
  const [filters, setFilters] = useState<FollowUpFilters>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateEntryStatus = useCallback((id: string, status: FollowUpQueueEntry['status']) => {
    setEntries(prev =>
      prev.map(entry =>
        entry.id === id
          ? {
              ...entry,
              status,
              approvedAt: new Date().toISOString(),
            }
          : entry
      )
    )
  }, [])

  const value: FollowUpContextType = {
    entries,
    filters,
    loading,
    error,
    setEntries,
    setFilters,
    setLoading,
    setError,
    updateEntryStatus,
  }

  return (
    <FollowUpContext.Provider value={value}>
      {children}
    </FollowUpContext.Provider>
  )
}

export const useFollowUp = (): FollowUpContextType => {
  const context = useContext(FollowUpContext)
  if (!context) {
    throw new Error('useFollowUp must be used within FollowUpProvider')
  }
  return context
}
