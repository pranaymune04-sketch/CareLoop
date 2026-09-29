import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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
  TableCell,
  EmptyState 
} from '@/components/ui';
import { CareLoopStore, mockHealthWorker } from '@/mock';
import { Referral } from '@/types';
import { RerouteModal } from '@/components/health-worker';
import { 
  AlertTriangle, 
  Compass, 
  Phone, 
  Eye, 
  ShieldCheck 
} from 'lucide-react';

export const HealthWorkerAtRiskReferrals: React.FC = () => {
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(null);
  const atRiskReferrals = CareLoopStore.getAtRiskReferrals();

  const handleRerouteComplete = (updated: Referral) => {
    alert(`Referral ${updated.referralNumber} rerouted to ${updated.targetFacilityName}.`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Care Recovery Radar"
        subtitle="Referral Exception Detection & Stuck Care Coordination Pipeline"
        breadcrumbs={[
          { label: 'Health Worker', href: '/health-worker' },
          { label: 'Referrals', href: '/health-worker/referrals' },
          { label: 'Care Recovery Radar' },
        ]}
      />

      {/* Operational Disclaimer Notice */}
      <div className="p-3.5 bg-amber-50 border border-amber-300 rounded text-xs text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            <strong>Operational Exception Detection:</strong> Flags administrative delays, unaccepted slot requests, missed facility check-in windows, and facility counter-proposals. CareLoop does NOT make medical or clinical risk predictions.
          </span>
        </div>
        <span className="text-[11px] font-semibold text-amber-900 bg-amber-100 px-2 py-0.5 rounded shrink-0">
          Sub-Centre: {mockHealthWorker.assignedSubCenter}
        </span>
      </div>

      {atRiskReferrals.length > 0 ? (
        <Card className="border-red-200 shadow-gov-card">
          <CardHeader className="bg-red-50/40">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-red-950 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-700" />
                  <span>Referrals Requiring Worker Intervention ({atRiskReferrals.length})</span>
                </CardTitle>
                <CardDescription>
                  Review delayed cases, contact patients, or execute pre-service rerouting to prevent dropout.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Referral #</TableHead>
                  <TableHead>Patient Details</TableHead>
                  <TableHead>Target Facility</TableHead>
                  <TableHead>Exception Reason / Trigger</TableHead>
                  <TableHead>Slot / Continuum Status</TableHead>
                  <TableHead className="text-right">Operational Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {atRiskReferrals.map((ref) => (
                  <TableRow key={ref.id} className="hover:bg-red-50/20">
                    <TableCell className="font-mono text-[11px] font-bold text-slate-800">
                      {ref.referralNumber}
                      <div className="mt-0.5">
                        <StatusBadge type={ref.referralType} size="sm" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-gov-text-primary">{ref.patientName}</div>
                      <div className="text-[11px] text-slate-500">
                        Age {ref.patientAge} • {ref.village}
                      </div>
                      {ref.patientPhone && (
                        <a href={`tel:${ref.patientPhone}`} className="text-gov-green-800 text-[11px] hover:underline flex items-center gap-1 mt-0.5">
                          <Phone className="w-2.5 h-2.5" /> {ref.patientPhone}
                        </a>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-slate-800">{ref.targetFacilityName}</div>
                      <div className="text-[11px] text-slate-500">{ref.targetDepartment}</div>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="p-2 bg-red-50 border border-red-200 rounded text-red-900 text-[11px] leading-snug">
                        {ref.gapReason?.toLowerCase().includes('cannot proceed') ? (
                          <>
                            <strong className="block text-red-950 font-semibold mb-0.5">
                              Facility cannot proceed — recovery action required.
                            </strong>
                            <span>{ref.gapReason}</span>
                          </>
                        ) : (
                          ref.gapReason || (ref.slot.status === 'ALTERNATIVE_PROPOSED' ? `Hospital proposed alternative: ${ref.slot.counterProposedSlot}` : 'Awaiting facility acceptance past threshold')
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={ref.status} size="sm" />
                      <div className="text-[11px] text-slate-500 mt-1">
                        Slot: {ref.slot.status}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        <Button
                          variant="emergency"
                          size="sm"
                          leftIcon={<Compass className="w-3.5 h-3.5" />}
                          onClick={() => setSelectedReferral(ref)}
                        >
                          Review & Reroute
                        </Button>
                        <Link to={`/health-worker/referrals/${ref.id}`}>
                          <Button variant="outline" size="sm" leftIcon={<Eye className="w-3.5 h-3.5" />}>
                            Details
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <EmptyState
          title="No At-Risk Referrals Detected"
          description="All active patient referrals are progressing smoothly within scheduled windows without reported delays or gap alerts."
          actionLabel="View Full Referrals Pipeline"
          onAction={() => window.location.assign('/health-worker/referrals')}
        />
      )}

      {/* Reroute Modal */}
      <RerouteModal
        referral={selectedReferral}
        isOpen={!!selectedReferral}
        onClose={() => setSelectedReferral(null)}
        onRerouteComplete={handleRerouteComplete}
      />
    </div>
  );
};
