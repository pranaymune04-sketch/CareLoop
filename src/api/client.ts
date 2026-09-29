/// <reference types="vite/client" />

/**
 * CareLoop Backend API Client
 * Connects frontend consumers to the Express backend layer.
 * Strictly typed with full error handling, actor context propagation, and configurable base URL.
 */

import { Referral, Facility, Patient, UserRole } from '../types/index';
import {
  ApiResponse,
  HealthStatus,
  ReferralFilterOptions,
  CreateReferralPayload,
  AcceptSlotPayload,
  ProposeSlotPayload,
  CannotProceedPayload,
  ArrivePayload,
  StartServicePayload,
  CompleteServicePayload,
  ReroutePayload,
  SmartMatchCriteria,
  MatchedFacilityResult,
} from '../types/api';

// Configurable backend base URL with Vite env support and default fallback
let customBaseUrl: string | null = null;

export function setApiBaseUrl(url: string | null): void {
  customBaseUrl = url;
}

export function getApiBaseUrl(): string {
  if (customBaseUrl) return customBaseUrl;
  const env = (import.meta as unknown as { env?: Record<string, string | undefined> })?.env;
  const processEnv = typeof process !== 'undefined' ? process?.env : undefined;
  const configured =
    env?.VITE_API_BASE_URL ||
    env?.VITE_API_URL ||
    processEnv?.VITE_API_BASE_URL ||
    processEnv?.VITE_API_URL;
  if (configured) return configured;

  if (
    typeof window !== 'undefined' &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1'
  ) {
    return '/api';
  }
  return 'http://localhost:5000/api';
}

export const API_BASE_URL = getApiBaseUrl();

/**
 * Standard typed API error representing non-2xx responses and backend exception envelopes
 */
export class ApiError extends Error {
  public readonly code: string;
  public readonly status: number;
  public readonly details?: unknown;
  public readonly timestamp?: string;

