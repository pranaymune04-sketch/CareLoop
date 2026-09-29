import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/layout';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell,
  StatusBadge, 
  Button 
} from '@/components/ui';
import { DemoAdminBanner } from './DemoAdminBanner';
import { careLoopApi, ApiError } from '@/api/client';
import { Referral, Facility, ReferralEvent } from '@/types';
import { Search, Loader2, AlertCircle, RefreshCw } from 'lucide-react';

interface AugmentedEvent extends ReferralEvent {
  referralDbId: string;
  referralNumber: string;
  patientName: string;
  targetFacilityName: string;
  targetFacilityId: string;
}

export const AdminAudit: React.FC = () => {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [selectedFacility, setSelectedFacility] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('ALL');

  const fetchData = async () => {
    try {
      setLoading(true);
      setApiError(null);
      const [refData, facData] = await Promise.all([
        careLoopApi.getReferrals(),
        careLoopApi.getFacilities(),
      ]);
      setReferrals(refData);
      setFacilities(facData);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to fetch referral audit stream.';
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Collect all events across all referrals with parent metadata
  const allEvents = useMemo<AugmentedEvent[]>(() => {
    return referrals.flatMap((r) =>
      r.events.map((e) => ({
        ...e,
        referralDbId: r.id,
        referralNumber: r.referralNumber,
        patientName: r.patientName,
        targetFacilityName: r.targetFacilityName,
        targetFacilityId: r.targetFacilityId,
      }))
    ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [referrals]);

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return allEvents.filter((evt) => {
      const matchesSearch =
        evt.referralNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        evt.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        evt.actorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        evt.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRole =
        selectedRole === 'ALL' || evt.actorRole.toLowerCase() === selectedRole.toLowerCase();

      const matchesFacility =
        selectedFacility === 'ALL' || evt.targetFacilityId === selectedFacility;

      const matchesStatus =
        selectedStatus === 'ALL' || evt.stage === selectedStatus;

      // Date filtering
      let matchesDate = true;
      if (dateFilter !== 'ALL') {
        const evtTime = new Date(evt.timestamp).getTime();
        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000;
        if (dateFilter === 'TODAY') {
          matchesDate = now - evtTime <= oneDay;
        } else if (dateFilter === 'WEEK') {
          matchesDate = now - evtTime <= 7 * oneDay;
        } else if (dateFilter === 'MONTH') {
          matchesDate = now - evtTime <= 30 * oneDay;
        }
      }

      return matchesSearch && matchesRole && matchesFacility && matchesStatus && matchesDate;
    });
  }, [allEvents, searchTerm, selectedRole, selectedFacility, selectedStatus, dateFilter]);

  if (loading && referrals.length === 0) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto py-12 text-center">
        <Loader2 className="w-8 h-8 text-gov-green-700 animate-spin mx-auto" />
        <p className="text-xs text-slate-500">Loading referral audit stream from backend API...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Continuum Audit & Event Log Center"
        subtitle="Referral-level event history and transition audit records aggregated across active district referrals"
        breadcrumbs={[
          { label: 'Admin Portal', href: '/admin' },
          { label: 'Audit Logs' },
        ]}
        actions={
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchData}
            disabled={loading}
            className="gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        }
      />

      {/* Mandatory Demo Disclosures */}
      <DemoAdminBanner 
        title="District Referral Event Stream" 
        badgeText="Referral-Level Audit Logs" 
        variant="info" 
      />

      {/* API Error Alert */}
      {apiError && (
        <div className="p-3.5 bg-red-50 border border-red-300 rounded-gov text-xs text-red-900 flex items-center justify-between shadow-gov-sm animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-700 shrink-0" />
            <span>{apiError}</span>
          </div>
          <Button variant="outline" size="sm" onClick={fetchData}>
            Retry
          </Button>
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-4 bg-white rounded-gov border border-gov-border shadow-gov-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Total Logged Events</span>
          <div className="text-2xl font-bold text-gov-text-primary mt-1">{allEvents.length}</div>
          <span className="text-[11px] text-slate-500">Across all network referrals</span>
        </div>

        <div className="p-4 bg-white rounded-gov border border-gov-border shadow-gov-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Health Worker Actions</span>
          <div className="text-2xl font-bold text-gov-green-800 mt-1">
            {allEvents.filter((e) => e.actorRole === 'health_worker').length}
          </div>
          <span className="text-[11px] text-gov-green-800 font-medium">Referral creation &amp; recovery</span>
        </div>

        <div className="p-4 bg-white rounded-gov border border-gov-border shadow-gov-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Hospital Confirmations</span>
          <div className="text-2xl font-bold text-purple-900 mt-1">
            {allEvents.filter((e) => e.actorRole === 'facility').length}
          </div>
          <span className="text-[11px] text-slate-500">Slot acceptance &amp; arrivals</span>
        </div>

        <div className="p-4 bg-white rounded-gov border border-gov-border shadow-gov-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Automated System Triggers</span>
          <div className="text-2xl font-bold text-blue-900 mt-1">
            {allEvents.filter((e) => e.actorRole === 'SYSTEM').length}
          </div>
          <span className="text-[11px] text-blue-800 font-medium">Smart matching &amp; timers</span>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <Card>
        <CardContent className="p-3.5 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Search */}
            <div className="relative lg:col-span-2">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search referral #, patient, actor, or action..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-gov border border-gov-border focus:outline-none focus:ring-1 focus:ring-gov-green-500 bg-white"
              />
            </div>

            {/* Filter by Role */}
            <div>
              <select
                aria-label="Filter by actor role"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full py-1.5 px-2.5 text-xs rounded-gov border border-gov-border focus:outline-none focus:ring-1 focus:ring-gov-green-500 bg-white"
              >
                <option value="ALL">All Roles</option>
                <option value="health_worker">Health Worker (ASHA/ANM)</option>
                <option value="facility">Facility Staff / MO</option>
                <option value="SYSTEM">System Automations</option>
                <option value="admin">District Admin</option>
                <option value="patient">Patient</option>
              </select>
            </div>

            {/* Filter by Facility */}
            <div>
              <select
                aria-label="Filter by receiving facility"
                value={selectedFacility}
                onChange={(e) => setSelectedFacility(e.target.value)}
                className="w-full py-1.5 px-2.5 text-xs rounded-gov border border-gov-border focus:outline-none focus:ring-1 focus:ring-gov-green-500 bg-white"
              >
                <option value="ALL">All Facilities</option>
                {facilities.map((fac) => (
                  <option key={fac.id} value={fac.id}>{fac.name}</option>
                ))}
              </select>
            </div>

            {/* Filter by Status / Stage */}
            <div>
              <select
                aria-label="Filter by referral status or stage"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full py-1.5 px-2.5 text-xs rounded-gov border border-gov-border focus:outline-none focus:ring-1 focus:ring-gov-green-500 bg-white"
              >
                <option value="ALL">All Event Stages</option>
                <option value="CREATED">CREATED</option>
                <option value="MATCHED">MATCHED</option>
                <option value="REFERRED">REFERRED</option>
                <option value="CONFIRMED">CONFIRMED</option>
                <option value="ARRIVED">ARRIVED</option>
                <option value="IN_CONSULTATION">IN_CONSULTATION</option>
                <option value="GAP_DETECTED">GAP_DETECTED</option>
                <option value="RECOVERED">RECOVERED</option>
                <option value="COMPLETED">COMPLETED</option>
              </select>
            </div>

            {/* Filter by Date Range */}
            <div>
              <select
                aria-label="Filter by date range"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full py-1.5 px-2.5 text-xs rounded-gov border border-gov-border focus:outline-none focus:ring-1 focus:ring-gov-green-500 bg-white"
              >
                <option value="ALL">All Time</option>
                <option value="TODAY">Last 24 Hours</option>
                <option value="WEEK">Last 7 Days</option>
                <option value="MONTH">Last 30 Days</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle>District Referral Event Audit Stream</CardTitle>
            <CardDescription>
              Chronological log with actor identification and event notes
            </CardDescription>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Showing {filteredEvents.length} of {allEvents.length} events
          </span>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Referral #</TableHead>
                <TableHead>Action / Stage</TableHead>
                <TableHead>Result / Notes</TableHead>
                <TableHead className="text-right">Dossier</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEvents.map((evt) => (
                <TableRow key={evt.id}>
                  <TableCell className="text-slate-500 text-[11px] whitespace-nowrap font-mono">
                    {new Date(evt.timestamp).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold text-slate-800 text-xs">
                      {evt.actorName}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex px-1.5 py-0.2 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border">
                      {evt.actorRole}
                    </span>
                  </TableCell>
                  <TableCell className="font-mono text-xs font-bold text-gov-green-950">
                    <Link to={`/admin/referrals/${evt.referralDbId}`} className="hover:underline">
                      {evt.referralNumber}
                    </Link>
                    <span className="text-[10px] text-slate-400 block font-normal font-sans">
                      {evt.patientName}
                    </span>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={evt.stage} size="sm" />
                  </TableCell>
                  <TableCell className="max-w-md">
                    <div className="text-xs text-slate-800 leading-snug">
                      {evt.description}
                    </div>
                    {evt.notes && (
                      <div className="text-[10px] text-slate-500 italic mt-0.5">
                        Note: {evt.notes}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link to={`/admin/referrals/${evt.referralDbId}`}>
                      <Button variant="ghost" size="sm" className="text-xs py-1 h-7">
                        Inspect
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
              {filteredEvents.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-slate-500 text-xs">
                    No audit records match the current filter configuration.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
