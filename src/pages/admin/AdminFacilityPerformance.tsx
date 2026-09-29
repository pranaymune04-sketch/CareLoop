import React, { useState, useEffect, useMemo } from 'react';
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
  Button
} from '@/components/ui';
import { DemoAdminBanner } from './DemoAdminBanner';
import { careLoopApi, ApiError } from '@/api/client';
import { Facility, Referral } from '@/types';
import { 
  Search, 
  ArrowUpDown, 
  Flame,
  Loader2,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

type SortField = 'name' | 'type' | 'availableBeds' | 'icuBeds' | 'incoming' | 'completed' | 'gaps' | 'utilization';
type SortOrder = 'asc' | 'desc';

export const AdminFacilityPerformance: React.FC = () => {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [emergencyOnly, setEmergencyOnly] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState('ALL');
  const [sortField, setSortField] = useState<SortField>('utilization');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const fetchFacilityData = async () => {
    try {
      setLoading(true);
      setApiError(null);
      const [facData, refData] = await Promise.all([
        careLoopApi.getFacilities(),
        careLoopApi.getReferrals(),
      ]);
      setFacilities(facData);
      setReferrals(refData);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to fetch facility performance telemetry.';
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacilityData();
  }, []);

  // Blocks list
  const uniqueBlocks = Array.from(new Set(facilities.map((f) => f.block)));

  // Augment facilities with dynamic operational metrics directly from API data
  const augmentedFacilities = useMemo(() => {
    return facilities.map((fac) => {
      const facReferrals = referrals.filter((r) => r.targetFacilityId === fac.id);
      const dynamicIncoming = facReferrals.filter(
        (r) => r.status !== 'COMPLETED' && r.status !== 'CANCELLED'
      ).length;
      const dynamicCompleted = facReferrals.filter((r) => r.status === 'COMPLETED').length;
      const dynamicGaps = facReferrals.filter((r) => r.status === 'GAP_DETECTED' || r.hasGapAlert).length;
      const dynamicRecovered = facReferrals.filter(
        (r) =>
          r.status === 'RECOVERED' ||
          r.events.some((e) => e.stage === 'RECOVERED') ||
          ((r.status === 'GAP_DETECTED' || r.hasGapAlert) &&
            (r.status === 'COMPLETED' || r.status === 'IN_CONSULTATION' || r.status === 'ARRIVED'))
      ).length;

      const incoming = dynamicIncoming;
      const completed = dynamicCompleted;
      const gaps = dynamicGaps;
      const recoveryPct = gaps > 0 ? Math.round((dynamicRecovered / gaps) * 100) : 100;
      const utilization = fac.totalBeds > 0 ? Math.round(((fac.totalBeds - fac.availableBeds) / fac.totalBeds) * 100) : 0;

      return {
        ...fac,
        incoming,
        completed,
        gaps,
        recoveryPct,
        utilization,
      };
    });
  }, [facilities, referrals]);

  // Filter & Sort
  const filteredFacilities = useMemo(() => {
    return augmentedFacilities
      .filter((f) => {
        const matchesSearch =
          f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          f.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          f.block.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesType = selectedType === 'ALL' || f.type === selectedType;
        const matchesEmergency = !emergencyOnly || f.emergencyAvailable24x7;
        const matchesBlock = selectedBlock === 'ALL' || f.block === selectedBlock;

        return matchesSearch && matchesType && matchesEmergency && matchesBlock;
      })
      .sort((a, b) => {
        let valA: string | number = '';
        let valB: string | number = '';

        switch (sortField) {
          case 'name':
            valA = a.name.toLowerCase();
            valB = b.name.toLowerCase();
            break;
          case 'type':
            valA = a.type.toLowerCase();
            valB = b.type.toLowerCase();
            break;
          case 'availableBeds':
            valA = a.availableBeds;
            valB = b.availableBeds;
            break;
          case 'icuBeds':
            valA = a.icuBedsAvailable;
            valB = b.icuBedsAvailable;
            break;
          case 'incoming':
            valA = a.incoming;
            valB = b.incoming;
            break;
          case 'completed':
            valA = a.completed;
            valB = b.completed;
            break;
          case 'gaps':
            valA = a.gaps;
            valB = b.gaps;
            break;
          case 'utilization':
            valA = a.utilization;
            valB = b.utilization;
            break;
        }

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [augmentedFacilities, searchTerm, selectedType, emergencyOnly, selectedBlock, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  if (loading && facilities.length === 0) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto py-12 text-center">
        <Loader2 className="w-8 h-8 text-gov-green-700 animate-spin mx-auto" />
        <p className="text-xs text-slate-500">Loading facility registry and capacity telemetry from backend API...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="District Health Facility Performance Index"
        subtitle="Real-time capacity tracking, intake volume, bed utilization, and gap incident ratios across registered public facilities"
        breadcrumbs={[
          { label: 'Admin Portal', href: '/admin' },
          { label: 'Facility Performance' },
        ]}
        actions={
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchFacilityData}
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
        title="District Facility Index" 
        badgeText="Authoritative Facility Registry" 
        variant="info" 
      />

      {/* API Error Alert */}
      {apiError && (
        <div className="p-3.5 bg-red-50 border border-red-300 rounded-gov text-xs text-red-900 flex items-center justify-between shadow-gov-sm animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-700 shrink-0" />
            <span>{apiError}</span>
          </div>
          <Button variant="outline" size="sm" onClick={fetchFacilityData}>
            Retry
          </Button>
        </div>
      )}

      {/* Overview Metric Highlights */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-4 bg-white rounded-gov border border-gov-border shadow-gov-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Total Public Facilities</span>
          <div className="text-2xl font-bold text-gov-text-primary mt-1">{facilities.length}</div>
          <span className="text-[11px] text-slate-500">Across {uniqueBlocks.length} rural blocks</span>
        </div>

        <div className="p-4 bg-white rounded-gov border border-gov-border shadow-gov-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Total Operational Beds</span>
          <div className="text-2xl font-bold text-gov-green-800 mt-1">
            {facilities.reduce((sum, f) => sum + f.totalBeds, 0)}
          </div>
          <span className="text-[11px] text-gov-green-800 font-medium">
            {facilities.reduce((sum, f) => sum + f.availableBeds, 0)} currently vacant
          </span>
        </div>

        <div className="p-4 bg-white rounded-gov border border-gov-border shadow-gov-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Emergency Ready (24x7)</span>
          <div className="text-2xl font-bold text-emerald-700 mt-1">
            {facilities.filter((f) => f.emergencyAvailable24x7).length} / {facilities.length}
          </div>
          <span className="text-[11px] text-slate-500">Equipped with 108 EMS ambulance hubs</span>
        </div>

        <div className="p-4 bg-white rounded-gov border border-gov-border shadow-gov-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Avg. Network Utilization</span>
          <div className="text-2xl font-bold text-indigo-900 mt-1">
            {augmentedFacilities.length > 0
              ? Math.round(
                  augmentedFacilities.reduce((sum, f) => sum + f.utilization, 0) / augmentedFacilities.length
                )
              : 0}%
          </div>
          <span className="text-[11px] text-indigo-700 font-medium">Optimal operational band (70-85%)</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card>
        <CardContent className="p-3.5 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search facility name, HFR code, or block..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-gov border border-gov-border focus:outline-none focus:ring-1 focus:ring-gov-green-500 bg-white"
              />
            </div>

            {/* Facility Type Filter */}
            <div>
              <select
                aria-label="Filter by facility type"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full py-1.5 px-2.5 text-xs rounded-gov border border-gov-border focus:outline-none focus:ring-1 focus:ring-gov-green-500 bg-white"
              >
                <option value="ALL">All Facility Types</option>
                <option value="Primary Health Centre (PHC)">Primary Health Centre (PHC)</option>
                <option value="Community Health Centre (CHC)">Community Health Centre (CHC)</option>
                <option value="District Hospital (DH)">District Hospital (DH)</option>
                <option value="Medical College / Tertiary">Medical College / Tertiary</option>
              </select>
            </div>

            {/* Block Filter */}
            <div>
              <select
                aria-label="Filter by administrative block"
                value={selectedBlock}
                onChange={(e) => setSelectedBlock(e.target.value)}
                className="w-full py-1.5 px-2.5 text-xs rounded-gov border border-gov-border focus:outline-none focus:ring-1 focus:ring-gov-green-500 bg-white"
              >
                <option value="ALL">All Administrative Blocks</option>
                {uniqueBlocks.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            {/* Emergency Checkbox Button */}
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => setEmergencyOnly(!emergencyOnly)}
                className={`w-full py-1.5 px-3 rounded-gov text-xs font-semibold border flex items-center justify-center gap-1.5 transition-colors ${
                  emergencyOnly
                    ? 'bg-red-50 text-red-900 border-red-300'
                    : 'bg-white text-slate-700 border-gov-border hover:bg-slate-50'
                }`}
              >
                <Flame className={`w-3.5 h-3.5 ${emergencyOnly ? 'text-red-700' : 'text-slate-400'}`} />
                <span>24x7 Emergency Only</span>
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Facility Performance Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle>District Public Healthcare Facility Index</CardTitle>
            <CardDescription>
              Click column headers to sort by capacity, workload, or gap volume
            </CardDescription>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Showing {filteredFacilities.length} of {facilities.length} facilities
          </span>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="cursor-pointer select-none" onClick={() => handleSort('name')}>
                  <div className="flex items-center gap-1">
                    <span>Facility Name</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer select-none" onClick={() => handleSort('type')}>
                  <div className="flex items-center gap-1">
                    <span>Type</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer select-none" onClick={() => handleSort('availableBeds')}>
                  <div className="flex items-center gap-1">
                    <span>Avail. Beds</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer select-none" onClick={() => handleSort('icuBeds')}>
                  <div className="flex items-center gap-1">
                    <span>ICU Beds</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </TableHead>
                <TableHead>Emergency</TableHead>
                <TableHead className="cursor-pointer select-none" onClick={() => handleSort('incoming')}>
                  <div className="flex items-center gap-1">
                    <span>Incoming</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer select-none" onClick={() => handleSort('completed')}>
                  <div className="flex items-center gap-1">
                    <span>Completed</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer select-none" onClick={() => handleSort('gaps')}>
                  <div className="flex items-center gap-1">
                    <span>Gaps Flagged</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </TableHead>
                <TableHead>Recovery %</TableHead>
                <TableHead className="cursor-pointer select-none" onClick={() => handleSort('utilization')}>
                  <div className="flex items-center gap-1">
                    <span>Utilization</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFacilities.map((fac) => (
                <TableRow key={fac.id}>
                  <TableCell>
                    <div className="font-semibold text-gov-text-primary text-xs">
                      {fac.name}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      HFR: {fac.code} • {fac.block}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-slate-700">
                    {fac.type}
                  </TableCell>
                  <TableCell className="text-xs">
                    <span className="font-bold text-gov-green-800">{fac.availableBeds}</span>
                    <span className="text-slate-400"> / {fac.totalBeds}</span>
                  </TableCell>
                  <TableCell className="text-xs font-semibold text-purple-800">
                    {fac.icuBedsAvailable}
                  </TableCell>
                  <TableCell>
                    {fac.emergencyAvailable24x7 ? (
                      <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        24x7
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                        Daytime
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs font-medium text-slate-800">
                    {fac.incoming}
                  </TableCell>
                  <TableCell className="text-xs font-semibold text-gov-green-800">
                    {fac.completed}
                  </TableCell>
                  <TableCell className="text-xs font-semibold text-red-700">
                    {fac.gaps}
                  </TableCell>
                  <TableCell className="text-xs font-bold text-teal-800">
                    {fac.recoveryPct}%
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-14 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            fac.utilization > 85 ? 'bg-red-600' : fac.utilization > 70 ? 'bg-amber-500' : 'bg-gov-green-700'
                          }`}
                          style={{ width: `${Math.min(fac.utilization, 100)}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-bold text-slate-700">{fac.utilization}%</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredFacilities.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-slate-500 text-xs">
                    No facilities found matching current filters.
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
