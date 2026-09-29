import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
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
  Input, 
  Select, 
  DateTimeInput,
  ConfirmationDialog
} from '@/components/ui';
import { mockPatients, mockFacilities } from '@/mock';
import { Siren, FileText, AlertTriangle } from 'lucide-react';

export const CreateReferralPlaceholder: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Mode: NORMAL vs EMERGENCY
  const initialMode = searchParams.get('type') === 'emergency' ? 'EMERGENCY' : 'NORMAL';
  const [referralType, setReferralType] = useState<'NORMAL' | 'EMERGENCY'>(initialMode);

  // Emergency patient mode: registered or unregistered
  const [emergencyPatientType, setEmergencyPatientType] = useState<'registered' | 'unregistered'>('unregistered');

  // Form fields
  const [selectedPatientId, setSelectedPatientId] = useState(mockPatients[0].id);
  const [unregisteredName, setUnregisteredName] = useState('');
  const [unregisteredAge, setUnregisteredAge] = useState('');
  const [unregisteredGender, setUnregisteredGender] = useState('male');

  const [targetFacilityId, setTargetFacilityId] = useState(mockFacilities[0].id);
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [requestedDate, setRequestedDate] = useState('2026-09-19');
  const [requestedTime, setRequestedTime] = useState('10:00');

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    if (searchParams.get('type') === 'emergency') {
      setReferralType('EMERGENCY');
    }
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirmModal(true);
  };

  const handleFinalSubmit = () => {
    setShowConfirmModal(false);
    alert(`${referralType} Referral created successfully in foundation mock store!`);
    navigate('/health-worker/referrals');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title={referralType === 'EMERGENCY' ? 'Create Emergency Referral' : 'Create Normal Referral'}
        subtitle="Referral created ≠ Care completed. Follow through all continuum steps."
        breadcrumbs={[
          { label: 'Health Worker', href: '/health-worker' },
          { label: 'Referrals', href: '/health-worker/referrals' },
          { label: 'Create Referral' },
        ]}
      />

      {/* Referral Type Selector Segment */}
      <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100 rounded-gov border border-gov-border">
        <button
          type="button"
          onClick={() => setReferralType('NORMAL')}
          className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded text-xs font-semibold transition-all ${
            referralType === 'NORMAL'
              ? 'bg-white text-gov-green-900 shadow-gov-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4 text-gov-green-800" />
          <span>Normal Referral</span>
        </button>

        <button
          type="button"
          onClick={() => setReferralType('EMERGENCY')}
          className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded text-xs font-semibold transition-all ${
            referralType === 'EMERGENCY'
              ? 'bg-red-700 text-white shadow-gov-sm'
              : 'text-red-700 hover:bg-red-50'
          }`}
        >
          <Siren className="w-4 h-4 text-current" />
          <span>Emergency Referral</span>
        </button>
      </div>

      {/* Emergency Rule Notice Banner */}
      {referralType === 'EMERGENCY' && (
        <div className="p-4 bg-red-50 border-l-4 border-l-red-600 rounded-gov border border-red-200">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-red-950 uppercase tracking-wide">
                Emergency Protocol Active
              </h4>
              <p className="text-xs text-red-800 mt-0.5 leading-relaxed">
                Prior registration or citizen login is <strong>NOT required</strong> for emergency referrals. Facility red triage will be pre-notified (Demo coordination).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Form Container */}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>
              {referralType === 'EMERGENCY' ? '1. Emergency Patient Identification' : '1. Patient Selection'}
            </CardTitle>
            <CardDescription>
              {referralType === 'EMERGENCY'
                ? 'Select existing village patient or quickly enter details for unregistered/trauma victim.'
                : 'Select registered village patient with ABHA record.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Emergency sub-choice: registered vs unregistered */}
            {referralType === 'EMERGENCY' && (
              <div className="flex items-center gap-4 pb-2 border-b border-gov-border text-xs">
                <label className="flex items-center gap-2 font-medium text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="emergencyPatientType"
                    checked={emergencyPatientType === 'unregistered'}
                    onChange={() => setEmergencyPatientType('unregistered')}
                    className="text-red-700 focus:ring-red-700"
                  />
                  <span>Unregistered Patient (Immediate Triage)</span>
                </label>
                <label className="flex items-center gap-2 font-medium text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="emergencyPatientType"
                    checked={emergencyPatientType === 'registered'}
                    onChange={() => setEmergencyPatientType('registered')}
                    className="text-red-700 focus:ring-red-700"
                  />
                  <span>Existing Village Patient</span>
                </label>
              </div>
            )}

            {/* If normal or emergency-registered */}
            {(referralType === 'NORMAL' || emergencyPatientType === 'registered') && (
              <FormField label="Select Patient" required helperText="Filtered by your assigned village">
                <Select
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  options={mockPatients
                    .filter((p) => p.registrationStatus === 'registered')
                    .map((p) => ({
                      value: p.id,
                      label: `${p.fullName} (Age ${p.age}, ${p.gender}) — ABHA: ${p.abhaId || 'N/A'} — ${p.village}`,
                    }))}
                />
              </FormField>
            )}

            {/* If unregistered emergency patient */}
            {referralType === 'EMERGENCY' && emergencyPatientType === 'unregistered' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <FormField label="Approx. Patient Name / ID" required helperText="e.g. Unknown Trauma Male">
                  <Input
                    value={unregisteredName}
                    onChange={(e) => setUnregisteredName(e.target.value)}
                    placeholder="Patient Name or Description"
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
                  <Select
                    value={unregisteredGender}
                    onChange={(e) => setUnregisteredGender(e.target.value)}
                    options={[
                      { value: 'male', label: 'Male' },
                      { value: 'female', label: 'Female' },
                      { value: 'other', label: 'Other / Unknown' },
                    ]}
                  />
                </FormField>
              </div>
            )}

            {/* Clinical & Reason Details */}
            <div className="pt-3 border-t border-gov-border space-y-3">
              <h4 className="text-xs font-bold text-gov-text-primary">2. Clinical Assessment & Reason</h4>
              <FormField label="Chief Complaint / Emergency Condition" required>
                <Input
                  value={chiefComplaint}
                  onChange={(e) => setChiefComplaint(e.target.value)}
                  placeholder="e.g. Severe preeclampsia with high BP / Polytrauma open fracture"
                  required
                />
              </FormField>
              <FormField label="Clinical Findings & Vitals" helperText="Include BP, pulse, SpO2 or preliminary medications given">
                <textarea
                  rows={2}
                  value={clinicalNotes}
                  onChange={(e) => setClinicalNotes(e.target.value)}
                  className="w-full rounded-gov border border-gov-border bg-white px-3 py-2 text-xs text-gov-text-primary shadow-gov-sm focus:border-gov-green-800 focus:outline-none focus:ring-1 focus:ring-gov-green-800"
                  placeholder="e.g. Tourniquet applied, IV ringers lactate running..."
                />
              </FormField>
            </div>

            {/* Target Facility Matching */}
            <div className="pt-3 border-t border-gov-border space-y-3">
              <h4 className="text-xs font-bold text-gov-text-primary">3. Target Facility Matching</h4>
              <FormField label="Recommended Matched Facility" required helperText="Ranked by specialty, bed availability & distance">
                <Select
                  value={targetFacilityId}
                  onChange={(e) => setTargetFacilityId(e.target.value)}
                  options={mockFacilities.map((f) => ({
                    value: f.id,
                    label: `${f.name} (${f.type}) — ${f.distanceKm} km away — ${f.availableBeds} beds available`,
                  }))}
                />
              </FormField>
            </div>

            {/* Requested Slot Scheduling (Only relevant for Normal referrals) */}
            {referralType === 'NORMAL' && (
              <div className="pt-3 border-t border-gov-border space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-gov-text-primary">4. Requested Appointment Slot</h4>
                  <span className="text-[11px] text-amber-800 font-medium">
                    Note: Requested slot must be confirmed by the receiving facility
                  </span>
                </div>
                <DateTimeInput
                  dateValue={requestedDate}
                  timeValue={requestedTime}
                  onDateChange={setRequestedDate}
                  onTimeChange={setRequestedTime}
                />
              </div>
            )}
          </CardContent>

          <CardFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => navigate('/health-worker')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant={referralType === 'EMERGENCY' ? 'emergency' : 'primary'}
              size="sm"
            >
              {referralType === 'EMERGENCY' ? 'Submit Emergency Referral' : 'Submit Referral Request'}
            </Button>
          </CardFooter>
        </Card>
      </form>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleFinalSubmit}
        variant={referralType === 'EMERGENCY' ? 'warning' : 'primary'}
        title={referralType === 'EMERGENCY' ? 'Confirm Emergency Referral?' : 'Submit Referral Request?'}
        message={
          referralType === 'EMERGENCY'
            ? 'This will immediately notify the emergency room and pre-triage staff at the selected facility (Demo).'
            : 'The referral slot will be sent to the facility for confirmation. Remember: Referral created ≠ Care completed.'
        }
        confirmText={referralType === 'EMERGENCY' ? 'Confirm Submission' : 'Submit to Facility'}
      />
    </div>
  );
};
