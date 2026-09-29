import { ReferralType, ReferralPriority, Gender, HealthWorkerCadre, FacilityType, ReferralStatus } from './index';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    timestamp: string;
    count?: number;
  };
}

export interface HealthStatus {
  service: string;
  status: string;
  uptimeSeconds: number;
  mode: string;
}

export interface ReferralFilterOptions {
  status?: ReferralStatus;
  priority?: ReferralPriority;
  referralType?: ReferralType;
  targetFacilityId?: string;
  referringWorkerId?: string;
  patientId?: string;
  atRisk?: boolean;
}

export interface CreateReferralPayload {
  referralType: ReferralType;
  priority: ReferralPriority;
  patientId?: string;
  patientName: string;
  patientAge: number;
  patientGender: Gender;
  patientPhone?: string;
  isUnregisteredEmergency?: boolean;

  referringWorkerId: string;
  referringWorkerName: string;
  referringWorkerCadre: HealthWorkerCadre;
  referringWorkerPhone: string;
  originSubCenter: string;
  village: string;

  targetFacilityId: string;
  targetFacilityName: string;
  targetFacilityType: FacilityType;
  targetDepartment: string;

  chiefComplaint: string;
  clinicalNotes?: string;
  provisionalDiagnosis?: string;
  transportRequired?: boolean;

  slot: {
    requestedDate: string;
    requestedTimeWindow: string;
    facilityRemarks?: string;
  };
}

export interface AcceptSlotPayload {
  confirmedDate?: string;
  confirmedTimeWindow?: string;
  facilityRemarks?: string;
  doctorName?: string;
}

export interface ProposeSlotPayload {
  counterSlot: string;
  reason: string;
  doctorName?: string;
}

export const CANNOT_PROCEED_REASONS = [
  'Specialist on emergency leave / not available',
  'Bed capacity fully exhausted in required ward',
  'Diagnostic equipment (USG/X-Ray) undergoing maintenance',
  'Service temporarily unavailable at this facility level',
  'Operational constraint / facility under emergency surge',
  'Department temporarily closed for sanitization',
] as const;

export type CannotProceedReason = typeof CANNOT_PROCEED_REASONS[number] | string;

export interface CannotProceedPayload {
  reason: CannotProceedReason;
  doctorName?: string;
}

export interface ArrivePayload {
  remarks?: string;
}

export interface StartServicePayload {
  doctorName: string;
  notes?: string;
}

export interface CompleteServicePayload {
  doctorName: string;
  operationalNotes?: string;
}

export interface ReroutePayload {
  newFacilityId: string;
  newDepartment: string;
  reason: string;
  requestedDate?: string;
  requestedTimeWindow?: string;
}

export interface SmartMatchCriteria {
  department: string;
  emergency?: boolean;
  maxDistanceKm?: number;
  requireIcu?: boolean;
}

export interface MatchedFacilityResult {
  facilityId: string;
  facilityName: string;
  facilityType: string;
  distanceKm?: number;
  availableBeds: number;
  icuBedsAvailable: number;
  emergencyAvailable24x7: boolean;
  ambulanceAvailable: boolean;
  specialistAvailable: boolean;
  activeDoctorName?: string;
  currentQueueLength: number;
  estimatedWaitMinutes: number;
  matchScore: number; // 0-100
  scoringFactors: {
    serviceMatch: number;
    bedAvailability: number;
    emergencyReadiness: number;
    distanceSuitability: number;
    queueFactor: number;
  };
}
