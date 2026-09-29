import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  EmptyState
} from '@/components/ui';
import { CareLoopStore } from '@/mock';
import { Referral } from '@/types';
import { careLoopApi, ApiError } from '@/api/client';
import { 
  CalendarDays, 
  Eye, 
  FileText,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

export const FacilityReferrals: React.FC = () => {
  const facility = CareLoopStore.getFacilities().find((f) => f.id === 'fac_chc_01') || CareLoopStore.getFacilities()[1];
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTab, setFilterTab] = useState<'ALL' | 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'EMERGENCY' | 'GAPS'>('ALL');

  const [facilityReferrals, setFacilityReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  const fetchReferrals = async () => {
    try {
      setLoading(true);
      setApiError(null);
      const data = await careLoopApi.getReferrals({ targetFacilityId: facility.id });
      setFacilityReferrals(data);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to fetch facility referrals.';
      setApiError(msg);
      setFacilityReferrals(CareLoopStore.getFacilityReferrals(facility.id));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferrals();
  }, [facility.id]);

  const filteredReferrals = facilityReferrals.filter((r) => {
    const matchesSearch =
      r.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.referralNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.targetDepartment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.referringWorkerName.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (filterTab === 'PENDING') return r.status === 'REFERRED' || r.status === 'SLOT_PROPOSED';
    if (filterTab === 'CONFIRMED') return r.status === 'CONFIRMED';
    if (filterTab === 'IN_PROGRESS') return r.status === 'ARRIVED' || r.status === 'IN_CONSULTATION';
    if (filterTab === 'COMPLETED') return r.status === 'COMPLETED';
    if (filterTab === 'EMERGENCY') return r.referralType === 'EMERGENCY';
    if (filterTab === 'GAPS') return r.hasGapAlert || r.status === 'GAP_DETECTED' || r.status === 'CANCELLED';
    return true;
  });

  const pendingCount = facilityReferrals.filter((r) => r.status === 'REFERRED' || r.status === 'SLOT_PROPOSED').length;
  const inProgressCount = facilityReferrals.filter((r) => r.status === 'ARRIVED' || r.status === 'IN_CONSULTATION').length;
  const completedCount = facilityReferrals.filter((r) => r.status === 'COMPLETED').length;
  const gapsCount = facilityReferrals.filter((r) => r.hasGapAlert || r.status === 'GAP_DETECTED' || r.status === 'CANCELLED').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Facility Referral Pipeline"
        subtitle={`All care referrals assigned to ${facility.name} across the closed-loop care continuum`}
        breadcrumbs={[
          { label: 'Facility Portal', href: '/facility' },
          { label: 'Referrals' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchReferrals} 
              disabled={loading}
              leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
            >
              Refresh
            </Button>
            <Link to="/facility/incoming">
              <Button variant="primary" size="sm" leftIcon={<CalendarDays className="w-3.5 h-3.5" />}>
                Process Incoming Triage ({pendingCount})
              </Button>
            </Link>
          </div>
        }
      />

      {/* Scope Privacy Disclaimer */}
      <div className="p-3 bg-slate-50 border border-gov-border rounded-gov text-xs text-slate-600 flex items-center justify-between">
        <span>
          <strong>Facility Access Scope:</strong> Access is strictly scoped to this facility's referrals ({facility.name}) via CareLoop Backend API.
        </span>
        <span className="text-[11px] font-semibold text-slate-500">
          Total Assigned Referrals: {facilityReferrals.length}
        </span>
      </div>

      {/* API Error Notification */}
      {apiError && (
        <div className="p-3 bg-red-50 border border-red-300 rounded-gov text-xs text-red-900 flex items-center gap-2 shadow-gov-sm animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-red-700 shrink-0" />
          <span>{apiError}</span>
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
              <TabsTrigger active={filterTab === 'ALL'} onClick={() => setFilterTab('ALL')}>
                All ({facilityReferrals.length})
              </TabsTrigger>
              <TabsTrigger active={filterTab === 'PENDING'} onClick={() => setFilterTab('PENDING')}>
                Pending Triage ({pendingCount})
              </TabsTrigger>
              <TabsTrigger active={filterTab === 'CONFIRMED'} onClick={() => setFilterTab('CONFIRMED')}>
                Confirmed
              </TabsTrigger>
              <TabsTrigger active={filterTab === 'IN_PROGRESS'} onClick={() => setFilterTab('IN_PROGRESS')}>
                In Progress ({inProgressCount})
              </TabsTrigger>
              <TabsTrigger active={filterTab === 'COMPLETED'} onClick={() => setFilterTab('COMPLETED')}>
                Completed ({completedCount})
              </TabsTrigger>
              <TabsTrigger active={filterTab === 'GAPS'} onClick={() => setFilterTab('GAPS')}>
                Exceptions / Gaps ({gapsCount})
              </TabsTrigger>
              <TabsTrigger active={filterTab === 'EMERGENCY'} onClick={() => setFilterTab('EMERGENCY')}>
                Emergency
              </TabsTrigger>
            </TabsList>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {filteredReferrals.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={<FileText className="w-10 h-10 text-slate-400" />}
                title="No Referrals Found"
                description={
                  searchTerm
                    ? `No referrals matched your search for "${searchTerm}".`
                    : 'No referrals currently match the selected continuum filter tab.'
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
                  <TableHead>Required Service</TableHead>
                  <TableHead>Referring Worker</TableHead>
                  <TableHead>Appointment Slot</TableHead>
                  <TableHead>Continuum Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReferrals.map((ref) => {
                  const isEmerg = ref.referralType === 'EMERGENCY';

                  return (
                    <TableRow key={ref.id} className={isEmerg ? 'bg-red-50/20' : undefined}>
                      <TableCell className="font-mono text-[11px] font-bold">
                        <Link
                          to={`/facility/referrals/${ref.id}`}
                          className="text-gov-green-900 hover:underline"
                        >
                          {ref.referralNumber}
                        </Link>
                      </TableCell>

                      <TableCell>
                        <div className="font-bold text-gov-text-primary text-xs">
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
                        <div className="text-[11px] text-slate-500 line-clamp-1 max-w-[200px]" title={ref.chiefComplaint}>
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
                        {ref.slot.status === 'CONFIRMED' ? (
                          <div>
                            <div className="font-bold text-emerald-800">
                              {ref.slot.confirmedDate || ref.slot.requestedDate}
                            </div>
                            <span className="text-[10px] text-emerald-700 font-semibold block">
                              Confirmed ({ref.slot.confirmedTimeWindow || ref.slot.requestedTimeWindow})
                            </span>
                          </div>
                        ) : ref.slot.status === 'ALTERNATIVE_PROPOSED' ? (
                          <div>
                            <div className="font-semibold text-amber-900">
                              {ref.slot.counterProposedSlot}
                            </div>
                            <span className="text-[10px] text-amber-800 font-semibold block">
                              Alt. Proposed
                            </span>
                          </div>
                        ) : (
                          <div>
                            <div className="font-medium text-slate-700">
                              {ref.slot.requestedDate}
                            </div>
                            <span className="text-[10px] text-blue-700 font-semibold block">
                              Requested ({ref.slot.requestedTimeWindow})
                            </span>
                          </div>
                        )}
                      </TableCell>

                      <TableCell>
                        <StatusBadge status={ref.status} size="sm" />
                      </TableCell>

                      <TableCell className="text-right">
                        <Link to={`/facility/referrals/${ref.id}`}>
                          <Button variant="outline" size="sm" leftIcon={<Eye className="w-3.5 h-3.5" />}>
                            View Detail
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
