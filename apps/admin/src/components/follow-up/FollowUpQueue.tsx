'use client'

import React, { useState } from 'react'
import { FollowUpQueueEntry, FollowUpStatus, SessionOutcome } from '../../types'
import { useFollowUpQueue } from '../../hooks/useFollowUpQueue'
import { useTenantConfig } from '../../hooks/useTenantConfig'
import { apiClient } from '../../services/api'
import { FollowUpCard } from './FollowUpCard'
import { FollowUpFilterBar } from './FollowUpFilterBar'
import { FollowUpEditModal } from './FollowUpEditModal'
import { LoadingSpinner } from '../shared/LoadingSpinner'
import { useAdminAuth } from '../../context/AdminAuthContext'

interface FollowUpQueueProps {
  tenantId: string
}

export const FollowUpQueue: React.FC<FollowUpQueueProps> = ({ tenantId }) => {
  const { config: tenantConfig, fetchConfig } = useTenantConfig()
  const { data, loading, error, fetchQueue, refetch } = useFollowUpQueue()
  const { user } = useAdminAuth()
  const [selectedEntry, setSelectedEntry] = useState<FollowUpQueueEntry | null>(null)
  const [currentStatus, setCurrentStatus] = useState<FollowUpStatus | undefined>()
  const [currentOutcome, setCurrentOutcome] = useState<SessionOutcome | undefined>()
  const [actionLoading, setActionLoading] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  React.useEffect(() => {
    // Carregar fila inicial
    fetchQueue(tenantId, currentStatus, currentOutcome)
  }, [tenantId, currentStatus, currentOutcome, fetchQueue])

  React.useEffect(() => {
    // Carregar config do tenant para validação de oferta
    if (tenantId) {
      fetchConfig(tenantId)
    }
  }, [tenantId, fetchConfig])

  const handleFilterChange = (status?: FollowUpStatus, outcome?: SessionOutcome) => {
    setCurrentStatus(status)
    setCurrentOutcome(outcome)
  }

  const handleEdit = (entry: FollowUpQueueEntry) => {
    setSelectedEntry(entry)
  }

  const handleApprove = async (newDraft: string) => {
    if (!selectedEntry || !user) return

    setActionLoading(true)
    setActionError(null)

    try {
      await apiClient.updateFollowUpStatus(tenantId, selectedEntry.id, {
        status: 'aprovado',
        draft_message: newDraft,
        approved_by: user.email,
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
      await apiClient.updateFollowUpStatus(tenantId, selectedEntry.id, {
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
      await apiClient.updateFollowUpStatus(tenantId, entry.id, {
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
      <FollowUpFilterBar
        onFilterChange={handleFilterChange}
        currentStatus={currentStatus}
        currentOutcome={currentOutcome}
      />

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
        <div className="grid gap-4 mb-4">
          {data.map(entry => (
            <FollowUpCard
              key={entry.id}
              entry={entry}
              onEdit={handleEdit}
              onApprove={() => handleEdit(entry)}
              onDiscard={() => handleDiscard()}
              onOptOut={() => handleOptOut(entry)}
            />
          ))}
        </div>
      )}

      <FollowUpEditModal
        entry={selectedEntry}
        tenantOferta={tenantConfig?.oferta_vigente_texto}
        onApprove={handleApprove}
        onDiscard={handleDiscard}
        onClose={() => setSelectedEntry(null)}
        isLoading={actionLoading}
      />
    </div>
  )
}
