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
import { DemoAdminBanner } from './DemoAdminBanner';
import { careLoopApi, ApiError } from '@/api/client';
import { Referral } from '@/types';
import { 
  ArrowLeft, 
  Building2, 
  User, 
  AlertTriangle, 
  History, 
  CheckCircle2, 
  FileText, 
  Lock,
  Loader2,
  AlertCircle
} from 'lucide-react';

export const AdminReferralDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [referral, setReferral] = useState<Referral | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  const fetchReferral = async () => {
    if (!id) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setApiError(null);
      const data = await careLoopApi.getReferralById(id);
      setReferral(data);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to retrieve referral record.';
      setApiError(msg);
      setReferral(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferral();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center space-y-3">
        <Loader2 className="w-8 h-8 text-gov-green-700 animate-spin mx-auto" />
        <p className="text-xs text-slate-500">Loading referral audit dossier from backend API...</p>
      </div>
    );
  }

  if (apiError) {
    return (
      <div className="max-w-4xl mx-auto py-8 space-y-4">
        <div className="p-4 bg-red-50 border border-red-300 rounded-gov text-xs text-red-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-700 shrink-0" />
            <span>{apiError}</span>
          </div>
          <Button variant="outline" size="sm" onClick={fetchReferral}>
            Retry
          </Button>
        </div>
        <div className="text-center">
          <Link to="/admin/referrals">
            <Button variant="secondary" size="sm">
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Referral Analytics
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!referral) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <EmptyState
          title="Referral Dossier Not Found"
          description="The requested referral record could not be retrieved from the district registry."
          actionLabel="Back to Referral Analytics"
          onAction={() => navigate('/admin/referrals')}
        />
      </div>
    );
  }

  // Lifecycle check states
  const lifecycleStages = [
    { key: 'CREATED', label: 'Created' },
    { key: 'MATCHED', label: 'Matched' },
    { key: 'REFERRED', label: 'Referred' },
    { key: 'CONFIRMED', label: 'Confirmed' },
    { key: 'ARRIVED', label: 'Arrived' },
    { key: 'IN_CONSULTATION', label: 'Consultation Started' },
    { key: 'COMPLETED', label: 'Completed' },
  ];

  const reachedStages = new Set(referral.events.map((e) => e.stage));
  const isGap = referral.status === 'GAP_DETECTED' || referral.hasGapAlert;
  const isRecovered = referral.status === 'RECOVERED' || reachedStages.has('RECOVERED');

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <PageHeader
        title={`Referral Audit Dossier: ${referral.referralNumber}`}
        subtitle="District Administrative Observational Record • Non-Clinical Telemetry & Event Audit"
        breadcrumbs={[
          { label: 'Admin Portal', href: '/admin' },
          { label: 'Referrals', href: '/admin/referrals' },
          { label: referral.referralNumber },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Link to="/admin/referrals">
              <Button variant="secondary" size="sm" className="gap-1.5">
                <ArrowLeft className="w-4 h-4" />
                Back to Referrals
              </Button>
            </Link>
            <Link to="/admin/audit">
              <Button variant="ghost" size="sm" className="gap-1.5 border">
                <History className="w-4 h-4 text-slate-500" />
                Network Audit Log
              </Button>
            </Link>
          </div>
        }
      />

      {/* Mandatory Demo Disclosures */}
      <DemoAdminBanner 
        title="Demo Administration View — Read-Only Dossier" 
        badgeText="Immutable Audit Dossier" 
        variant="info" 
      />

      {/* Read-Only Non-Clinical Observational Banner */}
      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-gov text-xs text-slate-700 flex items-start gap-2.5">
        <Lock className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-semibold text-slate-900">
            Observational Administrative View Only
          </span>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            District Administrators have read-only visibility into operational timelines, transit coordination, and audit notes. No clinical alterations or diagnostic modifications can be performed from this interface.
          </p>
        </div>
      </div>

      {/* Gap Alert Banner if applicable */}
      {isGap && (
        <div className="p-4 bg-red-50 border-l-4 border-l-red-600 rounded-gov border border-red-200 text-xs">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="font-bold text-red-950 uppercase tracking-wide">
                Continuum Operational Exception Flagged
              </h3>
              <p className="text-red-900 font-medium">
                {referral.gapReason || 'Continuum breach: scheduled appointment slot passed without hospital check-in.'}
              </p>
              <span className="text-[11px] text-slate-500 block">
                * Operational gap flagged by CareLoop automated monitoring. Follow-up logged by field ASHA.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Lifecycle Progress Bar */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Care Continuum Lifecycle Progress</CardTitle>
          <CardDescription>
            Full stage verification from primary creation through clinical loop closure
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between overflow-x-auto pb-2 gap-2 text-xs">
            {lifecycleStages.map((stage, idx) => {
              const isReached = reachedStages.has(stage.key as any) || referral.status === stage.key;
              const isCurrent = referral.status === stage.key;

              return (
                <div key={stage.key} className="flex items-center gap-2 shrink-0">
                  <div className="flex flex-col items-center gap-1">
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs border ${
                        isCurrent
                          ? 'bg-gov-green-800 text-white border-gov-green-900 shadow-sm'
                          : isReached
                          ? 'bg-gov-green-100 text-gov-green-900 border-gov-green-300'
                          : 'bg-slate-100 text-slate-400 border-slate-200'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <span
                      className={`text-[11px] font-medium text-center ${
                        isCurrent
                          ? 'font-bold text-gov-green-900'
                          : isReached
                          ? 'text-slate-800'
                          : 'text-slate-400'
                      }`}
                    >
                      {stage.label}
                    </span>
                  </div>
                  {idx < lifecycleStages.length - 1 && (
                    <div
                      className={`w-8 sm:w-12 h-0.5 mb-5 ${
                        isReached ? 'bg-gov-green-600' : 'bg-slate-200'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {(isGap || isRecovered) && (
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-3 text-xs">
              <span className="font-semibold text-slate-500 uppercase text-[10px]">Exception Pathway:</span>
              {isGap && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-100 text-red-900 font-bold border border-red-200">
                  <AlertTriangle className="w-3 h-3 text-red-700" />
                  GAP_DETECTED
                </span>
              )}
              {isRecovered && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-teal-100 text-teal-900 font-bold border border-teal-200">
                  <CheckCircle2 className="w-3 h-3 text-teal-700" />
                  RECOVERED (Loop Restored)
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Dossier Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Patient & Referring Origin */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gov-green-800" />
              <CardTitle>Patient &amp; Origin Demographics</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b">
              <span className="text-slate-500">Patient Full Name:</span>
              <span className="font-bold text-gov-text-primary">{referral.patientName}</span>
            </div>
            <div className="flex justify-between py-1 border-b">
              <span className="text-slate-500">Age &amp; Gender:</span>
              <span className="font-semibold text-slate-800">
                {referral.patientAge} years • {referral.patientGender.toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b">
              <span className="text-slate-500">Origin Village / Sub-Centre:</span>
              <span className="font-semibold text-slate-800">
                {referral.village} ({referral.originSubCenter})
              </span>
            </div>
            <div className="flex justify-between py-1 border-b">
              <span className="text-slate-500">Referring Field Worker:</span>
              <span className="font-bold text-gov-green-900">
                {referral.referringWorkerName} ({referral.referringWorkerCadre})
              </span>
            </div>
            <div className="flex justify-between py-1 border-b">
              <span className="text-slate-500">Worker Contact Phone:</span>
              <span className="font-mono text-slate-700">{referral.referringWorkerPhone}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Registration Mode:</span>
              <span className="font-semibold text-slate-800">
                {referral.isUnregisteredEmergency ? 'Unregistered Emergency' : 'Standard ABHA / Registry'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Target Facility & Slot Details */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-purple-700" />
              <CardTitle>Target Facility &amp; Appointment Slot</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b">
              <span className="text-slate-500">Target Facility:</span>
              <span className="font-bold text-gov-text-primary text-right max-w-[220px]">
                {referral.targetFacilityName}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b">
              <span className="text-slate-500">Clinical Department:</span>
              <span className="font-semibold text-purple-900 text-right max-w-[220px]">
                {referral.targetDepartment}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b">
              <span className="text-slate-500">Referral Urgency:</span>
              <div className="flex items-center gap-1.5">
                <StatusBadge type={referral.referralType} />
                <StatusBadge priority={referral.priority} />
              </div>
            </div>
            <div className="flex justify-between py-1 border-b">
              <span className="text-slate-500">Confirmed Slot Date:</span>
              <span className="font-semibold text-slate-800">
                {referral.slot.confirmedDate || referral.slot.requestedDate}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b">
              <span className="text-slate-500">Confirmed Window:</span>
              <span className="font-semibold text-slate-800">
                {referral.slot.confirmedTimeWindow || referral.slot.requestedTimeWindow}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Hospital Slot Status:</span>
              <span className="font-bold text-gov-green-800">{referral.slot.status}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Operational Information & Clinical Reason */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-gov-green-800" />
            <CardTitle>Operational Chief Complaint &amp; Intake Reason</CardTitle>
          </div>
          <CardDescription>
            Observational clinical reason documented by primary health worker (Read-Only)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-xs">
          <div>
            <span className="font-semibold text-slate-700 block mb-1">Chief Complaint:</span>
            <div className="p-3 bg-slate-50 border rounded-gov text-slate-900 font-medium">
              {referral.chiefComplaint}
            </div>
          </div>
          <div>
            <span className="font-semibold text-slate-700 block mb-1">Primary Clinical Notes:</span>
            <div className="p-3 bg-slate-50 border rounded-gov text-slate-700">
              {referral.clinicalNotes || 'No additional field clinical notes provided.'}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Complete Immutable Audit Trail Timeline */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-gov-green-800" />
            <CardTitle>Complete Immutable Event Audit Trail</CardTitle>
          </div>
          <CardDescription>
            Chronological audit log recording every system state transition, timestamp, and human actor
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y border-t border-gov-border">
            {referral.events.map((evt, idx) => (
              <div key={evt.id} className="p-4 hover:bg-slate-50/70 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-[11px] text-slate-400 font-bold">
                      #{idx + 1}
                    </span>
                    <StatusBadge status={evt.stage} size="sm" />
                    <span className="text-xs font-bold text-gov-text-primary">
                      {evt.actorName}
                    </span>
                    <span className="text-[10px] text-slate-500 uppercase px-1.5 py-0.2 bg-slate-100 rounded border">
                      {evt.actorRole}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {new Date(evt.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed pl-5">
                  {evt.description}
                </p>
                {evt.notes && (
                  <div className="mt-2 ml-5 p-2 bg-slate-100/80 border rounded text-[11px] text-slate-600 font-mono">
                    Audit Note: {evt.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
