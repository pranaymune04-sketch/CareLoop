import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/layout';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  Button, 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell,
  StatusBadge,
  Modal 
} from '@/components/ui';
import { DemoAdminBanner } from './DemoAdminBanner';
import { CareLoopStore } from '@/mock';
import { Referral } from '@/types';
import { 
  History, 
  Eye, 
  Search, 
  ShieldAlert
} from 'lucide-react';

export const AdminGapMonitoring: React.FC = () => {
  const referrals = CareLoopStore.getAllReferrals();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');
  const [activeAuditReferral, setActiveAuditReferral] = useState<Referral | null>(null);

  // Filter for gap alerts
  const gapReferrals = useMemo(() => {
    return referrals.filter(
      (r) => r.hasGapAlert || r.status === 'GAP_DETECTED' || r.status === 'CANCELLED'
    );
  }, [referrals]);

  // Filtered list
  const filteredReferrals = useMemo(() => {
    return gapReferrals.filter((r) => {
      const matchesSearch =
        r.referralNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.targetFacilityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.gapReason && r.gapReason.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus =
        selectedStatusFilter === 'ALL' || r.status === selectedStatusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [gapReferrals, searchTerm, selectedStatusFilter]);

  // Calculate days open
  const calculateDaysOpen = (createdAt: string) => {
    const createdDate = new Date(createdAt).getTime();
    const now = Date.now();
    const diffDays = Math.max(1, Math.round((now - createdDate) / (1000 * 60 * 60 * 24)));
    return diffDays;
  };

  // Determine recovery status label
  const getRecoveryStatus = (ref: Referral) => {
    if (ref.status === 'COMPLETED') {
      return { label: 'Resolved & Closed', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    }
    if (ref.status === 'RECOVERED') {
      return { label: 'Recovered & Re-routed', color: 'text-teal-700 bg-teal-50 border-teal-200' };
    }
    if (ref.status === 'IN_CONSULTATION') {
      return { label: 'Attending Hospital', color: 'text-blue-700 bg-blue-50 border-blue-200' };
    }
    return { label: 'Pending ASHA Action', color: 'text-amber-800 bg-amber-50 border-amber-200' };
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Continuum Gap Monitoring Center"
        subtitle="Active exception management, drop-off detection, and ASHA field recovery tracking across the district"
        breadcrumbs={[
          { label: 'Admin Portal', href: '/admin' },
          { label: 'Gap Monitoring' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Link to="/admin/network">
              <Button variant="secondary" size="sm">
                Continuum Funnel
              </Button>
            </Link>
          </div>
        }
      />

      {/* Mandatory Demo Disclosures */}
      <DemoAdminBanner 
        title="Demo Administration View — Gap Radar" 
        badgeText="Continuum Governance" 
        variant="warning" 
      />

      {/* Prominent Required Clinical Boundary Disclaimer */}
      <div className="p-4 bg-red-50 border border-red-300 rounded-gov shadow-gov-sm flex items-start gap-3 text-xs text-red-950">
        <ShieldAlert className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h2 className="font-bold text-red-950 text-xs uppercase tracking-wide">
            Operational Protocol Notice
          </h2>
          <p className="text-xs text-red-900 leading-relaxed font-semibold">
            These are operational coordination gaps, not medical diagnoses.
          </p>
          <p className="text-[11px] text-red-800 leading-snug">
            Gaps represent logistical breakdowns (missed arrival windows, bed capacity constraints, transit delays). The District Admin role tracks coordination velocity and does not evaluate clinical suitability.
          </p>
        </div>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-4 bg-white rounded-gov border border-gov-border shadow-gov-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Active Flagged Gaps</span>
          <div className="text-2xl font-bold text-red-700 mt-1">{gapReferrals.length}</div>
          <span className="text-[11px] text-red-700 font-medium">Require administrative visibility</span>
        </div>

        <div className="p-4 bg-white rounded-gov border border-gov-border shadow-gov-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Patient No-Show Gaps</span>
          <div className="text-2xl font-bold text-amber-800 mt-1">
            {gapReferrals.filter((r) => r.gapReason?.toLowerCase().includes('missed') || r.gapReason?.toLowerCase().includes('check-in')).length || 1}
          </div>
          <span className="text-[11px] text-slate-500">Missed confirmed hospital slot</span>
        </div>

        <div className="p-4 bg-white rounded-gov border border-gov-border shadow-gov-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Capacity / Reroute Gaps</span>
          <div className="text-2xl font-bold text-indigo-900 mt-1">
            {gapReferrals.filter((r) => r.gapReason?.toLowerCase().includes('capacity') || r.gapReason?.toLowerCase().includes('reroute') || r.gapReason?.toLowerCase().includes('cannot')).length || 2}
          </div>
          <span className="text-[11px] text-slate-500">Facility overloaded or redirected</span>
        </div>

        <div className="p-4 bg-white rounded-gov border border-gov-border shadow-gov-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Field Recovery Rate</span>
          <div className="text-2xl font-bold text-teal-800 mt-1">84.6%</div>
          <span className="text-[11px] text-teal-700 font-medium">ASHA village visit within 24h</span>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search referral #, patient name, hospital, or reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-gov border border-gov-border focus:outline-none focus:ring-1 focus:ring-gov-green-500 bg-white"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Filter Status:</span>
            <select
              aria-label="Filter by referral status"
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="py-1.5 px-2.5 text-xs rounded-gov border border-gov-border focus:outline-none focus:ring-1 focus:ring-gov-green-500 bg-white"
            >
              <option value="ALL">All Gap Statuses</option>
              <option value="GAP_DETECTED">GAP_DETECTED</option>
              <option value="RECOVERED">RECOVERED</option>
              <option value="IN_CONSULTATION">IN_CONSULTATION</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Gap Referrals Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle>Continuum Exception Incident Log</CardTitle>
            <CardDescription>
              Referrals flagged by automated transit timers, hospital refusal codes, or field worker reports
            </CardDescription>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Showing {filteredReferrals.length} exception cases
          </span>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Referral #</TableHead>
                <TableHead>Patient Details</TableHead>
                <TableHead>Current Facility &amp; Dept</TableHead>
                <TableHead>Identified Gap Reason</TableHead>
                <TableHead>Days Open</TableHead>
                <TableHead>Current Status</TableHead>
                <TableHead>Recovery Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReferrals.map((ref) => {
                const recovery = getRecoveryStatus(ref);
                const daysOpen = calculateDaysOpen(ref.createdAt);

                return (
                  <TableRow key={ref.id}>
                    <TableCell className="font-mono text-xs font-bold text-gov-green-950">
                      <Link to={`/admin/referrals/${ref.id}`} className="hover:underline">
                        {ref.referralNumber}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-gov-text-primary text-xs">
                        {ref.patientName}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {ref.patientAge}y • {ref.patientGender} • {ref.village}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs font-semibold text-gov-text-primary">
                        {ref.targetFacilityName}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {ref.targetDepartment}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="text-xs text-red-800 font-medium leading-snug">
                        {ref.gapReason || 'Continuum breach: scheduled window lapsed without check-in.'}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs">
                      <span className="font-semibold text-slate-700">{daysOpen}d</span>
                      <span className="text-[10px] text-slate-400 block">since referral</span>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={ref.status} size="sm" />
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold border ${recovery.color}`}>
                        {recovery.label}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs py-1 h-7 gap-1"
                          onClick={() => setActiveAuditReferral(ref)}
                        >
                          <History className="w-3.5 h-3.5 text-slate-500" />
                          <span>Audit</span>
                        </Button>
                        <Link to={`/admin/referrals/${ref.id}`}>
                          <Button variant="secondary" size="sm" className="text-xs py-1 h-7 gap-1">
                            <Eye className="w-3.5 h-3.5" />
                            <span>View</span>
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredReferrals.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-slate-500 text-xs">
                    No gap incidents found matching criteria. All active referrals within normal operational limits.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Audit Timeline Modal */}
      {activeAuditReferral && (
        <Modal
          isOpen={!!activeAuditReferral}
          onClose={() => setActiveAuditReferral(null)}
          title={`Audit Log: ${activeAuditReferral.referralNumber}`}
          description={`Patient: ${activeAuditReferral.patientName} • Current Status: ${activeAuditReferral.status}`}
          maxWidth="lg"
          footer={
            <div className="flex items-center justify-between w-full">
              <span className="text-[11px] text-slate-500">
                Immutable audit sequence maintained for district monitoring.
              </span>
              <Button variant="secondary" size="sm" onClick={() => setActiveAuditReferral(null)}>
                Close Audit View
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-gov text-xs">
              <div className="font-semibold text-slate-800">Operational Exception Reason:</div>
              <p className="text-red-700 font-medium mt-0.5">
                {activeAuditReferral.gapReason || 'Patient did not arrive at facility within scheduled window.'}
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Event Sequence ({activeAuditReferral.events.length} transitions)
              </h4>
              <div className="border rounded-gov divide-y overflow-hidden">
                {activeAuditReferral.events.map((evt) => (
                  <div key={evt.id} className="p-3 bg-white text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={evt.stage} size="sm" />
                        <span className="font-bold text-gov-text-primary">{evt.actorName}</span>
                        <span className="text-[10px] text-slate-500 uppercase">({evt.actorRole})</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(evt.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-slate-700 text-xs">{evt.description}</p>
                    {evt.notes && (
                      <p className="text-[11px] text-slate-500 italic bg-slate-50 p-1.5 rounded">
                        Note: {evt.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
