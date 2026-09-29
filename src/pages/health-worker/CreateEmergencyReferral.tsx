import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { PageHeader } from '@/components/layout';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter,
  Button, 
  FormField, 
  Input 
} from '@/components/ui';
import { CareLoopStore, mockHealthWorker } from '@/mock';
import { careLoopApi, ApiError } from '@/api/client';
import { Gender, Patient, Facility } from '@/types';
import { 
  Siren, 
  Building2, 
  AlertTriangle, 
  ArrowLeft, 
  ShieldAlert, 
  Truck,
  CheckCircle2
} from 'lucide-react';

export const CreateEmergencyReferral: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [patients, setPatients] = useState<Patient[]>(() => CareLoopStore.getPatients());
  const [facilities, setFacilities] = useState<Facility[]>(() => 
    CareLoopStore.getFacilities().filter(
      (f) => f.emergencyAvailable24x7 || f.type.includes('District Hospital') || f.type.includes('CHC')
    )
  );

  // Patient Status: Existing vs. Not Registered
  const initialPatientId = searchParams.get('patientId');
  const [patientStatus, setPatientStatus] = useState<'existing' | 'unregistered'>(
    initialPatientId ? 'existing' : 'unregistered'
  );

  // Existing Patient selection
  const [selectedPatientId, setSelectedPatientId] = useState(initialPatientId || patients[0]?.id || '');

  // Unregistered / Unknown Patient minimal triage fields
  const [unregisteredName, setUnregisteredName] = useState('Unknown Patient (Trauma / Acute)');
  const [unregisteredAge, setUnregisteredAge] = useState('35');
  const [unregisteredGender, setUnregisteredGender] = useState<Gender>('male');
  const [incidentLocation, setIncidentLocation] = useState('Highway Near Shivapur / Sub-Centre Catchment');
  const [callerPhone, setCallerPhone] = useState('');

  // Clinical & Emergency Details
  const [emergencyDepartment, setEmergencyDepartment] = useState('General Surgery & Trauma Triage');
  const [chiefComplaint, setChiefComplaint] = useState('Acute polytrauma / Hypovolemic shock risk following vehicle collision');
  const [clinicalNotes, setClinicalNotes] = useState('Immediate airway management, IV crystalloids started. Emergency transport assistance requested.');
  const [ambulanceDispatched, setAmbulanceDispatched] = useState(false);

  // Target Emergency Facility Selection
  const [selectedFacilityId, setSelectedFacilityId] = useState(facilities[0]?.id || '');

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadResources() {
      try {
        const [patList, facList] = await Promise.all([
          careLoopApi.getPatients(),
          careLoopApi.getFacilities(),
        ]);
        if (isMounted) {
          setPatients(patList);
          const emergFacs = facList.filter(
            (f) => f.emergencyAvailable24x7 || f.type.includes('District Hospital') || f.type.includes('CHC')
          );
          setFacilities(emergFacs);
          if (!selectedFacilityId && emergFacs.length > 0) {
            setSelectedFacilityId(emergFacs[0].id);
          }
          if (!selectedPatientId && patList.length > 0) {
            setSelectedPatientId(patList[0].id);
          }
        }
      } catch {
        // Fallback already in initial state
      }
    }
    loadResources();
    return () => {
      isMounted = false;
    };
  }, []);

  const selectedFacility = facilities.find((f) => f.id === selectedFacilityId) || facilities[0];
  const selectedExistingPatient = patients.find((p) => p.id === selectedPatientId) || CareLoopStore.getPatientById(selectedPatientId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const isUnregistered = patientStatus === 'unregistered';

    if (!isUnregistered && !selectedExistingPatient) {
      setError('Please select an existing patient from the registry.');
      return;
    }

    if (!chiefComplaint.trim()) {
      setError('Please provide emergency triage details / chief complaint.');
      return;
    }

    if (!selectedFacility) {
      setError('Please select a valid receiving facility.');
      return;
    }

    const patientName = isUnregistered
      ? unregisteredName.trim() || 'Unknown Patient (Emergency)'
      : selectedExistingPatient!.fullName;

    const patientAge = isUnregistered
      ? parseInt(unregisteredAge, 10) || 30
      : selectedExistingPatient!.age;

    const patientGender = isUnregistered
      ? unregisteredGender
      : selectedExistingPatient!.gender;

    const villageLocation = isUnregistered
      ? incidentLocation.trim() || mockHealthWorker.assignedVillage
      : selectedExistingPatient!.village;

    try {
      setIsSubmitting(true);

      // Canonical referral lifecycle: emergency starts in pending_acceptance (REFERRED)
      const newReferral = await careLoopApi.createReferral({
        referralType: 'EMERGENCY',
        priority: 'CRITICAL_EMERGENCY',
        patientId: isUnregistered ? undefined : selectedExistingPatient?.id,
        patientName,
        patientAge,
        patientGender,
        patientPhone: callerPhone || selectedExistingPatient?.phone || undefined,
        isUnregisteredEmergency: isUnregistered,
        referringWorkerId: mockHealthWorker.id,
        referringWorkerName: mockHealthWorker.name,
        referringWorkerCadre: mockHealthWorker.cadre,
        referringWorkerPhone: mockHealthWorker.phone,
        originSubCenter: mockHealthWorker.assignedSubCenter,
        village: villageLocation,
        targetFacilityId: selectedFacility.id,
        targetFacilityName: selectedFacility.name,
        targetFacilityType: selectedFacility.type,
        targetDepartment: emergencyDepartment,
        chiefComplaint: chiefComplaint.trim(),
        clinicalNotes: clinicalNotes.trim(),
        transportRequired: true,
        slot: {
          requestedDate: new Date().toISOString().split('T')[0],
          requestedTimeWindow: 'IMMEDIATE EMERGENCY REQUEST',
          facilityRemarks: 'Emergency notification queued for receiving facility triage desk (Demo).',
        },
      });

      // Synchronize in-memory/mock store so un-migrated tabs (e.g. facility demo) also see it
      CareLoopStore.createReferral({
        referralType: 'EMERGENCY',
        priority: 'CRITICAL_EMERGENCY',
        status: 'REFERRED',
        patientId: isUnregistered ? undefined : selectedExistingPatient?.id,
        patientName,
        patientAge,
        patientGender,
        patientPhone: callerPhone || selectedExistingPatient?.phone || undefined,
        isUnregisteredEmergency: isUnregistered,
        referringWorkerId: mockHealthWorker.id,
        referringWorkerName: mockHealthWorker.name,
        referringWorkerCadre: mockHealthWorker.cadre,
        referringWorkerPhone: mockHealthWorker.phone,
        originSubCenter: mockHealthWorker.assignedSubCenter,
        village: villageLocation,
        targetFacilityId: selectedFacility.id,
        targetFacilityName: selectedFacility.name,
        targetFacilityType: selectedFacility.type,
        targetDepartment: emergencyDepartment,
        chiefComplaint: chiefComplaint.trim(),
        clinicalNotes: clinicalNotes.trim(),
        transportRequired: true,
        ambulanceDispatched,
        slot: {
          requestedDate: new Date().toISOString().split('T')[0],
          requestedTimeWindow: 'IMMEDIATE EMERGENCY REQUEST',
          status: 'PENDING_CONFIRMATION',
          facilityRemarks: 'Emergency notification queued for receiving facility triage desk (Demo).',
        },
        hasGapAlert: false,
      });

      setIsSubmitting(false);
      navigate(`/health-worker/referrals/${newReferral.id}`);
    } catch (err: unknown) {
      setIsSubmitting(false);
      const msg = err instanceof ApiError ? err.message : (err instanceof Error ? err.message : 'Emergency referral creation failed.');
      setError(msg);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Create Emergency Referral"
        subtitle="Zero Administrative Bottleneck: Fast emergency triage coordination without requiring patient login."
        breadcrumbs={[
          { label: 'Health Worker', href: '/health-worker' },
          { label: 'Create Referral', href: '/health-worker/create-referral' },
          { label: 'Emergency Referral' },
        ]}
      />

      {/* Emergency Urgency Notice */}
      <div className="p-4 bg-red-700 text-white rounded-gov border border-red-800 shadow-gov-card space-y-1">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-red-200 shrink-0" />
          <h3 className="font-bold text-sm tracking-wide uppercase">
            Priority: Critical Emergency Coordination
          </h3>
        </div>
        <p className="text-xs text-red-100 leading-relaxed">
          Emergency is a referral urgency level, NOT a separate portal or role. Patients are NOT required to have an account, login, or phone to receive emergency facility coordination.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Patient Status (Existing vs Not Registered) */}
        <Card className="shadow-gov-card border-red-200">
          <CardHeader className="bg-red-50/50">
            <CardTitle className="text-red-950">1. Patient Identification Status</CardTitle>
            <CardDescription>
              Choose whether the patient is already registered or currently unregistered/unknown.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-5 space-y-4 text-xs">
            {error && (
              <div className="p-3 bg-red-100 border border-red-300 rounded text-red-950 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-700 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Toggle Segment */}
            <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100 rounded border border-gov-border">
              <button
                type="button"
                onClick={() => setPatientStatus('existing')}
                className={`py-2 px-3 rounded text-xs font-semibold transition-all ${
                  patientStatus === 'existing'
                    ? 'bg-white text-gov-green-950 shadow-gov-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                1. Existing Associated Patient
              </button>
              <button
                type="button"
                onClick={() => setPatientStatus('unregistered')}
                className={`py-2 px-3 rounded text-xs font-semibold transition-all ${
                  patientStatus === 'unregistered'
                    ? 'bg-red-700 text-white shadow-gov-sm'
                    : 'text-red-700 hover:bg-red-100'
                }`}
              >
                2. Patient Not Registered / Trauma
              </button>
            </div>

            {patientStatus === 'existing' ? (
              <div className="space-y-3 pt-2">
                <FormField label="Select Patient from Assigned Village Registry" required>
                  <select
                    value={selectedPatientId}
                    onChange={(e) => setSelectedPatientId(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gov-border rounded-gov bg-white focus:outline-none focus:ring-1 focus:ring-gov-green-700"
                  >
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.fullName} ({p.age} yrs, {p.gender}) — {p.village} | ABHA: {p.abhaId || 'Pending'}
                      </option>
                    ))}
                  </select>
                </FormField>
                {selectedExistingPatient && (
                  <div className="p-3 bg-slate-50 border rounded text-[11px] text-slate-700">
                    <strong>Selected:</strong> {selectedExistingPatient.fullName} • Age {selectedExistingPatient.age} ({selectedExistingPatient.gender}) • Village: {selectedExistingPatient.village}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3 pt-2">
                <div className="p-3 bg-amber-50 border border-amber-200 rounded text-amber-900 leading-relaxed text-[11px]">
                  <strong>Rapid Field Triage Mode:</strong> Enter available details. Approximate or unknown values are permitted so patient care is not delayed.
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <FormField label="Patient Name (or 'Unknown')" required>
                    <Input
                      type="text"
                      value={unregisteredName}
                      onChange={(e) => setUnregisteredName(e.target.value)}
                      placeholder="e.g. Unknown Male or Sunanda Patil"
                      required
                    />
                  </FormField>

                  <FormField label="Approximate Age" required>
                    <Input
                      type="number"
                      value={unregisteredAge}
                      onChange={(e) => setUnregisteredAge(e.target.value)}
                      placeholder="e.g. 35"
                      required
                    />
                  </FormField>

                  <FormField label="Gender" required>
                    <select
                      value={unregisteredGender}
                      onChange={(e) => setUnregisteredGender(e.target.value as Gender)}
                      className="w-full px-3 py-2 text-xs border border-gov-border rounded-gov bg-white focus:outline-none focus:ring-1 focus:ring-gov-green-700"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </FormField>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FormField label="Incident Location / Village Landmark" required>
                    <Input
                      type="text"
                      value={incidentLocation}
                      onChange={(e) => setIncidentLocation(e.target.value)}
                      placeholder="e.g. NH-4 Highway near Shivapur Toll Plaza"
                      required
                    />
                  </FormField>

                  <FormField label="On-Scene Contact / Caller Phone" helperText="Attendant or ambulance driver contact">
                    <Input
                      type="tel"
                      value={callerPhone}
                      onChange={(e) => setCallerPhone(e.target.value)}
                      placeholder="+91 98XXX XXXXX"
                    />
                  </FormField>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Step 2: Emergency Service & Clinical Information */}
        <Card className="shadow-gov-card border-red-200">
          <CardHeader className="bg-red-50/50">
            <CardTitle className="text-red-950">2. Emergency Clinical Details</CardTitle>
            <CardDescription>
              Critical conditions requiring immediate hospital triage pre-notification.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-5 space-y-4 text-xs">
            <FormField label="Required Emergency Department / Service" required>
              <select
                value={emergencyDepartment}
                onChange={(e) => setEmergencyDepartment(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gov-border rounded-gov bg-white focus:outline-none focus:ring-1 focus:ring-gov-green-700"
              >
                <option value="General Surgery & Trauma Triage">
                  Trauma Triage & Acute Surgery (Accident / Fracture / Hemorrhage)
                </option>
                <option value="Obstetrics & Gynaecology (Emergency C-Section)">
                  Emergency Obstetric Care (Eclampsia / Postpartum Hemorrhage)
                </option>
                <option value="Pediatrics & Special Newborn Care (SNCU)">
                  Neonatal Emergency / Asphyxia (SNCU / NICU)
                </option>
                <option value="Cardiology & Cath Lab">
                  Cardiology (Acute Chest Pain / Myocardial Infarction)
                </option>
              </select>
            </FormField>

            <FormField label="Emergency Reason / Chief Complaint" required>
              <Input
                type="text"
                value={chiefComplaint}
                onChange={(e) => setChiefComplaint(e.target.value)}
                placeholder="e.g. Severe blunt trauma, open wound, SpO2 dropping to 90%"
                required
              />
            </FormField>

            <FormField label="Emergency Clinical Observations (Provided During Referral)">
              <textarea
                value={clinicalNotes}
                onChange={(e) => setClinicalNotes(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 text-xs border border-gov-border rounded-gov bg-white focus:outline-none focus:ring-1 focus:ring-gov-green-700"
                placeholder="e.g. Tourniquet applied, IV access established, patient in shock."
              />
            </FormField>

            <div className="p-3 bg-red-50 border border-red-200 rounded flex items-center gap-2">
              <input
                type="checkbox"
                id="ambCheck"
                checked={ambulanceDispatched}
                onChange={(e) => setAmbulanceDispatched(e.target.checked)}
                className="rounded border-red-300 text-red-700 focus:ring-red-600"
              />
              <label htmlFor="ambCheck" className="text-xs text-red-950 font-semibold flex items-center gap-1.5 cursor-pointer">
                <Truck className="w-4 h-4 text-red-700" />
                Emergency transport assistance requested (Simulated field coordination — CareLoop does not directly dispatch ambulances)
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Step 3: Emergency Facility Selection */}
        <Card className="shadow-gov-card border-red-200">
          <CardHeader className="bg-red-50/50">
            <CardTitle className="text-red-950">3. Emergency-Ready Receiving Facilities</CardTitle>
            <CardDescription>
              Demo facility data • Mock availability values. Showing hospitals with configured 24x7 casualty, ICU bed readiness, and emergency surgical capabilities.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-5 space-y-3 text-xs">
            <div className="grid grid-cols-1 gap-3">
              {facilities.map((fac) => {
                const isSelected = fac.id === selectedFacilityId;

                return (
                  <div
                    key={fac.id}
                    onClick={() => setSelectedFacilityId(fac.id)}
                    className={`p-4 rounded-gov border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-red-600 bg-red-50/80 ring-2 ring-red-600'
                        : 'border-gov-border bg-white hover:border-red-300'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-red-700" />
                          <span className="font-bold text-gov-text-primary text-sm">
                            {fac.name}
                          </span>
                          <span className="text-[11px] px-2 py-0.5 rounded bg-red-100 text-red-900 font-semibold">
                            {fac.type}
                          </span>
                        </div>
                        <div className="text-slate-600 text-[11px] mt-0.5">
                          Emergency Contact: <strong>{fac.contactNumber}</strong> • Block: {fac.block}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        <span className="font-bold text-red-900 text-xs">
                          ~{fac.distanceKm} km (Mock)
                        </span>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-red-700" />
                        )}
                      </div>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-red-200 grid grid-cols-3 gap-2 text-[11px]">
                      <div>Mock ICU Beds: <strong>{fac.icuBedsAvailable} Available</strong></div>
                      <div>Demo Bed Capacity: <strong>{fac.availableBeds} / {fac.totalBeds}</strong></div>
                      <div>24/7 Casualty: <strong className="text-emerald-700">Demo Active</strong></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>

          <CardFooter className="bg-red-50/80 border-t border-red-200 flex items-center justify-between">
            <Link to="/health-worker/create-referral">
              <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              variant="emergency"
              size="sm"
              leftIcon={<Siren className="w-3.5 h-3.5" />}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting Emergency Referral...' : 'Submit Emergency Referral'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
};
