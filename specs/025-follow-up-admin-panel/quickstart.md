# Quickstart: Follow-up Admin Panel

**For**: Frontend developers implementing EDI-65  
**Duration**: ~5 mins to read, ~30 mins to set up project structure

---

## 1. Prerequisites

✅ Backend (EDI-53) endpoints deployed and tested  
✅ Next.js 14+ project running (`apps/admin/`)  
✅ TypeScript, React 18+ configured  
✅ Tailwind CSS v3+ + Framer Motion installed  
✅ Authentication/roles system in place  

---

## 2. Project Setup

### Directory Structure

Create this structure under `apps/admin/src/`:

```bash
mkdir -p components/follow-up components/history components/config components/dashboard components/shared
mkdir -p hooks context types services validation utils
mkdir -p app/admin/follow-up
```

### Install Dependencies

```bash
cd apps/admin

# If not already installed
npm install marked dompurify zod react-hook-form clsx tailwind-merge

# Types
npm install --save-dev @types/dompurify @types/marked
```

---

## 3. Core Type Definitions

**File**: `src/types/followup.ts`

```typescript
export type FollowUpStatus = 'pendente' | 'aprovado' | 'enviado' | 'descartado' | 'opt_out'
export type SessionOutcome = 'fechado' | 'pensando' | 'sem_resposta' | 'recusado' | 'em_andamento'

export interface FollowUpQueueEntry {
  id: string
  tenantId: string
  baseThreadId: string
  outcome: SessionOutcome
  summary: string
  draftMessage: string
  status: FollowUpStatus
  attempts: number
  createdAt: string
  approvedBy?: string
  approvedAt?: string
}
```

See `data-model.md` for all types.

---

## 4. Create Context Provider

**File**: `src/context/FollowUpContext.tsx`

```typescript
import React, { createContext, useContext, useState, useCallback } from 'react'
import { FollowUpQueueEntry, FollowUpFilters } from '../types/followup'

interface FollowUpContextType {
  entries: FollowUpQueueEntry[]
  filters: FollowUpFilters
  updateStatus: (id: string, status: FollowUpQueueEntry['status']) => Promise<void>
  editDraft: (id: string, newText: string) => void
  setFilters: (filters: FollowUpFilters) => void
}

const FollowUpContext = createContext<FollowUpContextType | undefined>(undefined)

export const FollowUpProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [entries, setEntries] = useState<FollowUpQueueEntry[]>([])
  const [filters, setFilters] = useState<FollowUpFilters>({})

  const updateStatus = useCallback(async (id: string, status: FollowUpQueueEntry['status']) => {
    // TODO: call PATCH /follow-up-queue/:id with new status
    // Update context after success
  }, [])

  const editDraft = useCallback((id: string, newText: string) => {
    // TODO: validate with Zod before updating
  }, [])

  return (
    <FollowUpContext.Provider value={{ entries, filters, updateStatus, editDraft, setFilters }}>
      {children}
    </FollowUpContext.Provider>
  )
}

export const useFollowUp = () => {
  const context = useContext(FollowUpContext)
  if (!context) throw new Error('useFollowUp must be inside FollowUpProvider')
  return context
}
```

---

## 5. Create Custom Hook for Data Fetching

**File**: `src/hooks/useFollowUpQueue.ts`

```typescript
import { useState, useEffect, useCallback } from 'react'
import { FollowUpQueueEntry, FollowUpFilters } from '../types/followup'
import { apiClient } from '../services/api'

interface UseFollowUpQueueResult {
  data: FollowUpQueueEntry[]
  loading: boolean
  error: string | null
  totalCount: number
  fetchQueue: (filters?: FollowUpFilters) => Promise<void>
}

export const useFollowUpQueue = (): UseFollowUpQueueResult => {
  const [data, setData] = useState<FollowUpQueueEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)

  const fetchQueue = useCallback(async (filters?: FollowUpFilters) => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiClient.get('/follow-up-queue', { params: filters })
      setData(response.data)
      setTotalCount(response.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchQueue()
  }, [fetchQueue])

  return { data, loading, error, totalCount, fetchQueue }
}
```

---

## 6. Create Main Component

**File**: `src/components/follow-up/FollowUpQueue.tsx`

