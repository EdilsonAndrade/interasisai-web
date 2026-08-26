'use client'

import React from 'react'
import { FollowUpQueueEntry } from '../../types'
import { formatDate, formatStatus, formatOutcome, getStatusColor, getOutcomeColor } from '../../utils/formatters'

interface FollowUpCardProps {
  entry: FollowUpQueueEntry
  onEdit: (entry: FollowUpQueueEntry) => void
  onApprove: (entry: FollowUpQueueEntry) => void
  onDiscard: (entry: FollowUpQueueEntry) => void
  onOptOut: (entry: FollowUpQueueEntry) => void
}

export const FollowUpCard: React.FC<FollowUpCardProps> = ({
  entry,
  onEdit,
  onApprove,
  onDiscard,
  onOptOut,
}) => {
  const isPendente = entry.status === 'pendente'

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="flex gap-2 mb-2">
            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(entry.status)}`}>
              {formatStatus(entry.status)}
            </span>
            <span className={`px-2 py-1 rounded text-xs font-medium ${getOutcomeColor(entry.outcome)}`}>
              {formatOutcome(entry.outcome)}
            </span>
          </div>
          <p className="text-sm text-gray-500">{entry.base_thread_id}</p>
        </div>
        <p className="text-xs text-gray-400">{formatDate(entry.created_at)}</p>
      </div>

      <div className="mb-3">
        <p className="text-sm font-medium text-gray-900 mb-2">Resumo:</p>
        <p className="text-sm text-gray-700 line-clamp-2">{entry.summary}</p>
      </div>

      <div className="bg-gray-50 rounded p-3 mb-4">
        <p className="text-sm font-medium text-gray-900 mb-2">Rascunho:</p>
        <p className="text-sm text-gray-700 line-clamp-3">{entry.draft_message}</p>
      </div>

      {isPendente && (
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(entry)}
            className="flex-1 px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded hover:bg-blue-100 transition-colors"
          >
            Editar
          </button>
          <button
            onClick={() => onApprove(entry)}
            className="flex-1 px-3 py-2 text-sm font-medium text-white bg-green-600 rounded hover:bg-green-700 transition-colors"
          >
            Aprovar
          </button>
          <button
            onClick={() => onDiscard(entry)}
            className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
          >
            Descartar
          </button>
          <button
            onClick={() => onOptOut(entry)}
            className="flex-1 px-3 py-2 text-sm font-medium text-red-700 bg-red-50 rounded hover:bg-red-100 transition-colors"
          >
            Opt-out
          </button>
        </div>
      )}
    </div>
  )
}
