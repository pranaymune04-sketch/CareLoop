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
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell,
  StatusBadge 
} from '@/components/ui';
import { DemoAdminBanner } from './DemoAdminBanner';
import { Referral, Facility, Patient } from '@/types';
import { careLoopApi, ApiError } from '@/api/client';
import { 
  Users, 
  FileText, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Building2, 
  RotateCcw, 
  Flame,
  ArrowRight,
  TrendingUp,
  ArrowUpRight,
  AlertCircle,
  Loader2,
  RefreshCw
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setApiError(null);
      const [refData, facData, patData] = await Promise.all([
        careLoopApi.getReferrals(),
        careLoopApi.getFacilities(),
        careLoopApi.getPatients().catch(() => []),
      ]);
      setReferrals(refData);
      setFacilities(facData);
      setPatients(patData);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to fetch admin command center telemetry.';
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Deterministic metrics computed directly from API data
  const totalPatientsCount = patients.length;
  const totalReferralsCount = referrals.length;
  const activeReferrals = referrals.filter(
    (r) => r.status !== 'COMPLETED' && r.status !== 'CANCELLED'
  );
  const activeReferralsCount = activeReferrals.length;
  const emergencyReferrals = referrals.filter((r) => r.referralType === 'EMERGENCY');
  const emergencyReferralsCount = emergencyReferrals.length;
  const gapDetectedReferrals = referrals.filter((r) => r.status === 'GAP_DETECTED' || r.hasGapAlert);
  const gapDetectedCount = gapDetectedReferrals.length;
  const recoveryReferrals = referrals.filter(
    (r) => r.status === 'RECOVERED' || r.events.some((e) => e.stage === 'RECOVERED')
  );
  const recoveryCount = recoveryReferrals.length;
  const completedReferrals = referrals.filter((r) => r.status === 'COMPLETED');
  const completedReferralsCount = completedReferrals.length;
  const networkFacilitiesCount = facilities.length;

  if (loading && referrals.length === 0) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto py-12 text-center">
        <Loader2 className="w-8 h-8 text-gov-green-700 animate-spin mx-auto" />
        <p className="text-xs text-slate-500">Loading district administration telemetry from backend API...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="District Health Command Center"
        subtitle="Pune District Administration • Closed-Loop Referral Governance & Operational Telemetry"
        breadcrumbs={[
          { label: 'Admin Portal', href: '/admin' },
          { label: 'Command Center' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchDashboardData}
              disabled={loading}
              className="gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Link to="/admin/network">
              <Button variant="secondary" size="sm" className="gap-1.5">
                <Activity className="w-4 h-4 text-gov-green-700" />
                Network Funnel
              </Button>
            </Link>
            <Link to="/admin/gaps">
              <Button variant="emergency" size="sm" className="gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                Gap Radar ({gapDetectedReferrals.length})
              </Button>
            </Link>
          </div>
        }
      />

      {/* Mandatory Demo Disclosures & Banner */}
      <DemoAdminBanner 
        title="District Health Administration Dashboard" 
        badgeText="Backend API Scoped Telemetry" 
        variant="dashboard" 
      />

      {/* API Error Notification */}
      {apiError && (
        <div className="p-3.5 bg-red-50 border border-red-300 rounded-gov text-xs text-red-900 flex items-center justify-between shadow-gov-sm animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-700 shrink-0" />
            <span>{apiError}</span>
          </div>
          <Button variant="outline" size="sm" onClick={fetchDashboardData}>
            Retry
          </Button>
        </div>
      )}

      {/* 8 Primary District KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* 1. Total Patients */}
        <div className="p-4 bg-white rounded-gov border border-gov-border shadow-gov-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
              Total Registered Patients
            </span>
            <span className="p-1.5 rounded-full bg-blue-50 text-blue-700">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-gov-text-primary mt-1">
            {totalPatientsCount.toLocaleString()}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-500">
            <span>District registry records</span>
          </div>
        </div>

        {/* 2. Total Referrals */}
        <div className="p-4 bg-white rounded-gov border border-gov-border shadow-gov-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
              Total Referrals
            </span>
            <span className="p-1.5 rounded-full bg-slate-100 text-slate-700">
              <FileText className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-gov-text-primary mt-1">
            {totalReferralsCount.toLocaleString()}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-emerald-700 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Authoritative continuum records</span>
          </div>
        </div>

        {/* 3. Active Referrals */}
        <div className="p-4 bg-white rounded-gov border border-gov-border shadow-gov-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
              Active Referrals In Pipeline
            </span>
            <span className="p-1.5 rounded-full bg-indigo-50 text-indigo-700">
              <Activity className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-indigo-900 mt-1">
            {activeReferralsCount.toLocaleString()}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-500">
            <span>In transit, slot triage, or consultation</span>
          </div>
        </div>

        {/* 4. Emergency Referrals */}
        <div className="p-4 bg-white rounded-gov border border-red-200 shadow-gov-sm bg-gradient-to-br from-white to-red-50/40">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-red-700 uppercase tracking-wide">
              Emergency Dispatches
            </span>
            <span className="p-1.5 rounded-full bg-red-100 text-red-700">
              <Flame className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-red-700 mt-1">
            {emergencyReferralsCount}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-red-800 font-medium">
            <span>Critical emergency continuum cases</span>
          </div>
        </div>

        {/* 5. Gap Detected Cases */}
        <div className="p-4 bg-white rounded-gov border border-amber-200 shadow-gov-sm bg-gradient-to-br from-white to-amber-50/40">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wide">
              Gap Detected Cases
            </span>
            <span className="p-1.5 rounded-full bg-amber-100 text-amber-800">
              <AlertTriangle className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-amber-800 mt-1">
            {gapDetectedCount}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-amber-900 font-medium">
            <span>Active continuum exceptions flagged</span>
          </div>
        </div>

        {/* 6. Recovery Cases */}
        <div className="p-4 bg-white rounded-gov border border-gov-border shadow-gov-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
              Recovered & Re-routed
            </span>
            <span className="p-1.5 rounded-full bg-teal-50 text-teal-700">
              <RotateCcw className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-teal-800 mt-1">
            {recoveryCount}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-teal-700 font-medium">
            <span>Care Recovery Radar interventions</span>
          </div>
        </div>

        {/* 7. Completed Referrals */}
        <div className="p-4 bg-white rounded-gov border border-gov-border shadow-gov-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
              Completed Referrals
            </span>
            <span className="p-1.5 rounded-full bg-emerald-50 text-gov-green-800">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-gov-green-800 mt-1">
            {completedReferralsCount.toLocaleString()}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-gov-green-800 font-medium">
            <span>Success = Care Completed</span>
          </div>
        </div>

        {/* 8. Network Facilities */}
        <div className="p-4 bg-white rounded-gov border border-gov-border shadow-gov-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
              Network Facilities
            </span>
            <span className="p-1.5 rounded-full bg-purple-50 text-purple-700">
              <Building2 className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-purple-900 mt-1">
            {networkFacilitiesCount}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-500">
            <span>CHCs, SDHs, &amp; Civil Hospital</span>
          </div>
        </div>
      </div>

      {/* Quick Navigation Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        <Link
          to="/admin/network"
          className="p-4 bg-white rounded-gov border border-gov-border hover:border-gov-green-300 hover:shadow-gov-md transition-all group flex items-start justify-between"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-gov-green-800" />
              <h2 className="text-sm font-bold text-gov-text-primary group-hover:text-gov-green-900">
                Network Funnel Overview
              </h2>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Track conversion stages from REFERRED to COMPLETED across district nodes.
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-gov-green-800 group-hover:translate-x-0.5 transition-all mt-1" />
        </Link>

        <Link
          to="/admin/gaps"
          className="p-4 bg-white rounded-gov border border-amber-200/80 hover:border-amber-400 hover:shadow-gov-md transition-all group flex items-start justify-between"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-700" />
              <h2 className="text-sm font-bold text-amber-950 group-hover:text-amber-900">
                Continuum Gap Radar
              </h2>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Investigate missed appointments, capacity refusals, and ASHA field interventions.
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-800 group-hover:translate-x-0.5 transition-all mt-1" />
        </Link>

        <Link
          to="/admin/facilities"
          className="p-4 bg-white rounded-gov border border-gov-border hover:border-gov-green-300 hover:shadow-gov-md transition-all group flex items-start justify-between"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-purple-700" />
              <h2 className="text-sm font-bold text-gov-text-primary group-hover:text-purple-950">
                Facility Performance Index
              </h2>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Real-time bed utilization, incoming load, ICU readiness, and recovery velocity.
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-800 group-hover:translate-x-0.5 transition-all mt-1" />
        </Link>
      </div>

      {/* Active Gap Alerts & Recent Referrals */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Priority Continuum Exception Radar</CardTitle>
            <CardDescription>
              Operational gaps requiring administrative visibility and field recovery monitoring
            </CardDescription>
          </div>
          <Link to="/admin/gaps">
            <Button variant="ghost" size="sm" className="text-xs gap-1">
              View All Gaps <ArrowUpRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Referral #</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Origin / ASHA</TableHead>
                <TableHead>Target Facility</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Operational Gap / Notes</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {gapDetectedReferrals.slice(0, 4).map((ref) => (
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
                    <div className="text-[11px] text-slate-500">
                      {ref.patientAge}y • {ref.patientGender}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs font-medium text-slate-700">
                      {ref.referringWorkerName}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {ref.village}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs font-medium text-gov-text-primary">
                      {ref.targetFacilityName}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-slate-700">{ref.targetDepartment}</span>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={ref.status} size="sm" />
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-red-700 font-medium">
                      {ref.gapReason || 'Operational gap detected in transit/slot'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link to={`/admin/referrals/${ref.id}`}>
                      <Button variant="ghost" size="sm" className="text-xs py-1 h-7">
                        Inspect
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Network Facilities Summary Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>District Health Facilities Status</CardTitle>
            <CardDescription>
              Hospital bed availability and emergency specialty readiness across administrative blocks
            </CardDescription>
          </div>
          <Link to="/admin/facilities">
            <Button variant="ghost" size="sm" className="text-xs gap-1">
              Complete Performance Table <ArrowUpRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Facility Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Block</TableHead>
                <TableHead>Available Beds</TableHead>
                <TableHead>ICU Beds</TableHead>
                <TableHead>Emergency</TableHead>
                <TableHead>Active Load</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {facilities.slice(0, 5).map((fac) => {
                const incomingCount = referrals.filter(
                  (r) => r.targetFacilityId === fac.id && r.status !== 'COMPLETED'
                ).length;
                return (
                  <TableRow key={fac.id}>
                    <TableCell className="font-semibold text-gov-text-primary text-xs">
                      {fac.name}
                    </TableCell>
                    <TableCell className="text-xs">{fac.type}</TableCell>
                    <TableCell className="text-xs">{fac.block}</TableCell>
                    <TableCell className="text-xs">
                      <span className="font-bold text-gov-green-800">{fac.availableBeds}</span> / {fac.totalBeds}
                    </TableCell>
                    <TableCell className="text-xs font-semibold text-purple-800">
                      {fac.icuBedsAvailable}
                    </TableCell>
                    <TableCell>
                      {fac.emergencyAvailable24x7 ? (
                        <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          24x7 Ready
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          Daytime Only
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs font-medium text-slate-700">
                      {incomingCount} active referrals
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
