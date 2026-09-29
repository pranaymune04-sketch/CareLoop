import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/layout';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  Button, 
  StatusBadge, 
  EmptyState 
} from '@/components/ui';
import { careLoopApi, ApiError } from '@/api/client';
import { Referral } from '@/types';
import { RerouteModal } from '@/components/health-worker';
import { 
  Phone, 
  Compass, 
  ArrowLeft, 
  AlertTriangle, 
  ShieldCheck,
  Truck
} from 'lucide-react';

export const HealthWorkerReferralDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [referral, setReferral] = useState<Referral | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRerouteOpen, setIsRerouteOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadReferral() {
      if (!id) return;
      try {
        setLoading(true);
        const data = await careLoopApi.getReferralById(id);
        if (isMounted) {
          setReferral(data);
          setError(null);
        }
      } catch (err: unknown) {
        if (isMounted) {
          const msg = err instanceof ApiError ? err.message : 'Referral not found.';
          setError(msg);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadReferral();
    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center text-sm text-gov-text-secondary">
        Loading referral dossier...
      </div>
    );
  }

  if (error || !referral) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <EmptyState
          title="Referral Not Found"
          description={error || "The requested referral record could not be found or you do not have permission to view it."}
          actionLabel="Back to Referrals Pipeline"
          onAction={() => navigate('/health-worker/referrals')}
        />
      </div>
    );
  }

  const handleRerouteComplete = (updated: Referral) => {
    setReferral({ ...updated });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <PageHeader
        title={`Referral Dossier: ${referral.referralNumber}`}
        subtitle={`Issued on ${new Date(referral.createdAt).toLocaleString()} by ${referral.referringWorkerName} (${referral.referringWorkerCadre})`}
        breadcrumbs={[
          { label: 'Health Worker', href: '/health-worker' },
          { label: 'Referrals', href: '/health-worker/referrals' },
          { label: referral.referralNumber },
        ]}
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            {(referral.hasGapAlert || referral.slot.status === 'ALTERNATIVE_PROPOSED' || referral.status === 'REFERRED') && (
              <Button
                variant="emergency"
                size="sm"
                leftIcon={<Compass className="w-3.5 h-3.5" />}
                onClick={() => setIsRerouteOpen(true)}
              >
                Reroute Facility
              </Button>
            )}
            {referral.patientId && (
              <Link to={`/health-worker/patients/${referral.patientId}`}>
                <Button variant="outline" size="sm">
                  Patient Profile
                </Button>
              </Link>
            )}
          </div>
        }
      />

      {/* Continuum Principle Banner */}
      <div className="p-3 bg-gov-green-50 border border-gov-green-200 rounded text-xs text-gov-green-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-gov-green-700 shrink-0" />
          <span>
            CareLoop Continuum: <strong>Referral created ≠ Care completed</strong>. Tracking ongoing delivery at {referral.targetFacilityName}.
          </span>
        </div>
        <span className="font-mono text-[11px] text-gov-green-900 font-bold shrink-0">
          Status: {referral.status}
        </span>
      </div>

      {/* Operational Gap Alert / Exception Banner */}
      {referral.hasGapAlert && (
        <div className="p-4 bg-red-50 border-l-4 border-l-red-600 rounded-gov border border-red-200 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-red-950 uppercase tracking-wide">
                  Care Continuum Exception Detected
                </h4>
                <p className="text-red-800 mt-0.5">
                  {referral.gapReason}
                </p>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  * Operational tracking alert. Follow-up intervention or rerouting recommended.
                </span>
              </div>
            </div>
            <Button
              variant="emergency"
              size="sm"
              leftIcon={<Compass className="w-3.5 h-3.5" />}
              onClick={() => setIsRerouteOpen(true)}
            >
              Initiate Reroute
            </Button>
          </div>
        </div>
      )}

      {/* Main Dossier Card */}
      <Card className="shadow-gov-card">
        <CardHeader className="bg-slate-50/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-bold text-gov-green-950">
                  {referral.referralNumber}
                </span>
                <StatusBadge status={referral.status} />
                <StatusBadge type={referral.referralType} />
                <StatusBadge priority={referral.priority} />
                {referral.isUnregisteredEmergency && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-900 border border-red-300">
                    Unregistered Emergency Case
                  </span>
                )}
              </div>
              <CardTitle className="text-base text-gov-text-primary mt-1">
                {referral.targetDepartment}
              </CardTitle>
            </div>
            <div className="text-xs text-slate-500">
              Last status update: {new Date(referral.updatedAt).toLocaleString()}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-5 space-y-5 text-xs">
          {/* Section 1: Patient & Logistics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 bg-slate-50 rounded-gov border border-gov-border space-y-1.5">
              <span className="text-xs font-bold text-gov-text-primary block">
                Patient Demographics
              </span>
              <div className="font-bold text-gov-green-950 text-sm">
                {referral.patientName}
              </div>
              <div className="text-slate-600 text-[11px]">
                Age: {referral.patientAge} yrs • Gender: {referral.patientGender}
              </div>
              <div className="text-slate-600 text-[11px]">
                Village: {referral.village} • Sub-Centre: {referral.originSubCenter}
              </div>
              {referral.patientPhone && (
                <div className="pt-1">
                  <a
                    href={`tel:${referral.patientPhone}`}
                    className="inline-flex items-center gap-1 text-gov-green-800 font-semibold hover:underline"
                  >
                    <Phone className="w-3 h-3" /> Call Patient ({referral.patientPhone})
                  </a>
                </div>
              )}
            </div>

            <div className="p-3.5 bg-slate-50 rounded-gov border border-gov-border space-y-1.5">
              <span className="text-xs font-bold text-gov-text-primary block">
                Target Facility & Service
              </span>
              <div className="font-bold text-gov-green-950 text-sm">
                {referral.targetFacilityName}
              </div>
              <div className="text-slate-600 text-[11px]">
                Facility Type: {referral.targetFacilityType}
              </div>
              <div className="text-slate-600 text-[11px]">
                Target Department: {referral.targetDepartment}
              </div>
              {referral.transportRequired && (
                <div className="pt-1 text-emerald-800 font-semibold flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5" />
                  <span>Transport support requested {referral.ambulanceDispatched && '(Mock field coordination)'}</span>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Appointment Slot Schedule (Requested vs Confirmed) */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gov-green-900">
              Appointment Slot Schedule
            </h4>
            <div className="p-3.5 bg-white rounded-gov border border-gov-border">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-500 block text-[11px]">Facility Confirmation Status:</span>
                  {referral.slot.status === 'CONFIRMED' ? (
                    <div className="mt-0.5">
                      <strong className="text-gov-green-950 block text-sm">
                        {referral.slot.confirmedDate} ({referral.slot.confirmedTimeWindow})
                      </strong>
                      <span className="text-emerald-700 text-[11px] font-semibold">
                        ✓ Confirmed by Receiving Hospital
                      </span>
                    </div>
                  ) : referral.slot.status === 'ALTERNATIVE_PROPOSED' ? (
                    <div className="mt-0.5">
                      <strong className="text-amber-950 block text-sm">
                        Proposed: {referral.slot.counterProposedSlot}
                      </strong>
                      <span className="text-amber-700 text-[11px] font-semibold">
                        Hospital Proposed Alternative Slot (Awaiting Decision)
                      </span>
                    </div>
                  ) : (
                    <div className="mt-0.5">
                      <strong className="text-slate-700 block text-sm">
                        Requested: {referral.slot.requestedDate} ({referral.slot.requestedTimeWindow})
                      </strong>
                      <span className="text-slate-500 text-[11px]">
                        Slot Requested — Awaiting Receiving Facility Confirmation
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <span className="text-slate-500 block text-[11px]">Facility Remarks / Preparation:</span>
                  <p className="text-slate-800 mt-0.5 font-medium">
                    {referral.slot.facilityRemarks || 'No additional remarks recorded by facility.'}
                  </p>
                  <span className="text-[10px] text-slate-400 block mt-1">
                    * Principle: A requested slot is not a confirmed appointment until accepted by the receiving facility.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Clinical Information Provided During Referral */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gov-green-900">
              Clinical Information Provided During Referral
            </h4>
            <div className="p-3.5 bg-slate-50 rounded-gov border border-gov-border space-y-2.5">
              <div>
                <span className="text-slate-500 text-[11px] block font-medium">Chief Complaint (Reported During Referral):</span>
                <p className="text-slate-800 font-medium mt-0.5">{referral.chiefComplaint}</p>
              </div>

              {referral.provisionalDiagnosis && (
                <div>
                  <span className="text-slate-500 text-[11px] block font-medium">
                    Provisional Diagnosis (Provided by Referring Health Worker):
                  </span>
                  <p className="text-slate-800 font-medium mt-0.5">{referral.provisionalDiagnosis}</p>
                </div>
              )}

              {referral.clinicalNotes && (
                <div>
                  <span className="text-slate-500 text-[11px] block font-medium">
                    Clinical Observations & Field Findings:
                  </span>
                  <p className="text-slate-700 mt-0.5 leading-relaxed bg-white p-2 rounded border border-gov-border">
                    {referral.clinicalNotes}
                  </p>
                </div>
              )}

              <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500">
                * Note: Clinical information provided during referral. CareLoop does not evaluate or diagnose patient conditions.
              </div>
            </div>
          </div>

          {/* Section 4: 6-Stage Care Continuum Event Timeline */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gov-green-900">
                Care Continuum Audit Trail ({referral.events.length} Events)
              </h4>
              <span className="text-[11px] text-slate-500">
                MATCH → REFER → TRACK → DETECT → RECOVER → COMPLETE
              </span>
            </div>

            <div className="p-4 bg-white rounded-gov border border-gov-border space-y-3">
              {referral.events.map((evt) => (
                <div key={evt.id} className="p-3 bg-slate-50 rounded border border-gov-border/80 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={evt.stage} size="sm" />
                      <span className="font-bold text-gov-text-primary">{evt.actorName}</span>
                    </div>
                    <span className="font-mono text-[11px] text-slate-500">
                      {new Date(evt.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-slate-700 leading-relaxed mt-1">
                    {evt.description}
                  </p>
                  {evt.notes && (
                    <div className="mt-1.5 p-1.5 bg-white rounded border border-slate-200 text-[11px] text-slate-600">
                      <strong>Note:</strong> {evt.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Footer Back & Actions */}
          <div className="pt-3 border-t border-gov-border flex flex-wrap items-center justify-between gap-3">
            <Link to="/health-worker/referrals">
              <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
                Back to Referrals Pipeline
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Compass className="w-3.5 h-3.5" />}
                onClick={() => setIsRerouteOpen(true)}
              >
                Reroute Facility
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reroute Modal */}
      <RerouteModal
        referral={referral}
        isOpen={isRerouteOpen}
        onClose={() => setIsRerouteOpen(false)}
        onRerouteComplete={handleRerouteComplete}
      />
    </div>
  );
};
