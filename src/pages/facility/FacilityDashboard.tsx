import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/layout';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  Button, 
  StatusBadge, 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell,
  Modal,
  FormField,
  Input,
  EmptyState
} from '@/components/ui';
import { CareLoopStore } from '@/mock';
import { Referral, Facility } from '@/types';
import { careLoopApi, ApiError } from '@/api/client';
import { 
  Siren, 
  Bed, 
  ArrowRight, 
  CalendarClock, 
  CheckCircle2, 
  Activity, 
  FileCheck,
  AlertCircle,
  Loader2
} from 'lucide-react';

export const FacilityDashboard: React.FC = () => {
  // Active facility: Bhor CHC (fac_chc_01)
  const defaultFacility = CareLoopStore.getFacilities().find((f) => f.id === 'fac_chc_01') || CareLoopStore.getFacilities()[1];
  const [facility, setFacility] = useState<Facility>(defaultFacility);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  // Modal for quick acceptance on dashboard
  const [quickAcceptModal, setQuickAcceptModal] = useState<Referral | null>(null);
  const [acceptDate, setAcceptDate] = useState('');
  const [acceptTime, setAcceptTime] = useState('');
  const [acceptRemarks, setAcceptRemarks] = useState('Slot confirmed. OPD registration bay reserved.');

  // Quick Action: Propose Alternative Modal
  const [quickProposeModal, setQuickProposeModal] = useState<Referral | null>(null);
  const [proposedDate, setProposedDate] = useState('');
  const [proposedTime, setProposedTime] = useState('02:00 - 04:00 PM');
  const [proposedReason, setProposedReason] = useState('Morning slot busy. Afternoon clinic offered.');

  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);
  const [submittingAction, setSubmittingAction] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setApiError(null);
      const [facData, refData] = await Promise.all([
        careLoopApi.getFacilityById('fac_chc_01').catch(() => defaultFacility),
        careLoopApi.getReferrals({ targetFacilityId: 'fac_chc_01' })
      ]);
      setFacility(facData);
      setReferrals(refData);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to load facility dashboard data.';
      setApiError(msg);
      // Fallback to local store data on network error so UI doesn't crash
      setReferrals(CareLoopStore.getFacilityReferrals('fac_chc_01'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Derived metrics
  const awaitingTriageReferrals = referrals.filter((r) => r.status === 'REFERRED');
  const confirmedReferrals = referrals.filter((r) => r.status === 'CONFIRMED');
  const inProgressReferrals = referrals.filter((r) => r.status === 'ARRIVED' || r.status === 'IN_CONSULTATION');
  const completedReferrals = referrals.filter((r) => r.status === 'COMPLETED');
  const emergencyReferrals = referrals.filter((r) => r.referralType === 'EMERGENCY' && r.status !== 'COMPLETED');

  const handleQuickAccept = async () => {
    if (!quickAcceptModal) return;
    setSubmittingAction(true);
    setApiError(null);
    try {
      const targetDate = acceptDate || quickAcceptModal.slot.requestedDate;
      const targetTime = acceptTime || quickAcceptModal.slot.requestedTimeWindow;
      const updated = await careLoopApi.acceptSlot(
        quickAcceptModal.id,
        {
          confirmedDate: targetDate,
          confirmedTimeWindow: targetTime,
          facilityRemarks: acceptRemarks,
        },
        facility.id,
        'Dr. Rajesh Sharma (Medical Superintendent)'
      );
      // Local sync for un-migrated tabs
      CareLoopStore.acceptReferralSlot(
        quickAcceptModal.id,
        targetDate,
        targetTime,
        acceptRemarks,
        'Dr. Rajesh Sharma (Medical Superintendent)'
      );
      setReferrals((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      setQuickAcceptModal(null);
      setActionSuccessMessage(`Referral ${updated.referralNumber} confirmed by receiving facility.`);
      setTimeout(() => setActionSuccessMessage(null), 4000);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to confirm referral slot.';
      setApiError(msg);
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleQuickPropose = async () => {
    if (!quickProposeModal || !proposedReason.trim()) return;
    setSubmittingAction(true);
    setApiError(null);
    try {
      const formatted = `${proposedDate} at ${proposedTime}`;
      const updated = await careLoopApi.proposeAlternativeSlot(
        quickProposeModal.id,
        {
          counterSlot: formatted,
          reason: proposedReason,
        },
        facility.id
      );
      // Local sync for un-migrated tabs
      CareLoopStore.proposeAlternativeSlot(
        quickProposeModal.id,
        formatted,
        proposedReason,
        'Dr. Rajesh Sharma (Medical Superintendent)'
      );
      setReferrals((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      setQuickProposeModal(null);
      setActionSuccessMessage(`Alternative slot transmitted for Referral ${updated.referralNumber}.`);
      setTimeout(() => setActionSuccessMessage(null), 4000);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to propose alternative slot.';
      setApiError(msg);
    } finally {
      setSubmittingAction(false);
    }
  };

  if (loading && referrals.length === 0) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto py-12 text-center">
        <Loader2 className="w-8 h-8 text-gov-green-700 animate-spin mx-auto" />
        <p className="text-xs text-slate-500">Loading facility dashboard from backend API...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={facility.name}
        subtitle={`Operational Triage Portal • Type: ${facility.type} • Block: ${facility.block}, ${facility.district} • HFR Code: ${facility.code}`}
        breadcrumbs={[
          { label: 'Facility Portal', href: '/facility' },
          { label: 'Dashboard' },
        ]}
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <Link to="/facility/capacity">
              <Button variant="outline" size="sm" leftIcon={<Bed className="w-3.5 h-3.5" />}>
                Manage Capacity
              </Button>
            </Link>
            <Link to="/facility/incoming">
              <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                Incoming Triage ({awaitingTriageReferrals.length})
              </Button>
            </Link>
          </div>
        }
      />

      {/* Demo Disclosure & Privacy Notice */}
      <div className="p-3 bg-slate-50 border border-gov-border rounded-gov text-xs text-slate-600 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
        <span>
          <strong>Facility Operational Dashboard:</strong> Access is scoped to this facility's referrals ({facility.name}) via CareLoop Backend API.
        </span>
        <span className="text-[11px] font-semibold text-gov-green-800">
          HFR: {facility.code}
        </span>
      </div>

      {/* API Error Notification */}
      {apiError && (
        <div className="p-3 bg-red-50 border border-red-300 rounded-gov text-xs text-red-900 flex items-center gap-2 shadow-gov-sm animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-red-700 shrink-0" />
          <span>{apiError}</span>
        </div>
      )}

      {/* Success Notification Banner */}
      {actionSuccessMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-gov text-xs text-emerald-900 flex items-center gap-2 shadow-gov-sm animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{actionSuccessMessage}</span>
        </div>
      )}

      {/* Emergency Immediate Action Callout (If active emergency exists) */}
      {emergencyReferrals.length > 0 && (
        <div className="p-4 bg-red-50 border-l-4 border-l-red-600 rounded border border-red-300 shadow-gov-card space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Siren className="w-5 h-5 text-red-700 animate-pulse shrink-0" />
              <div>
                <h3 className="font-bold text-sm text-red-950">
                  Critical Emergency Referrals Pending Triage ({emergencyReferrals.length})
                </h3>
                <p className="text-xs text-red-900">
                  Patients requiring immediate trauma/acute department coordination. No administrative bottlenecks.
                </p>
              </div>
            </div>

            <Link to="/facility/incoming?filter=emergency">
              <Button variant="emergency" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                Review Emergency Queue
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Operational Demo Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        <div className="p-4 bg-white rounded-gov border border-gov-border shadow-gov-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-gov-text-secondary uppercase">Awaiting Response</span>
            <CalendarClock className="w-4 h-4 text-blue-700" />
          </div>
          <div className="text-2xl font-bold text-blue-900 mt-1">
            {awaitingTriageReferrals.length}
          </div>
          <span className="text-[11px] text-blue-800 font-medium">Slot requests pending</span>
        </div>

        <div className="p-4 bg-white rounded-gov border border-gov-border shadow-gov-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-gov-text-secondary uppercase">Confirmed Slots</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-2xl font-bold text-emerald-900 mt-1">
            {confirmedReferrals.length}
          </div>
          <span className="text-[11px] text-emerald-800 font-medium">Accepted by facility</span>
        </div>

        <div className="p-4 bg-white rounded-gov border border-gov-border shadow-gov-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-gov-text-secondary uppercase">In Progress</span>
            <Activity className="w-4 h-4 text-teal-700" />
          </div>
          <div className="text-2xl font-bold text-teal-900 mt-1">
            {inProgressReferrals.length}
          </div>
          <span className="text-[11px] text-teal-800 font-medium">Arrived / In Consultation</span>
        </div>

        <div className="p-4 bg-white rounded-gov border border-gov-border shadow-gov-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-gov-text-secondary uppercase">Care Completed</span>
            <FileCheck className="w-4 h-4 text-purple-700" />
          </div>
          <div className="text-2xl font-bold text-purple-900 mt-1">
            {completedReferrals.length}
          </div>
          <span className="text-[11px] text-purple-800 font-medium">Discharged & closed</span>
        </div>

        <div className="p-4 bg-white rounded-gov border border-gov-border shadow-gov-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-gov-text-secondary uppercase">Mock Bed Capacity</span>
            <Bed className="w-4 h-4 text-gov-green-700" />
          </div>
          <div className="text-xl font-bold text-gov-green-950 mt-1">
            {facility.availableBeds} / {facility.totalBeds}
          </div>
          <span className="text-[11px] text-slate-500">ICU Available: {facility.icuBedsAvailable}</span>
        </div>
      </div>

      {/* Main Content Area: Urgent Queue Table */}
      <Card className="shadow-gov-card">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gov-border/60">
          <div>
            <CardTitle>Incoming Referrals Awaiting Facility Action</CardTitle>
            <CardDescription>
              Referral slots requested by rural health workers. Verify capacity, accept slot, or counter-propose availability.
            </CardDescription>
          </div>
          <Link to="/facility/incoming">
            <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              View All Incoming
            </Button>
          </Link>
        </CardHeader>

        <CardContent className="p-0">
          {awaitingTriageReferrals.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={<CheckCircle2 className="w-10 h-10 text-emerald-600" />}
                title="Triage Queue Clear"
                description="No incoming referrals are currently awaiting facility action. All requested slots have been processed."
                actionLabel="View All Facility Referrals"
                onAction={() => window.location.href = '/facility/referrals'}
              />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Referral #</TableHead>
                  <TableHead>Patient Details</TableHead>
                  <TableHead>Urgency</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Referring Worker</TableHead>
                  <TableHead>Requested Slot</TableHead>
                  <TableHead className="text-right">Quick Triage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {awaitingTriageReferrals.map((ref) => {
                  const isEmerg = ref.referralType === 'EMERGENCY';

                  return (
                    <TableRow key={ref.id} className={isEmerg ? 'bg-red-50/30' : undefined}>
                      <TableCell className="font-mono text-[11px] font-bold">
                        <Link to={`/facility/incoming/${ref.id}`} className="text-gov-green-900 hover:underline">
                          {ref.referralNumber}
                        </Link>
                      </TableCell>

                      <TableCell>
                        <div className="font-bold text-xs text-gov-text-primary">
                          {ref.patientName}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {ref.patientAge ? `${ref.patientAge} yrs, ${ref.patientGender}` : 'Demographics pending'} • {ref.village}
                        </div>
                      </TableCell>

                      <TableCell>
                        <StatusBadge type={ref.referralType} size="sm" />
                      </TableCell>

                      <TableCell className="text-xs">
                        <div className="font-medium text-gov-text-primary">{ref.targetDepartment}</div>
                        <div className="text-[11px] text-slate-500 line-clamp-1 max-w-[180px]" title={ref.chiefComplaint}>
                          {ref.chiefComplaint}
                        </div>
                      </TableCell>

                      <TableCell className="text-xs">
                        <div className="font-medium text-slate-800">{ref.referringWorkerName}</div>
                        <div className="text-[11px] text-slate-500">{ref.referringWorkerCadre} ({ref.originSubCenter})</div>
                      </TableCell>

                      <TableCell className="text-xs">
                        <div className="font-semibold text-gov-text-primary">{ref.slot.requestedDate}</div>
                        <div className="text-[11px] text-blue-700 font-medium">{ref.slot.requestedTimeWindow}</div>
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => {
                              setQuickAcceptModal(ref);
                              setAcceptDate(ref.slot.requestedDate);
                              setAcceptTime(ref.slot.requestedTimeWindow);
                            }}
                          >
                            Accept
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setQuickProposeModal(ref);
                              setProposedDate(
                                new Date(new Date(ref.slot.requestedDate).getTime() + 86400000).toISOString().split('T')[0]
                              );
                            }}
                          >
                            Propose Alt
                          </Button>

                          <Link to={`/facility/incoming/${ref.id}`}>
                            <Button variant="ghost" size="sm">
                              Review
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Department Readiness & Queue Summary */}
      <Card className="shadow-gov-card">
        <CardHeader className="flex flex-row items-center justify-between border-b border-gov-border/60">
          <div>
            <CardTitle>Department Roster & Mock Queue Status</CardTitle>
            <CardDescription>
              Configured specialist availability and current queue estimates for {facility.name} (Demo data)
            </CardDescription>
          </div>
          <Link to="/facility/capacity">
            <Button variant="ghost" size="sm">
              Edit Capacity
            </Button>
          </Link>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Clinical Department</TableHead>
                <TableHead>Doctor on Duty</TableHead>
                <TableHead>Specialist Availability</TableHead>
                <TableHead>Current Queue</TableHead>
                <TableHead>Estimated Wait</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {facility.services.map((svc) => (
                <TableRow key={svc.id}>
                  <TableCell className="font-semibold text-xs text-gov-text-primary">
                    {svc.name}
                  </TableCell>
                  <TableCell className="text-xs text-slate-700">
                    {svc.activeDoctorName || 'Duty Medical Officer'}
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                      svc.specialistAvailable 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {svc.specialistAvailable ? 'Specialist Active' : 'General Duty Only'}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs font-mono font-bold text-slate-800">
                    {svc.currentQueueLength} patients
                  </TableCell>
                  <TableCell className="text-xs text-slate-600">
                    ~{svc.estimatedWaitMinutes} mins
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* QUICK ACCEPT MODAL */}
      <Modal
        isOpen={!!quickAcceptModal}
        onClose={() => setQuickAcceptModal(null)}
        title="Confirm Appointment Slot"
        description={quickAcceptModal ? `Confirming requested slot for ${quickAcceptModal.patientName}` : ''}
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setQuickAcceptModal(null)} disabled={submittingAction}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              size="sm" 
              onClick={handleQuickAccept}
              disabled={submittingAction}
              leftIcon={submittingAction ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : undefined}
            >
              {submittingAction ? 'Confirming...' : 'Confirm Slot'}
            </Button>
          </div>
        }
      >
        <div className="space-y-3.5 text-xs">
          <p className="text-slate-700">
            Confirm that <strong>{facility.name}</strong> accepts this referral for the scheduled date and time.
          </p>

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
              required
            />
          </FormField>

          <FormField label="Facility Remarks">
            <Input
              type="text"
              value={acceptRemarks}
              onChange={(e) => setAcceptRemarks(e.target.value)}
            />
          </FormField>
        </div>
      </Modal>

      {/* QUICK PROPOSE MODAL */}
      <Modal
        isOpen={!!quickProposeModal}
        onClose={() => setQuickProposeModal(null)}
        title="Propose Alternative Slot"
        description={quickProposeModal ? `Suggest alternate session for ${quickProposeModal.patientName}` : ''}
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setQuickProposeModal(null)} disabled={submittingAction}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              size="sm" 
              onClick={handleQuickPropose}
              disabled={submittingAction}
              leftIcon={submittingAction ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : undefined}
            >
              {submittingAction ? 'Transmitting...' : 'Transmit Proposal'}
            </Button>
          </div>
        }
      >
        <div className="space-y-3.5 text-xs">
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
              required
            />
          </FormField>

          <FormField label="Operational Reason" required>
            <Input
              type="text"
              value={proposedReason}
              onChange={(e) => setProposedReason(e.target.value)}
              required
            />
          </FormField>
        </div>
      </Modal>
    </div>
  );
};
