import {
  GetFollowUpQueueResponse,
  FollowUpQueueGlobalResponse,
  UpdateFollowUpRequest,
  UpdateFollowUpResponse,
  GetConversationHistoryResponse,
  GetTenantResponse,
  UpdateTenantRequest,
  UpdateTenantResponse,
  ListTenantsResponse,
  ApiErrorResponse,
} from '../types'
import { FollowUpStatus, SessionOutcome } from '../types/followup'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>
}

class APIClient {
  private async request<T>(
    endpoint: string,
    options: FetchOptions = {}
  ): Promise<T> {
    const { params, ...fetchOptions } = options

    const url = new URL(`${API_BASE_URL}${endpoint}`)
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value))
        }
      })
    }

    const headers = {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    }

    let lastError: Error | null = null
    const maxRetries = 3
    const baseDelay = 1000

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const response = await fetch(url.toString(), {
          ...fetchOptions,
          headers,
        })

        if (!response.ok) {
          const error = (await response.json()) as ApiErrorResponse
          throw new Error(error.detail || `HTTP ${response.status}`)
        }

        return (await response.json()) as T
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))

        // Only retry on network errors or 5xx status codes
        const isRetryable =
          error instanceof TypeError || // Network error
          (error instanceof Error && error.message.startsWith('HTTP 5'))

        if (isRetryable && attempt < maxRetries - 1) {
          const delay = baseDelay * Math.pow(2, attempt)
          await new Promise(resolve => setTimeout(resolve, delay))
          continue
        }

        break
      }
    }

    throw lastError || new Error('Request failed')
  }

  async getFollowUpQueue(
    tenantId: string,
    status?: FollowUpStatus,
    outcome?: SessionOutcome
  ): Promise<GetFollowUpQueueResponse> {
    return this.request<GetFollowUpQueueResponse>(
      `/tenants/${tenantId}/follow-up-queue`,
      {
        params: { status, outcome },
      }
    )
  }

  async getFollowUpQueueGlobal(
    tenantId?: string,
    status?: FollowUpStatus,
    outcome?: SessionOutcome
  ): Promise<FollowUpQueueGlobalResponse> {
    return this.request<FollowUpQueueGlobalResponse>('/follow-up-queue', {
      params: { tenant_id: tenantId, status, outcome },
    })
  }

  async updateFollowUpStatus(
    tenantId: string,
    entryId: number,
    request: UpdateFollowUpRequest
  ): Promise<UpdateFollowUpResponse> {
    return this.request<UpdateFollowUpResponse>(
      `/tenants/${tenantId}/follow-up-queue/${entryId}`,
      {
        method: 'PATCH',
        body: JSON.stringify(request),
      }
    )
  }

  async getConversationHistory(
    tenantId: string,
    baseThreadId: string,
    limit = 200,
    before?: string
  ): Promise<GetConversationHistoryResponse> {
    return this.request<GetConversationHistoryResponse>(
      `/tenants/${tenantId}/conversation-history/${baseThreadId}`,
      {
        params: { limit, before },
      }
    )
  }

  async getTenantConfig(tenantId: string): Promise<GetTenantResponse> {
    return this.request<GetTenantResponse>(`/tenants/${tenantId}`)
  }

  async updateTenantConfig(
    tenantId: string,
    request: UpdateTenantRequest
  ): Promise<UpdateTenantResponse> {
    return this.request<UpdateTenantResponse>(`/tenants/${tenantId}`, {
      method: 'PUT',
      body: JSON.stringify(request),
    })
  }

  async listTenants(q?: string, limit = 50, offset = 0): Promise<ListTenantsResponse> {
    return this.request<ListTenantsResponse>('/tenants', {
      params: { q, limit, offset },
    })
  }
}

export const apiClient = new APIClient()
