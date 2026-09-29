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
  Button 
} from '@/components/ui';
import { DemoAdminBanner } from './DemoAdminBanner';
import { careLoopApi, ApiError } from '@/api/client';
import { Referral, Facility } from '@/types';
import { Activity, CheckCircle2, RotateCcw, Loader2, AlertCircle, RefreshCw } from 'lucide-react';

export const AdminOverview: React.FC = () => {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

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
      const msg = err instanceof ApiError ? err.message : 'Failed to fetch continuum monitoring telemetry.';
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Compute block metrics deterministically from API records
  const { blockData, totalReferrals, meanCompletionRate, fieldRecoveryRate, uniqueBlocksCount } = useMemo(() => {
    // Map facility ID to block name
    const facilityBlockMap = new Map<string, string>();
    const allBlocks = new Set<string>();

    facilities.forEach((f) => {
      facilityBlockMap.set(f.id, f.block);
      allBlocks.add(f.block);
    });

    const blockMetricsMap = new Map<
      string,
      { total: number; completed: number; gaps: number; recovered: number }
    >();

    allBlocks.forEach((block) => {
      blockMetricsMap.set(block, { total: 0, completed: 0, gaps: 0, recovered: 0 });
    });

    referrals.forEach((r) => {
      const block = facilityBlockMap.get(r.targetFacilityId) || 'Other';
      if (!blockMetricsMap.has(block)) {
        blockMetricsMap.set(block, { total: 0, completed: 0, gaps: 0, recovered: 0 });
      }
      const entry = blockMetricsMap.get(block)!;
      entry.total += 1;
      if (r.status === 'COMPLETED') {
        entry.completed += 1;
      }
      const isGap = r.status === 'GAP_DETECTED' || r.hasGapAlert;
      if (isGap) {
        entry.gaps += 1;
      }
      const isRecovered =
        r.status === 'RECOVERED' ||
        r.events.some((e) => e.stage === 'RECOVERED') ||
        (isGap && (r.status === 'COMPLETED' || r.status === 'IN_CONSULTATION' || r.status === 'ARRIVED'));
      if (isRecovered) {
        entry.recovered += 1;
      }
    });

    const rows = Array.from(blockMetricsMap.entries()).map(([block, m]) => {
      const recoveryRate = m.gaps > 0 ? `${Math.round((m.recovered / m.gaps) * 100)}%` : '100%';
      return {
        block,
        total: m.total,
        completed: m.completed,
        gaps: m.gaps,
        recoveryRate,
      };
    });

    const total = referrals.length;
    const completedTotal = referrals.filter((r) => r.status === 'COMPLETED').length;
    const meanComp = total > 0 ? `${Math.round((completedTotal / total) * 100)}%` : '0%';
    const totalGaps = referrals.filter((r) => r.status === 'GAP_DETECTED' || r.hasGapAlert).length;
    const totalRecovered = referrals.filter(
      (r) =>
        r.status === 'RECOVERED' ||
        r.events.some((e) => e.stage === 'RECOVERED') ||
        ((r.status === 'GAP_DETECTED' || r.hasGapAlert) &&
          (r.status === 'COMPLETED' || r.status === 'IN_CONSULTATION' || r.status === 'ARRIVED'))
    ).length;
    const recoveryTotal = totalGaps > 0 ? `${Math.round((totalRecovered / totalGaps) * 100)}%` : '100%';

    return {
      blockData: rows,
      totalReferrals: total,
      meanCompletionRate: meanComp,
      fieldRecoveryRate: recoveryTotal,
      uniqueBlocksCount: allBlocks.size,
    };
  }, [facilities, referrals]);

  if (loading && referrals.length === 0 && facilities.length === 0) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto py-12 text-center">
        <Loader2 className="w-8 h-8 text-gov-green-700 animate-spin mx-auto" />
        <p className="text-xs text-slate-500">Loading continuum telemetry from backend API...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Continuum Monitoring & Block Performance"
        subtitle="Tracking referral drop-off rates and field worker recovery speed across administrative blocks"
        breadcrumbs={[
          { label: 'Admin Portal', href: '/admin' },
          { label: 'Continuum Monitoring' },
        ]}
        actions={
          <div className="flex items-center gap-2">
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
            <Link to="/admin/network">
              <Button variant="secondary" size="sm" className="gap-1.5">
                <Activity className="w-4 h-4 text-gov-green-700" />
                Full Network Funnel
              </Button>
            </Link>
          </div>
        }
      />

      {/* Mandatory Demo Disclosures */}
      <DemoAdminBanner 
        title="District Administration View — Block Monitoring" 
        badgeText="Authoritative API Telemetry" 
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        <div className="p-4 bg-white rounded-gov border border-gov-border shadow-gov-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase">Total Block Referrals</span>
            <Activity className="w-4 h-4 text-blue-700" />
          </div>
          <div className="text-2xl font-bold text-gov-text-primary">{totalReferrals.toLocaleString()}</div>
          <span className="text-[11px] text-slate-500">Across {uniqueBlocksCount} rural blocks</span>
        </div>

        <div className="p-4 bg-white rounded-gov border border-gov-border shadow-gov-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase">Mean Completion %</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-2xl font-bold text-gov-green-800">{meanCompletionRate}</div>
          <span className="text-[11px] text-gov-green-800 font-medium">Closed care continuum loops</span>
        </div>

        <div className="p-4 bg-white rounded-gov border border-gov-border shadow-gov-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase">Field Recovery Success</span>
            <RotateCcw className="w-4 h-4 text-teal-700" />
          </div>
          <div className="text-2xl font-bold text-teal-800">{fieldRecoveryRate}</div>
          <span className="text-[11px] text-teal-700 font-medium">ASHA/ANM salvage rate</span>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Block-wise Referral Completion &amp; Gap Recovery</CardTitle>
          <CardDescription>
            Formula: Completion % = Completed Care Events / Total Referrals Generated
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Administrative Block</TableHead>
                <TableHead>Referrals Created</TableHead>
                <TableHead>Care Completed</TableHead>
                <TableHead>Gaps Detected</TableHead>
                <TableHead>ASHA Recovery Rate</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {blockData.map((b) => (
                <TableRow key={b.block}>
                  <TableCell className="font-semibold text-gov-text-primary text-xs">
                    {b.block}
                  </TableCell>
                  <TableCell className="text-xs">{b.total}</TableCell>
                  <TableCell className="font-semibold text-emerald-800 text-xs">{b.completed}</TableCell>
                  <TableCell className="font-semibold text-red-700 text-xs">{b.gaps}</TableCell>
                  <TableCell className="font-bold text-teal-800 text-xs">{b.recoveryRate}</TableCell>
                  <TableCell className="text-right">
                    <Link to="/admin/gaps">
                      <Button variant="ghost" size="sm" className="text-xs py-1 h-7">
                        Inspect
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
              {blockData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-500 text-xs">
                    No block records available.
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

