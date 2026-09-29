import { Patient, Referral, Facility } from '@/types';
import { mockPatients as initialPatients } from './patients';
import { mockReferrals as initialReferrals } from './referrals';
import { mockFacilities as initialFacilities } from './facilities';
import { mockHealthWorker } from './users';

const PATIENTS_STORAGE_KEY = 'careloop_mock_patients';
const REFERRALS_STORAGE_KEY = 'careloop_mock_referrals';
const FACILITIES_STORAGE_KEY = 'careloop_mock_facilities';

function loadPatients(): Patient[] {
  try {
    const saved = localStorage.getItem(PATIENTS_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.warn('Could not read patients from storage', e);
  }
  return [...initialPatients];
}

function loadReferrals(): Referral[] {
  try {
    const saved = localStorage.getItem(REFERRALS_STORAGE_KEY);
    if (saved) {
      const parsed: Referral[] = JSON.parse(saved);
      const savedIds = new Set(parsed.map((r) => r.id));
      const missing = initialReferrals.filter((r) => !savedIds.has(r.id));
      return [...parsed, ...missing];
    }
  } catch (e) {
    console.warn('Could not read referrals from storage', e);
  }
  return [...initialReferrals];
}

function loadFacilities(): Facility[] {
  try {
    const saved = localStorage.getItem(FACILITIES_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.warn('Could not read facilities from storage', e);
  }
  return [...initialFacilities];
}

function savePatients(patients: Patient[]) {
  try {
    localStorage.setItem(PATIENTS_STORAGE_KEY, JSON.stringify(patients));
  } catch (e) {
    console.warn('Could not save patients to storage', e);
  }
}

function saveReferrals(referrals: Referral[]) {
  try {
    localStorage.setItem(REFERRALS_STORAGE_KEY, JSON.stringify(referrals));
  } catch (e) {
    console.warn('Could not save referrals to storage', e);
  }
}

function saveFacilities(facilities: Facility[]) {
  try {
    localStorage.setItem(FACILITIES_STORAGE_KEY, JSON.stringify(facilities));
  } catch (e) {
    console.warn('Could not save facilities to storage', e);
  }
}

let patientsCache = loadPatients();
let referralsCache = loadReferrals();
let facilitiesCache = loadFacilities();

export const CareLoopStore = {
  getPatients: (workerVillage: string = mockHealthWorker.assignedVillage): Patient[] => {
    return patientsCache.filter((p) => 
      !workerVillage || 
      p.village.toLowerCase().includes(workerVillage.toLowerCase()) || 
      p.village.toLowerCase().includes('kapurhol') || 
      p.village.toLowerCase().includes('saswad') ||
      p.village.toLowerCase().includes('shindewadi')
    );
  },

  getAllPatients: (): Patient[] => {
    return patientsCache;
  },

  getPatientById: (id: string): Patient | undefined => {
    return patientsCache.find((p) => p.id === id);
  },

  registerPatient: (patientData: Omit<Patient, 'id' | 'createdAt'>): Patient => {
    const newPatient: Patient = {
      ...patientData,
      id: `pat_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    patientsCache = [newPatient, ...patientsCache];
    savePatients(patientsCache);
    return newPatient;
  },

  getReferrals: (workerId: string = mockHealthWorker.id): Referral[] => {
    return referralsCache.filter((r) => !workerId || r.referringWorkerId === workerId);
  },

  getAllReferrals: (): Referral[] => {
    return referralsCache;
  },

  getFacilityReferrals: (facilityId: string): Referral[] => {
    return referralsCache.filter((r) => r.targetFacilityId === facilityId);
  },

  getReferralById: (id: string): Referral | undefined => {
    return referralsCache.find((r) => r.id === id);
  },

  getAtRiskReferrals: (workerId: string = mockHealthWorker.id): Referral[] => {
    return referralsCache.filter((r) => 
      (!workerId || r.referringWorkerId === workerId) && 
      (r.hasGapAlert || r.slot.status === 'ALTERNATIVE_PROPOSED' || r.status === 'GAP_DETECTED' || r.status === 'CANCELLED')
    );
  },

  createReferral: (referralData: Omit<Referral, 'id' | 'referralNumber' | 'createdAt' | 'updatedAt' | 'events'>): Referral => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const id = `ref_${Date.now()}`;
    const referralNumber = `REF-MH-PUN-2026-${randomNum}`;
    const now = new Date().toISOString();

    const newReferral: Referral = {
      ...referralData,
      id,
      referralNumber,
      createdAt: now,
      updatedAt: now,
      events: [
        {
          id: `evt_${Date.now()}_1`,
          referralId: id,
          timestamp: now,
          stage: 'CREATED',
          actorRole: 'health_worker',
          actorName: referralData.referringWorkerName,
          description: `${referralData.referralType} referral drafted and issued by ${referralData.referringWorkerCadre}.`,
        },
        {
          id: `evt_${Date.now()}_2`,
          referralId: id,
          timestamp: now,
          stage: 'MATCHED',
          actorRole: 'SYSTEM',
          actorName: 'CareLoop Smart Match',
          description: `Matched with ${referralData.targetFacilityName} for ${referralData.targetDepartment}.`,
        },
        {
          id: `evt_${Date.now()}_3`,
          referralId: id,
          timestamp: now,
          stage: 'REFERRED',
          actorRole: 'health_worker',
          actorName: referralData.referringWorkerName,
          description: `Requested Slot: ${referralData.slot.requestedDate} (${referralData.slot.requestedTimeWindow}). Awaiting facility response.`,
        },
      ],
    };

    referralsCache = [newReferral, ...referralsCache];
    saveReferrals(referralsCache);
    return newReferral;
  },

  acceptReferralSlot: (
    referralId: string,
    confirmedDate?: string,
    confirmedTimeWindow?: string,
    facilityRemarks?: string,
    doctorName?: string
  ): Referral | null => {
    const referral = referralsCache.find((r) => r.id === referralId);
    if (!referral) return null;

    // Transition Guard: Only unaccepted requested slots or counter-proposed slots can be accepted
    if (referral.status !== 'REFERRED' && referral.status !== 'SLOT_PROPOSED') {
      return null;
    }

    const now = new Date().toISOString();
    const dateToConfirm = confirmedDate || referral.slot.requestedDate;
    const timeToConfirm = confirmedTimeWindow || referral.slot.requestedTimeWindow;

    referral.status = 'CONFIRMED';
    referral.slot = {
      ...referral.slot,
      status: 'CONFIRMED',
      confirmedDate: dateToConfirm,
      confirmedTimeWindow: timeToConfirm,
      facilityRemarks: facilityRemarks || 'Appointment slot confirmed by receiving facility triage desk.',
    };
    referral.updatedAt = now;

    referral.events.push({
      id: `evt_${Date.now()}_accept`,
      referralId,
      timestamp: now,
      stage: 'CONFIRMED',
      actorRole: 'facility',
      actorName: doctorName || 'Facility Triage Desk',
      description: `Appointment slot confirmed by receiving facility for ${dateToConfirm} (${timeToConfirm}).`,
      notes: facilityRemarks,
    });

    saveReferrals(referralsCache);
    return referral;
  },

  proposeAlternativeSlot: (
    referralId: string,
    counterSlot: string,
    reason: string,
    doctorName?: string
  ): Referral | null => {
    const referral = referralsCache.find((r) => r.id === referralId);
    if (!referral) return null;

    // Transition Guard: Can only propose alternative for pending referred requests
    if (referral.status !== 'REFERRED') {
      return null;
    }

    const now = new Date().toISOString();

    referral.status = 'SLOT_PROPOSED';
    referral.slot = {
      ...referral.slot,
      status: 'ALTERNATIVE_PROPOSED',
      counterProposedSlot: counterSlot,
      facilityRemarks: reason,
    };
    referral.updatedAt = now;

    referral.events.push({
      id: `evt_${Date.now()}_propslot`,
      referralId,
      timestamp: now,
      stage: 'SLOT_PROPOSED',
      actorRole: 'facility',
      actorName: doctorName || 'Facility Triage Desk',
      description: `Facility proposed alternative slot: ${counterSlot}. Reason: ${reason}`,
      notes: reason,
    });

    saveReferrals(referralsCache);
    return referral;
  },

  rejectReferral: (
    referralId: string,
    reason: string,
    doctorName?: string
  ): Referral | null => {
    const referral = referralsCache.find((r) => r.id === referralId);
    if (!referral) return null;

    // Transition Guard: Can only decline pre-service triage referrals
    if (referral.status !== 'REFERRED' && referral.status !== 'SLOT_PROPOSED') {
      return null;
    }

    const now = new Date().toISOString();

    // Set operational exception: GAP_DETECTED + hasGapAlert (Care Recovery Radar trigger)
    referral.status = 'GAP_DETECTED';
    referral.hasGapAlert = true;
    referral.gapReason = `Facility cannot proceed: ${reason}`;
    referral.updatedAt = now;

    referral.events.push({
      id: `evt_${Date.now()}_reject`,
      referralId,
      timestamp: now,
      stage: 'GAP_DETECTED',
      actorRole: 'facility',
      actorName: doctorName || 'Facility Triage Desk',
      description: `Facility unable to proceed with requested slot/service. Reason: ${reason}. Operational exception logged for Health Worker Care Recovery Radar.`,
      notes: reason,
    });

    saveReferrals(referralsCache);
    return referral;
  },

  markPatientArrived: (
    referralId: string,
    remarks?: string
  ): Referral | null => {
    const referral = referralsCache.find((r) => r.id === referralId);
    if (!referral) return null;

    // Transition Guard: Patient can only arrive after acceptance/confirmation
    if (referral.status !== 'CONFIRMED' && referral.status !== 'TRANSIT_DISPATCHED') {
      return null;
    }

    const now = new Date().toISOString();

    referral.status = 'ARRIVED';
    referral.updatedAt = now;

    referral.events.push({
      id: `evt_${Date.now()}_arrived`,
      referralId,
      timestamp: now,
      stage: 'ARRIVED',
      actorRole: 'facility',
      actorName: 'Facility Registration Desk',
      description: remarks || 'Patient arrived and checked in at facility triage counter.',
    });

    saveReferrals(referralsCache);
    return referral;
  },

  startReferralService: (
    referralId: string,
    doctorName?: string,
    notes?: string
  ): Referral | null => {
    const referral = referralsCache.find((r) => r.id === referralId);
    if (!referral) return null;

    // Transition Guard: Service can only begin once patient has checked in (ARRIVED)
    if (referral.status !== 'ARRIVED') {
      return null;
    }

    const now = new Date().toISOString();

    referral.status = 'IN_CONSULTATION';
    referral.updatedAt = now;

    referral.events.push({
      id: `evt_${Date.now()}_startsvc`,
      referralId,
      timestamp: now,
      stage: 'IN_CONSULTATION',
      actorRole: 'facility',
      actorName: doctorName || 'Duty Specialist',
      description: notes || 'Clinical consultation / specialist service started.',
      notes,
    });

    saveReferrals(referralsCache);
    return referral;
  },

  completeReferralService: (
    referralId: string,
    doctorName?: string,
    operationalNotes?: string
  ): Referral | null => {
    const referral = referralsCache.find((r) => r.id === referralId);
    if (!referral) return null;

    // Transition Guard: Service completion requires active consultation
    if (referral.status !== 'IN_CONSULTATION') {
      return null;
    }

    const now = new Date().toISOString();

    referral.status = 'COMPLETED';
    referral.hasGapAlert = false;
    referral.updatedAt = now;

    referral.events.push({
      id: `evt_${Date.now()}_complete`,
      referralId,
      timestamp: now,
      stage: 'COMPLETED',
      actorRole: 'facility',
      actorName: doctorName || 'Duty Specialist',
      description: operationalNotes || 'Specialist care coordination delivered. Discharge slip recorded.',
      notes: operationalNotes,
    });

    saveReferrals(referralsCache);
    return referral;
  },

  rerouteReferral: (
    referralId: string, 
    newFacility: Facility, 
    newDepartment: string, 
    reason: string
  ): Referral | null => {
    const referral = referralsCache.find((r) => r.id === referralId);
    if (!referral) return null;

    const now = new Date().toISOString();
    const oldFacilityName = referral.targetFacilityName;

    referral.targetFacilityId = newFacility.id;
    referral.targetFacilityName = newFacility.name;
    referral.targetFacilityType = newFacility.type;
    referral.targetDepartment = newDepartment;
    referral.status = 'REFERRED';
    referral.hasGapAlert = false;
    referral.gapReason = undefined;
    referral.slot = {
      requestedDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      requestedTimeWindow: '10:00 - 12:00 PM',
      status: 'PENDING_CONFIRMATION',
      facilityRemarks: `Rerouted from ${oldFacilityName}. Reason: ${reason}`,
    };
    referral.updatedAt = now;

    referral.events.push({
      id: `evt_${Date.now()}_reroute`,
      referralId,
      timestamp: now,
      stage: 'RECOVERED',
      actorRole: 'health_worker',
      actorName: `${mockHealthWorker.name} (${mockHealthWorker.cadre})`,
      description: `Rerouted referral to ${newFacility.name}. Reason: ${reason}. Awaiting facility confirmation.`,
      notes: reason,
    });

    saveReferrals(referralsCache);
    return referral;
  },

  getFacilities: (): Facility[] => {
    return facilitiesCache;
  },

  getFacilityById: (id: string): Facility | undefined => {
    return facilitiesCache.find((f) => f.id === id);
  },

  updateFacilityCapacity: (
    facilityId: string,
    updates: Partial<Facility>
  ): Facility | null => {
    const index = facilitiesCache.findIndex((f) => f.id === facilityId);
    if (index === -1) return null;

    facilitiesCache[index] = {
      ...facilitiesCache[index],
      ...updates,
    };
    saveFacilities(facilitiesCache);
    return facilitiesCache[index];
  },
};
