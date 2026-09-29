import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/layout';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  Button, 
  StatusBadge, 
  SearchField, 
  EmptyState 
} from '@/components/ui';
import { careLoopApi, ApiError } from '@/api/client';
import { Referral } from '@/types';
import { 
  Building2, 
  ArrowRight, 
  Compass, 
  AlertTriangle 
} from 'lucide-react';

export const PatientReferrals: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadReferrals() {
      try {
        setLoading(true);
        const data = await careLoopApi.getReferrals({ patientId: 'pat_001' });
        if (isMounted) {
          setReferrals(data);
          setError(null);
        }
      } catch (err: unknown) {
        if (isMounted) {
          const msg = err instanceof ApiError ? err.message : 'Failed to retrieve referrals from backend.';
          setError(msg);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadReferrals();
    return () => {
      isMounted = false;
    };
  }, []);

  // Active referrals for this patient
  const activeReferrals = referrals.filter((r) => r.status !== 'COMPLETED');

  const filtered = activeReferrals.filter(
    (r) =>
      r.referralNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.targetFacilityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.targetDepartment.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-12 text-center text-sm text-gov-text-secondary">
        Loading active referrals from server...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-gov text-sm">
          {error}
        </div>
      )}
      <PageHeader
        title="My Active Referrals"
        subtitle="Track ongoing hospital referrals, requested appointment slots, and continuum stages."
        breadcrumbs={[
          { label: 'Patient Portal', href: '/patient' },
          { label: 'My Referrals' },
        ]}
        actions={
          <Link to="/patient/history">
            <Button variant="outline" size="sm">
              View Past History
            </Button>
          </Link>
        }
      />

      {/* Search & Filter Bar */}
      <Card>
        <CardContent className="p-4">
          <SearchField
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search by referral number, hospital or department..."
          />
        </CardContent>
      </Card>

      {/* Referrals List: Responsive Card-based for optimal usability on both Desktop and Mobile */}
      {filtered.length > 0 ? (
        <div className="space-y-4">
          {filtered.map((ref) => (
            <Card key={ref.id} className="border-gov-border shadow-gov-card overflow-hidden">
              <CardHeader className="bg-slate-50/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-gov-green-950">
                      {ref.referralNumber}
                    </span>
                    <StatusBadge status={ref.status} size="sm" />
                    <StatusBadge type={ref.referralType} size="sm" />
                    <StatusBadge priority={ref.priority} size="sm" />
                  </div>
                  <CardTitle className="mt-1 text-base">
                    {ref.targetDepartment} — {ref.targetFacilityName}
                  </CardTitle>
                </div>
                <span className="text-xs text-slate-500 font-medium shrink-0">
                  Issued: {new Date(ref.createdAt).toLocaleDateString()}
                </span>
              </CardHeader>

              <CardContent className="p-4 sm:p-5 space-y-3.5 text-xs">
                {/* Gap Alert If Active */}
                {ref.hasGapAlert && (
                  <div className="p-3 bg-red-50 border-l-4 border-l-red-600 rounded text-xs text-red-900">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
                      <div>
                        <strong>Gap Alert:</strong> {ref.gapReason}
                      </div>
                    </div>
                  </div>
                )}

                {/* Logistics breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-gov border border-gov-border">
                  <div>
                    <span className="text-slate-500 block text-[11px] font-medium">Facility & Type:</span>
                    <strong className="text-gov-text-primary block">{ref.targetFacilityName}</strong>
                    <span className="text-slate-500 text-[11px]">{ref.targetFacilityType}</span>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[11px] font-medium">Appointment Slot:</span>
                    {ref.slot.status === 'CONFIRMED' ? (
                      <div>
                        <strong className="text-gov-green-900 block">
                          {ref.slot.confirmedDate} ({ref.slot.confirmedTimeWindow})
                        </strong>
                        <span className="text-emerald-700 text-[11px] font-medium">✓ Confirmed by Hospital</span>
                      </div>
                    ) : ref.slot.status === 'ALTERNATIVE_PROPOSED' ? (
                      <div>
                        <strong className="text-amber-900 block">
                          Proposed: {ref.slot.counterProposedSlot}
                        </strong>
                        <span className="text-amber-700 text-[11px] font-medium">Alternative Proposed</span>
                      </div>
                    ) : (
                      <div>
                        <strong className="text-slate-700 block">
                          Requested: {ref.slot.requestedDate} ({ref.slot.requestedTimeWindow})
                        </strong>
                        <span className="text-slate-500 text-[11px]">Awaiting Facility Confirmation</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[11px] font-medium">Referring Field Worker:</span>
                    <strong className="text-gov-text-primary block">{ref.referringWorkerName}</strong>
                    <span className="text-slate-500 text-[11px]">{ref.originSubCenter} ({ref.referringWorkerPhone})</span>
                  </div>
                </div>

                {/* Complaint Summary */}
                <div>
                  <span className="text-slate-500 text-[11px] font-semibold block mb-1">
                    Reason for Referral / Chief Complaint:
                  </span>
                  <p className="text-slate-800 bg-white p-2.5 rounded border border-gov-border">
                    {ref.chiefComplaint}
                  </p>
                </div>

                {/* Action Buttons Row */}
                <div className="pt-2 border-t border-gov-border/70 flex flex-wrap items-center justify-between gap-2.5">
                  <div className="text-[11px] text-slate-500">
                    Rule: Health worker requested time ≠ confirmed appointment.
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link to={`/patient/referrals/${ref.id}/journey`}>
                      <Button variant="outline" size="sm" leftIcon={<Compass className="w-3.5 h-3.5" />}>
                        Care Journey
                      </Button>
                    </Link>
                    <Link to={`/patient/referrals/${ref.id}/appointment`}>
                      <Button variant="outline" size="sm" leftIcon={<Building2 className="w-3.5 h-3.5" />}>
                        Appointment Slip
                      </Button>
                    </Link>
                    <Link to={`/patient/referrals/${ref.id}`}>
                      <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No Active Referrals Found"
          description={
            searchTerm
              ? `No active referrals match "${searchTerm}". Clear search to view all.`
              : 'You have no open referrals at this time. All past care records can be viewed in your history.'
          }
          actionLabel={searchTerm ? 'Clear Search' : 'View History'}
          onAction={
            searchTerm
              ? () => setSearchTerm('')
              : () => window.location.assign('/patient/history')
          }
        />
      )}
    </div>
  );
};
