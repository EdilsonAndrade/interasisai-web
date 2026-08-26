'use client'

import React, { useState, useEffect } from 'react'
import { FollowUpQueueEntry } from '../../types'
import { validateOfferText } from '../../utils/offerValidator'
import { EditDraftSchema } from '../../validation/schemas'

interface FollowUpEditModalProps {
  entry: FollowUpQueueEntry | null
  tenantOferta?: string | null
  onApprove: (newDraft: string) => Promise<void>
  onDiscard: () => Promise<void>
  onClose: () => void
  isLoading?: boolean
}

export const FollowUpEditModal: React.FC<FollowUpEditModalProps> = ({
  entry,
  tenantOferta,
  onApprove,
  onDiscard,
  onClose,
  isLoading = false,
}) => {
  const [draft, setDraft] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false)

  useEffect(() => {
    if (entry) {
      setDraft(entry.draftMessage)
      setError(null)
    }
  }, [entry])

  if (!entry) return null

  const handleApprove = async () => {
    setError(null)

    // Validar com Zod
    const validation = EditDraftSchema.safeParse({ draftMessage: draft })
    if (!validation.success) {
      setError(validation.error.errors[0].message)
      return
    }

    // Validar oferta
    const offerValidation = validateOfferText(draft, tenantOferta)
    if (!offerValidation.isValid) {
      setError(offerValidation.message)
      return
    }

    try {
      await onApprove(draft)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao aprovar')
    }
  }

  const handleDiscard = async () => {
    try {
      await onDiscard()
      setShowDiscardConfirm(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao descartar')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">Revisar Rascunho</h2>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Resumo */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Resumo da Sessão</p>
            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{entry.summary}</p>
          </div>

          {/* Rascunho */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rascunho da Mensagem
            </label>
            <textarea
              value={draft}
              onChange={e => {
                setDraft(e.target.value)
                setError(null)
              }}
              className="w-full h-40 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Edite a mensagem aqui..."
            />
            <p className="text-xs text-gray-500 mt-1">{draft.length}/1000 caracteres</p>
          </div>

          {/* Erro */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Validação de oferta */}
          {tenantOferta && (
            <div className="bg-blue-50 border border-blue-200 rounded p-3">
              <p className="text-xs font-medium text-blue-900 mb-1">Oferta Vigente:</p>
              <p className="text-sm text-blue-800">{tenantOferta}</p>
              <p className="text-xs text-blue-700 mt-1">
                Certifique-se de não mencionar promoções não autorizadas
              </p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50 flex gap-3 justify-end sticky bottom-0">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={() => setShowDiscardConfirm(true)}
            disabled={isLoading}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
          >
            Descartar
          </button>
          <button
            onClick={handleApprove}
            disabled={isLoading}
            className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {isLoading ? 'Processando...' : 'Aprovar'}
          </button>
        </div>
      </div>

      {/* Confirm discard modal */}
      {showDiscardConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Descartar Rascunho?</h3>
            <p className="text-gray-700 mb-6">Esta ação não pode ser desfeita.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDiscardConfirm(false)}
                disabled={isLoading}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDiscard}
                disabled={isLoading}
                className="px-4 py-2 text-white bg-red-600 rounded hover:bg-red-700 disabled:opacity-50"
              >
                {isLoading ? 'Processando...' : 'Descartar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