  constructor(message: string, status: number, code = 'API_ERROR', details?: unknown, timestamp?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
    this.timestamp = timestamp;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export interface ApiFetchOptions extends RequestInit {
  actorRole?: UserRole | 'SYSTEM';
  actorId?: string;
  actorName?: string;
  facilityId?: string;
}

/**
 * Core transport fetch wrapper with typed response, envelope unwrapping, and error handling
 */
export async function apiFetch<T>(endpoint: string, options: ApiFetchOptions = {}): Promise<T> {
  const { actorRole, actorId, actorName, facilityId, headers, ...rest } = options;

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(headers as Record<string, string>),
  };

  if (actorRole) requestHeaders['x-actor-role'] = actorRole;
  if (actorId) requestHeaders['x-actor-id'] = actorId;
  if (actorName) requestHeaders['x-actor-name'] = actorName;
  if (facilityId) requestHeaders['x-facility-id'] = facilityId;

  const base = getApiBaseUrl().replace(/\/+$/, '');
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = endpoint.startsWith('http://') || endpoint.startsWith('https://') ? endpoint : `${base}${path}`;

  let res: Response;
  try {
    res = await fetch(url, {
      ...rest,
      headers: requestHeaders,
    });
  } catch (netErr: unknown) {
    const msg = netErr instanceof Error ? netErr.message : 'Network error';
    throw new ApiError(`Failed to connect to CareLoop backend: ${msg}`, 0, 'NETWORK_ERROR');
  }

  let json: ApiResponse<T> | null = null;
  try {
    json = await res.json();
  } catch {
    if (!res.ok) {
      throw new ApiError(`HTTP Error ${res.status}: ${res.statusText}`, res.status, 'HTTP_ERROR');
    }
    throw new ApiError('Received invalid JSON response from server.', 500, 'INVALID_JSON_RESPONSE');
  }

  if (!res.ok || !json || !json.success) {
    const errorInfo = json?.error;
    const message = errorInfo?.message || `API request failed with HTTP ${res.status}`;
    const code = errorInfo?.code || (res.status === 404 ? 'RESOURCE_NOT_FOUND' : 'API_ERROR');
    throw new ApiError(message, res.status, code, errorInfo?.details, json?.meta?.timestamp);
  }

  return json.data as T;
}

/**
 * CareLoop Client Service Object
 */
export const careLoopApi = {
  // 1. Health Check
  checkHealth: (): Promise<HealthStatus> => apiFetch<HealthStatus>('/health'),

  // 2. Facilities
  getFacilities: (): Promise<Facility[]> => apiFetch<Facility[]>('/facilities'),
  getFacilityById: (id: string): Promise<Facility> => apiFetch<Facility>(`/facilities/${id}`),
  matchFacilities: (criteria: SmartMatchCriteria | { department: string; emergency?: boolean }): Promise<MatchedFacilityResult[]> => {
    const params = new URLSearchParams();
    if (criteria.department) params.append('department', criteria.department);
    if (criteria.emergency !== undefined) params.append('emergency', String(criteria.emergency));
    if ('maxDistanceKm' in criteria && criteria.maxDistanceKm !== undefined) {
      params.append('maxDistanceKm', String(criteria.maxDistanceKm));
    }
    if ('requireIcu' in criteria && criteria.requireIcu !== undefined) {
      params.append('requireIcu', String(criteria.requireIcu));
    }
    const qs = params.toString();
    return apiFetch<MatchedFacilityResult[]>(`/facilities/match${qs ? `?${qs}` : ''}`);
  },
  updateFacilityCapacity: (id: string, updates: Partial<Facility>): Promise<Facility> =>
    apiFetch<Facility>(`/facilities/${id}/capacity`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),

  // 3. Patients
  getPatients: (): Promise<Patient[]> => apiFetch<Patient[]>('/patients'),
  getPatientById: (id: string): Promise<Patient> => apiFetch<Patient>(`/patients/${id}`),

  // 4. Referrals Queries
  getReferrals: (filters?: ReferralFilterOptions): Promise<Referral[]> => {
    const query = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined) query.append(k, String(v));
      });
    }
    const qs = query.toString();
    return apiFetch<Referral[]>(`/referrals${qs ? `?${qs}` : ''}`);
  },
  getReferralById: (id: string): Promise<Referral> => apiFetch<Referral>(`/referrals/${id}`),

  // 5. Referral Lifecycle Actions
  createReferral: (
    payload: CreateReferralPayload,
    actor?: { role?: UserRole; actorId?: string; actorName?: string }
  ): Promise<Referral> =>
    apiFetch<Referral>('/referrals', {
      method: 'POST',
      body: JSON.stringify(payload),
      actorRole: actor?.role || 'health_worker',
      actorId: actor?.actorId,
      actorName: actor?.actorName,
    }),

  acceptSlot: (
    id: string,
    payload: AcceptSlotPayload,
    facilityId?: string,
    doctorName?: string
  ): Promise<Referral> =>
    apiFetch<Referral>(`/referrals/${id}/accept`, {
      method: 'POST',
      body: JSON.stringify(payload),
      actorRole: 'facility',
      facilityId,
      actorName: doctorName,
    }),

  proposeAlternativeSlot: (
    id: string,
    payload: ProposeSlotPayload,
    facilityId?: string
  ): Promise<Referral> =>
    apiFetch<Referral>(`/referrals/${id}/propose-slot`, {
      method: 'POST',
      body: JSON.stringify(payload),
      actorRole: 'facility',
      facilityId,
    }),

  cannotProceed: (
    id: string,
    payload: CannotProceedPayload,
    facilityId?: string
  ): Promise<Referral> =>
    apiFetch<Referral>(`/referrals/${id}/cannot-proceed`, {
      method: 'POST',
      body: JSON.stringify(payload),
      actorRole: 'facility',
      facilityId,
    }),

  markArrived: (
    id: string,
    payload: ArrivePayload = {},
    facilityId?: string
  ): Promise<Referral> =>
    apiFetch<Referral>(`/referrals/${id}/arrive`, {
      method: 'POST',
      body: JSON.stringify(payload),
      actorRole: 'facility',
      facilityId,
    }),

  startService: (
    id: string,
    payload: StartServicePayload,
    facilityId?: string
  ): Promise<Referral> =>
    apiFetch<Referral>(`/referrals/${id}/start-service`, {
      method: 'POST',
      body: JSON.stringify(payload),
      actorRole: 'facility',
      facilityId,
      actorName: payload.doctorName,
    }),

  completeService: (
    id: string,
    payload: CompleteServicePayload,
    facilityId?: string
  ): Promise<Referral> =>
    apiFetch<Referral>(`/referrals/${id}/complete`, {
      method: 'POST',
      body: JSON.stringify(payload),
      actorRole: 'facility',
      facilityId,
      actorName: payload.doctorName,
    }),

  rerouteReferral: (
    id: string,
    payload: ReroutePayload,
    actorWorkerName?: string
  ): Promise<Referral> =>
    apiFetch<Referral>(`/referrals/${id}/reroute`, {
      method: 'POST',
      body: JSON.stringify(payload),
      actorRole: 'health_worker',
      actorName: actorWorkerName,
    }),
};
