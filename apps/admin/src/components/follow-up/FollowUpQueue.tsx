'use client'

import React, { useState, useEffect } from 'react'
import { FollowUpQueueEntry, FollowUpFilters } from '../../types'
import { useFollowUpQueue } from '../../hooks/useFollowUpQueue'
import { useTenantConfig } from '../../hooks/useTenantConfig'
import { apiClient } from '../../services/api'
import { FollowUpCard } from './FollowUpCard'
import { FollowUpFilterBar } from './FollowUpFilterBar'
import { FollowUpEditModal } from './FollowUpEditModal'
import { LoadingSpinner } from '../shared/LoadingSpinner'

export const FollowUpQueue: React.FC = () => {
  const { data, loading, error, totalCount, fetchQueue, refetch } = useFollowUpQueue()
  const { config: tenantConfig, fetchConfig } = useTenantConfig()
  const [selectedEntry, setSelectedEntry] = useState<FollowUpQueueEntry | null>(null)
  const [currentFilters, setCurrentFilters] = useState<FollowUpFilters>({})
  const [actionLoading, setActionLoading] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  useEffect(() => {
    // Carregar config do tenant quando tiver entrada selecionada
    if (selectedEntry && selectedEntry.tenantId) {
      fetchConfig(selectedEntry.tenantId)
    }
  }, [selectedEntry, fetchConfig])

  const handleFilterChange = async (filters: FollowUpFilters) => {
    setCurrentFilters(filters)
    await fetchQueue(filters)
  }

  const handleEdit = (entry: FollowUpQueueEntry) => {
    setSelectedEntry(entry)
  }

  const handleApprove = async (newDraft: string) => {
    if (!selectedEntry) return

    setActionLoading(true)
    setActionError(null)

    try {
      await apiClient.updateFollowUpStatus(selectedEntry.id, {
        status: 'aprovado',
        draftMessage: newDraft,
        approvedBy: 'current-user-id',
      })
      setSelectedEntry(null)
      await refetch()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Erro ao aprovar')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDiscard = async () => {
    if (!selectedEntry) return

    setActionLoading(true)
    setActionError(null)

    try {
      await apiClient.updateFollowUpStatus(selectedEntry.id, {
        status: 'descartado',
      })
      setSelectedEntry(null)
      await refetch()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Erro ao descartar')
    } finally {
      setActionLoading(false)
    }
  }

  const handleOptOut = async (entry: FollowUpQueueEntry) => {
    setActionLoading(true)
    setActionError(null)

    try {
      await apiClient.updateFollowUpStatus(entry.id, {
        status: 'opt_out',
      })
      await refetch()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Erro ao marcar opt-out')
    } finally {
      setActionLoading(false)
    }
  }

  if (loading && data.length === 0) {
    return <LoadingSpinner message="Carregando fila de follow-up..." />
  }

  return (
    <div>
      <FollowUpFilterBar onFilterChange={handleFilterChange} />

      {actionError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{actionError}</p>
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">{error}</p>
        </div>
      )}

      {data.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Nenhum follow-up encontrado</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 mb-4">
            {data.map(entry => (
              <FollowUpCard
                key={entry.id}
                entry={entry}
                onEdit={handleEdit}
                onApprove={() => handleEdit(entry)}
                onDiscard={() => handleOptOut(entry)}
                onOptOut={() => handleOptOut(entry)}
              />
            ))}
          </div>

          <div className="text-center py-4 text-sm text-gray-600">
            Mostrando {data.length} de {totalCount} registros
          </div>
        </>
      )}

      <FollowUpEditModal
        entry={selectedEntry}
        tenantOferta={tenantConfig?.ofertaVigente?.text}
        onApprove={handleApprove}
        onDiscard={handleDiscard}
        onClose={() => setSelectedEntry(null)}
        isLoading={actionLoading}
      />
    </div>
  )
}
