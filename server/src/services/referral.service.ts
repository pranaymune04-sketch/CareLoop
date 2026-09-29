import { 
  Referral, 
  ReferralEvent, 
  ActorContext 
} from '../types/index';
import { 
  CreateReferralPayload, 
  AcceptSlotPayload, 
  ProposeSlotPayload, 
  CannotProceedPayload, 
  ArrivePayload, 
  StartServicePayload, 
  CompleteServicePayload, 
  ReroutePayload 
} from '../types/api';
import { IReferralRepository, ReferralFilter } from '../repositories/referral.repository';
import { IFacilityRepository } from '../repositories/facility.repository';
import { IPatientRepository } from '../repositories/patient.repository';

export class BusinessRuleError extends Error {
  public statusCode: number;
  public code: string;

  constructor(message: string, statusCode: number = 400, code: string = 'BUSINESS_RULE_VIOLATION') {
    super(message);
    this.name = 'BusinessRuleError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

export class ReferralService {
  constructor(
    private referralRepo: IReferralRepository,
    private facilityRepo: IFacilityRepository,
    private patientRepo?: IPatientRepository
  ) {}

  async getReferralById(id: string): Promise<Referral> {
    const referral = await this.referralRepo.findById(id);
    if (!referral) {
      throw new BusinessRuleError(`Referral with ID "${id}" not found.`, 404, 'REFERRAL_NOT_FOUND');
    }
    return referral;
  }

  async getAllReferrals(filter?: ReferralFilter): Promise<Referral[]> {
    return this.referralRepo.findAll(filter);
  }

  async getAtRiskReferrals(workerId?: string): Promise<Referral[]> {
    return this.referralRepo.findAll({
      referringWorkerId: workerId,
      atRiskOnly: true,
    });
  }

  async createReferral(payload: CreateReferralPayload, actor?: ActorContext): Promise<Referral> {
    // 1. Validate required fields
    if (!payload.referralType || (payload.referralType !== 'NORMAL' && payload.referralType !== 'EMERGENCY')) {
      throw new BusinessRuleError('Valid referralType ("NORMAL" | "EMERGENCY") is required.', 400, 'INVALID_REFERRAL_TYPE');
    }

    if (!payload.priority || (payload.priority !== 'ROUTINE' && payload.priority !== 'URGENT' && payload.priority !== 'CRITICAL_EMERGENCY')) {
      throw new BusinessRuleError('Valid priority ("ROUTINE" | "URGENT" | "CRITICAL_EMERGENCY") is required.', 400, 'INVALID_PRIORITY');
    }

    if (!payload.patientName || !payload.patientName.trim()) {
      throw new BusinessRuleError('Patient name is required for referral creation.', 400, 'MISSING_PATIENT_NAME');
    }

    if (typeof payload.patientAge !== 'number' || payload.patientAge < 0 || payload.patientAge > 130) {
      throw new BusinessRuleError('Valid patient age (number between 0 and 130) is required.', 400, 'INVALID_PATIENT_AGE');
    }

    if (!payload.patientGender || !['male', 'female', 'other'].includes(payload.patientGender)) {
      throw new BusinessRuleError('Valid patient gender ("male" | "female" | "other") is required.', 400, 'INVALID_PATIENT_GENDER');
    }

    if (!payload.referringWorkerId || !payload.referringWorkerId.trim()) {
      throw new BusinessRuleError('Referring worker ID is required.', 400, 'MISSING_WORKER_ID');
    }

    if (!payload.targetDepartment || !payload.targetDepartment.trim()) {
      throw new BusinessRuleError('Target clinical department is required.', 400, 'MISSING_TARGET_DEPARTMENT');
    }

    if (!payload.slot || !payload.slot.requestedDate || !payload.slot.requestedTimeWindow) {
      throw new BusinessRuleError('Requested appointment date and time window are required in slot.', 400, 'MISSING_SLOT_DETAILS');
    }

    // 2. Validate chief complaint
    if (!payload.chiefComplaint || !payload.chiefComplaint.trim()) {
      throw new BusinessRuleError('Chief complaint is required for referral creation.', 400, 'MISSING_CHIEF_COMPLAINT');
    }

    // 3. Validate target facility exists
    const facility = await this.facilityRepo.findById(payload.targetFacilityId);
    if (!facility) {
      throw new BusinessRuleError(
        `Target facility with ID "${payload.targetFacilityId}" does not exist in the CareLoop network.`,
        404,
        'FACILITY_NOT_FOUND'
      );
    }

    // 4. Validate patient reference if provided
    if (payload.patientId && this.patientRepo) {
      const patient = await this.patientRepo.findById(payload.patientId);
      if (!patient) {
        throw new BusinessRuleError(
          `Referenced patient with ID "${payload.patientId}" does not exist in the CareLoop registry.`,
          404,
          'PATIENT_NOT_FOUND'
        );
      }
    }

    const now = new Date().toISOString();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const id = `ref_${Date.now()}`;
    const referralNumber = `REF-MH-PUN-2026-${randomNum}`;

    const newReferral: Referral = {
      id,
      referralNumber,
      referralType: payload.referralType,
      priority: payload.priority,
      status: 'REFERRED',
      patientId: payload.patientId,
      patientName: payload.patientName,
      patientAge: payload.patientAge,
      patientGender: payload.patientGender,
      patientPhone: payload.patientPhone,
      isUnregisteredEmergency: Boolean(payload.isUnregisteredEmergency),
      referringWorkerId: payload.referringWorkerId,
      referringWorkerName: payload.referringWorkerName,
      referringWorkerCadre: payload.referringWorkerCadre,
      referringWorkerPhone: payload.referringWorkerPhone,
      originSubCenter: payload.originSubCenter,
      village: payload.village,
      targetFacilityId: facility.id,
      targetFacilityName: facility.name,
      targetFacilityType: facility.type,
      targetDepartment: payload.targetDepartment,
      chiefComplaint: payload.chiefComplaint.trim(),
      clinicalNotes: payload.clinicalNotes?.trim() || 'Recorded during field worker consultation.',
      provisionalDiagnosis: payload.provisionalDiagnosis,
      transportRequired: Boolean(payload.transportRequired),
      slot: {
        requestedDate: payload.slot.requestedDate,
        requestedTimeWindow: payload.slot.requestedTimeWindow,
        status: 'PENDING_CONFIRMATION',
        facilityRemarks: payload.slot.facilityRemarks || 'Slot request transmitted. Awaiting receiving facility confirmation.',
      },
      hasGapAlert: false,
      createdAt: now,
      updatedAt: now,
      events: [
        {
          id: `evt_${Date.now()}_1`,
          referralId: id,
          timestamp: now,
          stage: 'CREATED',
          actorRole: actor?.role || 'health_worker',
          actorName: actor?.actorName || payload.referringWorkerName,
          description: `${payload.referralType} referral created by ${payload.referringWorkerCadre}.`,
        },
        {
          id: `evt_${Date.now()}_2`,
          referralId: id,
          timestamp: now,
          stage: 'MATCHED',
          actorRole: 'SYSTEM',
          actorName: 'CareLoop Smart Match',
          description: `Matched with ${facility.name} for ${payload.targetDepartment}.`,
        },
        {
          id: `evt_${Date.now()}_3`,
          referralId: id,
          timestamp: now,
          stage: 'REFERRED',
          actorRole: actor?.role || 'health_worker',
          actorName: actor?.actorName || payload.referringWorkerName,
          description: `Requested Slot: ${payload.slot.requestedDate} (${payload.slot.requestedTimeWindow}). Awaiting facility confirmation.`,
        },
      ],
    };

    return this.referralRepo.create(newReferral);
  }

  async acceptSlot(referralId: string, payload: AcceptSlotPayload, actor?: ActorContext): Promise<Referral> {
    const referral = await this.getReferralById(referralId);

    // Guard 1: Facility Scope Check
    this.assertFacilityScope(referral, actor);

    // Guard 2: State Transition Check
    if (referral.status !== 'REFERRED' && referral.status !== 'SLOT_PROPOSED') {
      throw new BusinessRuleError(
        `Cannot accept slot for referral in "${referral.status}" status. Only pending or slot-proposed referrals can be confirmed.`,
        409,
        'INVALID_STATE_TRANSITION'
      );
    }

    const now = new Date().toISOString();
    const dateToConfirm = payload.confirmedDate || referral.slot.requestedDate;
    const timeToConfirm = payload.confirmedTimeWindow || referral.slot.requestedTimeWindow;
    const doctor = payload.doctorName || actor?.actorName || 'Facility Triage Desk';

    const event: ReferralEvent = {
      id: `evt_${Date.now()}_accept`,
      referralId,
      timestamp: now,
      stage: 'CONFIRMED',
      actorRole: 'facility',
      actorName: doctor,
      description: `Appointment slot confirmed by receiving facility for ${dateToConfirm} (${timeToConfirm}).`,
      notes: payload.facilityRemarks,
    };

    const updated = await this.referralRepo.update(referralId, {
      status: 'CONFIRMED',
      slot: {
        ...referral.slot,
        status: 'CONFIRMED',
        confirmedDate: dateToConfirm,
        confirmedTimeWindow: timeToConfirm,
        facilityRemarks: payload.facilityRemarks || 'Appointment slot confirmed by receiving facility triage desk.',
      },
    });

    if (!updated) throw new BusinessRuleError('Failed to update referral.', 500);

    await this.referralRepo.appendEvent(referralId, event);
    return this.getReferralById(referralId);
  }

  async proposeAlternativeSlot(referralId: string, payload: ProposeSlotPayload, actor?: ActorContext): Promise<Referral> {
    const referral = await this.getReferralById(referralId);

    // Guard 1: Facility Scope Check
    this.assertFacilityScope(referral, actor);

    // Guard 2: State Transition Check
    if (referral.status !== 'REFERRED') {
      throw new BusinessRuleError(
        `Cannot propose alternative slot for referral in "${referral.status}" status. Only initial REFERRED requests can receive alternative slot proposals.`,
        409,
        'INVALID_STATE_TRANSITION'
      );
    }

    if (!payload.counterSlot || !payload.counterSlot.trim()) {
      throw new BusinessRuleError('Counter slot description is required.', 400, 'MISSING_COUNTER_SLOT');
    }

    if (!payload.reason || !payload.reason.trim()) {
      throw new BusinessRuleError('Operational reason for proposing alternative slot is required.', 400, 'MISSING_REASON');
    }

    const now = new Date().toISOString();
    const doctor = payload.doctorName || actor?.actorName || 'Facility Triage Desk';

    const event: ReferralEvent = {
      id: `evt_${Date.now()}_propslot`,
      referralId,
      timestamp: now,
      stage: 'SLOT_PROPOSED',
      actorRole: 'facility',
      actorName: doctor,
      description: `Facility proposed alternative slot: ${payload.counterSlot}. Reason: ${payload.reason}`,
      notes: payload.reason,
    };

    // Does NOT auto-confirm; transitions to SLOT_PROPOSED
    await this.referralRepo.update(referralId, {
      status: 'SLOT_PROPOSED',
      slot: {
        ...referral.slot,
        status: 'ALTERNATIVE_PROPOSED',
        counterProposedSlot: payload.counterSlot,
        facilityRemarks: payload.reason,
      },
    });

    await this.referralRepo.appendEvent(referralId, event);
    return this.getReferralById(referralId);
  }

  async cannotProceed(referralId: string, payload: CannotProceedPayload, actor?: ActorContext): Promise<Referral> {
    const referral = await this.getReferralById(referralId);

    // Guard 1: Facility Scope Check
    this.assertFacilityScope(referral, actor);

    // Guard 2: State Transition Check
    if (referral.status !== 'REFERRED' && referral.status !== 'SLOT_PROPOSED') {
      throw new BusinessRuleError(
        `Cannot record non-acceptance for referral in "${referral.status}" status. Only pre-service triage referrals can be declined.`,
        409,
        'INVALID_STATE_TRANSITION'
      );
    }

    if (!payload.reason || !payload.reason.trim()) {
      throw new BusinessRuleError('An operational reason is strictly required when a facility cannot proceed.', 400, 'MISSING_REASON');
    }

    const now = new Date().toISOString();
    const doctor = payload.doctorName || actor?.actorName || 'Facility Triage Desk';

    const event: ReferralEvent = {
      id: `evt_${Date.now()}_reject`,
      referralId,
      timestamp: now,
      stage: 'GAP_DETECTED',
      actorRole: 'facility',
      actorName: doctor,
      description: `Facility unable to proceed. Reason: ${payload.reason}. Operational exception logged for Care Recovery Radar.`,
      notes: payload.reason,
    };

    // Transitions to GAP_DETECTED; sets hasGapAlert = true; does NOT cancel care permanently; does NOT auto-reroute
    await this.referralRepo.update(referralId, {
      status: 'GAP_DETECTED',
      hasGapAlert: true,
      gapReason: `Facility cannot proceed: ${payload.reason}`,
    });

    await this.referralRepo.appendEvent(referralId, event);
    return this.getReferralById(referralId);
  }

  async recordPatientArrival(referralId: string, payload: ArrivePayload, actor?: ActorContext): Promise<Referral> {
    const referral = await this.getReferralById(referralId);

    // Guard 1: Facility Scope Check
    this.assertFacilityScope(referral, actor);

    // Guard 2: State Transition Check
    if (referral.status !== 'CONFIRMED' && referral.status !== 'TRANSIT_DISPATCHED') {
      throw new BusinessRuleError(
        `Patient cannot be marked arrived for referral in "${referral.status}" status. Appointment must be CONFIRMED first.`,
        409,
        'INVALID_STATE_TRANSITION'
      );
    }

    const now = new Date().toISOString();

    const event: ReferralEvent = {
      id: `evt_${Date.now()}_arrived`,
      referralId,
      timestamp: now,
      stage: 'ARRIVED',
      actorRole: 'facility',
      actorName: actor?.actorName || 'Facility Registration Desk',
      description: payload.remarks || 'Patient arrived and checked in at facility triage counter.',
    };

    await this.referralRepo.update(referralId, {
      status: 'ARRIVED',
    });

    await this.referralRepo.appendEvent(referralId, event);
    return this.getReferralById(referralId);
  }

  async startService(referralId: string, payload: StartServicePayload, actor?: ActorContext): Promise<Referral> {
    const referral = await this.getReferralById(referralId);

    // Guard 1: Facility Scope Check
    this.assertFacilityScope(referral, actor);

    // Guard 2: State Transition Check
    if (referral.status !== 'ARRIVED') {
      throw new BusinessRuleError(
        `Clinical service cannot begin for referral in "${referral.status}" status. Patient must be checked in (ARRIVED) before consultation can start.`,
        409,
        'INVALID_STATE_TRANSITION'
      );
    }

    if (!payload.doctorName || !payload.doctorName.trim()) {
      throw new BusinessRuleError('Treating doctor / specialist name is required to start service.', 400, 'MISSING_DOCTOR_NAME');
    }

    const now = new Date().toISOString();

    const event: ReferralEvent = {
      id: `evt_${Date.now()}_startsvc`,
      referralId,
      timestamp: now,
      stage: 'IN_CONSULTATION',
      actorRole: 'facility',
      actorName: payload.doctorName,
      description: payload.notes || 'Clinical consultation / specialist service started.',
      notes: payload.notes,
    };

    await this.referralRepo.update(referralId, {
      status: 'IN_CONSULTATION',
    });

    await this.referralRepo.appendEvent(referralId, event);
    return this.getReferralById(referralId);
  }

  async completeService(referralId: string, payload: CompleteServicePayload, actor?: ActorContext): Promise<Referral> {
    const referral = await this.getReferralById(referralId);

    // Guard 1: Facility Scope Check
    this.assertFacilityScope(referral, actor);

    // Guard 2: State Transition Check
    if (referral.status !== 'IN_CONSULTATION') {
      throw new BusinessRuleError(
        `Referral care cannot be completed for referral in "${referral.status}" status. Active clinical consultation (IN_CONSULTATION) must be underway.`,
        409,
        'INVALID_STATE_TRANSITION'
      );
    }

    if (!payload.doctorName || !payload.doctorName.trim()) {
      throw new BusinessRuleError('Treating doctor / specialist name is required to complete service.', 400, 'MISSING_DOCTOR_NAME');
    }

    const now = new Date().toISOString();

    const event: ReferralEvent = {
      id: `evt_${Date.now()}_complete`,
      referralId,
      timestamp: now,
      stage: 'COMPLETED',
      actorRole: 'facility',
      actorName: payload.doctorName,
      description: payload.operationalNotes || 'Specialist care coordination delivered. Discharge recorded.',
      notes: payload.operationalNotes,
    };

    await this.referralRepo.update(referralId, {
      status: 'COMPLETED',
      hasGapAlert: false,
    });

    await this.referralRepo.appendEvent(referralId, event);
    return this.getReferralById(referralId);
  }

  async rerouteReferral(referralId: string, payload: ReroutePayload, actor?: ActorContext): Promise<Referral> {
    const referral = await this.getReferralById(referralId);

    // Guard 1: Referral must be in a recoverable exception state
    if (referral.status === 'COMPLETED') {
      throw new BusinessRuleError('Cannot reroute an already completed referral.', 409, 'REFERRAL_ALREADY_COMPLETED');
    }

    const isRecoverable = 
      referral.hasGapAlert || 
      referral.status === 'GAP_DETECTED' || 
      referral.status === 'CANCELLED' || 
      referral.slot.status === 'ALTERNATIVE_PROPOSED' ||
      referral.status === 'REFERRED';

    if (!isRecoverable) {
      throw new BusinessRuleError(
        `Referral in "${referral.status}" status without an active exception flag cannot be rerouted.`,
        409,
        'NOT_RECOVERABLE'
      );
    }

    // Guard 2: Currently failing facility MUST NOT be selectable as the new target
    if (payload.newFacilityId === referral.targetFacilityId) {
      throw new BusinessRuleError(
        `Cannot reroute to the same failing facility (${referral.targetFacilityName}). An alternative facility must be selected.`,
        400,
        'CANNOT_REROUTE_TO_SAME_FACILITY'
      );
    }

    // Guard 3: Validate alternative facility exists
    const newFacility = await this.facilityRepo.findById(payload.newFacilityId);
    if (!newFacility) {
      throw new BusinessRuleError(
        `Alternative facility with ID "${payload.newFacilityId}" does not exist in the CareLoop network.`,
        404,
        'FACILITY_NOT_FOUND'
      );
    }

    if (!payload.reason || !payload.reason.trim()) {
      throw new BusinessRuleError('Operational reason for rerouting is required.', 400, 'MISSING_REROUTE_REASON');
    }

    const now = new Date().toISOString();
    const oldFacilityName = referral.targetFacilityName;
    const requestedDate = payload.requestedDate || new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const requestedTimeWindow = payload.requestedTimeWindow || '10:00 - 12:00 PM';

    const event: ReferralEvent = {
      id: `evt_${Date.now()}_reroute`,
      referralId,
      timestamp: now,
      stage: 'RECOVERED',
      actorRole: actor?.role || 'health_worker',
      actorName: actor?.actorName || 'Assigned Health Worker',
      description: `Rerouted referral from ${oldFacilityName} to ${newFacility.name}. Reason: ${payload.reason}. Awaiting new facility confirmation.`,
      notes: payload.reason,
    };

    // Updates target facility; resets status to REFERRED; resets slot to PENDING_CONFIRMATION; clears gap alert; appends RECOVERED event
    await this.referralRepo.update(referralId, {
      targetFacilityId: newFacility.id,
      targetFacilityName: newFacility.name,
      targetFacilityType: newFacility.type,
      targetDepartment: payload.newDepartment,
      status: 'REFERRED',
      hasGapAlert: false,
      gapReason: undefined,
      slot: {
        requestedDate,
        requestedTimeWindow,
        status: 'PENDING_CONFIRMATION',
        facilityRemarks: `Rerouted from ${oldFacilityName}. Reason: ${payload.reason}`,
      },
    });

    await this.referralRepo.appendEvent(referralId, event);
    return this.getReferralById(referralId);
  }

  private assertFacilityScope(referral: Referral, actor?: ActorContext): void {
    if (actor?.role === 'facility' && actor.facilityId) {
      if (referral.targetFacilityId !== actor.facilityId) {
        throw new BusinessRuleError(
          `Facility scope violation: This referral is assigned to "${referral.targetFacilityName}" (${referral.targetFacilityId}). You cannot perform facility actions from facility "${actor.facilityId}".`,
          403,
          'FACILITY_SCOPE_VIOLATION'
        );
      }
    }
  }
}
