import { Metadata } from 'next'
import { AdminAuthProvider } from '@/context/AdminAuthContext'
import { FollowUpProvider } from '@/context/FollowUpContext'
import { FollowUpQueue } from '@/components/follow-up/FollowUpQueue'
import { ErrorBoundary } from '@/components/shared/ErrorBoundary'

export const metadata: Metadata = {
  title: 'Fila de Follow-up | Admin',
  description: 'Gerenciar rascunhos de follow-up e revisar mensagens de acompanhamento',
  openGraph: {
    title: 'Fila de Follow-up',
    description: 'Gerenciar rascunhos de follow-up',
    type: 'website',
  },
}

// TODO: Obter tenantId da URL, query params ou context
const DEFAULT_TENANT_ID = 'demo'

export default function FollowUpPage() {
  return (
    <ErrorBoundary>
      <AdminAuthProvider>
        <FollowUpProvider>
          <main className="p-6 max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Fila de Follow-up</h1>
              <p className="text-gray-600">
                Revise e aprove rascunhos de follow-up gerados automaticamente
              </p>
            </div>

            <FollowUpQueue tenantId={DEFAULT_TENANT_ID} />
          </main>
        </FollowUpProvider>
      </AdminAuthProvider>
    </ErrorBoundary>
  )
}
