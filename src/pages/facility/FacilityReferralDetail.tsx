import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/layout';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  Button, 
  StatusBadge, 
  Modal, 
  FormField, 
  Input, 
  EmptyState 
} from '@/components/ui';
import { CareLoopStore } from '@/mock';
import { Referral } from '@/types';
import { careLoopApi, ApiError } from '@/api/client';
import { 
  User, 
  Calendar, 
  Clock, 
  Phone, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowLeft, 
  Check, 
  X, 
  CalendarClock, 
  Activity, 
  FileText, 
  AlertCircle, 
  Siren, 
  Stethoscope, 
  CheckCheck, 
  ShieldCheck,
  Loader2
} from 'lucide-react';

export const FacilityReferralDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Active facility: Bhor CHC (fac_chc_01)
  const activeFacility = CareLoopStore.getFacilities().find((f) => f.id === 'fac_chc_01') || CareLoopStore.getFacilities()[1];
  const [referral, setReferral] = useState<Referral | undefined>(() => {
    return id ? CareLoopStore.getReferralById(id) : undefined;
  });
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  // Modal states
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [acceptDate, setAcceptDate] = useState('');
  const [acceptTime, setAcceptTime] = useState('');
  const [acceptRemarks, setAcceptRemarks] = useState('Slot confirmed. Department examination bed reserved.');

  const [showProposeModal, setShowProposeModal] = useState(false);
  const [proposedDate, setProposedDate] = useState('2026-09-22');
  const [proposedTime, setProposedTime] = useState('02:00 - 04:00 PM');
  const [proposedReason, setProposedReason] = useState('Morning specialist OPD fully booked. Afternoon session available.');

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('Specialist on emergency leave / Bed capacity exhausted.');

  const [showArriveModal, setShowArriveModal] = useState(false);
  const [arriveRemarks, setArriveRemarks] = useState('Patient verified and checked in at facility triage counter.');

  const [showStartServiceModal, setShowStartServiceModal] = useState(false);
  const [doctorName, setDoctorName] = useState('Dr. Suresh Kulkarni');
  const [serviceNotes, setServiceNotes] = useState('Clinical consultation initiated. Patient vitals reviewed.');

  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [completionNotes, setCompletionNotes] = useState('Specialist care coordination completed. Treatment advice recorded and discharge slip provided.');

  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);
  const [submittingAction, setSubmittingAction] = useState(false);

  useEffect(() => {
    if (!id) return;
    let isMounted = true;
    setLoading(true);
    setApiError(null);

    careLoopApi.getReferralById(id)
      .then((data) => {
        if (!isMounted) return;
        setReferral(data);
        setAcceptDate(data.slot.requestedDate || '');
        setAcceptTime(data.slot.requestedTimeWindow || '');
        if (data.slot.requestedDate) {
          try {
            const nextDay = new Date(new Date(data.slot.requestedDate).getTime() + 86400000).toISOString().split('T')[0];
            setProposedDate(nextDay);
          } catch {
            // fallback
          }
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        const msg = err instanceof ApiError ? err.message : 'Failed to fetch referral details from backend.';
        setApiError(msg);
        // Fallback to local store data
        const fallback = CareLoopStore.getReferralById(id);
        if (fallback) setReferral(fallback);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading && !referral) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto py-12 text-center">
        <Loader2 className="w-8 h-8 text-gov-green-700 animate-spin mx-auto" />
        <p className="text-xs text-slate-500">Loading referral from backend API...</p>
      </div>
    );
  }

  if (!referral) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Referral Not Found"
          breadcrumbs={[
            { label: 'Facility Portal', href: '/facility' },
            { label: 'Incoming Triage', href: '/facility/incoming' },
            { label: 'Not Found' },
          ]}
        />
        <EmptyState
          icon={<AlertCircle className="w-12 h-12 text-slate-400" />}
          title="Referral Not Found"
          description={`No referral found with identifier "${id}". It may have been rerouted or deleted.`}
          actionLabel="Return to Incoming Triage"
          onAction={() => navigate('/facility/incoming')}
        />
      </div>
    );
  }

  const isEmergency = referral.referralType === 'EMERGENCY' || referral.priority === 'CRITICAL_EMERGENCY';
  const isScopedToThisFacility = referral.targetFacilityId === activeFacility.id;

  // State handlers with scoping guards and backend synchronization
  const handleAcceptConfirm = async () => {
    if (!isScopedToThisFacility) return;
    setSubmittingAction(true);
    setApiError(null);
    try {
      const targetDate = acceptDate || referral.slot.requestedDate;
      const targetTime = acceptTime || referral.slot.requestedTimeWindow;
      const doc = doctorName || 'Dr. Suresh Kulkarni';
      const updated = await careLoopApi.acceptSlot(
        referral.id,
        {
          confirmedDate: targetDate,
          confirmedTimeWindow: targetTime,
          facilityRemarks: acceptRemarks,
          doctorName: doc,
        },
        activeFacility.id,
        doc
      );
      // Sync local store
      CareLoopStore.acceptReferralSlot(
        referral.id,
        targetDate,
        targetTime,
        acceptRemarks,
        doc
      );
      setReferral(updated);
      setShowAcceptModal(false);
      setActionSuccessMessage('Requested appointment slot successfully confirmed by receiving facility!');
      setTimeout(() => setActionSuccessMessage(null), 5000);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to confirm referral slot.';
      setApiError(msg);
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleProposeConfirm = async () => {
    if (!isScopedToThisFacility || !proposedReason.trim()) return;
    setSubmittingAction(true);
    setApiError(null);
    try {
      const formattedSlot = `${proposedDate} at ${proposedTime}`;
      const doc = doctorName || 'Dr. Suresh Kulkarni';
      const updated = await careLoopApi.proposeAlternativeSlot(
        referral.id,
        {
          counterSlot: formattedSlot,
          reason: proposedReason,
          doctorName: doc,
        },
        activeFacility.id
      );
      // Sync local store
      CareLoopStore.proposeAlternativeSlot(
        referral.id,
        formattedSlot,
        proposedReason,
        doc
      );
      setReferral(updated);
      setShowProposeModal(false);
      setActionSuccessMessage('Alternative appointment slot proposed to referring health worker!');
      setTimeout(() => setActionSuccessMessage(null), 5000);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to propose alternative slot.';
      setApiError(msg);
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleRejectConfirm = async () => {
    if (!isScopedToThisFacility || !rejectReason.trim()) return;
    setSubmittingAction(true);
    setApiError(null);
    try {
      const doc = doctorName || 'Dr. Suresh Kulkarni';
      const updated = await careLoopApi.cannotProceed(
        referral.id,
        {
          reason: rejectReason,
          doctorName: doc,
        },
        activeFacility.id
      );
      // Sync local store
      CareLoopStore.rejectReferral(
        referral.id,
        rejectReason,
        doc
      );
      setReferral(updated);
      setShowRejectModal(false);
      setActionSuccessMessage('Referral marked as cannot proceed. Escalated to Health Worker Care Recovery Radar.');
      setTimeout(() => setActionSuccessMessage(null), 5000);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to record cannot proceed.';
      setApiError(msg);
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleMarkArrivedConfirm = async () => {
    if (!isScopedToThisFacility) return;
    setSubmittingAction(true);
    setApiError(null);
    try {
      const updated = await careLoopApi.markArrived(
        referral.id,
        { remarks: arriveRemarks },
        activeFacility.id
      );
      // Sync local store
      CareLoopStore.markPatientArrived(referral.id, arriveRemarks);
      setReferral(updated);
      setShowArriveModal(false);
      setActionSuccessMessage('Patient arrival successfully recorded at facility registration!');
      setTimeout(() => setActionSuccessMessage(null), 5000);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to record patient arrival.';
      setApiError(msg);
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleStartServiceConfirm = async () => {
    if (!isScopedToThisFacility) return;
    setSubmittingAction(true);
    setApiError(null);
    try {
      const updated = await careLoopApi.startService(
        referral.id,
        {
          doctorName,
          notes: serviceNotes,
        },
        activeFacility.id
      );
      // Sync local store
      CareLoopStore.startReferralService(
        referral.id,
        doctorName,
        serviceNotes
      );
      setReferral(updated);
      setShowStartServiceModal(false);
      setActionSuccessMessage('Service / consultation marked as actively started.');
      setTimeout(() => setActionSuccessMessage(null), 5000);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to start service consultation.';
      setApiError(msg);
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleCompleteServiceConfirm = async () => {
    if (!isScopedToThisFacility) return;
    setSubmittingAction(true);
    setApiError(null);
    try {
      const updated = await careLoopApi.completeService(
        referral.id,
        {
          doctorName,
          operationalNotes: completionNotes,
        },
        activeFacility.id
      );
      // Sync local store
      CareLoopStore.completeReferralService(
        referral.id,
        doctorName,
        completionNotes
      );
      setReferral(updated);
      setShowCompleteModal(false);
      setActionSuccessMessage('Care continuum completed! Discharge summary recorded.');
      setTimeout(() => setActionSuccessMessage(null), 5000);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to complete care continuum.';
      setApiError(msg);
    } finally {
      setSubmittingAction(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <PageHeader
        title={`Referral ${referral.referralNumber}`}
        subtitle={`Receiving Facility: ${activeFacility.name} • Triage & Care Delivery`}
        breadcrumbs={[
          { label: 'Facility Portal', href: '/facility' },
          { label: 'Incoming Triage', href: '/facility/incoming' },
          { label: referral.referralNumber },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
              onClick={() => navigate('/facility/incoming')}
            >
              Back to Incoming
            </Button>
          </div>
        }
      />

      {/* API Error Notification */}
      {apiError && (
        <div className="p-3.5 bg-red-50 border border-red-300 rounded-gov text-xs text-red-900 flex items-center gap-2 shadow-gov-sm animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-red-700 shrink-0" />
          <span>{apiError}</span>
        </div>
      )}

      {/* Success Notification Banner */}
      {actionSuccessMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-gov text-xs text-emerald-900 flex items-center gap-2 shadow-gov-sm animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{actionSuccessMessage}</span>
        </div>
      )}

      {/* Emergency Alert Banner */}
      {isEmergency && (
        <div className="p-4 bg-red-700 text-white rounded-gov border border-red-800 shadow-gov-card space-y-1">
          <div className="flex items-center gap-2">
            <Siren className="w-5 h-5 text-red-200 shrink-0" />
            <h3 className="font-bold text-sm tracking-wide uppercase">
              Priority: Critical Emergency Coordination
            </h3>
          </div>
          <p className="text-xs text-red-100 leading-relaxed">
            Emergency referrals bypass standard administrative hurdles. Triage pre-notification sent from field worker. 
            Ambulance support information is simulated mock data.
          </p>
        </div>
      )}

      {/* Continuum Exception Alert Banner */}
      {referral.hasGapAlert && (
        <div className="p-4 bg-amber-50 border-l-4 border-l-amber-600 rounded border border-amber-300 text-xs text-amber-950 flex items-start gap-2.5 shadow-gov-sm">
          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <strong>Care Recovery Exception Flagged:</strong> {referral.gapReason || 'Continuum delay recorded. Referring field worker alerted for follow-up.'}
          </div>
        </div>
      )}

      {/* Operational Actions Card (Context-Aware Action Toolbar) */}
      <Card className="border-gov-green-300 bg-gov-green-50/40 shadow-gov-card">
        <CardHeader className="py-3 px-5 border-b border-gov-green-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-sm text-gov-green-950">
                Operational Referral Actions
              </CardTitle>
              <CardDescription className="text-xs text-gov-green-900">
                Current Lifecycle State: <strong className="uppercase">{referral.status.replace('_', ' ')}</strong> • Slot: <strong className="uppercase">{referral.slot.status.replace('_', ' ')}</strong>
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              <StatusBadge status={referral.status} />
              <StatusBadge type={referral.referralType} />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-5">
          {!isScopedToThisFacility ? (
            <div className="w-full p-3.5 bg-amber-50 border border-amber-300 rounded text-xs text-amber-950 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <strong>Facility Scope Restriction:</strong> This referral is assigned to <strong>{referral.targetFacilityName}</strong>. You are currently viewing in demo scope as {activeFacility.name}. Operational triage actions (Accept, Propose Alternative, Reject, Check-in, Start/Complete Service) are restricted to the assigned facility.
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Stage 1: Pending Acceptance Actions */}
              {referral.status === 'REFERRED' && (
                <>
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<Check className="w-4 h-4" />}
                    onClick={() => {
                      setAcceptDate(referral.slot.requestedDate);
                      setAcceptTime(referral.slot.requestedTimeWindow);
                      setShowAcceptModal(true);
                    }}
                  >
                    Accept Requested Slot
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<CalendarClock className="w-4 h-4 text-amber-700" />}
                    onClick={() => setShowProposeModal(true)}
                  >
                    Propose Alternative Slot
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-700 hover:bg-red-50"
                    leftIcon={<X className="w-4 h-4" />}
                    onClick={() => setShowRejectModal(true)}
                  >
                    Cannot Proceed / Reject
                  </Button>
                </>
              )}

              {/* Stage 1B: Alternative Proposed State */}
              {referral.status === 'SLOT_PROPOSED' && (
                <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-amber-100/70 border border-amber-300 rounded text-xs text-amber-950">
                  <div>
                    <strong>Alternative Proposed:</strong> {referral.slot.counterProposedSlot || 'Alternative slot transmitted'}.
                    <span className="block text-[11px] text-amber-900 mt-0.5">
                      Awaiting health worker / patient agreement. You may still accept original or mark cannot proceed.
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setAcceptDate(referral.slot.requestedDate);
                        setAcceptTime(referral.slot.requestedTimeWindow);
                        setShowAcceptModal(true);
                      }}
                    >
                      Accept Original Slot Instead
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-700 hover:bg-red-50"
                      onClick={() => setShowRejectModal(true)}
                    >
                      Cannot Proceed
                    </Button>
                  </div>
                </div>
              )}

              {/* Stage 2: Confirmed / Awaiting Arrival Actions */}
              {referral.status === 'CONFIRMED' && (
                <>
                  <div className="text-xs text-emerald-900 font-semibold flex items-center gap-1.5 mr-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    <span>Slot Confirmed by Facility. Ready for patient check-in.</span>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<User className="w-4 h-4" />}
                    onClick={() => setShowArriveModal(true)}
                  >
                    Mark Patient Arrived
                  </Button>
                </>
              )}

              {/* Stage 3: Patient Arrived -> Ready for Service Start */}
              {referral.status === 'ARRIVED' && (
                <>
                  <div className="text-xs text-teal-900 font-semibold flex items-center gap-1.5 mr-2">
                    <Activity className="w-4 h-4 text-teal-700" />
                    <span>Patient Checked In at Facility Counter.</span>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<Stethoscope className="w-4 h-4" />}
                    onClick={() => setShowStartServiceModal(true)}
                  >
                    Start Service / Consultation
                  </Button>
                </>
              )}

              {/* Stage 4: In Consultation -> Ready for Service Completion */}
              {referral.status === 'IN_CONSULTATION' && (
                <>
                  <div className="text-xs text-sky-900 font-semibold flex items-center gap-1.5 mr-2">
                    <Activity className="w-4 h-4 text-sky-700 animate-pulse" />
                    <span>Clinical Consultation In Progress.</span>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<CheckCheck className="w-4 h-4" />}
                    onClick={() => setShowCompleteModal(true)}
                  >
                    Mark Service Completed
                  </Button>
                </>
              )}

              {/* Stage 5: Care Completed */}
              {referral.status === 'COMPLETED' && (
                <div className="w-full p-3 bg-emerald-100/80 border border-emerald-300 rounded text-xs text-emerald-950 flex items-center gap-2">
                  <CheckCheck className="w-5 h-5 text-emerald-700 shrink-0" />
                  <div>
                    <strong>Care Coordination Successfully Completed:</strong> Final service delivered and discharge summary recorded in continuum ledger.
                  </div>
                </div>
              )}

              {/* Stage 6: Cancelled / Cannot Proceed / Operational Exception */}
              {(referral.status === 'CANCELLED' || referral.status === 'GAP_DETECTED') && (
                <div className="w-full p-3.5 bg-amber-50 border border-amber-300 rounded text-xs text-amber-950 flex items-start gap-2.5">
                  <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-amber-900 font-bold">Facility Cannot Proceed — Operational Exception Recorded:</strong>
                    <p className="mt-0.5 text-amber-950">
                      {referral.gapReason || 'Facility was unable to accommodate the requested appointment slot or service.'}
                    </p>
                    <p className="mt-1 text-[11px] text-amber-800">
                      Care is NOT cancelled. This case is actively flagged on the referring Health Worker's Care Recovery Radar ({referral.referringWorkerName}) for review and alternative facility rerouting.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 2-Column Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Patient Demographics Card */}
        <Card className="shadow-gov-card">
          <CardHeader className="bg-slate-50 border-b border-gov-border/60">
            <CardTitle className="text-sm flex items-center gap-2">
              <User className="w-4 h-4 text-gov-green-800" />
              Patient Demographics
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-slate-500 block text-[11px]">Full Name:</span>
                <strong className="text-gov-text-primary text-sm">{referral.patientName}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Patient ID:</span>
                <span className="font-mono text-slate-700">{referral.patientId || 'Not available (Trauma / Field)'}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
              <div>
                <span className="text-slate-500 block text-[11px]">Age:</span>
                <strong>{referral.patientAge ? `${referral.patientAge} years` : 'Not available'}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Gender:</span>
                <strong className="capitalize">{referral.patientGender || 'Not available'}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Contact Phone:</span>
                {referral.patientPhone ? (
                  <a href={`tel:${referral.patientPhone}`} className="text-gov-green-800 font-semibold hover:underline">
                    {referral.patientPhone}
                  </a>
                ) : (
                  <span className="text-slate-400 italic">Not available</span>
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <span className="text-slate-500 block text-[11px]">Origin Location / Village:</span>
              <strong className="text-slate-800">{referral.village}</strong>
            </div>

            {referral.isUnregisteredEmergency && (
              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded text-[11px] text-amber-900">
                <strong>Rapid Emergency Intake:</strong> Patient was referred without pre-registration. Full ABHA registration may be recorded upon stabilization.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Referring Health Worker Card */}
        <Card className="shadow-gov-card">
          <CardHeader className="bg-slate-50 border-b border-gov-border/60">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-gov-green-800" />
              Referring Field Health Worker
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-slate-500 block text-[11px]">Health Worker Name:</span>
                <strong className="text-gov-text-primary text-sm">{referral.referringWorkerName}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Cadre:</span>
                <span className="px-2 py-0.5 rounded bg-slate-100 font-semibold text-slate-800">
                  {referral.referringWorkerCadre}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
              <div>
                <span className="text-slate-500 block text-[11px]">Assigned Sub-Centre:</span>
                <strong className="text-slate-800">{referral.originSubCenter}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Worker Contact:</span>
                {referral.referringWorkerPhone ? (
                  <a href={`tel:${referral.referringWorkerPhone}`} className="text-gov-green-800 font-semibold hover:underline flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {referral.referringWorkerPhone}
                  </a>
                ) : (
                  <span className="text-slate-400">Not available</span>
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-600">
              Created Timestamp: <strong>{new Date(referral.createdAt).toLocaleString()}</strong>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Clinical Context & Reason Card */}
      <Card className="shadow-gov-card">
        <CardHeader className="bg-slate-50 border-b border-gov-border/60">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-gov-green-800" />
              Clinical Information & Service Context
            </CardTitle>
            <span className="text-[11px] px-2 py-0.5 rounded bg-gov-green-100 text-gov-green-950 font-semibold">
              {referral.targetDepartment}
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-4 space-y-3.5 text-xs">
          <div>
            <span className="text-slate-500 block text-[11px] font-semibold uppercase">Chief Complaint / Reason for Referral:</span>
            <div className="mt-1 p-3 bg-white rounded border border-gov-border font-medium text-gov-text-primary text-xs">
              {referral.chiefComplaint}
            </div>
          </div>

          {referral.clinicalNotes && (
            <div>
              <span className="text-slate-500 block text-[11px] font-semibold uppercase">Clinical Observations Recorded by Health Worker:</span>
              <div className="mt-1 p-3 bg-slate-50 rounded border border-slate-200 text-slate-700 text-xs leading-relaxed">
                {referral.clinicalNotes}
              </div>
            </div>
          )}

          {referral.provisionalDiagnosis && (
            <div>
              <span className="text-slate-500 block text-[11px] font-semibold uppercase">Field Provisional Assessment:</span>
              <div className="mt-1 text-slate-800 font-semibold text-xs">
                {referral.provisionalDiagnosis}
              </div>
            </div>
          )}

          {/* Mandatory Medical Disclaimer */}
          <div className="p-3 bg-slate-100 rounded-gov border border-slate-200 text-[11px] text-slate-600 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Medical Disclaimer:</strong> Clinical information was provided by the referring health worker during referral creation. 
              CareLoop does not diagnose the patient or generate independent clinical findings.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Appointment Slot Schedule Card (Requested vs Confirmed) */}
      <Card className="shadow-gov-card border-gov-border">
        <CardHeader className="bg-slate-50 border-b border-gov-border/60">
          <CardTitle className="text-sm flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gov-green-800" />
            Appointment Slot Schedule (Requested vs. Confirmed)
          </CardTitle>
          <CardDescription className="text-xs">
            Health worker requested slot is a preference. Confirmed slot is enacted only by facility confirmation.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-4 space-y-3 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Requested Slot Box */}
            <div className="p-3.5 bg-slate-50 rounded border border-slate-200 space-y-1">
              <span className="text-slate-500 font-bold block text-[11px] uppercase">
                1. Health Worker Preferred Slot (Requested)
              </span>
              <div className="text-sm font-bold text-gov-text-primary">
                {referral.slot.requestedDate}
              </div>
              <div className="text-xs text-slate-700">
                Window: <strong>{referral.slot.requestedTimeWindow}</strong>
              </div>
            </div>

            {/* Confirmed / Alternative Slot Box */}
            <div className={`p-3.5 rounded border space-y-1 ${
              referral.slot.status === 'CONFIRMED'
                ? 'bg-emerald-50 border-emerald-200'
                : referral.slot.status === 'ALTERNATIVE_PROPOSED'
                ? 'bg-amber-50 border-amber-200'
                : 'bg-blue-50 border-blue-200'
            }`}>
              <span className="font-bold block text-[11px] uppercase text-slate-600">
                2. Facility Confirmation Status
              </span>

              {referral.slot.status === 'CONFIRMED' ? (
                <div>
                  <strong className="text-sm text-emerald-950 block">
                    {referral.slot.confirmedDate || referral.slot.requestedDate} ({referral.slot.confirmedTimeWindow || referral.slot.requestedTimeWindow})
                  </strong>
                  <span className="text-emerald-800 font-semibold text-[11px] block mt-0.5">
                    ✓ Confirmed by Facility ({activeFacility.name})
                  </span>
                  {referral.slot.facilityRemarks && (
                    <p className="text-[11px] text-slate-600 mt-1 italic">
                      Remarks: "{referral.slot.facilityRemarks}"
                    </p>
                  )}
                </div>
              ) : referral.slot.status === 'ALTERNATIVE_PROPOSED' ? (
                <div>
                  <strong className="text-sm text-amber-950 block">
                    Alternative: {referral.slot.counterProposedSlot}
                  </strong>
                  <span className="text-amber-900 font-semibold text-[11px] block mt-0.5">
                    Proposed by Facility • Awaiting Health Worker acceptance
                  </span>
                  {referral.slot.facilityRemarks && (
                    <p className="text-[11px] text-slate-600 mt-1 italic">
                      Reason: "{referral.slot.facilityRemarks}"
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <strong className="text-sm text-blue-950 block">
                    Awaiting Facility Confirmation
                  </strong>
                  <span className="text-blue-800 text-[11px] block mt-0.5">
                    Pending review by {activeFacility.name} triage team.
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Referral Continuum Event Timeline */}
      <Card className="shadow-gov-card">
        <CardHeader className="bg-slate-50 border-b border-gov-border/60">
          <CardTitle className="text-sm flex items-center gap-2">
            <Clock className="w-4 h-4 text-gov-green-800" />
            Care Continuum Audit Trail & Event Timeline
          </CardTitle>
          <CardDescription className="text-xs">
            Chronological log across MATCH → REFER → TRACK → DETECT → RECOVER → COMPLETE
          </CardDescription>
        </CardHeader>

        <CardContent className="p-5">
          <div className="space-y-4 relative before:absolute before:top-2 before:bottom-2 before:left-3.5 before:w-0.5 before:bg-slate-200">
            {referral.events.map((evt) => (
              <div key={evt.id} className="relative pl-8 text-xs">
                <div className="absolute left-2 -translate-x-1/2 top-1 w-3 h-3 rounded-full bg-gov-green-700 ring-4 ring-white" />
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="font-bold text-gov-text-primary text-xs">
                    {evt.stage.replace('_', ' ')} • {evt.actorName}
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {new Date(evt.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-slate-600 text-xs mt-0.5 leading-relaxed">
                  {evt.description}
                </p>
                {evt.notes && (
                  <p className="text-[11px] text-slate-500 italic mt-0.5">
                    Notes: {evt.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* MODAL 1: Accept Requested Slot */}
      <Modal
        isOpen={showAcceptModal}
        onClose={() => setShowAcceptModal(false)}
        title="Accept & Confirm Appointment Slot"
        description={`Confirming slot for ${referral.patientName} (${referral.referralNumber})`}
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowAcceptModal(false)} disabled={submittingAction}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              size="sm" 
              onClick={handleAcceptConfirm}
              disabled={submittingAction}
              leftIcon={submittingAction ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : undefined}
            >
              {submittingAction ? 'Confirming...' : 'Confirm Slot'}
            </Button>
          </div>
        }
      >
        <div className="space-y-3.5 text-xs">
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-emerald-950">
            <strong>Facility Confirmation Action:</strong> This confirms that {activeFacility.name} can accommodate the patient at the specified time. The slot state will become <strong>CONFIRMED</strong>.
          </div>

          <FormField label="Confirmed Date" required>
            <Input
              type="date"
              value={acceptDate}
              onChange={(e) => setAcceptDate(e.target.value)}
              required
            />
          </FormField>

          <FormField label="Confirmed Time Window" required>
            <Input
              type="text"
              value={acceptTime}
              onChange={(e) => setAcceptTime(e.target.value)}
              placeholder="e.g. 10:00 AM - 12:00 PM"
              required
            />
          </FormField>

          <FormField label="Operational Remarks / Preparation Instructions">
            <Input
              type="text"
              value={acceptRemarks}
              onChange={(e) => setAcceptRemarks(e.target.value)}
              placeholder="e.g. Report to Room 12 with ANC card"
            />
          </FormField>
        </div>
      </Modal>

      {/* MODAL 2: Propose Alternative Slot */}
      <Modal
        isOpen={showProposeModal}
        onClose={() => setShowProposeModal(false)}
        title="Propose Alternative Appointment Slot"
        description={`Counter-propose slot for ${referral.patientName} (${referral.referralNumber})`}
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowProposeModal(false)} disabled={submittingAction}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              size="sm" 
              onClick={handleProposeConfirm}
              disabled={submittingAction}
              leftIcon={submittingAction ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : undefined}
            >
              {submittingAction ? 'Transmitting...' : 'Transmit Alternative'}
            </Button>
          </div>
        }
      >
        <div className="space-y-3.5 text-xs">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded text-amber-950">
            <strong>Alternative Proposal Principle:</strong> If the facility cannot accommodate the health worker's requested slot, you may offer an alternative session. The slot state will become <strong>ALTERNATIVE_PROPOSED</strong>.
          </div>

          <FormField label="Proposed Alternative Date" required>
            <Input
              type="date"
              value={proposedDate}
              onChange={(e) => setProposedDate(e.target.value)}
              required
            />
          </FormField>

          <FormField label="Proposed Alternative Time Window" required>
            <Input
              type="text"
              value={proposedTime}
              onChange={(e) => setProposedTime(e.target.value)}
              placeholder="e.g. 02:00 - 04:00 PM"
              required
            />
          </FormField>

          <FormField label="Operational Reason for Alternative" required>
            <Input
              type="text"
              value={proposedReason}
              onChange={(e) => setProposedReason(e.target.value)}
              placeholder="e.g. Morning OPD quota exceeded; afternoon clinic available"
              required
            />
          </FormField>
        </div>
      </Modal>

      {/* MODAL 3: Cannot Proceed / Reject */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="Cannot Proceed with Referral"
        description={`Record operational constraint for ${referral.patientName}`}
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowRejectModal(false)} disabled={submittingAction}>
              Cancel
            </Button>
            <Button 
              variant="emergency" 
              size="sm" 
              onClick={handleRejectConfirm}
              disabled={submittingAction}
              leftIcon={submittingAction ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : undefined}
            >
              {submittingAction ? 'Recording...' : 'Confirm Cannot Proceed'}
            </Button>
          </div>
        }
      >
        <div className="space-y-3.5 text-xs">
          <div className="p-3 bg-red-50 border border-red-200 rounded text-red-950">
            <strong>Operational Non-Acceptance:</strong> Use when the facility cannot accept this patient due to capacity, service downtime, or equipment failure. This alerts the referring health worker's Care Recovery Radar for rerouting.
          </div>

          <FormField label="Operational Reason (Required)" required>
            <select
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-gov-border rounded-gov bg-white focus:outline-none focus:ring-1 focus:ring-gov-green-700"
            >
              <option value="Specialist on emergency leave / not available">Specialist on emergency leave / not available</option>
              <option value="Bed capacity fully exhausted in required ward">Bed capacity fully exhausted in required ward</option>
              <option value="Diagnostic equipment (USG/X-Ray) undergoing maintenance">Diagnostic equipment (USG/X-Ray) undergoing maintenance</option>
              <option value="Service temporarily unavailable at this facility level">Service temporarily unavailable at this facility level</option>
              <option value="Operational constraint / facility under emergency surge">Operational constraint / facility under emergency surge</option>
            </select>
          </FormField>
        </div>
      </Modal>

      {/* MODAL 4: Mark Patient Arrived */}
      <Modal
        isOpen={showArriveModal}
        onClose={() => setShowArriveModal(false)}
        title="Record Patient Arrival at Facility"
        description={`Patient check-in for ${referral.patientName}`}
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowArriveModal(false)} disabled={submittingAction}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              size="sm" 
              onClick={handleMarkArrivedConfirm}
              disabled={submittingAction}
              leftIcon={submittingAction ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : undefined}
            >
              {submittingAction ? 'Recording...' : 'Confirm Check-in'}
            </Button>
          </div>
        }
      >
        <div className="space-y-3.5 text-xs">
          <p className="text-slate-700">
            Confirm that <strong>{referral.patientName}</strong> has reached {activeFacility.name} and presented their referral slip / registration details at the triage desk.
          </p>

          <FormField label="Registration Desk Remarks">
            <Input
              type="text"
              value={arriveRemarks}
              onChange={(e) => setArriveRemarks(e.target.value)}
              placeholder="e.g. Patient present in OPD waiting area"
            />
          </FormField>
        </div>
      </Modal>

      {/* MODAL 5: Start Service */}
      <Modal
        isOpen={showStartServiceModal}
        onClose={() => setShowStartServiceModal(false)}
        title="Start Clinical Service / Consultation"
        description={`Advance lifecycle to IN_CONSULTATION for ${referral.patientName}`}
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowStartServiceModal(false)} disabled={submittingAction}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              size="sm" 
              onClick={handleStartServiceConfirm}
              disabled={submittingAction}
              leftIcon={submittingAction ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : undefined}
            >
              {submittingAction ? 'Starting...' : 'Start Service'}
            </Button>
          </div>
        }
      >
        <div className="space-y-3.5 text-xs">
          <FormField label="Treating Doctor / Specialist Name" required>
            <Input
              type="text"
              value={doctorName}
              onChange={(e) => setDoctorName(e.target.value)}
              placeholder="e.g. Dr. Suresh Kulkarni"
              required
            />
          </FormField>

          <FormField label="Consultation Opening Notes">
            <Input
              type="text"
              value={serviceNotes}
              onChange={(e) => setServiceNotes(e.target.value)}
              placeholder="e.g. Patient vitals taken, clinical evaluation started"
            />
          </FormField>
        </div>
      </Modal>

      {/* MODAL 6: Complete Service */}
      <Modal
        isOpen={showCompleteModal}
        onClose={() => setShowCompleteModal(false)}
        title="Mark Service / Care Completed"
        description={`Record final care completion for ${referral.patientName}`}
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowCompleteModal(false)} disabled={submittingAction}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              size="sm" 
              onClick={handleCompleteServiceConfirm}
              disabled={submittingAction}
              leftIcon={submittingAction ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : undefined}
            >
              {submittingAction ? 'Completing...' : 'Complete Referral Care'}
            </Button>
          </div>
        }
      >
        <div className="space-y-3.5 text-xs">
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-emerald-950">
            <strong>Care Completion Principle:</strong> Marking care completed closes the loop (MATCH → REFER → TRACK → DETECT → RECOVER → COMPLETE). It indicates the consultation/treatment at this facility concluded.
          </div>

          <FormField label="Doctor / Officer Completing Care" required>
            <Input
              type="text"
              value={doctorName}
              onChange={(e) => setDoctorName(e.target.value)}
              required
            />
          </FormField>

          <FormField label="Operational Completion & Discharge Notes" required>
            <Input
              type="text"
              value={completionNotes}
              onChange={(e) => setCompletionNotes(e.target.value)}
              placeholder="e.g. Treatment delivered, medications dispensed, follow-up slip issued"
              required
            />
          </FormField>
        </div>
      </Modal>
    </div>
  );
};
