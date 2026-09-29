import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { PageHeader } from '@/components/layout';
import { 
  Card, 
  CardHeader, 
  CardContent, 
  Button, 
  StatusBadge, 
  SearchField, 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell, 
  TabsList, 
  TabsTrigger, 
  Modal, 
  FormField, 
  Input, 
  EmptyState 
} from '@/components/ui';
import { CareLoopStore } from '@/mock';
import { Referral } from '@/types';
import { careLoopApi, ApiError } from '@/api/client';
import { 
  CheckCircle2, 
  CalendarClock, 
  Eye, 
  Inbox,
  AlertCircle,
  Loader2
} from 'lucide-react';

export const FacilityIncoming: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialFilter = searchParams.get('filter') === 'emergency' ? 'EMERGENCY' : 'PENDING';

  const facility = CareLoopStore.getFacilities().find((f) => f.id === 'fac_chc_01') || CareLoopStore.getFacilities()[1];
  
  const [incomingList, setIncomingList] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterTab, setFilterTab] = useState<'ALL' | 'PENDING' | 'EMERGENCY' | 'ALTERNATIVE' | 'CONFIRMED'>(initialFilter as any);

  // Modals
  const [acceptModalRef, setAcceptModalRef] = useState<Referral | null>(null);
  const [acceptDate, setAcceptDate] = useState('');
  const [acceptTime, setAcceptTime] = useState('');
  const [acceptRemarks, setAcceptRemarks] = useState('Slot confirmed. OPD triage registration allocated.');

  const [proposeModalRef, setProposeModalRef] = useState<Referral | null>(null);
  const [proposedDate, setProposedDate] = useState('');
  const [proposedTime, setProposedTime] = useState('02:00 - 04:00 PM');
  const [proposedReason, setProposedReason] = useState('Specialist morning rounds full. Afternoon consultation offered.');

  const [rejectModalRef, setRejectModalRef] = useState<Referral | null>(null);
  const [rejectReason, setRejectReason] = useState('Specialist on emergency leave / Bed capacity exhausted.');

  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);
  const [submittingAction, setSubmittingAction] = useState(false);

  const refreshList = async () => {
    try {
      setLoading(true);
      setApiError(null);
      const data = await careLoopApi.getReferrals({ targetFacilityId: facility.id });
      setIncomingList(data);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to fetch incoming facility referrals.';
      setApiError(msg);
      // Fallback to local store data
      setIncomingList(CareLoopStore.getFacilityReferrals(facility.id));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshList();
  }, [facility.id]);

  // Filtered referrals
  const filtered = incomingList.filter((r) => {
    const matchesSearch =
      r.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.referralNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.targetDepartment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.referringWorkerName.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (filterTab === 'PENDING') return r.status === 'REFERRED';
    if (filterTab === 'EMERGENCY') return r.referralType === 'EMERGENCY';
    if (filterTab === 'ALTERNATIVE') return r.status === 'SLOT_PROPOSED';
    if (filterTab === 'CONFIRMED') return r.status === 'CONFIRMED';
    return true;
  });

  const pendingCount = incomingList.filter((r) => r.status === 'REFERRED').length;
  const emergencyCount = incomingList.filter((r) => r.referralType === 'EMERGENCY' && r.status !== 'COMPLETED').length;
  const altCount = incomingList.filter((r) => r.status === 'SLOT_PROPOSED').length;

  const handleConfirmSlot = async () => {
    if (!acceptModalRef) return;
    setSubmittingAction(true);
    setApiError(null);
    try {
      const targetDate = acceptDate || acceptModalRef.slot.requestedDate;
      const targetTime = acceptTime || acceptModalRef.slot.requestedTimeWindow;
      const updated = await careLoopApi.acceptSlot(
        acceptModalRef.id,
        {
          confirmedDate: targetDate,
          confirmedTimeWindow: targetTime,
          facilityRemarks: acceptRemarks,
        },
        facility.id,
        'Dr. Rajesh Sharma (Medical Superintendent)'
      );
      // Sync local store for un-migrated tabs
      CareLoopStore.acceptReferralSlot(
        acceptModalRef.id,
        targetDate,
        targetTime,
        acceptRemarks,
        'Dr. Rajesh Sharma (Medical Superintendent)'
      );
      await refreshList();
      setAcceptModalRef(null);
      setActionSuccessMessage(`Referral ${updated.referralNumber} confirmed by receiving facility.`);
      setTimeout(() => setActionSuccessMessage(null), 4000);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to confirm referral slot.';
      setApiError(msg);
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleProposeAlternate = async () => {
    if (!proposeModalRef || !proposedReason.trim()) return;
    setSubmittingAction(true);
    setApiError(null);
    try {
      const formatted = `${proposedDate} at ${proposedTime}`;
      const updated = await careLoopApi.proposeAlternativeSlot(
        proposeModalRef.id,
        {
          counterSlot: formatted,
          reason: proposedReason,
        },
        facility.id
      );
      // Sync local store for un-migrated tabs
      CareLoopStore.proposeAlternativeSlot(
        proposeModalRef.id,
        formatted,
        proposedReason,
        'Dr. Rajesh Sharma (Medical Superintendent)'
      );
      await refreshList();
      setProposeModalRef(null);
      setActionSuccessMessage(`Alternative slot transmitted to health worker for Referral ${updated.referralNumber}.`);
      setTimeout(() => setActionSuccessMessage(null), 4000);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to propose alternative slot.';
      setApiError(msg);
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleReject = async () => {
    if (!rejectModalRef || !rejectReason.trim()) return;
    setSubmittingAction(true);
    setApiError(null);
    try {
      const updated = await careLoopApi.cannotProceed(
        rejectModalRef.id,
        {
          reason: rejectReason,
        },
        facility.id
      );
      // Sync local store for un-migrated tabs
      CareLoopStore.rejectReferral(
        rejectModalRef.id,
        rejectReason,
        'Dr. Rajesh Sharma (Medical Superintendent)'
      );
      await refreshList();
      setRejectModalRef(null);
      setActionSuccessMessage(`Referral ${updated.referralNumber} recorded as cannot proceed. Escalated to recovery radar.`);
      setTimeout(() => setActionSuccessMessage(null), 4000);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to record cannot proceed.';
      setApiError(msg);
    } finally {
      setSubmittingAction(false);
    }
  };

  if (loading && incomingList.length === 0) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto py-12 text-center">
        <Loader2 className="w-8 h-8 text-gov-green-700 animate-spin mx-auto" />
        <p className="text-xs text-slate-500">Loading incoming triage queue from backend API...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Incoming Triage & Slot Confirmation"
        subtitle={`Review and manage referral slots requested by field workers for ${facility.name}`}
        breadcrumbs={[
          { label: 'Facility Portal', href: '/facility' },
          { label: 'Incoming Triage' },
        ]}
        actions={
          <Link to="/facility/referrals">
            <Button variant="outline" size="sm">
              All Facility Referrals ({incomingList.length})
            </Button>
          </Link>
        }
      />

      {/* Principle Reminder Banner */}
      <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-gov text-xs text-blue-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <CalendarClock className="w-4 h-4 text-blue-700 shrink-0" />
          <span>
            <strong>Requested Slot Principle:</strong> Health workers request preferred appointment windows. Slots are NOT confirmed until accepted by this receiving facility triage desk.
          </span>
        </div>
        <span className="text-[11px] font-semibold text-blue-800 shrink-0">
          Demo Scoped View: {facility.name}
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

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <SearchField
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search by patient, referral #, service or health worker..."
              className="max-w-md"
            />
            <TabsList className="overflow-x-auto">
              <TabsTrigger active={filterTab === 'PENDING'} onClick={() => setFilterTab('PENDING')}>
                Awaiting Triage ({pendingCount})
              </TabsTrigger>
              <TabsTrigger active={filterTab === 'EMERGENCY'} onClick={() => setFilterTab('EMERGENCY')}>
                Emergency ({emergencyCount})
              </TabsTrigger>
              <TabsTrigger active={filterTab === 'ALTERNATIVE'} onClick={() => setFilterTab('ALTERNATIVE')}>
                Alt. Proposed ({altCount})
              </TabsTrigger>
              <TabsTrigger active={filterTab === 'CONFIRMED'} onClick={() => setFilterTab('CONFIRMED')}>
                Confirmed Slots
              </TabsTrigger>
              <TabsTrigger active={filterTab === 'ALL'} onClick={() => setFilterTab('ALL')}>
                All Incoming ({incomingList.length})
              </TabsTrigger>
            </TabsList>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={<Inbox className="w-10 h-10 text-slate-400" />}
                title="No Incoming Referrals"
                description={
                  searchTerm
                    ? `No incoming referrals found matching "${searchTerm}".`
                    : 'No referrals currently match the selected triage filter.'
                }
              />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Referral #</TableHead>
                  <TableHead>Patient Details</TableHead>
                  <TableHead>Type & Priority</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Referring Worker</TableHead>
                  <TableHead>Requested Time Slot</TableHead>
                  <TableHead>Slot State</TableHead>
                  <TableHead className="text-right">Triage Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((ref) => {
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
                        <div className="flex flex-col gap-1 items-start">
                          <StatusBadge type={ref.referralType} size="sm" />
                          {ref.priority === 'CRITICAL_EMERGENCY' && (
                            <span className="text-[10px] text-red-700 font-bold uppercase">
                              Critical
                            </span>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="text-xs">
                        <div className="font-medium text-gov-text-primary">
                          {ref.targetDepartment}
                        </div>
                        <div className="text-[11px] text-slate-500 line-clamp-1 max-w-[190px]" title={ref.chiefComplaint}>
                          {ref.chiefComplaint}
                        </div>
                      </TableCell>

                      <TableCell className="text-xs">
                        <div className="font-semibold text-slate-800">
                          {ref.referringWorkerName}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {ref.referringWorkerCadre} ({ref.originSubCenter})
                        </div>
                      </TableCell>

                      <TableCell className="text-xs">
                        <div className="font-medium text-gov-text-primary">
                          {ref.slot.requestedDate}
                        </div>
                        <div className="text-[11px] text-blue-700 font-medium">
                          {ref.slot.requestedTimeWindow}
                        </div>
                      </TableCell>

                      <TableCell>
                        <StatusBadge status={ref.status} size="sm" />
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {ref.status === 'REFERRED' && (
                            <>
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => {
                                  setAcceptModalRef(ref);
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
                                  setProposeModalRef(ref);
                                  setProposedDate(
                                    new Date(new Date(ref.slot.requestedDate).getTime() + 86400000).toISOString().split('T')[0]
                                  );
                                }}
                              >
                                Propose Alt
                              </Button>

                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-700 hover:bg-red-50"
                                onClick={() => {
                                  setRejectModalRef(ref);
                                }}
                              >
                                Reject
                              </Button>
                            </>
                          )}

                          <Link to={`/facility/incoming/${ref.id}`}>
                            <Button variant="outline" size="sm" leftIcon={<Eye className="w-3.5 h-3.5" />}>
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

      {/* ACCEPT MODAL */}
      <Modal
        isOpen={!!acceptModalRef}
        onClose={() => setAcceptModalRef(null)}
        title="Confirm Appointment Slot"
        description={acceptModalRef ? `Confirming requested slot for ${acceptModalRef.patientName}` : ''}
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setAcceptModalRef(null)} disabled={submittingAction}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              size="sm" 
              onClick={handleConfirmSlot}
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

      {/* PROPOSE MODAL */}
      <Modal
        isOpen={!!proposeModalRef}
        onClose={() => setProposeModalRef(null)}
        title="Propose Alternative Slot"
        description={proposeModalRef ? `Suggest alternate session for ${proposeModalRef.patientName}` : ''}
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setProposeModalRef(null)} disabled={submittingAction}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              size="sm" 
              onClick={handleProposeAlternate}
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

      {/* REJECT MODAL */}
      <Modal
        isOpen={!!rejectModalRef}
        onClose={() => setRejectModalRef(null)}
        title="Cannot Proceed with Referral"
        description={rejectModalRef ? `Record operational constraint for ${rejectModalRef.patientName}` : ''}
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setRejectModalRef(null)} disabled={submittingAction}>
              Cancel
            </Button>
            <Button 
              variant="emergency" 
              size="sm" 
              onClick={handleReject}
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
            <strong>Operational Constraint:</strong> If the facility cannot accommodate this referral, record the constraint. This triggers Care Recovery Radar on the health worker dashboard for rerouting.
          </div>

          <FormField label="Operational Reason (Required)" required>
            <select
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-gov-border rounded-gov bg-white focus:outline-none focus:ring-1 focus:ring-gov-green-700"
            >
              <option value="Specialist on emergency leave / not available">Specialist on emergency leave / not available</option>
              <option value="Bed capacity fully exhausted in required ward">Bed capacity fully exhausted in required ward</option>
              <option value="Diagnostic equipment undergoing maintenance">Diagnostic equipment undergoing maintenance</option>
              <option value="Operational surge / emergency triage saturation">Operational surge / emergency triage saturation</option>
            </select>
          </FormField>
        </div>
      </Modal>
    </div>
  );
};
