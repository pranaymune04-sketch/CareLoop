import React from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/layout';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  Button 
} from '@/components/ui';
import { DemoAdminBanner } from './DemoAdminBanner';
import { CareLoopStore } from '@/mock';
import { 
  TrendingUp, 
  Flame, 
  Building2, 
  Stethoscope, 
  AlertTriangle,
  ArrowRight,
  Activity
} from 'lucide-react';

export const AdminReferralAnalytics: React.FC = () => {
  const referrals = CareLoopStore.getAllReferrals();

  // 1. Department Breakdown (mock district scaled)
  const departmentsData = [
    { name: 'Obstetrics & Gynaecology (Emergency ANC / C-Section)', count: 485, percentage: 34, color: 'bg-pink-600' },
    { name: 'Pediatrics & Neonatal Care (SNCU)', count: 320, percentage: 22, color: 'bg-blue-600' },
    { name: 'General Medicine & Critical NCDs', count: 260, percentage: 18, color: 'bg-emerald-600' },
    { name: 'Emergency Trauma & Orthopedics', count: 185, percentage: 13, color: 'bg-amber-600' },
    { name: 'Cardiology & Intensive Care', count: 110, percentage: 8, color: 'bg-purple-600' },
    { name: 'General Surgery & Diagnostics', count: 70, percentage: 5, color: 'bg-slate-600' },
  ];

  // 2. Facility Distribution
  const facilityData = [
    { name: 'Pune District Civil Hospital (Aundh)', count: 520, percentage: 36, type: 'Tertiary / DH' },
    { name: 'Bhor Community Health Centre & Sub-District Hospital', count: 380, percentage: 27, type: 'CHC / SDH' },
    { name: 'Saswad Sub-District Hospital', count: 290, percentage: 20, type: 'Sub-District Hospital' },
    { name: 'Kapurhol 24x7 Primary Health Centre', count: 140, percentage: 10, type: 'PHC' },
    { name: 'Shindewadi Primary Health Centre', count: 100, percentage: 7, type: 'PHC' },
  ];

  // 3. Status Breakdown
  const statusData = [
    { status: 'COMPLETED', label: 'Completed Care Events', count: 945, percentage: 66, color: 'bg-emerald-600' },
    { status: 'CONFIRMED', label: 'Slot Confirmed (Upcoming)', count: 185, percentage: 13, color: 'bg-indigo-600' },
    { status: 'REFERRED', label: 'Slot Requested / Pending', count: 110, percentage: 8, color: 'bg-blue-600' },
    { status: 'GAP_DETECTED', label: 'Active Continuum Gaps', count: 85, percentage: 6, color: 'bg-red-600' },
    { status: 'RECOVERED', label: 'Recovered & Re-routed', count: 65, percentage: 5, color: 'bg-teal-600' },
    { status: 'IN_CONSULTATION', label: 'Currently in Hospital OPD', count: 40, percentage: 3, color: 'bg-amber-600' },
  ];

  // 4. Emergency vs Normal
  const totalVolume = 1430;
  const emergencyCount = 285; // ~20%
  const normalCount = 1145; // ~80%
  const emergencyPct = Math.round((emergencyCount / totalVolume) * 100);
  const normalPct = 100 - emergencyPct;

  // 5. Gap Cases by Operational Reason
  const gapReasonsData = [
    { reason: 'Patient No-Show within Scheduled Slot Window', count: 62, percentage: 46 },
    { reason: 'Facility Specialist / OPD Ward at Max Capacity', count: 34, percentage: 25 },
    { reason: 'Patient Transportation / Ambulance Delay', count: 24, percentage: 18 },
    { reason: 'Facility Equipment Downtime (USG/X-Ray)', count: 15, percentage: 11 },
  ];

  // 6. Monthly Referral Volume Trend (Last 6 Months)
  const monthlyData = [
    { month: 'Apr', total: 195, completed: 140 },
    { month: 'May', total: 220, completed: 165 },
    { month: 'Jun', total: 245, completed: 190 },
    { month: 'Jul', total: 280, completed: 215 },
    { month: 'Aug', total: 310, completed: 250 },
    { month: 'Sep', total: 345, completed: 285 },
  ];
  const maxMonthly = Math.max(...monthlyData.map((m) => m.total));

  return (
    <div className="space-y-6">
      <PageHeader
        title="District Referral Analytics & Specialty Telemetry"
        subtitle="Distribution across clinical departments, receiving health centers, urgency categories, and historical monthly volumes"
        breadcrumbs={[
          { label: 'Admin Portal', href: '/admin' },
          { label: 'Referral Analytics' },
        ]}
        actions={
          <Link to="/admin/network">
            <Button variant="secondary" size="sm" className="gap-1.5">
              <TrendingUp className="w-4 h-4 text-gov-green-700" />
              Funnel Overview
            </Button>
          </Link>
        }
      />

      <DemoAdminBanner 
        title="Demo Administration View — Analytics Engine" 
        badgeText="Statistical Models" 
        variant="info" 
      />

      {/* Top Level Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 bg-white rounded-gov border border-gov-border shadow-gov-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Aggregated Annual Volume</span>
          <div className="text-2xl font-bold text-gov-text-primary mt-1">
            {(totalVolume + referrals.length).toLocaleString()}
          </div>
          <span className="text-[11px] text-emerald-700 font-medium">+18.5% YoY growth</span>
        </div>

        <div className="p-4 bg-white rounded-gov border border-gov-border shadow-gov-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Top Specialty Load</span>
          <div className="text-2xl font-bold text-pink-700 mt-1">Obstetrics (34%)</div>
          <span className="text-[11px] text-slate-500">Maternal & Child Health focus</span>
        </div>

        <div className="p-4 bg-white rounded-gov border border-gov-border shadow-gov-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Emergency Share</span>
          <div className="text-2xl font-bold text-red-700 mt-1">{emergencyPct}%</div>
          <span className="text-[11px] text-red-800 font-medium">{emergencyCount} emergency dispatches</span>
        </div>

        <div className="p-4 bg-white rounded-gov border border-gov-border shadow-gov-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Mean Resolution Velocity</span>
          <div className="text-2xl font-bold text-gov-green-800 mt-1">1.6 Days</div>
          <span className="text-[11px] text-gov-green-800 font-medium">Creation to clinical arrival</span>
        </div>
      </div>

      {/* Monthly Volume Trend Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Monthly Referral Volume & Closed Loops (Last 6 Months)</CardTitle>
              <CardDescription>
                Comparison of generated referrals (grey) versus completed care episodes (green)
              </CardDescription>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-slate-300 inline-block" />
                <span className="text-slate-600">Total Generated</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-gov-green-700 inline-block" />
                <span className="text-gov-green-900 font-bold">Closed Loop</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-56 flex items-end justify-between gap-3 pt-6 px-2 border-b border-slate-200">
            {monthlyData.map((item) => {
              const totalHeight = Math.round((item.total / maxMonthly) * 100);
              const completedHeight = Math.round((item.completed / maxMonthly) * 100);

              return (
                <div key={item.month} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <div className="w-full max-w-[54px] flex items-end justify-center gap-1.5 h-full">
                    {/* Total Bar */}
                    <div
                      className="w-1/2 bg-slate-200 rounded-t group-hover:bg-slate-300 transition-all relative flex justify-center"
                      style={{ height: `${totalHeight}%` }}
                    >
                      <span className="absolute -top-5 text-[10px] text-slate-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.total}
                      </span>
                    </div>

                    {/* Completed Bar */}
                    <div
                      className="w-1/2 bg-gov-green-700 rounded-t group-hover:bg-gov-green-800 transition-all relative flex justify-center"
                      style={{ height: `${completedHeight}%` }}
                    >
                      <span className="absolute -top-5 text-[10px] text-gov-green-900 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.completed}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-slate-700">{item.month}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Referrals by Department */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-gov-green-800" />
              <CardTitle>Referrals by Clinical Specialty</CardTitle>
            </div>
            <CardDescription>
              Volume share across secondary &amp; tertiary departments
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {departmentsData.map((dept) => (
              <div key={dept.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800 truncate pr-2">{dept.name}</span>
                  <span className="font-bold text-slate-700 shrink-0">
                    {dept.count} <span className="text-slate-400 font-normal">({dept.percentage}%)</span>
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${dept.color}`}
                    style={{ width: `${dept.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Referrals by Status */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-700" />
              <CardTitle>Referrals by Lifecycle Status</CardTitle>
            </div>
            <CardDescription>
              Current distribution across active and resolved stages
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {statusData.map((st) => (
              <div key={st.status} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800">{st.label}</span>
                    <span className="text-[10px] text-slate-400 font-mono">({st.status})</span>
                  </div>
                  <span className="font-bold text-slate-700 shrink-0">
                    {st.count} <span className="text-slate-400 font-normal">({st.percentage}%)</span>
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${st.color}`}
                    style={{ width: `${st.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Emergency vs Normal Ratio */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-red-600" />
              <CardTitle>Emergency vs Standard Normal Referrals</CardTitle>
            </div>
            <CardDescription>
              Triage priority distribution and protocol compliance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Visual ratio bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-gov-green-900 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-gov-green-700" />
                  Standard / Routine: {normalPct}% ({normalCount})
                </span>
                <span className="text-red-700 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
                  Emergency: {emergencyPct}% ({emergencyCount})
                </span>
              </div>
              <div className="w-full h-4 rounded-full overflow-hidden flex shadow-inner">
                <div className="bg-gov-green-700 h-full" style={{ width: `${normalPct}%` }} />
                <div className="bg-red-600 h-full" style={{ width: `${emergencyPct}%` }} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 bg-slate-50 border border-gov-border rounded-gov">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Standard Pathway</span>
                <div className="text-sm font-bold text-slate-800 mt-1">Slot Scheduled</div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Pre-booked 24-48h appointment window with specialist confirmation.
                </p>
              </div>

              <div className="p-3 bg-red-50/70 border border-red-200 rounded-gov">
                <span className="text-[10px] font-bold text-red-700 uppercase">Emergency Pathway</span>
                <div className="text-sm font-bold text-red-900 mt-1">Direct Dispatch</div>
                <p className="text-[11px] text-red-800 mt-0.5">
                  108 EMS integrated, bypasses normal OPD triage, alerts Emergency Team.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Referrals by Facility */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-purple-700" />
              <CardTitle>Referrals by Receiving Facility</CardTitle>
            </div>
            <CardDescription>
              Workload distribution across secondary and district health centers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {facilityData.map((fac) => (
              <div key={fac.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-slate-800">{fac.name}</span>
                    <span className="text-[10px] text-slate-400 block">{fac.type}</span>
                  </div>
                  <span className="font-bold text-slate-700 shrink-0">
                    {fac.count} cases <span className="text-slate-400 font-normal">({fac.percentage}%)</span>
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-purple-700"
                    style={{ width: `${fac.percentage * 2.5}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Gap Cases by Operational Reason */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-700" />
              <CardTitle>Continuum Gaps by Operational Root Cause</CardTitle>
            </div>
            <CardDescription>
              Categorized logistical breakdowns detected across the district
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {gapReasonsData.map((item) => (
              <div key={item.reason} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800 truncate pr-2">{item.reason}</span>
                  <span className="font-bold text-amber-800 shrink-0">
                    {item.count} cases <span className="text-slate-400 font-normal">({item.percentage}%)</span>
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-amber-600"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}

            <div className="pt-2">
              <Link to="/admin/gaps">
                <Button variant="ghost" size="sm" className="w-full text-xs gap-1 border">
                  Open Gap Monitoring Center <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
