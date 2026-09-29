import React from 'react';
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
  TableCell 
} from '@/components/ui';
import { DemoAdminBanner } from './DemoAdminBanner';
import { CareLoopStore } from '@/mock';
import { 
  ArrowDown, 
  CheckCircle2, 
  AlertTriangle, 
  RotateCcw, 
  Clock, 
  Share2
} from 'lucide-react';

export const AdminNetworkDashboard: React.FC = () => {
  const referrals = CareLoopStore.getAllReferrals();

  // Aggregate mock calculations
  const totalReferrals = 1420 + referrals.length;
  const stageReferred = 1420 + referrals.length;
  const stageConfirmed = 1240;
  const stageArrived = 1090;
  const stageInConsultation = 1015;
  const stageCompleted = 945;

  const gapCount = 135;
  const recoveredCount = 112;
  const gapDetectionRate = ((gapCount / totalReferrals) * 100).toFixed(1);
  const completionRate = ((stageCompleted / totalReferrals) * 100).toFixed(1);
  const recoverySuccessRate = ((recoveredCount / gapCount) * 100).toFixed(1);
  const avgCompletionTime = '38.4 hours';

  // Funnel steps data
  const funnelSteps = [
    {
      stage: 'REFERRED',
      title: 'Referral Initiated & Slot Requested',
      description: 'Field ASHA or PHC MO creates referral and submits requested appointment window.',
      count: stageReferred,
      percentage: '100%',
      dropoff: '12.7% pending/cancelled',
      color: 'bg-blue-600',
      lightColor: 'bg-blue-50 border-blue-200 text-blue-900',
    },
    {
      stage: 'CONFIRMED',
      title: 'Facility Slot Confirmed',
      description: 'Receiving CHC/District Hospital accepts slot or confirms alternative appointment.',
      count: stageConfirmed,
      percentage: `${((stageConfirmed / stageReferred) * 100).toFixed(0)}%`,
      dropoff: '12.1% no-show / transport delay',
      color: 'bg-indigo-600',
      lightColor: 'bg-indigo-50 border-indigo-200 text-indigo-900',
    },
    {
      stage: 'ARRIVED',
      title: 'Patient Checked In at Hospital',
      description: 'Patient check-in recorded by Hospital Registration desk / Helpdesk.',
      count: stageArrived,
      percentage: `${((stageArrived / stageReferred) * 100).toFixed(0)}%`,
      dropoff: '6.8% OPD triage queue wait',
      color: 'bg-amber-600',
      lightColor: 'bg-amber-50 border-amber-200 text-amber-900',
    },
    {
      stage: 'IN_CONSULTATION',
      title: 'Clinical Consultation Commenced',
      description: 'Specialist doctor commences clinical examination and treatment.',
      count: stageInConsultation,
      percentage: `${((stageInConsultation / stageReferred) * 100).toFixed(0)}%`,
      dropoff: '6.9% pending lab tests / discharge',
      color: 'bg-teal-600',
      lightColor: 'bg-teal-50 border-teal-200 text-teal-900',
    },
    {
      stage: 'COMPLETED',
      title: 'Continuum Loop Closed & Discharged',
      description: 'Discharge summary recorded, feedback logged, follow-up notified to field worker.',
      count: stageCompleted,
      percentage: `${((stageCompleted / stageReferred) * 100).toFixed(0)}%`,
      dropoff: 'Loop successfully closed',
      color: 'bg-emerald-600',
      lightColor: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    },
  ];

  // Block performance mock table
  const blockPerformance = [
    { block: 'Haveli Block', initiated: 420, confirmed: 380, completed: 310, gaps: 34, recoveryRate: '88.2%' },
    { block: 'Bhor Block', initiated: 315, confirmed: 275, completed: 220, gaps: 28, recoveryRate: '85.7%' },
    { block: 'Purandar Block', initiated: 280, confirmed: 240, completed: 185, gaps: 31, recoveryRate: '77.4%' },
    { block: 'Baramati Block', initiated: 260, confirmed: 225, completed: 170, gaps: 22, recoveryRate: '90.9%' },
    { block: 'Shirur Block', initiated: 145, confirmed: 120, completed: 60, gaps: 20, recoveryRate: '75.0%' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Network Continuum & Referral Funnel"
        subtitle="End-to-end telemetry across all stages: Match → Refer → Slot → Transit → Arrival → Consultation → Closure"
        breadcrumbs={[
          { label: 'Admin Portal', href: '/admin' },
          { label: 'Network Overview' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Link to="/admin/referrals">
              <Button variant="secondary" size="sm" className="gap-1.5">
                <Share2 className="w-4 h-4" />
                Specialty Analytics
              </Button>
            </Link>
            <Link to="/admin/gaps">
              <Button variant="emergency" size="sm" className="gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                Gap Monitoring
              </Button>
            </Link>
          </div>
        }
      />

      <DemoAdminBanner 
        title="Demo Administration View — Network Telemetry" 
        badgeText="Operational Telemetry" 
        variant="info" 
      />

      {/* 4 Key Funnel KPI Indicators */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-4 bg-white rounded-gov border border-gov-border shadow-gov-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase">Referral Completion Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-2xl font-bold text-gov-green-800">{completionRate}%</div>
          <span className="text-[11px] text-slate-500">Target benchmark: &gt;75%</span>
        </div>

        <div className="p-4 bg-white rounded-gov border border-gov-border shadow-gov-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase">Gap Detection Rate</span>
            <AlertTriangle className="w-4 h-4 text-amber-700" />
          </div>
          <div className="text-2xl font-bold text-amber-800">{gapDetectionRate}%</div>
          <span className="text-[11px] text-amber-900 font-medium">{gapCount} total open/past gaps</span>
        </div>

        <div className="p-4 bg-white rounded-gov border border-gov-border shadow-gov-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase">ASHA Recovery Success</span>
            <RotateCcw className="w-4 h-4 text-teal-700" />
          </div>
          <div className="text-2xl font-bold text-teal-800">{recoverySuccessRate}%</div>
          <span className="text-[11px] text-teal-700 font-medium">{recoveredCount} cases salvaged</span>
        </div>

        <div className="p-4 bg-white rounded-gov border border-gov-border shadow-gov-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase">Avg. Completion Time</span>
            <Clock className="w-4 h-4 text-blue-700" />
          </div>
          <div className="text-2xl font-bold text-gov-text-primary">{avgCompletionTime}</div>
          <span className="text-[11px] text-emerald-700 font-medium">-4.5 hrs from Q3</span>
        </div>
      </div>

      {/* Visual Referral Funnel */}
      <Card>
        <CardHeader>
          <CardTitle>District Referral Conversion Funnel</CardTitle>
          <CardDescription>
            Tracing conversion efficiency from primary referral initiation to secondary/tertiary loop closure
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {funnelSteps.map((step, idx) => (
              <div key={step.stage} className="relative">
                <div className={`p-4 rounded-gov border transition-all ${step.lightColor}`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-white border font-bold text-xs flex items-center justify-center shadow-sm">
                        {idx + 1}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold uppercase tracking-wider">{step.stage}</span>
                          <span className="text-xs font-semibold text-slate-800">— {step.title}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-0.5">{step.description}</p>
                      </div>
                    </div>
                    <div className="text-right sm:shrink-0 flex items-center gap-4 sm:flex-col sm:items-end">
                      <div className="text-lg font-bold">{step.count.toLocaleString()} <span className="text-xs font-normal text-slate-500">cases</span></div>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-white/80 border">
                        {step.percentage} conversion
                      </span>
                    </div>
                  </div>

                  {/* Progress visual bar */}
                  <div className="w-full bg-slate-200/80 h-2 rounded-full overflow-hidden mt-3">
                    <div
                      className={`h-full rounded-full ${step.color} transition-all duration-500`}
                      style={{ width: step.percentage }}
                    />
                  </div>
                </div>

                {/* Arrow down connector */}
                {idx < funnelSteps.length - 1 && (
                  <div className="flex items-center justify-center my-1">
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-[10px] font-semibold border">
                      <ArrowDown className="w-3 h-3 text-slate-400" />
                      <span>Drop-off / In-Transit: {step.dropoff}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recovery Pipeline Card */}
      <Card className="border-teal-200 bg-gradient-to-r from-teal-50/40 via-white to-white">
        <CardHeader>
          <div className="flex items-center gap-2 text-teal-900">
            <RotateCcw className="w-5 h-5 text-teal-700" />
            <CardTitle>Continuum Recovery & Loop Restoration Pipeline</CardTitle>
          </div>
          <CardDescription>
            Exception lifecycle: GAP_DETECTED → ASHA Follow-up / Reroute → RECOVERED → REFERRED
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="p-3.5 bg-white rounded-gov border border-amber-200 shadow-sm">
              <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wide">1. Gap Detected</span>
              <div className="text-xl font-bold text-amber-900 mt-1">{gapCount}</div>
              <p className="text-[11px] text-slate-500 mt-1">Missed visits, slot capacity refusals, or transport stalls.</p>
            </div>

            <div className="p-3.5 bg-white rounded-gov border border-indigo-200 shadow-sm">
              <span className="text-[10px] font-bold text-indigo-800 uppercase tracking-wide">2. Field Follow-up</span>
              <div className="text-xl font-bold text-indigo-900 mt-1">126</div>
              <p className="text-[11px] text-slate-500 mt-1">Home visits by ASHA / ANM to counsel family and arrange 108 EMS.</p>
            </div>

            <div className="p-3.5 bg-white rounded-gov border border-teal-200 shadow-sm">
              <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wide">3. Rerouted / Recovered</span>
              <div className="text-xl font-bold text-teal-900 mt-1">{recoveredCount}</div>
              <p className="text-[11px] text-slate-500 mt-1">Alternate hospital slot booked or pre-service reroute finalized.</p>
            </div>

            <div className="p-3.5 bg-white rounded-gov border border-emerald-200 shadow-sm">
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wide">4. Closed Successfully</span>
              <div className="text-xl font-bold text-emerald-900 mt-1">98</div>
              <p className="text-[11px] text-slate-500 mt-1">Patient received specialist care at secondary/tertiary node.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Block-wise Funnel Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Administrative Block Referral Performance</CardTitle>
          <CardDescription>
            Tracking referral completion and gap resolution velocity across rural sub-districts
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Administrative Block</TableHead>
                <TableHead>Referrals Initiated</TableHead>
                <TableHead>Slot Confirmed</TableHead>
                <TableHead>Completed Care</TableHead>
                <TableHead>Gaps Flagged</TableHead>
                <TableHead>ASHA Recovery %</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {blockPerformance.map((row) => (
                <TableRow key={row.block}>
                  <TableCell className="font-semibold text-gov-text-primary text-xs">
                    {row.block}
                  </TableCell>
                  <TableCell className="text-xs">{row.initiated}</TableCell>
                  <TableCell className="text-xs">{row.confirmed}</TableCell>
                  <TableCell className="text-xs font-semibold text-gov-green-800">
                    {row.completed}
                  </TableCell>
                  <TableCell className="text-xs font-semibold text-red-700">
                    {row.gaps}
                  </TableCell>
                  <TableCell className="text-xs font-bold text-teal-800">
                    {row.recoveryRate}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link to="/admin/gaps">
                      <Button variant="ghost" size="sm" className="text-xs py-1 h-7">
                        Inspect Gaps
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