```typescript
import React from 'react'
import { useFollowUpQueue } from '../../hooks/useFollowUpQueue'
import { useFollowUp } from '../../context/FollowUpContext'
import { FollowUpCard } from './FollowUpCard'
import { FollowUpFilterBar } from './FollowUpFilterBar'

export const FollowUpQueue: React.FC = () => {
  const { data, loading, error } = useFollowUpQueue()
  const { filters, setFilters } = useFollowUp()

  if (loading) return <div>Carregando...</div>
  if (error) return <div>Erro: {error}</div>

  return (
    <div className="space-y-4">
      <FollowUpFilterBar filters={filters} onFilterChange={setFilters} />
      <div className="grid gap-4">
        {data.map((entry) => (
          <FollowUpCard key={entry.id} entry={entry} />
        ))}
      </div>
    </div>
  )
}
```

---

## 7. Page Route

**File**: `src/app/admin/follow-up/page.tsx`

```typescript
import { Metadata } from 'next'
import { FollowUpProvider } from '@/context/FollowUpContext'
import { FollowUpQueue } from '@/components/follow-up/FollowUpQueue'

export const metadata: Metadata = {
  title: 'Fila de Follow-up',
  description: 'Gerenciar rascunhos de follow-up e aprovar mensagens',
}

export default function FollowUpPage() {
  return (
    <FollowUpProvider>
      <main className="p-6">
        <h1 className="text-3xl font-bold mb-6">Fila de Follow-up</h1>
        <FollowUpQueue />
      </main>
    </FollowUpProvider>
  )
}
```

---

## 8. Testing Setup

**File**: `src/hooks/__tests__/useFollowUpQueue.test.ts`

```typescript
import { renderHook, waitFor } from '@testing-library/react'
import { useFollowUpQueue } from '../useFollowUpQueue'
import * as apiClient from '../../services/api'

jest.mock('../../services/api')

describe('useFollowUpQueue', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should fetch queue on mount', async () => {
    const mockData = [
      { id: '1', status: 'pendente', draftMessage: 'Hello' } as any,
    ]
    jest.spyOn(apiClient, 'get').mockResolvedValue({
      data: mockData,
      total: 1,
    })

    const { result } = renderHook(() => useFollowUpQueue())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toEqual(mockData)
  })

  it('should handle errors gracefully', async () => {
    jest.spyOn(apiClient, 'get').mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => useFollowUpQueue())

    await waitFor(() => {
      expect(result.current.error).toBe('Network error')
    })
  })
})
```

---

## 9. Implementation Checklist

- [ ] Types defined (all 5 entities: FollowUpQueueEntry, ConversationMessage, TenantConfig, etc.)
- [ ] Contexts created (FollowUpContext, AdminAuthContext)
- [ ] Hooks implemented (useFollowUpQueue, useConversationHistory, useTenantConfig)
- [ ] Components built (FollowUpQueue, ConversationHistory, TenantConfigPanel, Dashboard)
- [ ] API client initialized (services/api.ts)
- [ ] Validation schemas (Zod) set up
- [ ] Tests written (100% coverage of hooks + interactive components)
- [ ] Accessibility checked (semantic HTML, ARIA labels, keyboard nav)
- [ ] Responsiveness tested (mobile 320px, tablet, desktop)
- [ ] E2E test created (filter → edit → approve flow)

---

## 10. Common Patterns

### Fetch with Error Handling

```typescript
try {
  const res = await fetch('/api/follow-up-queue')
  if (!res.ok) throw new Error(res.statusText)
  return await res.json()
} catch (err) {
  showToast.error(`Failed: ${err.message}`)
  throw err
}
```

### Client-side Offer Validation

```typescript
const validateOffer = (draftText: string, tenantOferta: string | null) => {
  if (draftText.toLowerCase().includes('desconto')) {
    return tenantOferta !== null
  }
  return true
}
```

### Render Markdown Safely

```typescript
import marked from 'marked'
import DOMPurify from 'dompurify'

const SafeMarkdown = ({ content }: { content: string }) => {
  const html = marked(content)
  const clean = DOMPurify.sanitize(html)
  return <div dangerouslySetInnerHTML={{ __html: clean }} />
}
```

---

## 11. Next Steps

1. Read `plan.md` for full architecture overview
2. Review `data-model.md` for type definitions
3. Check `contracts/endpoints.md` for API specs
4. Start with Phase 2 tasks (`tasks.md` — generated by `/speckit.tasks`)
5. Implement in order: P1 (fila) → P2 (histórico) → P3 (config) → P4 (dashboard)

---

## 12. Support

- Questions about spec? Check `spec.md`
- Types unclear? See `data-model.md`
- API confusion? Read `contracts/endpoints.md`
- Design decisions? See `research.md`

Happy coding! 🚀
