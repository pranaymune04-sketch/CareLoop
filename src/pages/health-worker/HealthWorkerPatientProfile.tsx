import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/layout';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  Button, 
  StatusBadge, 
  EmptyState 
} from '@/components/ui';
import { mockHealthWorker } from '@/mock';
import { careLoopApi, ApiError } from '@/api/client';
import { Patient, Referral } from '@/types';
import { 
  FilePlus2, 
  Siren, 
  Phone, 
  ArrowLeft, 
  Eye, 
  Activity, 
  CheckCircle2 
} from 'lucide-react';

export const HealthWorkerPatientProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [patientReferrals, setPatientReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadPatientDetails() {
      if (!id) return;
      try {
        setLoading(true);
        const [patData, refsData] = await Promise.all([
          careLoopApi.getPatientById(id),
          careLoopApi.getReferrals({ patientId: id }),
        ]);
        if (isMounted) {
          setPatient(patData);
          setPatientReferrals(refsData);
          setError(null);
        }
      } catch (err: unknown) {
        if (isMounted) {
          const msg = err instanceof ApiError ? err.message : 'Patient record not found.';
          setError(msg);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadPatientDetails();
    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center text-sm text-gov-text-secondary">
        Loading patient dossier...
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <EmptyState
          title="Patient Record Not Found"
          description={error || "The requested patient was not found in your assigned village sub-centre records."}
          actionLabel="Back to Village Patients"
          onAction={() => navigate('/health-worker/patients')}
        />
      </div>
    );
  }

  const activeReferral = patientReferrals.find(
    (r) => r.status !== 'COMPLETED' && r.status !== 'CANCELLED'
  );
  const pastReferrals = patientReferrals.filter(
    (r) => r.status === 'COMPLETED' || r.status === 'CANCELLED'
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <PageHeader
        title={`Patient: ${patient.fullName}`}
        subtitle={`ID: ${patient.id} • Village: ${patient.village}, ${patient.district} • Sub-Centre: ${mockHealthWorker.assignedSubCenter}`}
        breadcrumbs={[
          { label: 'Health Worker', href: '/health-worker' },
          { label: 'Village Patients', href: '/health-worker/patients' },
          { label: patient.fullName },
        ]}
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <Link to={`/health-worker/create-referral/emergency?patientId=${patient.id}`}>
              <Button variant="emergency" size="sm" leftIcon={<Siren className="w-4 h-4" />}>
                Emergency Referral
              </Button>
            </Link>
            <Link to={`/health-worker/create-referral/normal?patientId=${patient.id}`}>
              <Button variant="primary" size="sm" leftIcon={<FilePlus2 className="w-4 h-4" />}>
                + New Normal Referral
              </Button>
            </Link>
          </div>
        }
      />

      {/* Demographic Profile Card */}
      <Card className="shadow-gov-card">
        <CardHeader className="bg-slate-50/70">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base text-gov-text-primary">
                Demographic & Field Identification
              </CardTitle>
              <CardDescription>
                Associated with {mockHealthWorker.name} ({mockHealthWorker.cadre}, {mockHealthWorker.assignedSubCenter})
              </CardDescription>
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300 self-start sm:self-auto">
              Village Jurisdiction Confirmed
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-5 space-y-4 text-xs">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-50 rounded-gov border border-gov-border">
            <div>
              <span className="text-slate-500 block text-[11px]">Age / Gender:</span>
              <strong className="text-gov-text-primary text-sm">{patient.age} yrs • {patient.gender}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Blood Group:</span>
              <strong className="text-gov-text-primary text-sm">{patient.bloodGroup || 'Not Tested'}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">ABHA ID (Demo):</span>
              <span className="font-mono text-slate-800 font-semibold">{patient.abhaId || 'Pending'}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Contact Mobile:</span>
              {patient.phone ? (
                <a href={`tel:${patient.phone}`} className="font-semibold text-gov-green-800 hover:underline flex items-center gap-1 mt-0.5">
                  <Phone className="w-3 h-3" /> {patient.phone}
                </a>
              ) : (
                <span className="text-slate-400">Not registered</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 bg-white rounded border border-gov-border">
              <span className="text-slate-500 block text-[11px] font-medium">Residential Jurisdiction:</span>
              <div className="text-slate-800 font-medium mt-0.5">
                Village: {patient.village}, Block: {patient.subDistrict}, District: {patient.district}, State: {patient.state}
              </div>
            </div>

            <div className="p-3 bg-white rounded border border-gov-border">
              <span className="text-slate-500 block text-[11px] font-medium">Pre-existing Health Notes:</span>
              <div className="text-slate-800 font-medium mt-0.5">
                {patient.preExistingConditions && patient.preExistingConditions.length > 0
                  ? patient.preExistingConditions.join(', ')
                  : 'No chronic conditions recorded.'}
              </div>
            </div>
          </div>

          {patient.latestVitals && (
            <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded">
              <div className="flex items-center gap-1.5 font-bold text-emerald-950 mb-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-800" />
                <span>Sub-Centre Field Vitals (Recorded: {new Date(patient.latestVitals.recordedAt).toLocaleDateString()})</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-700">
                <div>BP: <strong>{patient.latestVitals.bpSystolic}/{patient.latestVitals.bpDiastolic} mmHg</strong></div>
                <div>Pulse: <strong>{patient.latestVitals.pulseRate} bpm</strong></div>
                <div>SpO2: <strong>{patient.latestVitals.spO2}%</strong></div>
                <div>Temp: <strong>{patient.latestVitals.temperature}°F</strong></div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Referral Section */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gov-green-950">
          Current Active Referral
        </h3>

        {activeReferral ? (
          <Card className="border-gov-green-300 shadow-gov-card">
            <CardHeader className="bg-gov-green-50/50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold text-gov-green-950">
                    {activeReferral.referralNumber}
                  </span>
                  <StatusBadge status={activeReferral.status} size="sm" />
                  <StatusBadge type={activeReferral.referralType} size="sm" />
                  <StatusBadge priority={activeReferral.priority} size="sm" />
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  Created {new Date(activeReferral.createdAt).toLocaleDateString()}
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-5 space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded border border-gov-border">
                <div>
                  <span className="text-slate-500 text-[11px] block">Target Facility & Service:</span>
                  <strong className="text-gov-text-primary block">{activeReferral.targetFacilityName}</strong>
                  <span className="text-slate-500 text-[11px]">{activeReferral.targetDepartment}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px] block">Appointment Slot Status:</span>
                  {activeReferral.slot.status === 'CONFIRMED' ? (
                    <div>
                      <strong className="text-gov-green-900 block">
                        {activeReferral.slot.confirmedDate} ({activeReferral.slot.confirmedTimeWindow})
                      </strong>
                      <span className="text-emerald-700 font-semibold text-[11px]">✓ Confirmed by Hospital</span>
                    </div>
                  ) : activeReferral.slot.status === 'ALTERNATIVE_PROPOSED' ? (
                    <div>
                      <strong className="text-amber-900 block">
                        Proposed: {activeReferral.slot.counterProposedSlot}
                      </strong>
                      <span className="text-amber-700 font-semibold text-[11px]">Hospital Counter-Proposed</span>
                    </div>
                  ) : (
                    <div>
                      <strong className="text-slate-700 block">
                        Requested: {activeReferral.slot.requestedDate} ({activeReferral.slot.requestedTimeWindow})
                      </strong>
                      <span className="text-slate-500 text-[11px]">Awaiting Facility Confirmation</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <span className="text-slate-500 text-[11px] font-semibold block mb-0.5">
                  Clinical information provided during referral:
                </span>
                <p className="text-slate-800 bg-white p-2.5 rounded border border-gov-border">
                  {activeReferral.chiefComplaint}
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-gov-border">
                <span className="text-[11px] text-slate-500">
                  Continuum Stage: <strong>{activeReferral.status}</strong>
                </span>
                <Link to={`/health-worker/referrals/${activeReferral.id}`}>
                  <Button variant="primary" size="sm" rightIcon={<Eye className="w-3.5 h-3.5" />}>
                    Open Referral Dossier
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="p-6 text-center text-xs">
            <CheckCircle2 className="w-8 h-8 text-gov-green-700 mx-auto mb-2" />
            <h4 className="font-bold text-gov-text-primary text-sm">No Active Referral Pending</h4>
            <p className="text-slate-500 mt-1 max-w-sm mx-auto">
              This patient currently has no open or in-transit referral slips.
            </p>
            <div className="mt-3">
              <Link to={`/health-worker/create-referral/normal?patientId=${patient.id}`}>
                <Button variant="primary" size="sm" leftIcon={<FilePlus2 className="w-3.5 h-3.5" />}>
                  Create Referral for {patient.fullName}
                </Button>
              </Link>
            </div>
          </Card>
        )}
      </div>

      {/* Referral History Section */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gov-green-950">
          Referral History ({pastReferrals.length} Closed / Completed)
        </h3>

        {pastReferrals.length > 0 ? (
          <div className="space-y-2.5">
            {pastReferrals.map((ref) => (
              <Card key={ref.id} className="p-4 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-700">{ref.referralNumber}</span>
                      <StatusBadge status="COMPLETED" size="sm" />
                      <span className="text-slate-500">• {new Date(ref.updatedAt).toLocaleDateString()}</span>
                    </div>
                    <div className="font-semibold text-slate-900 mt-1">
                      {ref.targetDepartment} — {ref.targetFacilityName}
                    </div>
                  </div>
                  <Link to={`/health-worker/referrals/${ref.id}`}>
                    <Button variant="outline" size="sm">
                      View Record
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded border border-gov-border">
            No completed past referral records for this patient.
          </p>
        )}
      </div>

      {/* Back Button */}
      <div className="pt-2">
        <Link to="/health-worker/patients">
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
            Back to Village Patients Registry
          </Button>
        </Link>
      </div>
    </div>
  );
};
