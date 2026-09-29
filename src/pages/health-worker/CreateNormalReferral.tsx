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
import { Patient, Facility } from '@/types';
import { 
  FilePlus2, 
  Building2, 
  Clock, 
  CheckCircle2, 
  ArrowLeft, 
  AlertCircle,
  Truck
} from 'lucide-react';

export const CreateNormalReferral: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [patients, setPatients] = useState<Patient[]>(() => CareLoopStore.getPatients());
  const [facilities, setFacilities] = useState<Facility[]>(() => CareLoopStore.getFacilities());
  const initialPatientId = searchParams.get('patientId') || patients[0]?.id || '';
  const [patientId, setPatientId] = useState(initialPatientId);

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
          setFacilities(facList);
          if (!patientId && patList.length > 0) {
            setPatientId(patList[0].id);
          }
        }
      } catch {
        // Fallback already seeded
      }
    }
    loadResources();
    return () => {
      isMounted = false;
    };
  }, []);

  // Form State
  const [targetDepartment, setTargetDepartment] = useState('Obstetrics & Gynaecology (Emergency C-Section)');
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [transportRequired, setTransportRequired] = useState(false);

  // Facility Selection
  const [selectedFacilityId, setSelectedFacilityId] = useState(facilities[1]?.id || facilities[0]?.id || '');
  const [requestedDate, setRequestedDate] = useState('2026-09-20');
  const [requestedTimeWindow, setRequestedTimeWindow] = useState('10:00 - 12:00 PM');

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedPatient = patients.find((p) => p.id === patientId) || CareLoopStore.getPatientById(patientId);
  const selectedFacility = facilities.find((f) => f.id === selectedFacilityId) || facilities[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedPatient) {
      setError('Please select an active patient from your assigned village registry.');
      return;
    }
    if (!chiefComplaint.trim()) {
      setError('Please enter the chief clinical complaint reported during referral.');
      return;
    }
    if (!selectedFacility) {
      setError('Please select a valid receiving facility.');
      return;
    }

    try {
      setIsSubmitting(true);

      const newReferral = await careLoopApi.createReferral({
        referralType: 'NORMAL',
        priority: 'ROUTINE',
        patientId: selectedPatient.id,
        patientName: selectedPatient.fullName,
        patientAge: selectedPatient.age,
        patientGender: selectedPatient.gender,
        patientPhone: selectedPatient.phone,
        isUnregisteredEmergency: false,
        referringWorkerId: mockHealthWorker.id,
        referringWorkerName: mockHealthWorker.name,
        referringWorkerCadre: mockHealthWorker.cadre,
        referringWorkerPhone: mockHealthWorker.phone,
        originSubCenter: mockHealthWorker.assignedSubCenter,
        village: selectedPatient.village,
        targetFacilityId: selectedFacility.id,
        targetFacilityName: selectedFacility.name,
        targetFacilityType: selectedFacility.type,
        targetDepartment,
        chiefComplaint: chiefComplaint.trim(),
        clinicalNotes: clinicalNotes.trim() || 'Recorded during sub-centre health worker consultation.',
        transportRequired,
        slot: {
          requestedDate,
          requestedTimeWindow,
          facilityRemarks: 'Slot request transmitted. Awaiting receiving facility confirmation.',
        },
      });

      // Synchronize in-memory/mock store so un-migrated tabs (e.g. facility demo) also see it
      CareLoopStore.createReferral({
        referralType: 'NORMAL',
        priority: 'ROUTINE',
        status: 'REFERRED',
        patientId: selectedPatient.id,
        patientName: selectedPatient.fullName,
        patientAge: selectedPatient.age,
        patientGender: selectedPatient.gender,
        patientPhone: selectedPatient.phone,
        isUnregisteredEmergency: false,
        referringWorkerId: mockHealthWorker.id,
        referringWorkerName: mockHealthWorker.name,
        referringWorkerCadre: mockHealthWorker.cadre,
        referringWorkerPhone: mockHealthWorker.phone,
        originSubCenter: mockHealthWorker.assignedSubCenter,
        village: selectedPatient.village,
        targetFacilityId: selectedFacility.id,
        targetFacilityName: selectedFacility.name,
        targetFacilityType: selectedFacility.type,
        targetDepartment,
        chiefComplaint: chiefComplaint.trim(),
        clinicalNotes: clinicalNotes.trim() || 'Recorded during sub-centre health worker consultation.',
        transportRequired,
        slot: {
          requestedDate,
          requestedTimeWindow,
          status: 'PENDING_CONFIRMATION',
          facilityRemarks: 'Slot request transmitted. Awaiting receiving facility confirmation.',
        },
        hasGapAlert: false,
      });

      setIsSubmitting(false);
      navigate(`/health-worker/referrals/${newReferral.id}`);
    } catch (err: unknown) {
      setIsSubmitting(false);
      const msg = err instanceof ApiError ? err.message : (err instanceof Error ? err.message : 'Referral creation failed.');
      setError(msg);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Create Normal Referral"
        subtitle="Planned specialist coordination with Smart Facility Matching and Slot Request"
        breadcrumbs={[
          { label: 'Health Worker', href: '/health-worker' },
          { label: 'Create Referral', href: '/health-worker/create-referral' },
          { label: 'Normal Referral' },
        ]}
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Select Associated Patient */}
        <Card className="shadow-gov-card">
          <CardHeader>
            <CardTitle>1. Select Village Patient</CardTitle>
            <CardDescription>
              Select an associated citizen from {mockHealthWorker.assignedSubCenter}.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 space-y-4 text-xs">
            {error && (
              <div className="p-3 bg-red-50 border border-red-300 rounded text-red-900 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <FormField label="Assigned Patient" required>
              <select
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gov-border rounded-gov bg-white focus:outline-none focus:ring-1 focus:ring-gov-green-700"
              >
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.fullName} ({p.age} yrs, {p.gender}) — {p.village} | ID: {p.abhaId || p.id}
                  </option>
                ))}
              </select>
            </FormField>

            {selectedPatient && (
              <div className="p-3 bg-slate-50 rounded border border-gov-border flex flex-wrap items-center justify-between gap-2">
                <div>
                  <strong>Selected:</strong> {selectedPatient.fullName} • Age {selectedPatient.age} ({selectedPatient.gender})
                  <span className="text-slate-500 block text-[11px]">
                    Village: {selectedPatient.village}, {selectedPatient.district}
                  </span>
                </div>
                <Link
                  to="/health-worker/patients/register"
                  className="text-gov-green-800 hover:underline font-semibold text-[11px]"
                >
                  + Register different patient
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Step 2: Clinical Details Provided During Referral */}
        <Card className="shadow-gov-card">
          <CardHeader>
            <CardTitle>2. Clinical Information Provided During Referral</CardTitle>
            <CardDescription>
              Record clinical observations and requirements. CareLoop does not diagnose patients.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 space-y-4 text-xs">
            <FormField label="Required Specialty / Clinical Department" required>
              <select
                value={targetDepartment}
                onChange={(e) => setTargetDepartment(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gov-border rounded-gov bg-white focus:outline-none focus:ring-1 focus:ring-gov-green-700"
              >
                <option value="Obstetrics & Gynaecology (Emergency C-Section)">
                  Obstetrics & Gynaecology (High-Risk ANC / Delivery)
                </option>
                <option value="Pediatrics & Special Newborn Care (SNCU)">
                  Pediatrics & Neonatal Care (SNCU)
                </option>
                <option value="General Medicine & OPD">
                  General Medicine / NCD Screening (Diabetes & Hypertension)
                </option>
                <option value="General Surgery & Trauma Triage">
                  General Surgery & Acute Care
                </option>
                <option value="Cardiology & Cath Lab">Cardiology / Cardiac Evaluation</option>
                <option value="Basic Antenatal & Delivery Care">Basic Antenatal Clinic</option>
              </select>
            </FormField>

            <FormField
              label="Chief Complaint (Reported During Referral)"
              required
              helperText="Patient symptoms, onset, and referral rationale"
            >
              <Input
                type="text"
                value={chiefComplaint}
                onChange={(e) => setChiefComplaint(e.target.value)}
                placeholder="e.g. Persistent headache and elevated BP (145/95) at 32 weeks gestation"
                required
              />
            </FormField>

            <FormField
              label="Clinical Notes / Sub-Centre Findings (Provided During Referral)"
              helperText="Vitals, observations, or preliminary field measurements"
            >
              <textarea
                value={clinicalNotes}
                onChange={(e) => setClinicalNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 text-xs border border-gov-border rounded-gov bg-white focus:outline-none focus:ring-1 focus:ring-gov-green-700"
                placeholder="e.g. Urine albumin trace, pedal edema +1. Advised salt restriction, referred for USG and OBGYN consultation."
              />
            </FormField>

            <div className="pt-1">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={transportRequired}
                  onChange={(e) => setTransportRequired(e.target.checked)}
                  className="rounded border-gov-border text-gov-green-800 focus:ring-gov-green-700"
                />
                <span className="text-xs text-slate-800 font-medium flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-slate-500" />
                  Patient requires transport assistance (Simulated coordination — CareLoop does not dispatch ambulances)
                </span>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Step 3: Smart Facility Matching Screen */}
        <Card className="shadow-gov-card">
          <CardHeader>
            <CardTitle>3. Smart Facility Matching Network</CardTitle>
            <CardDescription>
              Demo facility data • Mock availability values. Public health facilities ranked by regional proximity, bed readiness, and department capability.
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
                        ? 'border-gov-green-600 bg-gov-green-50/60 ring-2 ring-gov-green-600'
                        : 'border-gov-border bg-white hover:border-slate-400'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-gov-green-800" />
                          <span className="font-bold text-gov-text-primary text-sm">
                            {fac.name}
                          </span>
                          <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            {fac.type}
                          </span>
                        </div>
                        <div className="text-slate-600 text-[11px]">
                          Block: {fac.block}, {fac.district} • Contact: {fac.contactNumber}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        <span className="font-bold text-gov-green-950 text-xs">
                          ~{fac.distanceKm} km (Mock)
                        </span>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-gov-green-800" />
                        )}
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-gov-border/60 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-700">
                      <div>
                        <span className="text-slate-500 block text-[10px]">Mock Available Beds</span>
                        <strong>{fac.availableBeds} / {fac.totalBeds}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Mock ICU Beds</span>
                        <strong>{fac.icuBedsAvailable} Available</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">24x7 Emergency</span>
                        <strong className={fac.emergencyAvailable24x7 ? 'text-emerald-700' : 'text-slate-500'}>
                          {fac.emergencyAvailable24x7 ? 'Active (Demo)' : 'No'}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Ambulance Support (Demo Info)</span>
                        <strong className={fac.ambulanceAvailable ? 'text-emerald-700' : 'text-slate-500'}>
                          {fac.ambulanceAvailable ? 'Supported' : 'Unavailable'}
                        </strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Step 4: Requested Slot (Explicitly Distinct from Confirmed Appointment) */}
        <Card className="shadow-gov-card border-amber-200">
          <CardHeader className="bg-amber-50/50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-amber-950">
                  4. Preferred Appointment Schedule (Requested Slot)
                </CardTitle>
                <CardDescription className="text-amber-900">
                  CRITICAL RULE: The requested slot is a preference transmitted to the hospital. It is NOT a confirmed appointment until accepted by the receiving facility.
                </CardDescription>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded bg-amber-100 text-amber-900 border border-amber-300">
                Requested Slot Only
              </span>
            </div>
          </CardHeader>

          <CardContent className="p-5 space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Requested Date" required>
                <Input
                  type="date"
                  value={requestedDate}
                  onChange={(e) => setRequestedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </FormField>

              <FormField label="Requested Time Window" required>
                <select
                  value={requestedTimeWindow}
                  onChange={(e) => setRequestedTimeWindow(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gov-border rounded-gov bg-white focus:outline-none focus:ring-1 focus:ring-gov-green-700"
                >
                  <option value="09:00 - 11:00 AM">Morning Session (09:00 - 11:00 AM)</option>
                  <option value="10:00 - 12:00 PM">Late Morning (10:00 - 12:00 PM)</option>
                  <option value="01:00 - 03:00 PM">Afternoon Session (01:00 - 03:00 PM)</option>
                  <option value="03:00 - 05:00 PM">Evening Session (03:00 - 05:00 PM)</option>
                </select>
              </FormField>
            </div>

            <div className="p-3 bg-slate-50 border border-gov-border rounded text-[11px] text-slate-600 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-500 shrink-0" />
              <span>
                On submission, this referral will enter the continuum with status <strong>REFERRED</strong> and slot status <strong>PENDING_CONFIRMATION</strong>.
              </span>
            </div>
          </CardContent>

          <CardFooter className="bg-slate-50 border-t border-gov-border flex items-center justify-between">
            <Link to="/health-worker/create-referral">
              <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              leftIcon={<FilePlus2 className="w-3.5 h-3.5" />}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting Referral...' : 'Create & Request Slot'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
};
