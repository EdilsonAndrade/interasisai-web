import {
  ListFollowUpResponse,
  UpdateFollowUpRequest,
  UpdateFollowUpResponse,
  ListConversationResponse,
  GetTenantResponse,
  UpdateTenantRequest,
  UpdateTenantResponse,
  FollowUpFilters,
  HistorySearchParams,
  ApiError,
} from '../types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'

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
          const error = (await response.json()) as ApiError
          throw new Error(error.message || `HTTP ${response.status}`)
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

  async getFollowUpQueue(filters?: FollowUpFilters): Promise<ListFollowUpResponse> {
    return this.request<ListFollowUpResponse>('/follow-up-queue', {
      params: {
        status: filters?.status,
        outcome: filters?.outcome,
        tenant_id: filters?.tenantId,
        page: filters?.page || 1,
        limit: filters?.limit || 20,
      },
    })
  }

  async updateFollowUpStatus(
    queueId: string,
    request: UpdateFollowUpRequest
  ): Promise<UpdateFollowUpResponse> {
    return this.request<UpdateFollowUpResponse>(`/follow-up-queue/${queueId}`, {
      method: 'PATCH',
      body: JSON.stringify(request),
    })
  }

  async getConversationHistory(
    tenantId: string,
    baseThreadId: string,
    page = 1,
    limit = 50
  ): Promise<ListConversationResponse> {
    return this.request<ListConversationResponse>(
      `/conversation-history/${tenantId}/${baseThreadId}`,
      {
        params: { page, limit },
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
      method: 'PATCH',
      body: JSON.stringify(request),
    })
  }
}

export const apiClient = new APIClient()
