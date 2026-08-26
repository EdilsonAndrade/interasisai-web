'use client'

import React, { useState } from 'react'
import { FollowUpStatus } from '../../types'

interface FollowUpFilterBarProps {
  onFilterChange: (status?: FollowUpStatus) => void
  currentStatus?: FollowUpStatus
}

const statuses: FollowUpStatus[] = ['pendente', 'aprovado', 'descartado', 'enviado', 'opt_out']

export const FollowUpFilterBar: React.FC<FollowUpFilterBarProps> = ({
  onFilterChange,
  currentStatus,
}) => {
  const [status, setStatus] = useState<FollowUpStatus | ''>((currentStatus as FollowUpStatus) || '')

  const handleApplyFilters = () => {
    onFilterChange(status ? (status as FollowUpStatus) : undefined)
  }

  const handleReset = () => {
    setStatus('')
    onFilterChange(undefined)
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
      <div className="flex gap-3 items-end">
        <div className="flex-1">
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

        <div className="flex gap-2">
          <button
            onClick={handleApplyFilters}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
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
