import { createApp } from '../src/app.js';
import { AddressInfo } from 'net';

async function runTests() {
  console.log('=====================================================');
  console.log('  CareLoop Backend Integration & State Machine Tests  ');
  console.log('=====================================================\n');

  const app = createApp();
  const server = app.listen(0);
  const port = (server.address() as AddressInfo).port;
  const baseUrl = `http://127.0.0.1:${port}/api`;

  let testsPassed = 0;
  let testsFailed = 0;

  async function assert(desc: string, fn: () => Promise<void>) {
    try {
      await fn();
      console.log(`[PASS] ${desc}`);
      testsPassed++;
    } catch (err: any) {
      console.error(`[FAIL] ${desc}`);
      console.error(`       Error: ${err.message}\n`);
      testsFailed++;
    }
  }

  try {
    // 1. Health Check
    await assert('GET /api/health returns 200 and status "ok"', async () => {
      const res = await fetch(`${baseUrl}/health`);
      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
      const body = await res.json();
      if (!body.success || body.data.status !== 'ok') throw new Error('Invalid health payload');
    });

    // 2. Facilities
    await assert('GET /api/facilities returns facility network', async () => {
      const res = await fetch(`${baseUrl}/facilities`);
      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
      const body = await res.json();
      if (!body.success || !Array.isArray(body.data) || body.data.length === 0) {
        throw new Error('Facilities array empty or invalid');
      }
    });

    await assert('GET /api/facilities/match executes Smart Facility Matching', async () => {
      const res = await fetch(`${baseUrl}/facilities/match?department=Obstetrics&emergency=false`);
      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
      const body = await res.json();
      if (!body.success || !Array.isArray(body.data)) throw new Error('Match failed');
      const topMatch = body.data[0];
      if (typeof topMatch.matchScore !== 'number' || topMatch.matchScore < 0 || topMatch.matchScore > 100) {
        throw new Error('Invalid matchScore');
      }
    });

    // 3. Patients
    await assert('GET /api/patients returns patient registry', async () => {
      const res = await fetch(`${baseUrl}/patients`);
      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
      const body = await res.json();
      if (!body.success || !Array.isArray(body.data) || body.data.length === 0) {
        throw new Error('Patients array empty or invalid');
      }
    });

    // 4. Referral Creation
    let createdRefId = '';
    await assert('POST /api/referrals creates new referral in REFERRED status', async () => {
      const payload = {
        referralType: 'NORMAL',
        priority: 'ROUTINE',
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
        chiefComplaint: 'Gestational diabetes evaluation',
        slot: {
          requestedDate: '2026-09-25',
          requestedTimeWindow: '10:00 - 12:00 PM',
        },
      };

      const res = await fetch(`${baseUrl}/referrals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.status !== 201) throw new Error(`Expected 201, got ${res.status}`);
      const body = await res.json();
      if (!body.success || !body.data.id) throw new Error('Creation response invalid');
      if (body.data.status !== 'REFERRED') throw new Error(`Expected REFERRED, got ${body.data.status}`);
      if (body.data.slot.status !== 'PENDING_CONFIRMATION') throw new Error('Slot should be PENDING_CONFIRMATION');
      createdRefId = body.data.id;
    });

    // 5. Facility Propose Alternative Slot (Does NOT auto-confirm)
    await assert('POST /api/referrals/:id/propose-slot moves to SLOT_PROPOSED without confirming', async () => {
      const res = await fetch(`${baseUrl}/referrals/${createdRefId}/propose-slot`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-actor-role': 'facility',
          'x-facility-id': 'fac_chc_01'
        },
        body: JSON.stringify({
          counterSlot: '2026-09-26 at 02:00 - 04:00 PM',
          reason: 'Morning OPD quota reached for specialist',
        }),
      });

      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
      const body = await res.json();
      if (body.data.status !== 'SLOT_PROPOSED') throw new Error(`Expected SLOT_PROPOSED, got ${body.data.status}`);
      if (body.data.slot.status !== 'ALTERNATIVE_PROPOSED') throw new Error('Slot status should be ALTERNATIVE_PROPOSED');
    });

    // 6. Facility Acceptance (CONFIRMED)
    await assert('POST /api/referrals/:id/accept moves to CONFIRMED and confirms slot', async () => {
      const res = await fetch(`${baseUrl}/referrals/${createdRefId}/accept`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-actor-role': 'facility',
          'x-facility-id': 'fac_chc_01'
        },
        body: JSON.stringify({
          confirmedDate: '2026-09-26',
          confirmedTimeWindow: '02:00 - 04:00 PM',
          facilityRemarks: 'OBGYN Clinic Counter #2 reserved',
        }),
      });

      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
      const body = await res.json();
      if (body.data.status !== 'CONFIRMED') throw new Error(`Expected CONFIRMED, got ${body.data.status}`);
      if (body.data.slot.status !== 'CONFIRMED') throw new Error('Slot status should be CONFIRMED');
      if (body.data.slot.confirmedDate !== '2026-09-26') throw new Error('Confirmed date mismatch');
    });

    // 7. Invalid Transition: Start Service Before Arrival (Must be rejected with 409)
    await assert('POST /api/referrals/:id/start-service rejected before patient arrival (409 Conflict)', async () => {
      const res = await fetch(`${baseUrl}/referrals/${createdRefId}/start-service`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-actor-role': 'facility',
          'x-facility-id': 'fac_chc_01'
        },
        body: JSON.stringify({
          doctorName: 'Dr. Suresh Kulkarni',
        }),
      });

      if (res.status !== 409) throw new Error(`Expected 409 Conflict, got ${res.status}`);
    });

    // 8. Patient Arrival (ARRIVED)
    await assert('POST /api/referrals/:id/arrive records arrival (ARRIVED)', async () => {
      const res = await fetch(`${baseUrl}/referrals/${createdRefId}/arrive`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-actor-role': 'facility',
          'x-facility-id': 'fac_chc_01'
        },
        body: JSON.stringify({ remarks: 'Patient verified at triage desk' }),
      });

      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
      const body = await res.json();
      if (body.data.status !== 'ARRIVED') throw new Error(`Expected ARRIVED, got ${body.data.status}`);
    });

    // 9. Start Service (IN_CONSULTATION)
    await assert('POST /api/referrals/:id/start-service starts consultation (IN_CONSULTATION)', async () => {
      const res = await fetch(`${baseUrl}/referrals/${createdRefId}/start-service`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-actor-role': 'facility',
          'x-facility-id': 'fac_chc_01'
        },
        body: JSON.stringify({
          doctorName: 'Dr. Suresh Kulkarni',
          notes: 'Patient examination underway',
        }),
      });

      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
      const body = await res.json();
      if (body.data.status !== 'IN_CONSULTATION') throw new Error(`Expected IN_CONSULTATION, got ${body.data.status}`);
    });

    // 10. Complete Service (COMPLETED)
    await assert('POST /api/referrals/:id/complete marks referral completed (COMPLETED)', async () => {
      const res = await fetch(`${baseUrl}/referrals/${createdRefId}/complete`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-actor-role': 'facility',
          'x-facility-id': 'fac_chc_01'
        },
        body: JSON.stringify({
          doctorName: 'Dr. Suresh Kulkarni',
          operationalNotes: 'Ultrasound completed and prescription issued. Discharge slip given.',
        }),
      });

      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
      const body = await res.json();
      if (body.data.status !== 'COMPLETED') throw new Error(`Expected COMPLETED, got ${body.data.status}`);
    });

    // 11. Cannot Proceed / Operational Exception Workflow
    let secondRefId = '';
    await assert('Facility cannot-proceed transitions to GAP_DETECTED with operational reason', async () => {
      // Create a second referral targeted to Bhor CHC
      const createRes = await fetch(`${baseUrl}/referrals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          referralType: 'NORMAL',
          priority: 'URGENT',
          patientName: 'Test Patient For Exception',
          patientAge: 40,
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
          chiefComplaint: 'Elective evaluation',
          slot: { requestedDate: '2026-09-28', requestedTimeWindow: '10:00 - 12:00 PM' },
        }),
      });
      const created = await createRes.json();
      secondRefId = created.data.id;

      // Cannot proceed call
      const res = await fetch(`${baseUrl}/referrals/${secondRefId}/cannot-proceed`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-actor-role': 'facility',
          'x-facility-id': 'fac_chc_01'
        },
        body: JSON.stringify({
          reason: 'Bed capacity fully exhausted in required ward',
        }),
      });

      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
      const body = await res.json();
      if (body.data.status !== 'GAP_DETECTED') throw new Error(`Expected GAP_DETECTED, got ${body.data.status}`);
      if (!body.data.hasGapAlert) throw new Error('hasGapAlert must be true');
      if (!body.data.gapReason?.includes('Bed capacity fully exhausted')) throw new Error('gapReason not recorded');
    });

    // 12. Recovery Radar Retrieval
    await assert('GET /api/referrals?atRisk=true returns the exception referral', async () => {
      const res = await fetch(`${baseUrl}/referrals?atRisk=true`);
      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
      const body = await res.json();
      const found = body.data.some((r: any) => r.id === secondRefId);
      if (!found) throw new Error('Exception referral not present in at-risk list');
    });

    // 13. Invalid Reroute: Reroute to Same Failing Facility (Must be rejected with 400)
    await assert('Rerouting to same failing facility rejected (400 Bad Request)', async () => {
      const res = await fetch(`${baseUrl}/referrals/${secondRefId}/reroute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newFacilityId: 'fac_chc_01', // Same failing facility
          newDepartment: 'Obstetrics & Gynaecology (Emergency C-Section)',
          reason: 'Try again at same place',
        }),
      });

      if (res.status !== 400) throw new Error(`Expected 400 Bad Request, got ${res.status}`);
    });

    // 14. Valid Pre-Service Reroute to Alternative Facility
    await assert('Pre-service reroute resets status to REFERRED & slot to PENDING_CONFIRMATION', async () => {
      const res = await fetch(`${baseUrl}/referrals/${secondRefId}/reroute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newFacilityId: 'fac_dh_01', // Aundh District Hospital
          newDepartment: 'High Risk Obstetrics & NICU Level-3',
          reason: 'Bhor CHC bed capacity exhausted. Rerouting to Aundh DH.',
        }),
      });

      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
      const body = await res.json();
      if (body.data.status !== 'REFERRED') throw new Error(`Expected REFERRED, got ${body.data.status}`);
      if (body.data.targetFacilityId !== 'fac_dh_01') throw new Error('Target facility not updated');
      if (body.data.slot.status !== 'PENDING_CONFIRMATION') throw new Error('Slot must be PENDING_CONFIRMATION (never auto-confirmed)');
      if (body.data.hasGapAlert !== false) throw new Error('hasGapAlert must be cleared after recovery');
      const lastEvent = body.data.events[body.data.events.length - 1];
      if (lastEvent.stage !== 'RECOVERED') throw new Error('Last event must be RECOVERED');
    });

    // 15. Cross-Facility Scoping Violation (Must be rejected with 403)
    await assert('Cross-facility action rejected (403 Forbidden)', async () => {
      // secondRefId is now assigned to fac_dh_01; fac_chc_01 attempts to accept it
      const res = await fetch(`${baseUrl}/referrals/${secondRefId}/accept`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-actor-role': 'facility',
          'x-facility-id': 'fac_chc_01' // Wrong facility!
        },
        body: JSON.stringify({
          confirmedDate: '2026-09-30',
          confirmedTimeWindow: '10:00 - 12:00 PM',
        }),
      });

      if (res.status !== 403) throw new Error(`Expected 403 Forbidden, got ${res.status}`);
    });

    // 16. Resource by ID lookups
    await assert('GET /api/referrals/:id returns referral details', async () => {
      const res = await fetch(`${baseUrl}/referrals/${createdRefId}`);
      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
      const body = await res.json();
      if (!body.success || body.data.id !== createdRefId) throw new Error('Referral ID mismatch');
    });

    await assert('GET /api/facilities/:id returns facility details', async () => {
      const res = await fetch(`${baseUrl}/facilities/fac_chc_01`);
      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
      const body = await res.json();
      if (!body.success || body.data.id !== 'fac_chc_01') throw new Error('Facility ID mismatch');
    });

    await assert('GET /api/patients/:id returns patient details', async () => {
      const res = await fetch(`${baseUrl}/patients/pat_001`);
      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
      const body = await res.json();
      if (!body.success || body.data.id !== 'pat_001') throw new Error('Patient ID mismatch');
    });

    // 17. Invalid Transition: Arrival before confirmation (Must be rejected with 409)
    await assert('Invalid Transition: Mark arrival before confirmation rejected (409 Conflict)', async () => {
      // secondRefId is currently in REFERRED status (rerouted)
      const res = await fetch(`${baseUrl}/referrals/${secondRefId}/arrive`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-actor-role': 'facility',
          'x-facility-id': 'fac_dh_01'
        },
        body: JSON.stringify({ remarks: 'Premature arrival attempt' }),
      });
      if (res.status !== 409) throw new Error(`Expected 409 Conflict, got ${res.status}`);
    });

    // 18. Invalid Transition: Complete service before start (Must be rejected with 409)
    await assert('Invalid Transition: Complete service before consultation started rejected (409 Conflict)', async () => {
      // Create a third referral, confirm it, and mark arrival
      const createRes = await fetch(`${baseUrl}/referrals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          referralType: 'NORMAL',
          priority: 'ROUTINE',
          patientName: 'Test Pre-Start Complete',
          patientAge: 32,
          patientGender: 'male',
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
          chiefComplaint: 'Chronic cough',
          slot: { requestedDate: '2026-09-30', requestedTimeWindow: '10:00 - 12:00 PM' },
        }),
      });
      const third = await createRes.json();
      const thirdId = third.data.id;

      // Confirm it
      await fetch(`${baseUrl}/referrals/${thirdId}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-actor-role': 'facility', 'x-facility-id': 'fac_chc_01' },
        body: JSON.stringify({}),
      });

      // Arrive
      await fetch(`${baseUrl}/referrals/${thirdId}/arrive`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-actor-role': 'facility', 'x-facility-id': 'fac_chc_01' },
        body: JSON.stringify({ remarks: 'Arrived at desk' }),
      });

      // Attempt to COMPLETE directly from ARRIVED without START_SERVICE
      const completeRes = await fetch(`${baseUrl}/referrals/${thirdId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-actor-role': 'facility', 'x-facility-id': 'fac_chc_01' },
        body: JSON.stringify({ doctorName: 'Dr. Test' }),
      });
      if (completeRes.status !== 409) throw new Error(`Expected 409 Conflict, got ${completeRes.status}`);
    });

    // 19. Invalid Transition: Reroute already terminal/completed referral (Must be rejected with 409)
    await assert('Invalid Transition: Rerouting terminal/completed referral rejected (409 Conflict)', async () => {
      // createdRefId is COMPLETED
      const res = await fetch(`${baseUrl}/referrals/${createdRefId}/reroute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newFacilityId: 'fac_dh_01',
          newDepartment: 'Cardiology',
          reason: 'Attempt rerouting completed referral',
        }),
      });
      if (res.status !== 409) throw new Error(`Expected 409 Conflict, got ${res.status}`);
    });

    // 20. Invalid Transition: Auto-confirm / accept already completed referral (Must be rejected with 409)
    await assert('Invalid Transition: Acceptance of completed referral rejected (409 Conflict)', async () => {
      // createdRefId is COMPLETED
      const res = await fetch(`${baseUrl}/referrals/${createdRefId}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-actor-role': 'facility', 'x-facility-id': 'fac_chc_01' },
        body: JSON.stringify({}),
      });
      if (res.status !== 409) throw new Error(`Expected 409 Conflict, got ${res.status}`);
    });

    // 21. Validation: Creation with missing required fields (Must be rejected with 400)
    await assert('Validation: Missing required fields on referral creation rejected (400 Bad Request)', async () => {
      const res = await fetch(`${baseUrl}/referrals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          referralType: 'NORMAL',
          // Missing priority, patientName, slot, chiefComplaint
        }),
      });
      if (res.status !== 400) throw new Error(`Expected 400 Bad Request, got ${res.status}`);
    });

    // 22. Validation: Cannot-proceed without operational reason (Must be rejected with 400)
    await assert('Validation: Cannot-proceed without operational reason rejected (400 Bad Request)', async () => {
      const res = await fetch(`${baseUrl}/referrals/${secondRefId}/cannot-proceed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-actor-role': 'facility', 'x-facility-id': 'fac_dh_01' },
        body: JSON.stringify({ reason: '' }),
      });
      if (res.status !== 400) throw new Error(`Expected 400 Bad Request, got ${res.status}`);
    });

  } finally {
    server.close();
  }

  console.log('\n=====================================================');
  console.log(`  Tests Complete: ${testsPassed} Passed, ${testsFailed} Failed`);
  console.log('=====================================================\n');

  if (testsFailed > 0) {
    process.exit(1);
  }
}

runTests();
