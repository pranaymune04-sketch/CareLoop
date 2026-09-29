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
  CheckCheck, 
  ArrowRight 
} from 'lucide-react';

export const PatientHistory: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [pastReferrals, setPastReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadPastReferrals() {
      try {
        setLoading(true);
        const data = await careLoopApi.getReferrals({ patientId: 'pat_001', status: 'COMPLETED' });
        if (isMounted) {
          setPastReferrals(data);
          setError(null);
        }
      } catch (err: unknown) {
        if (isMounted) {
          const msg = err instanceof ApiError ? err.message : 'Failed to retrieve referral history.';
          setError(msg);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadPastReferrals();
    return () => {
      isMounted = false;
    };
  }, []);

  const filtered = pastReferrals.filter(
    (r) =>
      r.referralNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.targetFacilityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.targetDepartment.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-12 text-center text-sm text-gov-text-secondary">
        Loading care history from server...
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
        title="Referral Care History"
        subtitle="Completed healthcare consultations, discharge summaries, and closed continuum loops"
        breadcrumbs={[
          { label: 'Patient Portal', href: '/patient' },
          { label: 'History' },
        ]}
        actions={
          <Link to="/patient/referrals">
            <Button variant="outline" size="sm">
              View Active Referrals
            </Button>
          </Link>
        }
      />

      {/* Search Input */}
      <Card>
        <CardContent className="p-4">
          <SearchField
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search past care by referral number, hospital or service..."
          />
        </CardContent>
      </Card>

      {/* Completed Care List: Responsive Cards to prevent table overflow on mobile */}
      {filtered.length > 0 ? (
        <div className="space-y-4">
          {filtered.map((ref) => (
            <Card key={ref.id} className="border-gov-border shadow-gov-card overflow-hidden">
              <CardHeader className="bg-emerald-50/50 border-b border-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-gov-green-950">
                      {ref.referralNumber}
                    </span>
                    <StatusBadge status="COMPLETED" size="sm" />
                    <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                      Care Delivered
                    </span>
                  </div>
                  <CardTitle className="mt-1 text-base text-gov-green-950">
                    {ref.targetDepartment} — {ref.targetFacilityName}
                  </CardTitle>
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  Completed on {new Date(ref.updatedAt).toLocaleDateString()}
                </div>
              </CardHeader>

              <CardContent className="p-4 sm:p-5 space-y-3.5 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-gov border border-gov-border">
                  <div>
                    <span className="text-slate-500 block text-[11px] font-medium">Treated Hospital:</span>
                    <strong className="text-gov-text-primary block">{ref.targetFacilityName}</strong>
                    <span className="text-[11px] text-slate-500">{ref.targetFacilityType}</span>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[11px] font-medium">Consultation Date:</span>
                    <strong className="text-gov-text-primary block">
                      {ref.slot.confirmedDate || ref.slot.requestedDate}
                    </strong>
                    <span className="text-[11px] text-slate-500">Slot: {ref.slot.confirmedTimeWindow}</span>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[11px] font-medium">Referring Field Worker:</span>
                    <strong className="text-gov-text-primary block">{ref.referringWorkerName}</strong>
                    <span className="text-[11px] text-slate-500">{ref.originSubCenter}</span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 text-[11px] font-semibold block mb-1">
                    Clinical information provided during referral & hospital discharge:
                  </span>
                  <p className="text-slate-800 bg-white p-2.5 rounded border border-gov-border leading-relaxed">
                    {ref.provisionalDiagnosis ? (
                      <span><strong>Diagnosis recorded at facility:</strong> {ref.provisionalDiagnosis}. </span>
                    ) : null}
                    {ref.clinicalNotes}
                  </p>
                </div>

                <div className="pt-2 border-t border-gov-border flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-emerald-800 text-xs font-semibold">
                    <CheckCheck className="w-4 h-4 text-emerald-700" />
                    <span>Closed Continuum Loop</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link to={`/patient/referrals/${ref.id}/journey`}>
                      <Button variant="outline" size="sm">
                        View Care Trail
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
          title="No Referral History Available"
          description={
            searchTerm
              ? `No completed care records match "${searchTerm}".`
              : 'You do not have any past completed referrals recorded yet. Once care is delivered at a health center, the completed record will appear here.'
          }
          actionLabel={searchTerm ? 'Clear Search' : undefined}
          onAction={searchTerm ? () => setSearchTerm('') : undefined}
        />
      )}
    </div>
  );
};
