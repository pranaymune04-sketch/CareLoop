import { createApp } from '../src/app.js';
import { AddressInfo } from 'net';
import { careLoopApi, setApiBaseUrl, ApiError, apiFetch } from '../../src/api/client.js';

async function runApiClientTests() {
  console.log('=====================================================');
  console.log('  CareLoop Frontend API Client Verification Tests    ');
  console.log('=====================================================\n');

  const app = createApp();
  const server = app.listen(0);
  const port = (server.address() as AddressInfo).port;
  const baseUrl = `http://127.0.0.1:${port}/api`;

  setApiBaseUrl(baseUrl);

  let testsPassed = 0;
  let testsFailed = 0;

  async function assert(desc: string, fn: () => Promise<void>) {
    try {
      await fn();
      console.log(`[PASS] ${desc}`);
      testsPassed++;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[FAIL] ${desc}`);
      console.error(`       Error: ${msg}\n`);
      testsFailed++;
    }
  }

  try {
    // 1. Health check via careLoopApi.checkHealth()
    await assert('careLoopApi.checkHealth() returns 200 with status "ok"', async () => {
      const health = await careLoopApi.checkHealth();
      if (!health || health.status !== 'ok') {
        throw new Error(`Unexpected health payload: ${JSON.stringify(health)}`);
      }
      if (typeof health.uptimeSeconds !== 'number') {
        throw new Error('Missing uptimeSeconds in health status');
      }
    });

    // 2. Successful facility retrieval via careLoopApi.getFacilities()
    await assert('careLoopApi.getFacilities() retrieves facility network', async () => {
      const facilities = await careLoopApi.getFacilities();
      if (!Array.isArray(facilities) || facilities.length === 0) {
        throw new Error('Facilities array empty or invalid');
      }
      if (!facilities[0].id || !facilities[0].name) {
        throw new Error('Facility item missing id or name');
      }
    });

    // 3. Successful patient retrieval via careLoopApi.getPatients()
    await assert('careLoopApi.getPatients() retrieves patient registry', async () => {
      const patients = await careLoopApi.getPatients();
      if (!Array.isArray(patients) || patients.length === 0) {
        throw new Error('Patients array empty or invalid');
      }
      if (!patients[0].id || !patients[0].fullName) {
        throw new Error('Patient item missing id or fullName');
      }
    });

    // 4. Successful referral retrieval via careLoopApi.getReferrals()
    await assert('careLoopApi.getReferrals() retrieves referrals list', async () => {
      const referrals = await careLoopApi.getReferrals();
      if (!Array.isArray(referrals)) {
        throw new Error('Referrals array invalid');
      }
    });

    // 5. Smart facility matching via careLoopApi.matchFacilities()
    await assert('careLoopApi.matchFacilities() returns scored matches', async () => {
      const matches = await careLoopApi.matchFacilities({
        department: 'Obstetrics',
        emergency: false,
      });
      if (!Array.isArray(matches) || matches.length === 0) {
        throw new Error('Expected at least one matched facility');
      }
      if (typeof matches[0].matchScore !== 'number') {
        throw new Error('Match result missing numeric matchScore');
      }
    });

    // 6. 404 response handling: Non-existent resource ID throws typed ApiError with status 404
    await assert('API Client correctly parses 404 response and throws ApiError', async () => {
      try {
        await careLoopApi.getReferralById('ref_non_existent_9999');
        throw new Error('Expected ApiError to be thrown for non-existent ID, but request succeeded');
      } catch (err: unknown) {
        if (!(err instanceof ApiError)) {
          throw new Error(`Expected instance of ApiError, got: ${err}`);
        }
        if (err.status !== 404) {
          throw new Error(`Expected status 404, got: ${err.status}`);
        }
        if (err.code !== 'REFERRAL_NOT_FOUND') {
          throw new Error(`Expected code REFERRAL_NOT_FOUND, got: ${err.code}`);
        }
        if (!err.message || err.message.includes('stack')) {
          throw new Error('Error message invalid or leaked stack trace');
        }
      }
    });

    // 7. Non-success response / business error envelope: Business rule failure throws typed ApiError
    await assert('API Client correctly parses business error envelope (400) and throws ApiError', async () => {
      try {
        // Attempt creating referral with invalid payload (missing required fields)
        await careLoopApi.createReferral({} as any);
        throw new Error('Expected ApiError for invalid payload, but request succeeded');
      } catch (err: unknown) {
        if (!(err instanceof ApiError)) {
          throw new Error(`Expected instance of ApiError, got: ${err}`);
        }
        if (err.status !== 400) {
          throw new Error(`Expected status 400, got: ${err.status}`);
        }
        if (!err.code) {
          throw new Error('Expected error code in ApiError');
        }
        if (!err.message) {
          throw new Error('Expected readable error message');
        }
      }
    });

    // 8. 404 for undefined API route throws ApiError with ENDPOINT_NOT_FOUND
    await assert('API Client correctly handles undefined API route (404 ENDPOINT_NOT_FOUND)', async () => {
      try {
        await apiFetch('/non-existent-endpoint');
        throw new Error('Expected ApiError for undefined endpoint, but request succeeded');
      } catch (err: unknown) {
        if (!(err instanceof ApiError)) {
          throw new Error(`Expected instance of ApiError, got: ${err}`);
        }
        if (err.status !== 404) {
          throw new Error(`Expected status 404, got: ${err.status}`);
        }
        if (err.code !== 'ENDPOINT_NOT_FOUND') {
          throw new Error(`Expected code ENDPOINT_NOT_FOUND, got: ${err.code}`);
        }
      }
    });

    // 9. Patient retrieval by ID (careLoopApi.getPatientById)
    await assert('careLoopApi.getPatientById("pat_001") retrieves demo patient record', async () => {
      const patient = await careLoopApi.getPatientById('pat_001');
      if (!patient || patient.id !== 'pat_001') {
        throw new Error('Patient ID mismatch');
      }
      if (patient.fullName !== 'Anandi Bai Patil') {
        throw new Error(`Expected Anandi Bai Patil, got ${patient.fullName}`);
      }
    });

    // 10. Health Worker referral list retrieval with filters
    await assert('careLoopApi.getReferrals({ referringWorkerId }) retrieves HW assigned pipeline', async () => {
      const referrals = await careLoopApi.getReferrals({ referringWorkerId: 'usr_hw_01' });
      if (!Array.isArray(referrals)) {
        throw new Error('Expected referrals array');
      }
      for (const r of referrals) {
        if (r.referringWorkerId !== 'usr_hw_01') {
          throw new Error(`Referral ${r.id} does not match requested worker ID`);
        }
      }
    });

    // 11. Normal referral creation via careLoopApi.createReferral()
    let normalRefId = '';
    await assert('careLoopApi.createReferral() creates normal referral in REFERRED status', async () => {
      const created = await careLoopApi.createReferral({
        referralType: 'NORMAL',
        priority: 'ROUTINE',
        patientId: 'pat_001',
        patientName: 'Anandi Bai Patil',
        patientAge: 28,
        patientGender: 'female',
        patientPhone: '+91 94210 56789',
        isUnregisteredEmergency: false,
        referringWorkerId: 'usr_hw_01',
        referringWorkerName: 'Sunita Devi',
        referringWorkerCadre: 'ASHA',
        referringWorkerPhone: '+91 98765 43210',
        originSubCenter: 'Shivapur Sub-Centre',
        village: 'Khed Shivapur',
        targetFacilityId: 'fac_chc_01',
        targetFacilityName: 'Bhor Community Health Centre & Sub-District Hospital',
        targetFacilityType: 'Community Health Centre (CHC)',
        targetDepartment: 'Obstetrics & Gynaecology (Emergency C-Section)',
        chiefComplaint: 'Gestational diabetes evaluation and fetal monitoring',
        clinicalNotes: 'Blood sugar fasting 132 mg/dL. Referred for specialist ultrasound.',
        transportRequired: false,
        slot: {
          requestedDate: '2026-09-29',
          requestedTimeWindow: '10:00 - 12:00 PM',
        },
      });

      if (!created || !created.id) throw new Error('Referral creation returned empty id');
      if (created.status !== 'REFERRED') throw new Error(`Expected backend state REFERRED, got ${created.status}`);
      if (created.slot.status !== 'PENDING_CONFIRMATION') throw new Error(`Expected slot PENDING_CONFIRMATION, got ${created.slot.status}`);
      if (!created.referralNumber.startsWith('REF-')) throw new Error('Missing canonical referralNumber');
      normalRefId = created.id;
    });

    // 12. Referral detail retrieval via careLoopApi.getReferralById()
    await assert('careLoopApi.getReferralById() retrieves live created referral', async () => {
      const retrieved = await careLoopApi.getReferralById(normalRefId);
      if (!retrieved || retrieved.id !== normalRefId) {
        throw new Error('Retrieved referral does not match normalRefId');
      }
      if (retrieved.patientName !== 'Anandi Bai Patil') {
        throw new Error('Patient name mismatch');
      }
      if (retrieved.events.length < 3) {
        throw new Error('Expected initial creation events in referral audit trail');
      }
    });

    // 13. Emergency referral creation (Registered Patient)
    await assert('careLoopApi.createReferral() creates emergency referral for registered patient', async () => {
      const emerg = await careLoopApi.createReferral({
        referralType: 'EMERGENCY',
        priority: 'CRITICAL_EMERGENCY',
        patientId: 'pat_001',
        patientName: 'Anandi Bai Patil',
        patientAge: 28,
        patientGender: 'female',
        patientPhone: '+91 94210 56789',
        isUnregisteredEmergency: false,
        referringWorkerId: 'usr_hw_01',
        referringWorkerName: 'Sunita Devi',
        referringWorkerCadre: 'ASHA',
        referringWorkerPhone: '+91 98765 43210',
        originSubCenter: 'Shivapur Sub-Centre',
        village: 'Khed Shivapur',
        targetFacilityId: 'fac_chc_01',
        targetFacilityName: 'Bhor Community Health Centre & Sub-District Hospital',
        targetFacilityType: 'Community Health Centre (CHC)',
        targetDepartment: 'Obstetrics & Gynaecology (Emergency C-Section)',
        chiefComplaint: 'Severe eclampsia warning signs / BP 170/110',
        clinicalNotes: 'Immediate obstetrics resuscitation needed.',
        transportRequired: true,
        slot: {
          requestedDate: new Date().toISOString().split('T')[0],
          requestedTimeWindow: 'IMMEDIATE EMERGENCY REQUEST',
        },
      });

      if (emerg.referralType !== 'EMERGENCY') throw new Error('Expected referralType EMERGENCY');
      if (emerg.priority !== 'CRITICAL_EMERGENCY') throw new Error('Expected priority CRITICAL_EMERGENCY');
      if (emerg.status !== 'REFERRED') throw new Error(`Expected REFERRED status, got ${emerg.status}`);
      if (emerg.slot.status !== 'PENDING_CONFIRMATION') throw new Error('Slot must be PENDING_CONFIRMATION');
    });

    // 14. Emergency referral creation (Unregistered / Unknown Patient)
    await assert('careLoopApi.createReferral() creates emergency referral for unregistered patient', async () => {
      const unregEmerg = await careLoopApi.createReferral({
        referralType: 'EMERGENCY',
        priority: 'CRITICAL_EMERGENCY',
        patientName: 'Unknown Patient (Highway Trauma)',
        patientAge: 32,
        patientGender: 'male',
        isUnregisteredEmergency: true,
        referringWorkerId: 'usr_hw_01',
        referringWorkerName: 'Sunita Devi',
        referringWorkerCadre: 'ASHA',
        referringWorkerPhone: '+91 98765 43210',
        originSubCenter: 'Shivapur Sub-Centre',
        village: 'NH-4 Highway Near Shivapur',
        targetFacilityId: 'fac_dh_01',
        targetFacilityName: 'Pune District Civil Hospital (Aundh)',
        targetFacilityType: 'District Hospital (DH)',
        targetDepartment: 'General Surgery & Trauma Triage',
        chiefComplaint: 'Polytrauma following vehicle collision',
        clinicalNotes: 'Airway secured, emergency transport en route.',
        transportRequired: true,
        slot: {
          requestedDate: new Date().toISOString().split('T')[0],
          requestedTimeWindow: 'IMMEDIATE EMERGENCY REQUEST',
        },
      });

      if (!unregEmerg.isUnregisteredEmergency) throw new Error('Expected isUnregisteredEmergency true');
      if (unregEmerg.patientId !== undefined) throw new Error('Unregistered patientId must be undefined');
      if (unregEmerg.status !== 'REFERRED') throw new Error('Must start in REFERRED status');
    });

    // 15. Invalid referral creation returns typed ApiError (400)
    await assert('Invalid referral creation (missing chiefComplaint) throws ApiError 400', async () => {
      try {
        await careLoopApi.createReferral({
          referralType: 'NORMAL',
          priority: 'ROUTINE',
          patientName: 'Test Patient',
          patientAge: 25,
          patientGender: 'female',
          referringWorkerId: 'usr_hw_01',
          referringWorkerName: 'Sunita Devi',
          referringWorkerCadre: 'ASHA',
          referringWorkerPhone: '+91 98765 43210',
          originSubCenter: 'Shivapur Sub-Centre',
          village: 'Khed Shivapur',
          targetFacilityId: 'fac_chc_01',
          targetFacilityName: 'Bhor CHC',
          targetFacilityType: 'Community Health Centre (CHC)',
          targetDepartment: 'General Medicine',
          chiefComplaint: '', // Empty complaint!
          slot: { requestedDate: '2026-09-30', requestedTimeWindow: '10:00 - 12:00 PM' },
        });
        throw new Error('Expected createReferral to fail, but it succeeded');
      } catch (err: unknown) {
        if (!(err instanceof ApiError)) throw new Error(`Expected ApiError, got ${err}`);
        if (err.status !== 400) throw new Error(`Expected status 400, got ${err.status}`);
      }
    });

    // 16. Backend remains authoritative for initial REFERRED state
    await assert('Backend assigns authoritative REFERRED status regardless of client input', async () => {
      const ref = await careLoopApi.createReferral({
        referralType: 'NORMAL',
        priority: 'ROUTINE',
        patientId: 'pat_001',
        patientName: 'Anandi Bai Patil',
        patientAge: 28,
        patientGender: 'female',
        referringWorkerId: 'usr_hw_01',
        referringWorkerName: 'Sunita Devi',
        referringWorkerCadre: 'ASHA',
        referringWorkerPhone: '+91 98765 43210',
        originSubCenter: 'Shivapur Sub-Centre',
        village: 'Khed Shivapur',
        targetFacilityId: 'fac_chc_01',
        targetFacilityName: 'Bhor Community Health Centre & Sub-District Hospital',
        targetFacilityType: 'Community Health Centre (CHC)',
        targetDepartment: 'General Medicine & OPD',
        chiefComplaint: 'Routine prenatal follow-up',
        slot: { requestedDate: '2026-09-30', requestedTimeWindow: '10:00 - 12:00 PM' },
      });

      if (ref.status !== 'REFERRED') throw new Error('Backend failed to assign REFERRED status');
      if (ref.slot.status !== 'PENDING_CONFIRMATION') throw new Error('Backend failed to assign PENDING_CONFIRMATION slot status');
    });

    // 17. Facility-scoped referral retrieval
    await assert('careLoopApi.getReferrals({ targetFacilityId }) retrieves facility-scoped referrals', async () => {
      const facReferrals = await careLoopApi.getReferrals({ targetFacilityId: 'fac_chc_01' });
      if (!Array.isArray(facReferrals)) throw new Error('Expected referrals array');
      for (const r of facReferrals) {
        if (r.targetFacilityId !== 'fac_chc_01') {
          throw new Error(`Referral ${r.id} target facility mismatch`);
        }
      }
    });

    // 18. Facility slot acceptance
    let acceptedRefId = '';
    await assert('careLoopApi.acceptSlot() transitions REFERRED -> CONFIRMED with confirmed slot', async () => {
      const created = await careLoopApi.createReferral({
        referralType: 'NORMAL',
        priority: 'ROUTINE',
        patientId: 'pat_001',
        patientName: 'Anandi Bai Patil',
        patientAge: 28,
        patientGender: 'female',
        referringWorkerId: 'usr_hw_01',
        referringWorkerName: 'Sunita Devi',
        referringWorkerCadre: 'ASHA',
        referringWorkerPhone: '+91 98765 43210',
        originSubCenter: 'Shivapur Sub-Centre',
        village: 'Khed Shivapur',
        targetFacilityId: 'fac_chc_01',
        targetFacilityName: 'Bhor Community Health Centre & Sub-District Hospital',
        targetFacilityType: 'Community Health Centre (CHC)',
        targetDepartment: 'Obstetrics & Gynaecology (Emergency C-Section)',
        chiefComplaint: 'Prenatal anomaly scan evaluation',
        slot: { requestedDate: '2026-09-28', requestedTimeWindow: '09:00 - 11:00 AM' },
      });

      const accepted = await careLoopApi.acceptSlot(
        created.id,
        {
          confirmedDate: '2026-09-28',
          confirmedTimeWindow: '09:30 - 11:00 AM',
          facilityRemarks: 'Slot confirmed by MS desk',
          doctorName: 'Dr. Rajesh Sharma',
        },
        'fac_chc_01',
        'Dr. Rajesh Sharma'
      );

      if (accepted.status !== 'CONFIRMED') throw new Error(`Expected CONFIRMED, got ${accepted.status}`);
      if (accepted.slot.status !== 'CONFIRMED') throw new Error(`Expected slot status CONFIRMED, got ${accepted.slot.status}`);
      if (accepted.slot.confirmedDate !== '2026-09-28') throw new Error('Confirmed date mismatch');
      acceptedRefId = accepted.id;
    });

    // 19. Facility alternative slot proposal
    await assert('careLoopApi.proposeAlternativeSlot() transitions REFERRED -> SLOT_PROPOSED', async () => {
      const created = await careLoopApi.createReferral({
        referralType: 'NORMAL',
        priority: 'ROUTINE',
        patientId: 'pat_001',
        patientName: 'Anandi Bai Patil',
        patientAge: 28,
        patientGender: 'female',
        referringWorkerId: 'usr_hw_01',
        referringWorkerName: 'Sunita Devi',
        referringWorkerCadre: 'ASHA',
        referringWorkerPhone: '+91 98765 43210',
        originSubCenter: 'Shivapur Sub-Centre',
        village: 'Khed Shivapur',
        targetFacilityId: 'fac_chc_01',
        targetFacilityName: 'Bhor Community Health Centre & Sub-District Hospital',
        targetFacilityType: 'Community Health Centre (CHC)',
        targetDepartment: 'Obstetrics & Gynaecology (Emergency C-Section)',
        chiefComplaint: 'Follow-up ultrasound',
        slot: { requestedDate: '2026-09-28', requestedTimeWindow: '09:00 - 11:00 AM' },
      });

      const proposed = await careLoopApi.proposeAlternativeSlot(
        created.id,
        {
          counterSlot: '2026-09-29 at 02:00 PM',
          reason: 'Morning specialist OPD fully booked',
        },
        'fac_chc_01'
      );

      if (proposed.status !== 'SLOT_PROPOSED') throw new Error(`Expected SLOT_PROPOSED, got ${proposed.status}`);
      if (proposed.slot.status !== 'ALTERNATIVE_PROPOSED') throw new Error(`Expected ALTERNATIVE_PROPOSED, got ${proposed.slot.status}`);
      if (!proposed.slot.counterProposedSlot?.includes('2026-09-29')) throw new Error('Missing counterProposedSlot');
    });

    // 20. Facility cannot-proceed / gap detection
    await assert('careLoopApi.cannotProceed() transitions to GAP_DETECTED with hasGapAlert=true', async () => {
      const created = await careLoopApi.createReferral({
        referralType: 'NORMAL',
        priority: 'ROUTINE',
        patientId: 'pat_001',
        patientName: 'Anandi Bai Patil',
        patientAge: 28,
        patientGender: 'female',
        referringWorkerId: 'usr_hw_01',
        referringWorkerName: 'Sunita Devi',
        referringWorkerCadre: 'ASHA',
        referringWorkerPhone: '+91 98765 43210',
        originSubCenter: 'Shivapur Sub-Centre',
        village: 'Khed Shivapur',
        targetFacilityId: 'fac_chc_01',
        targetFacilityName: 'Bhor Community Health Centre & Sub-District Hospital',
        targetFacilityType: 'Community Health Centre (CHC)',
        targetDepartment: 'Obstetrics & Gynaecology (Emergency C-Section)',
        chiefComplaint: 'Specialist surgery consultation',
        slot: { requestedDate: '2026-09-28', requestedTimeWindow: '09:00 - 11:00 AM' },
      });

      const declined = await careLoopApi.cannotProceed(
        created.id,
        {
          reason: 'Bed capacity fully exhausted in required ward',
        },
        'fac_chc_01'
      );

      if (declined.status !== 'GAP_DETECTED') throw new Error(`Expected GAP_DETECTED, got ${declined.status}`);
      if (!declined.hasGapAlert) throw new Error('hasGapAlert must be true');
      if (!declined.gapReason?.includes('Bed capacity fully exhausted')) throw new Error('Missing gapReason');
    });

    // 21. Facility patient arrival
    await assert('careLoopApi.markArrived() transitions CONFIRMED -> ARRIVED', async () => {
      const arrived = await careLoopApi.markArrived(
        acceptedRefId,
        { remarks: 'Patient verified at registration desk' },
        'fac_chc_01'
      );

      if (arrived.status !== 'ARRIVED') throw new Error(`Expected ARRIVED, got ${arrived.status}`);
    });

    // 22. Facility service start
    await assert('careLoopApi.startService() transitions ARRIVED -> IN_CONSULTATION', async () => {
      const inConsult = await careLoopApi.startService(
        acceptedRefId,
        {
          doctorName: 'Dr. Suresh Kulkarni',
          notes: 'Specialist ultrasound evaluation active',
        },
        'fac_chc_01'
      );

      if (inConsult.status !== 'IN_CONSULTATION') throw new Error(`Expected IN_CONSULTATION, got ${inConsult.status}`);
    });

    // 23. Facility service completion
    await assert('careLoopApi.completeService() transitions IN_CONSULTATION -> COMPLETED', async () => {
      const completed = await careLoopApi.completeService(
        acceptedRefId,
        {
          doctorName: 'Dr. Suresh Kulkarni',
          operationalNotes: 'Obstetrics consult done. Patient discharged in stable condition.',
        },
        'fac_chc_01'
      );

      if (completed.status !== 'COMPLETED') throw new Error(`Expected COMPLETED, got ${completed.status}`);
      if (completed.hasGapAlert) throw new Error('hasGapAlert must be false on completion');
    });

    // 24. Facility capacity update
    await assert('careLoopApi.updateFacilityCapacity() updates capacity on backend', async () => {
      const updated = await careLoopApi.updateFacilityCapacity('fac_chc_01', {
        totalBeds: 55,
        availableBeds: 22,
        icuBedsAvailable: 7,
      });

      if (updated.totalBeds !== 55) throw new Error(`Expected 55 total beds, got ${updated.totalBeds}`);
      if (updated.availableBeds !== 22) throw new Error(`Expected 22 available beds, got ${updated.availableBeds}`);
      if (updated.icuBedsAvailable !== 7) throw new Error(`Expected 7 ICU beds, got ${updated.icuBedsAvailable}`);
    });

    // 25. Cross-facility action rejected (403)
    await assert('Cross-facility action rejected with 403 Forbidden', async () => {
      const ref = await careLoopApi.createReferral({
        referralType: 'NORMAL',
        priority: 'ROUTINE',
        patientId: 'pat_001',
        patientName: 'Anandi Bai Patil',
        patientAge: 28,
        patientGender: 'female',
        referringWorkerId: 'usr_hw_01',
        referringWorkerName: 'Sunita Devi',
        referringWorkerCadre: 'ASHA',
        referringWorkerPhone: '+91 98765 43210',
        originSubCenter: 'Shivapur Sub-Centre',
        village: 'Khed Shivapur',
        targetFacilityId: 'fac_chc_01', // Assigned to fac_chc_01!
        targetFacilityName: 'Bhor CHC',
        targetFacilityType: 'Community Health Centre (CHC)',
        targetDepartment: 'Obstetrics',
        chiefComplaint: 'Cross facility test',
        slot: { requestedDate: '2026-09-30', requestedTimeWindow: '10:00 - 12:00 PM' },
      });

      try {
        // Attempt action with different facility ID fac_dh_01
        await careLoopApi.acceptSlot(
          ref.id,
          { confirmedDate: '2026-09-30' },
          'fac_dh_01', // Unauthorized cross-facility!
          'Dr. Other'
        );
        throw new Error('Expected cross-facility action to be rejected, but it succeeded');
      } catch (err: unknown) {
        if (!(err instanceof ApiError)) throw new Error(`Expected ApiError, got ${err}`);
        if (err.status !== 403) throw new Error(`Expected status 403, got ${err.status}`);
        if (err.code !== 'FACILITY_SCOPE_VIOLATION') throw new Error(`Expected FACILITY_SCOPE_VIOLATION, got ${err.code}`);
      }
    });

    // 26. Invalid state transition rejected (409 Conflict)
    await assert('Invalid state transition (start service before arrival) rejected with 409 Conflict', async () => {
      const ref = await careLoopApi.createReferral({
        referralType: 'NORMAL',
        priority: 'ROUTINE',
        patientId: 'pat_001',
        patientName: 'Anandi Bai Patil',
        patientAge: 28,
        patientGender: 'female',
        referringWorkerId: 'usr_hw_01',
        referringWorkerName: 'Sunita Devi',
        referringWorkerCadre: 'ASHA',
        referringWorkerPhone: '+91 98765 43210',
        originSubCenter: 'Shivapur Sub-Centre',
        village: 'Khed Shivapur',
        targetFacilityId: 'fac_chc_01',
        targetFacilityName: 'Bhor CHC',
        targetFacilityType: 'Community Health Centre (CHC)',
        targetDepartment: 'Obstetrics',
        chiefComplaint: 'State machine invalid transition test',
        slot: { requestedDate: '2026-09-30', requestedTimeWindow: '10:00 - 12:00 PM' },
      });

      try {
        // In REFERRED status, attempt startService directly
        await careLoopApi.startService(
          ref.id,
          { doctorName: 'Dr. Suresh Kulkarni' },
          'fac_chc_01'
        );
        throw new Error('Expected startService on un-arrived referral to fail, but it succeeded');
      } catch (err: unknown) {
        if (!(err instanceof ApiError)) throw new Error(`Expected ApiError, got ${err}`);
        if (err.status !== 409) throw new Error(`Expected status 409, got ${err.status}`);
        if (err.code !== 'INVALID_STATE_TRANSITION') throw new Error(`Expected INVALID_STATE_TRANSITION, got ${err.code}`);
      }
    });

    // 27. Emergency referral follows same canonical facility lifecycle
    await assert('Emergency referral follows same canonical facility lifecycle (REFERRED -> CONFIRMED -> ARRIVED -> IN_CONSULTATION -> COMPLETED)', async () => {
      const emerg = await careLoopApi.createReferral({
        referralType: 'EMERGENCY',
        priority: 'CRITICAL_EMERGENCY',
        patientId: 'pat_001',
        patientName: 'Anandi Bai Patil',
        patientAge: 28,
        patientGender: 'female',
        patientPhone: '+91 94210 56789',
        referringWorkerId: 'usr_hw_01',
        referringWorkerName: 'Sunita Devi',
        referringWorkerCadre: 'ASHA',
        referringWorkerPhone: '+91 98765 43210',
        originSubCenter: 'Shivapur Sub-Centre',
        village: 'Khed Shivapur',
        targetFacilityId: 'fac_chc_01',
        targetFacilityName: 'Bhor Community Health Centre & Sub-District Hospital',
        targetFacilityType: 'Community Health Centre (CHC)',
        targetDepartment: 'Obstetrics & Gynaecology (Emergency C-Section)',
        chiefComplaint: 'Acute placental abruption',
        transportRequired: true,
        slot: { requestedDate: '2026-09-26', requestedTimeWindow: 'IMMEDIATE' },
      });

      if (emerg.status !== 'REFERRED') throw new Error('Emergency must start as REFERRED');

      const confirmed = await careLoopApi.acceptSlot(
        emerg.id,
        { confirmedDate: '2026-09-26', confirmedTimeWindow: 'IMMEDIATE', facilityRemarks: 'Emergency OT prepared' },
        'fac_chc_01',
        'Dr. Rajesh Sharma'
      );
      if (confirmed.status !== 'CONFIRMED') throw new Error('Failed to confirm emergency slot');

      const arrived = await careLoopApi.markArrived(
        emerg.id,
        { remarks: 'Patient brought in by ambulance' },
        'fac_chc_01'
      );
      if (arrived.status !== 'ARRIVED') throw new Error('Failed to mark emergency arrival');

      const inService = await careLoopApi.startService(
        emerg.id,
        { doctorName: 'Dr. Suresh Kulkarni', notes: 'Emergency surgery underway' },
        'fac_chc_01'
      );
      if (inService.status !== 'IN_CONSULTATION') throw new Error('Failed to start emergency service');

      const completed = await careLoopApi.completeService(
        emerg.id,
        { doctorName: 'Dr. Suresh Kulkarni', operationalNotes: 'C-section successful. Mother and neonate stable.' },
        'fac_chc_01'
      );
      if (completed.status !== 'COMPLETED') throw new Error('Failed to complete emergency care');
    });

    // ==========================================
    // STEP 7D: ADMIN API INTEGRATION TESTS
    // ==========================================

    // 28. Admin facilities retrieval through API client
    await assert('Admin: careLoopApi.getFacilities() retrieves facility list with operational capacity', async () => {
      const facilities = await careLoopApi.getFacilities();
      if (!Array.isArray(facilities)) throw new Error('Expected facilities array');
      if (facilities.length === 0) throw new Error('Expected non-empty facilities list');
      const first = facilities[0];
      if (!first.id || !first.name || !first.block || !first.type) {
        throw new Error('Facility missing core fields (id, name, block, type)');
      }
      if (typeof first.totalBeds !== 'number' || typeof first.availableBeds !== 'number') {
        throw new Error('Facility missing numeric bed capacity fields');
      }
    });

    // 29. Admin referral retrieval and deterministic metric calculation
    await assert('Admin: careLoopApi.getReferrals() allows deterministic metric calculation', async () => {
      const referrals = await careLoopApi.getReferrals();
      if (!Array.isArray(referrals)) throw new Error('Expected referrals array');
      if (referrals.length === 0) throw new Error('Expected non-empty referrals list');

      // Metric calculations per Step 7D Rule 9
      const totalReferrals = referrals.length;
      const completedReferrals = referrals.filter((r) => r.status === 'COMPLETED').length;
      const activeReferrals = referrals.filter((r) => r.status !== 'COMPLETED' && r.status !== 'CANCELLED').length;
      const emergencyReferrals = referrals.filter((r) => r.referralType === 'EMERGENCY').length;
      const gapReferrals = referrals.filter((r) => r.status === 'GAP_DETECTED' || r.hasGapAlert).length;

      if (totalReferrals <= 0) throw new Error('Total referrals should be > 0');
      if (completedReferrals < 0) throw new Error('Completed referrals cannot be negative');
      if (activeReferrals < 0) throw new Error('Active referrals cannot be negative');
      if (emergencyReferrals < 0) throw new Error('Emergency referrals cannot be negative');
      if (gapReferrals < 0) throw new Error('Gap referrals cannot be negative');

      // Deterministic conservation: completed + active + cancelled = total
      const cancelledReferrals = referrals.filter((r) => r.status === 'CANCELLED').length;
      if (completedReferrals + activeReferrals + cancelledReferrals !== totalReferrals) {
        throw new Error('Deterministic metric sum mismatch: completed + active + cancelled != total');
      }
    });

    // 30. Admin empty API response handling
    await assert('Admin: careLoopApi.getReferrals() handles empty query without errors', async () => {
      const emptyResults = await careLoopApi.getReferrals({ targetFacilityId: 'fac_non_existent_999' });
      if (!Array.isArray(emptyResults)) throw new Error('Expected empty array');
      if (emptyResults.length !== 0) throw new Error(`Expected 0 results, got ${emptyResults.length}`);
    });

    // 31. Admin API error handling (404 on missing referral)
    await assert('Admin: careLoopApi.getReferralById() throws ApiError 404 for unknown referral ID', async () => {
      try {
        await careLoopApi.getReferralById('ref_non_existent_999');
        throw new Error('Expected getReferralById to fail for unknown ID, but it succeeded');
      } catch (err: unknown) {
        if (!(err instanceof ApiError)) throw new Error(`Expected ApiError, got ${err}`);
        if (err.status !== 404) throw new Error(`Expected status 404, got ${err.status}`);
      }
    });

    // 32. Admin audit stream aggregation from referral event history
    await assert('Admin: Aggregates referral-level audit event stream preserving metadata', async () => {
      const referrals = await careLoopApi.getReferrals();
      const allEvents = referrals.flatMap((r) =>
        r.events.map((e) => ({
          ...e,
          referralDbId: r.id,
          referralNumber: r.referralNumber,
          patientName: r.patientName,
          targetFacilityName: r.targetFacilityName,
          targetFacilityId: r.targetFacilityId,
        }))
      );

      if (allEvents.length === 0) throw new Error('Expected non-empty audit event stream');
      const firstEvent = allEvents[0];
      if (!firstEvent.id || !firstEvent.timestamp || !firstEvent.stage || !firstEvent.actorName) {
        throw new Error('Audit event missing core fields (id, timestamp, stage, actorName)');
      }
      if (!firstEvent.referralDbId || !firstEvent.referralNumber) {
        throw new Error('Audit event missing parent referral linking metadata');
      }
    });

  } finally {
    server.close();
    setApiBaseUrl(null); // Reset
  }

  console.log('\n=====================================================');
  console.log(`  API Client Tests Complete: ${testsPassed} Passed, ${testsFailed} Failed`);
  console.log('=====================================================\n');

  if (testsFailed > 0) {
    process.exit(1);
  }
}

runApiClientTests();
