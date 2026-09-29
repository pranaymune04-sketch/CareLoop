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
import { mockFacilities } from '@/mock';
import { careLoopApi, ApiError } from '@/api/client';
import { Referral, Facility } from '@/types';
import { 
  Building2, 
  Phone, 
  Compass, 
  ArrowLeft, 
  AlertTriangle 
} from 'lucide-react';

export const PatientReferralDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [referral, setReferral] = useState<Referral | null>(null);
  const [facility, setFacility] = useState<Facility | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadDetail() {
      if (!id) return;
      try {
        setLoading(true);
        const refData = await careLoopApi.getReferralById(id);
        if (isMounted) {
          setReferral(refData);
          try {
            const facData = await careLoopApi.getFacilityById(refData.targetFacilityId);
            if (isMounted) setFacility(facData);
          } catch {
            const mockFac = mockFacilities.find((f) => f.id === refData.targetFacilityId);
            if (isMounted) setFacility(mockFac);
          }
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
    loadDetail();
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
          title="Referral Record Not Found"
          description={error || "The requested referral record could not be found or you do not have permission to view it."}
          actionLabel="Back to My Referrals"
          onAction={() => navigate('/patient/referrals')}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Header with breadcrumb */}
      <PageHeader
        title={`Referral: ${referral.referralNumber}`}
        subtitle={`Issued on ${new Date(referral.createdAt).toLocaleDateString()} for ${referral.patientName}`}
        breadcrumbs={[
          { label: 'Patient Portal', href: '/patient' },
          { label: 'My Referrals', href: '/patient/referrals' },
          { label: referral.referralNumber },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Link to={`/patient/referrals/${referral.id}/journey`}>
              <Button variant="outline" size="sm" leftIcon={<Compass className="w-3.5 h-3.5" />}>
                Care Journey
              </Button>
            </Link>
            <Link to={`/patient/referrals/${referral.id}/appointment`}>
              <Button variant="primary" size="sm" leftIcon={<Building2 className="w-3.5 h-3.5" />}>
                Appointment & Facility
              </Button>
            </Link>
          </div>
        }
      />

      {/* Main Referral Record Card */}
      <Card className="shadow-gov-card">
        <CardHeader className="bg-slate-50/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-bold text-gov-green-950">
                  {referral.referralNumber}
                </span>
                <StatusBadge status={referral.status} />
                <StatusBadge type={referral.referralType} />
                <StatusBadge priority={referral.priority} />
              </div>
              <CardTitle className="text-base sm:text-lg text-gov-text-primary">
                {referral.targetDepartment}
              </CardTitle>
            </div>
            <div className="text-xs text-slate-500 font-medium">
              Last update: {new Date(referral.updatedAt).toLocaleString()}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-5 space-y-5 text-xs">
          {/* Gap Alert / Recovery Banner if applicable */}
          {referral.hasGapAlert && (
            <div className="p-4 bg-red-50 border-l-4 border-l-red-600 rounded-gov border border-red-200">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-red-950 text-xs uppercase tracking-wide">
                    {referral.gapReason?.toLowerCase().includes('cannot proceed') || referral.status === 'CANCELLED'
                      ? 'Facility unable to proceed — referral requires rerouting'
                      : 'Continuum Alert: Follow-up Action Required'}
                  </h4>
                  <p className="text-red-800 mt-0.5 leading-relaxed">
                    {referral.gapReason}. Your assigned health worker ({referral.referringWorkerName}) has received an operational recovery alert to review alternative facilities and reroute your care referral.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Section 1: Appointment & Timing Details */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gov-green-900">
              1. Appointment & Slot Schedule
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-gov border border-gov-border">
              <div>
                <span className="text-slate-500 block text-[11px] font-medium">Status of Appointment Slot:</span>
                {referral.slot.status === 'CONFIRMED' ? (
                  <div className="mt-0.5">
                    <strong className="text-gov-green-900 block text-sm">
                      {referral.slot.confirmedDate} ({referral.slot.confirmedTimeWindow})
                    </strong>
                    <span className="text-emerald-700 text-[11px] font-semibold">
                      ✓ Confirmed by Hospital
                    </span>
                  </div>
                ) : referral.slot.status === 'ALTERNATIVE_PROPOSED' ? (
                  <div className="mt-0.5">
                    <strong className="text-amber-900 block text-sm">
                      Proposed: {referral.slot.counterProposedSlot}
                    </strong>
                    <span className="text-amber-700 text-[11px] font-semibold">
                      Hospital Proposed Alternative Slot
                    </span>
                  </div>
                ) : (
                  <div className="mt-0.5">
                    <strong className="text-slate-700 block text-sm">
                      Requested: {referral.slot.requestedDate} ({referral.slot.requestedTimeWindow})
                    </strong>
                    <span className="text-slate-500 text-[11px]">
                      Awaiting Facility Confirmation
                    </span>
                  </div>
                )}
              </div>

              <div>
                <span className="text-slate-500 block text-[11px] font-medium">Hospital Remarks:</span>
                <p className="text-slate-800 mt-0.5">
                  {referral.slot.facilityRemarks || 'No additional remarks recorded.'}
                </p>
                <span className="text-[11px] text-slate-400 block mt-1">
                  * Note: Requested slot ≠ Confirmed appointment until confirmed by receiving facility.
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Clinical Details */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gov-green-900">
              2. Clinical information provided during referral
            </h4>
            <div className="p-3.5 bg-white rounded-gov border border-gov-border space-y-2.5">
              <div>
                <span className="text-slate-500 text-[11px] block font-medium">Chief Complaint (reported during referral):</span>
                <p className="text-slate-800 font-medium mt-0.5">{referral.chiefComplaint}</p>
              </div>
              {referral.provisionalDiagnosis && (
                <div>
                  <span className="text-slate-500 text-[11px] block font-medium">Provisional Diagnosis (provided by referring health worker):</span>
                  <p className="text-slate-800 font-medium mt-0.5">{referral.provisionalDiagnosis}</p>
                </div>
              )}
              {referral.clinicalNotes && (
                <div>
                  <span className="text-slate-500 text-[11px] block font-medium">Clinical Notes (recorded during referral):</span>
                  <p className="text-slate-700 mt-0.5 leading-relaxed bg-slate-50 p-2 rounded">
                    {referral.clinicalNotes}
                  </p>
                </div>
              )}
              <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                * Note: Clinical information provided during referral. CareLoop does not diagnose patients or provide medical evaluation.
              </div>
            </div>
          </div>

          {/* Section 3: Receiving Facility & Referring Worker */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 bg-slate-50 rounded-gov border border-gov-border space-y-1.5">
              <span className="text-xs font-bold text-gov-text-primary block">
                Receiving Health Facility
              </span>
              <div className="font-semibold text-gov-green-900">{referral.targetFacilityName}</div>
              <div className="text-[11px] text-slate-600">Type: {referral.targetFacilityType}</div>
              {facility && (
                <div className="text-[11px] text-slate-500 space-y-0.5 pt-1">
                  <div>Block: {facility.block}, {facility.district}</div>
                  <div>Contact: {facility.contactNumber}</div>
                  <div>Distance: ~{facility.distanceKm} km from referring sub-centre</div>
                </div>
              )}
            </div>

            <div className="p-3.5 bg-slate-50 rounded-gov border border-gov-border space-y-1.5">
              <span className="text-xs font-bold text-gov-text-primary block">
                Referring Health Worker
              </span>
              <div className="font-semibold text-gov-green-900">{referral.referringWorkerName}</div>
              <div className="text-[11px] text-slate-600">
                Cadre: {referral.referringWorkerCadre} • Sub-Centre: {referral.originSubCenter}
              </div>
              <div className="text-[11px] text-slate-500 pt-1">
                Phone: {referral.referringWorkerPhone}
              </div>
              <div className="pt-2">
                <a
                  href={`tel:${referral.referringWorkerPhone}`}
                  className="inline-flex items-center gap-1 text-xs text-gov-green-800 font-semibold hover:underline"
                >
                  <Phone className="w-3.5 h-3.5" /> Call Assigned Worker
                </a>
              </div>
            </div>
          </div>

          {/* Quick Sub-navigation Footer */}
          <div className="pt-3 border-t border-gov-border flex flex-wrap items-center justify-between gap-3">
            <Link to="/patient/referrals">
              <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
                Back to Referrals List
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Link to={`/patient/referrals/${referral.id}/journey`}>
                <Button variant="outline" size="sm" leftIcon={<Compass className="w-3.5 h-3.5" />}>
                  View Care Continuum Journey
                </Button>
              </Link>
              <Link to={`/patient/referrals/${referral.id}/appointment`}>
                <Button variant="primary" size="sm" leftIcon={<Building2 className="w-3.5 h-3.5" />}>
                  Hospital & Appointment Slip
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
