/**
 * CareLoop Canonical Backend Type Definitions
 * Preserves exact alignment with CareLoop Domain Model
 */

// 1. Roles
export type UserRole = 'patient' | 'health_worker' | 'facility' | 'admin';

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: UserRole;
  createdAt: string;
}

// 2. Health Worker Cadre
export type HealthWorkerCadre = 'ASHA' | 'ANM' | 'CHO' | 'MO';

export interface HealthWorker extends User {
  role: 'health_worker';
  workerId: string;
  cadre: HealthWorkerCadre;
  assignedVillage: string;
  assignedSubCenter: string;
  district: string;
  state: string;
  activeReferralsCount: number;
}

// 3. Patient
export type RegistrationStatus = 'registered' | 'unregistered_emergency';
export type Gender = 'male' | 'female' | 'other';

export interface PatientVitals {
  bpSystolic?: number;
  bpDiastolic?: number;
  pulseRate?: number;
  spO2?: number;
  temperature?: number;
  recordedAt: string;
}

export interface Patient {
  id: string;
  abhaId?: string; // Ayushman Bharat Health Account (Demo)
  fullName: string;
  age: number;
  gender: Gender;
  phone?: string;
  relativePhone?: string;
  village: string;
  subDistrict: string;
  district: string;
  state: string;
  registrationStatus: RegistrationStatus;
  bloodGroup?: string;
  preExistingConditions?: string[];
  allergies?: string[];
  latestVitals?: PatientVitals;
  createdAt: string;
}

// 4. Facility and Services
export type FacilityType = 
  | 'Sub-Center'
  | 'Primary Health Centre (PHC)'
  | 'Community Health Centre (CHC)'
  | 'District Hospital (DH)'
  | 'Medical College / Tertiary';

export interface FacilityService {
  id: string;
  name: string;
  specialistAvailable: boolean;
  activeDoctorName?: string;
  currentQueueLength: number;
  estimatedWaitMinutes: number;
}

export interface Facility {
  id: string;
  name: string;
  code: string;
  type: FacilityType;
  block: string;
  district: string;
  state: string;
  distanceKm?: number;
  contactNumber: string;
  emergencyAvailable24x7: boolean;
  totalBeds: number;
  availableBeds: number;
  icuBedsAvailable: number;
  ambulanceAvailable: boolean;
  services: FacilityService[];
  latitude?: number;
  longitude?: number;
}

// 5. Referral System
export type ReferralType = 'NORMAL' | 'EMERGENCY';

export type ReferralPriority = 'ROUTINE' | 'URGENT' | 'CRITICAL_EMERGENCY';

// Core workflow stages: MATCH → REFER → TRACK → DETECT → RECOVER → COMPLETE
export type ReferralStatus = 
  | 'CREATED'          // Initial referral drafted
  | 'MATCHED'          // Optimal facility identified based on beds/services
  | 'REFERRED'         // Sent to target facility (Slot requested by Health Worker)
  | 'SLOT_PROPOSED'    // Facility proposed alternative slot
  | 'CONFIRMED'        // Facility confirmed requested or adjusted appointment slot
  | 'TRANSIT_DISPATCHED' // Patient dispatched/ambulance en route (Demo)
  | 'ARRIVED'          // Patient checked in at target facility
  | 'IN_CONSULTATION'  // Active clinical consultation
  | 'GAP_DETECTED'     // System or worker detected missed visit / transit failure
  | 'RECOVERED'        // Follow-up worker intervention resolved delay/rerouted
  | 'COMPLETED'        // Final care delivered, discharge slip generated
  | 'CANCELLED';

export interface ReferralSlot {
  requestedDate: string;
  requestedTimeWindow: string;
  status: 'PENDING_CONFIRMATION' | 'CONFIRMED' | 'ALTERNATIVE_PROPOSED';
  confirmedDate?: string;
  confirmedTimeWindow?: string;
  counterProposedSlot?: string;
  facilityRemarks?: string;
}

export interface ReferralEvent {
  id: string;
  referralId: string;
  timestamp: string;
  stage: ReferralStatus;
  actorRole: UserRole | 'SYSTEM';
  actorName: string;
  description: string;
  notes?: string;
}

export interface Referral {
  id: string;
  referralNumber: string;
  referralType: ReferralType;
  priority: ReferralPriority;
  status: ReferralStatus;
  
  // Patient details
  patientId?: string;
  patientName: string;
  patientAge: number;
  patientGender: Gender;
  patientPhone?: string;
  isUnregisteredEmergency: boolean;

  // Referring Worker & Origin
  referringWorkerId: string;
  referringWorkerName: string;
  referringWorkerCadre: HealthWorkerCadre;
  referringWorkerPhone: string;
  originSubCenter: string;
  village: string;

  // Target Facility & Service
  targetFacilityId: string;
  targetFacilityName: string;
  targetFacilityType: FacilityType;
  targetDepartment: string;
  
  // Clinical Information (Provided by referring worker)
  chiefComplaint: string;
  clinicalNotes: string;
  provisionalDiagnosis?: string;
  transportRequired: boolean;
  ambulanceDispatched?: boolean;

  // Slot scheduling
  slot: ReferralSlot;

  // Continuum tracking audit
  events: ReferralEvent[];
  
  // Tracking alerts
  hasGapAlert: boolean;
  gapReason?: string;
  
  createdAt: string;
  updatedAt: string;
}

// 6. Actor Context for API Requests
export interface ActorContext {
  role?: UserRole;
  actorId?: string;
  actorName?: string;
  facilityId?: string;
}
