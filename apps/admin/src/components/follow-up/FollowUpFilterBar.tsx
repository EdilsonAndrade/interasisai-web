'use client'

import React, { useState } from 'react'
import { FollowUpFilters, FollowUpStatus, SessionOutcome } from '../../types'

interface FollowUpFilterBarProps {
  onFilterChange: (filters: FollowUpFilters) => void
}

const statuses: FollowUpStatus[] = ['pendente', 'aprovado', 'descartado', 'enviado', 'opt_out']
const outcomes: SessionOutcome[] = ['fechado', 'pensando', 'sem_resposta', 'recusado', 'em_andamento']

export const FollowUpFilterBar: React.FC<FollowUpFilterBarProps> = ({ onFilterChange }) => {
  const [status, setStatus] = useState<FollowUpStatus | ''>('')
  const [outcome, setOutcome] = useState<SessionOutcome | ''>('')
  const [tenantId, setTenantId] = useState('')

  const handleApplyFilters = () => {
    onFilterChange({
      status: status ? (status as FollowUpStatus) : undefined,
      outcome: outcome ? (outcome as SessionOutcome) : undefined,
      tenantId: tenantId || undefined,
      page: 1,
      limit: 20,
    })
  }

  const handleReset = () => {
    setStatus('')
    setOutcome('')
    setTenantId('')
    onFilterChange({ page: 1, limit: 20 })
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            value={status}
            onChange={e => setStatus(e.target.value as FollowUpStatus | '')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos</option>
            {statuses.map(s => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Outcome</label>
          <select
            value={outcome}
            onChange={e => setOutcome(e.target.value as SessionOutcome | '')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos</option>
            {outcomes.map(o => (
              <option key={o} value={o}>
                {o.charAt(0).toUpperCase() + o.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tenant ID</label>
          <input
            type="text"
            value={tenantId}
            onChange={e => setTenantId(e.target.value)}
            placeholder="Filtrar por tenant..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-end gap-2">
          <button
            onClick={handleApplyFilters}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Filtrar
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  )
}
