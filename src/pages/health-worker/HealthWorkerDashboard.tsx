import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/layout';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  Button, 
  StatusBadge, 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from '@/components/ui';
import { CareLoopStore, mockHealthWorker } from '@/mock';
import { Referral } from '@/types';
import { RerouteModal } from '@/components/health-worker';
import { 
  FilePlus2, 
  AlertTriangle, 
  Siren, 
  Phone, 
  ChevronRight, 
  Calendar,
  Users,
  UserPlus,
  Compass,
  Eye,
  ShieldCheck
} from 'lucide-react';

export const HealthWorkerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [selectedRerouteReferral, setSelectedRerouteReferral] = useState<Referral | null>(null);

  // Read live from CareLoopStore
  const patients = CareLoopStore.getPatients();
  const referrals = CareLoopStore.getReferrals();
  const atRiskReferrals = CareLoopStore.getAtRiskReferrals();

  const activeReferrals = referrals.filter((r) => r.status !== 'COMPLETED' && r.status !== 'CANCELLED');
  const awaitingResponse = referrals.filter((r) => r.slot.status === 'PENDING_CONFIRMATION' || r.status === 'REFERRED');

  const handleRerouteComplete = (updated: Referral) => {
    // Re-render handled by state in store
    alert(`Referral ${updated.referralNumber} rerouted to ${updated.targetFacilityName}. Status reset to Requested Slot (Pending Confirmation).`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title={`Namaste, ${mockHealthWorker.name}`}
        subtitle={`Cadre: ${mockHealthWorker.cadre} • Sub-Centre: ${mockHealthWorker.assignedSubCenter} (${mockHealthWorker.assignedVillage}, ${mockHealthWorker.district})`}
        breadcrumbs={[
          { label: 'Health Worker Portal', href: '/health-worker' },
          { label: 'Operational Dashboard' },
        ]}
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <Link to="/health-worker/create-referral/emergency">
              <Button variant="emergency" size="sm" leftIcon={<Siren className="w-4 h-4" />}>
                Emergency Referral
              </Button>
            </Link>
            <Link to="/health-worker/create-referral/normal">
              <Button variant="primary" size="sm" leftIcon={<FilePlus2 className="w-4 h-4" />}>
                + New Normal Referral
              </Button>
            </Link>
          </div>
        }
      />

      {/* Core Principle Notice */}
      <div className="p-3 bg-gov-green-50 border border-gov-green-200 rounded-gov text-xs text-gov-green-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-gov-green-700 shrink-0" />
          <span>
            CareLoop Rural Continuum: <strong>Referral created ≠ Care completed</strong>. Track each patient through MATCH → REFER → TRACK → DETECT → RECOVER → COMPLETE.
          </span>
        </div>
        <span className="text-[11px] text-gov-green-800 font-medium shrink-0">
          Sub-Centre: {mockHealthWorker.assignedSubCenter}
        </span>
      </div>

      {/* Care Recovery Radar Banner (Operational Exception Detection) */}
      {atRiskReferrals.length > 0 && (
        <div className="p-4 bg-red-50 border-l-4 border-l-red-600 rounded-gov border border-red-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-red-950 uppercase tracking-wide">
                  Care Recovery Radar: {atRiskReferrals.length} Referral(s) Require Operational Follow-Up
                </h4>
                <p className="text-xs text-red-800 mt-0.5 leading-relaxed">
                  <strong>{atRiskReferrals[0].patientName}</strong> ({atRiskReferrals[0].referralNumber}) at {atRiskReferrals[0].targetFacilityName}. Reason: {atRiskReferrals[0].gapReason || 'Slot proposal pending decision.'}
                </p>
                <span className="text-[11px] text-slate-500 block mt-1">
                  * Operational referral tracking exception. Not a medical diagnosis.
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              {atRiskReferrals[0].patientPhone && (
                <a
                  href={`tel:${atRiskReferrals[0].patientPhone}`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-red-300 text-red-800 rounded text-xs font-semibold hover:bg-red-50 shadow-gov-sm"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Patient</span>
                </a>
              )}
              <Button 
                variant="outline" 
                size="sm"
                leftIcon={<Compass className="w-3.5 h-3.5" />}
                onClick={() => setSelectedRerouteReferral(atRiskReferrals[0])}
              >
                Reroute Facility
              </Button>
              <Link to="/health-worker/referrals/at-risk">
                <Button variant="primary" size="sm">
                  View Recovery Radar
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Operational Metrics (Mock Demonstration Data) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-4 bg-white rounded-gov border border-gov-border shadow-gov-sm">
          <span className="text-[11px] font-medium text-gov-text-secondary uppercase">My Village Patients</span>
          <div className="text-2xl font-bold text-gov-green-950 mt-1">
            {patients.length}
          </div>
          <Link to="/health-worker/patients" className="text-[11px] text-gov-green-800 hover:underline font-medium">
            Assigned Sub-Centre registry →
          </Link>
        </div>

        <div className="p-4 bg-white rounded-gov border border-gov-border shadow-gov-sm">
          <span className="text-[11px] font-medium text-gov-text-secondary uppercase">Active Referrals</span>
          <div className="text-2xl font-bold text-gov-green-950 mt-1">
            {activeReferrals.length}
          </div>
          <span className="text-[11px] text-gov-green-800 font-medium">In continuum tracking</span>
        </div>

        <div className="p-4 bg-white rounded-gov border border-gov-border shadow-gov-sm">
          <span className="text-[11px] font-medium text-gov-text-secondary uppercase">Awaiting Facility Response</span>
          <div className="text-2xl font-bold text-amber-700 mt-1">
            {awaitingResponse.length}
          </div>
          <span className="text-[11px] text-amber-800 font-medium">Requested slots (unconfirmed)</span>
        </div>

        <div className="p-4 bg-white rounded-gov border border-gov-border shadow-gov-sm">
          <span className="text-[11px] font-medium text-gov-text-secondary uppercase">At-Risk Referrals</span>
          <div className="text-2xl font-bold text-red-700 mt-1">
            {atRiskReferrals.length}
          </div>
          <Link to="/health-worker/referrals/at-risk" className="text-[11px] text-red-700 hover:underline font-medium">
            Review in Recovery Radar →
          </Link>
        </div>
      </div>

      {/* Quick Operational Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <button
          type="button"
          onClick={() => navigate('/health-worker/patients')}
          className="p-3.5 bg-white border border-gov-border rounded-gov text-left hover:border-gov-green-600 transition-colors shadow-gov-sm group"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gov-green-100 text-gov-green-900 rounded-gov group-hover:bg-gov-green-200">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-gov-text-primary">Find Patient</div>
              <div className="text-[11px] text-slate-500">Search registry before referring</div>
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => navigate('/health-worker/patients/register')}
          className="p-3.5 bg-white border border-gov-border rounded-gov text-left hover:border-gov-green-600 transition-colors shadow-gov-sm group"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 text-emerald-900 rounded-gov group-hover:bg-emerald-200">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-gov-text-primary">Register Patient</div>
              <div className="text-[11px] text-slate-500">New citizen demographic profile</div>
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => navigate('/health-worker/create-referral/normal')}
          className="p-3.5 bg-white border border-gov-border rounded-gov text-left hover:border-gov-green-600 transition-colors shadow-gov-sm group"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gov-green-100 text-gov-green-900 rounded-gov group-hover:bg-gov-green-200">
              <FilePlus2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-gov-text-primary">Create Normal Referral</div>
              <div className="text-[11px] text-slate-500">Planned care & specialist matching</div>
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => navigate('/health-worker/create-referral/emergency')}
          className="p-3.5 bg-red-50/70 border border-red-200 rounded-gov text-left hover:border-red-500 transition-colors shadow-gov-sm group"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-red-600 text-white rounded-gov group-hover:bg-red-700">
              <Siren className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-red-950">Emergency Referral</div>
              <div className="text-[11px] text-red-800">Urgent triage (no login required)</div>
            </div>
          </div>
        </button>
      </div>

      {/* Active Referral Pipeline Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Active Referral Continuum Tracker</CardTitle>
            <CardDescription>
              All village referrals undergoing MATCH → REFER → TRACK → DETECT → RECOVER → COMPLETE
            </CardDescription>
          </div>
          <Link to="/health-worker/referrals">
            <Button variant="ghost" size="sm" rightIcon={<ChevronRight className="w-3.5 h-3.5" />}>
              View All Referrals
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Referral #</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Target Facility</TableHead>
                <TableHead>Appointment Slot Status</TableHead>
                <TableHead>Continuum Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {referrals.slice(0, 5).map((ref) => (
                <TableRow key={ref.id}>
                  <TableCell className="font-mono text-[11px] font-bold text-slate-700">
                    {ref.referralNumber}
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold text-gov-text-primary">{ref.patientName}</div>
                    <div className="text-[11px] text-slate-500">
                      Age {ref.patientAge} • {ref.village}
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge type={ref.referralType} size="sm" />
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
                        <span className="text-emerald-700 font-semibold">✓ Confirmed by Hospital</span>
                      ) : ref.slot.status === 'ALTERNATIVE_PROPOSED' ? (
                        <span className="text-amber-700 font-semibold">⚠ Counter-Proposed</span>
                      ) : (
                        <span className="text-slate-500">Requested (Awaiting Response)</span>
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
                    <Link to={`/health-worker/referrals/${ref.id}`}>
                      <Button variant="outline" size="sm" leftIcon={<Eye className="w-3.5 h-3.5" />}>
                        Details
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Reusable Pre-Service Reroute Modal */}
      <RerouteModal
        referral={selectedRerouteReferral}
        isOpen={!!selectedRerouteReferral}
        onClose={() => setSelectedRerouteReferral(null)}
        onRerouteComplete={handleRerouteComplete}
      />
    </div>
  );
};
