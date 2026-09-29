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
import { careLoopApi, ApiError } from '@/api/client';
import { Referral } from '@/types';
import { 
  CheckCircle2, 
  AlertTriangle, 
  ArrowLeft, 
  Building2, 
  ShieldCheck, 
  CheckCheck
} from 'lucide-react';

export const PatientJourney: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [referral, setReferral] = useState<Referral | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          const msg = err instanceof ApiError ? err.message : 'Referral journey record not found.';
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
        Loading care journey continuum...
      </div>
    );
  }

  if (error || !referral) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <EmptyState
          title="Referral Not Found"
          description={error || "The requested care journey could not be located."}
          actionLabel="Back to Referrals"
          onAction={() => navigate('/patient/referrals')}
        />
      </div>
    );
  }

  // 6-stage continuum workflow progression
  const continuumStages = [
    { key: 'MATCH', label: '1. Facility Matching', desc: 'Matched based on specialist capability, beds, and location.' },
    { key: 'REFER', label: '2. Referral Issued', desc: 'Clinical referral drafted and consultation slot requested.' },
    { key: 'TRACK', label: '3. Track & Transit', desc: 'Slot confirmed or proposed; transit tracking active.' },
    { key: 'DETECT', label: '4. Gap Detection', desc: 'System alerts if appointment window elapses without arrival.' },
    { key: 'RECOVER', label: '5. Gap Recovery', desc: 'ASHA follow-up to resolve transport delays or reschedule.' },
    { key: 'COMPLETE', label: '6. Care Completed', desc: 'Consultation delivered and discharge summary recorded.' },
  ];

  // Determine which index is currently active based on referral status
  const getActiveStageIndex = () => {
    switch (referral.status) {
      case 'CREATED':
        return 1;
      case 'MATCHED':
        return 0;
      case 'REFERRED':
      case 'SLOT_PROPOSED':
      case 'CONFIRMED':
      case 'TRANSIT_DISPATCHED':
        return 2;
      case 'GAP_DETECTED':
        return 3;
      case 'RECOVERED':
        return 4;
      case 'ARRIVED':
      case 'IN_CONSULTATION':
        return 4;
      case 'COMPLETED':
        return 5;
      default:
        return 2;
    }
  };

  const currentStageIndex = getActiveStageIndex();

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <PageHeader
        title="Care Continuum Journey"
        subtitle={`Tracking full continuum for Referral ${referral.referralNumber} • Patient: ${referral.patientName}`}
        breadcrumbs={[
          { label: 'Patient Portal', href: '/patient' },
          { label: 'My Referrals', href: '/patient/referrals' },
          { label: referral.referralNumber, href: `/patient/referrals/${referral.id}` },
          { label: 'Care Journey' },
        ]}
        actions={
          <Link to={`/patient/referrals/${referral.id}/appointment`}>
            <Button variant="primary" size="sm" leftIcon={<Building2 className="w-3.5 h-3.5" />}>
              Hospital Appointment Slip
            </Button>
          </Link>
        }
      />

      {/* Core Principle Notice */}
      <div className="p-3.5 bg-gov-green-50 border border-gov-green-200 rounded-gov text-xs text-gov-green-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-gov-green-700 shrink-0" />
          <span>
            CareLoop helps track referral progress and identify cases that may require recovery or rerouting. (<strong>Referral created ≠ Care completed</strong>)
          </span>
        </div>
        <span className="text-[11px] text-gov-green-800 font-semibold shrink-0">
          Hospital: {referral.targetFacilityName}
        </span>
      </div>

      {/* Continuum Progression Bar */}
      <Card>
        <CardHeader>
          <CardTitle>Care Continuum Pipeline</CardTitle>
          <CardDescription>
            CareLoop helps track referral progress and identify cases that may require recovery or rerouting through public healthcare coordination stages.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {continuumStages.map((stage, idx) => {
              const isDone = idx < currentStageIndex;
              const isCurrent = idx === currentStageIndex;

              return (
                <div
                  key={stage.key}
                  className={`p-3 rounded-gov border text-xs flex flex-col justify-between transition-colors ${
                    isCurrent
                      ? referral.hasGapAlert
                        ? 'bg-red-50 border-red-300 text-red-950 shadow-gov-sm ring-2 ring-red-400'
                        : 'bg-gov-green-50 border-gov-green-400 text-gov-green-950 shadow-gov-sm ring-2 ring-gov-green-600'
                      : isDone
                      ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                      : 'bg-slate-50 border-gov-border text-slate-400'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-bold">{stage.key}</span>
                      {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />}
                      {isCurrent && (
                        <span className="w-2 h-2 rounded-full bg-gov-green-800 animate-ping"></span>
                      )}
                    </div>
                    <div className="font-semibold text-xs leading-tight">
                      {stage.label}
                    </div>
                  </div>
                  <div className="text-[10px] mt-2 text-slate-500 leading-tight">
                    {isDone ? 'Completed' : isCurrent ? 'Active Stage' : 'Pending'}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Actual Timestamped Referral Events Timeline from centralized mock data */}
      <Card>
        <CardHeader>
          <CardTitle>Actual Event Logs & Clinical Audit Trail</CardTitle>
          <CardDescription>
            Recorded events with timestamps from community health workers, receiving facilities, and the CareLoop system.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-gov-border">
            {referral.events.map((evt, idx) => {
              const isLast = idx === referral.events.length - 1;
              return (
                <div key={evt.id} className="relative group">
                  {/* Timeline Dot Icon */}
                  <div
                    className={`absolute -left-6 sm:-left-8 top-1 w-6 h-6 rounded-full border-2 flex items-center justify-center bg-white ${
                      evt.stage === 'GAP_DETECTED'
                        ? 'border-red-600 text-red-600'
                        : evt.stage === 'COMPLETED'
                        ? 'border-emerald-700 text-emerald-700'
                        : 'border-gov-green-800 text-gov-green-800'
                    }`}
                  >
                    {evt.stage === 'GAP_DETECTED' ? (
                      <AlertTriangle className="w-3 h-3" />
                    ) : evt.stage === 'COMPLETED' ? (
                      <CheckCheck className="w-3 h-3" />
                    ) : (
                      <CheckCircle2 className="w-3 h-3" />
                    )}
                  </div>

                  {/* Event Content Card */}
                  <div
                    className={`p-3.5 sm:p-4 rounded-gov border transition-colors ${
                      isLast && referral.hasGapAlert
                        ? 'bg-red-50/70 border-red-200'
                        : 'bg-white border-gov-border hover:bg-slate-50/70'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={evt.stage} size="sm" />
                        <span className="text-xs font-bold text-gov-text-primary">
                          {evt.actorName}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {new Date(evt.timestamp).toLocaleString()}
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                      {evt.description}
                    </p>

                    {evt.notes && (
                      <div className="mt-2 text-[11px] text-slate-600 bg-slate-50 p-2 rounded border border-gov-border">
                        <strong>Clinical/Operational Note:</strong> {evt.notes}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Back Navigation Bar */}
      <div className="flex items-center justify-between pt-2">
        <Link to={`/patient/referrals/${referral.id}`}>
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
            Back to Referral Overview
          </Button>
        </Link>
        <Link to={`/patient/referrals/${referral.id}/appointment`}>
          <Button variant="primary" size="sm" leftIcon={<Building2 className="w-3.5 h-3.5" />}>
            View Appointment Details
          </Button>
        </Link>
      </div>
    </div>
  );
};
