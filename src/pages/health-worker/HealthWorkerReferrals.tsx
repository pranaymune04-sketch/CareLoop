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
import { mockHealthWorker } from '@/mock';
import { careLoopApi, ApiError } from '@/api/client';
import { Referral } from '@/types';
import { RerouteModal } from '@/components/health-worker';
import { 
  Eye, 
  FilePlus2, 
  Calendar, 
  Compass, 
  Siren 
} from 'lucide-react';

export const HealthWorkerReferrals: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'NORMAL' | 'EMERGENCY' | 'GAPS'>('ALL');
  const [selectedRerouteReferral, setSelectedRerouteReferral] = useState<Referral | null>(null);

  const [allReferrals, setAllReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReferrals = async () => {
    try {
      setLoading(true);
      const data = await careLoopApi.getReferrals();
      setAllReferrals(data);
      setError(null);
    } catch (err: unknown) {
      const msg = err instanceof ApiError ? err.message : 'Failed to retrieve referral pipeline.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferrals();
  }, []);

  const filteredReferrals = allReferrals.filter((r) => {
    const matchesSearch = 
      r.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.referralNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.targetFacilityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.targetDepartment.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (filterType === 'NORMAL') return r.referralType === 'NORMAL';
    if (filterType === 'EMERGENCY') return r.referralType === 'EMERGENCY';
    if (filterType === 'GAPS') return r.hasGapAlert || r.slot.status === 'ALTERNATIVE_PROPOSED';
    return true;
  });

  const gapCount = allReferrals.filter((r) => r.hasGapAlert || r.slot.status === 'ALTERNATIVE_PROPOSED').length;

  const handleRerouteComplete = (updated: Referral) => {
    alert(`Referral ${updated.referralNumber} successfully rerouted to ${updated.targetFacilityName}.`);
    fetchReferrals();
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-12 text-center text-sm text-gov-text-secondary">
        Loading referral pipeline from server...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-gov text-sm">
          {error}
        </div>
      )}
      <PageHeader
        title="Referral Pipeline & Care Continuum"
        subtitle={`Track patient journeys across MATCH → REFER → TRACK → DETECT → RECOVER → COMPLETE (Sub-Centre: ${mockHealthWorker.assignedSubCenter})`}
        breadcrumbs={[
          { label: 'Health Worker', href: '/health-worker' },
          { label: 'Referrals' },
        ]}
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <Link to="/health-worker/create-referral/emergency">
              <Button variant="emergency" size="sm" leftIcon={<Siren className="w-3.5 h-3.5" />}>
                Emergency Referral
              </Button>
            </Link>
            <Link to="/health-worker/create-referral">
              <Button variant="primary" size="sm" leftIcon={<FilePlus2 className="w-3.5 h-3.5" />}>
                + Create Referral
              </Button>
            </Link>
          </div>
        }
      />

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <SearchField
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search by patient, referral #, hospital or department..."
              className="max-w-md"
            />
            <TabsList>
              <TabsTrigger active={filterType === 'ALL'} onClick={() => setFilterType('ALL')}>
                All Referrals ({allReferrals.length})
              </TabsTrigger>
              <TabsTrigger active={filterType === 'NORMAL'} onClick={() => setFilterType('NORMAL')}>
                Normal
              </TabsTrigger>
              <TabsTrigger active={filterType === 'EMERGENCY'} onClick={() => setFilterType('EMERGENCY')}>
                Emergency
              </TabsTrigger>
              <TabsTrigger active={filterType === 'GAPS'} onClick={() => setFilterType('GAPS')}>
                At-Risk / Gaps ({gapCount})
              </TabsTrigger>
            </TabsList>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {filteredReferrals.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Referral #</TableHead>
                  <TableHead>Patient Details</TableHead>
                  <TableHead>Type / Priority</TableHead>
                  <TableHead>Receiving Hospital & Service</TableHead>
                  <TableHead>Appointment Slot Status</TableHead>
                  <TableHead>Continuum Stage</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReferrals.map((ref) => (
                  <TableRow key={ref.id} className={ref.hasGapAlert ? 'bg-red-50/30' : undefined}>
                    <TableCell className="font-mono text-[11px] font-bold text-slate-800">
                      {ref.referralNumber}
                      {ref.isUnregisteredEmergency && (
                        <span className="block text-[9px] text-red-700 font-bold uppercase mt-0.5">
                          Unregistered
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-gov-text-primary">{ref.patientName}</div>
                      <div className="text-[11px] text-slate-500">
                        Age {ref.patientAge} • {ref.village}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-0.5">
                        <StatusBadge type={ref.referralType} size="sm" />
                        <div>
                          <StatusBadge priority={ref.priority} size="sm" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-slate-800">{ref.targetFacilityName}</div>
                      <div className="text-[11px] text-slate-500">{ref.targetDepartment}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-slate-700 text-xs">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{ref.slot.requestedDate}</span>
                      </div>
                      <div className="text-[11px]">
                        {ref.slot.status === 'CONFIRMED' ? (
                          <span className="text-emerald-700 font-semibold">✓ Confirmed Slot</span>
                        ) : ref.slot.status === 'ALTERNATIVE_PROPOSED' ? (
                          <span className="text-amber-700 font-semibold">⚠ Counter-Proposed</span>
                        ) : (
                          <span className="text-slate-500">Requested (Awaiting)</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={ref.status} size="sm" />
                      {ref.hasGapAlert && (
                        <span className="block text-[10px] text-red-600 font-bold mt-0.5">
                          Gap Alert Active
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        {ref.hasGapAlert && (
                          <Button
                            variant="emergency"
                            size="sm"
                            leftIcon={<Compass className="w-3.5 h-3.5" />}
                            onClick={() => setSelectedRerouteReferral(ref)}
                          >
                            Reroute
                          </Button>
                        )}
                        <Link to={`/health-worker/referrals/${ref.id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            leftIcon={<Eye className="w-3.5 h-3.5" />}
                          >
                            Dossier
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-8">
              <EmptyState
                title="No Referrals Found"
                description={
                  searchTerm
                    ? `No referrals matched your search "${searchTerm}".`
                    : 'No referrals currently match this filter criteria.'
                }
                actionLabel={searchTerm ? 'Clear Search' : undefined}
                onAction={searchTerm ? () => setSearchTerm('') : undefined}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reroute Modal */}
      <RerouteModal
        referral={selectedRerouteReferral}
        isOpen={!!selectedRerouteReferral}
        onClose={() => setSelectedRerouteReferral(null)}
        onRerouteComplete={handleRerouteComplete}
      />
    </div>
  );
};
