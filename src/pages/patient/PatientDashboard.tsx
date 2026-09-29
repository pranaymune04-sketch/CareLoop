import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/layout';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  Button, 
  StatusBadge 
} from '@/components/ui';
import { mockNotifications } from '@/mock';
import { careLoopApi, ApiError } from '@/api/client';
import { Patient, Referral } from '@/types';
import { 
  Phone, 
  ArrowRight, 
  AlertTriangle, 
  CheckCircle2, 
  Bell, 
  History, 
  User, 
  Compass,
  FileText
} from 'lucide-react';

export const PatientDashboard: React.FC = () => {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadPatientData() {
      try {
        setLoading(true);
        const [patData, refData] = await Promise.all([
          careLoopApi.getPatientById('pat_001'),
          careLoopApi.getReferrals({ patientId: 'pat_001' }),
        ]);
        if (isMounted) {
          setPatient(patData);
          setReferrals(refData);
          setError(null);
        }
      } catch (err: unknown) {
        if (isMounted) {
          const msg = err instanceof ApiError ? err.message : 'Unable to connect to CareLoop coordination service.';
          setError(msg);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadPatientData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Active referrals for this patient (excluding completed)
  const patientActiveReferrals = referrals.filter((r) => r.status !== 'COMPLETED');
  const activeReferral = patientActiveReferrals[0];

  // Unread patient notifications count
  const unreadNotifs = mockNotifications.filter(
    (n) => n.recipientRole === 'patient' && !n.isRead
  ).length;

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-12 text-center text-sm text-gov-text-secondary">
        Loading patient dashboard and active continuum records...
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="max-w-5xl mx-auto py-8">
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-gov text-sm">
          {error || 'Patient record could not be loaded.'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Greeting & Demographic Breadcrumb */}
      <PageHeader
        title={`Welcome, ${patient.fullName}`}
        subtitle={`Village: ${patient.village}, ${patient.district} (${patient.state}) • ABHA ID (Demo): ${patient.abhaId || 'Simulated'}`}
        breadcrumbs={[
          { label: 'Patient Portal', href: '/patient' },
          { label: 'Dashboard' },
        ]}
        actions={
          <Link to="/patient/profile">
            <Button variant="outline" size="sm" leftIcon={<User className="w-3.5 h-3.5" />}>
              My Profile
            </Button>
          </Link>
        }
      />

      {/* Overview Metric Cards (No fake marketing stats, grounded in patient's active care) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 bg-white rounded-gov border border-gov-border shadow-gov-sm">
          <span className="text-[11px] font-medium text-gov-text-secondary uppercase">Active Referral</span>
          <div className="text-2xl font-bold text-gov-green-950 mt-1">
            {patientActiveReferrals.length}
          </div>
          <span className="text-[11px] text-gov-green-800 font-medium">In continuum tracking</span>
        </div>

        <div className="p-4 bg-white rounded-gov border border-gov-border shadow-gov-sm">
          <span className="text-[11px] font-medium text-gov-text-secondary uppercase">Next Appointment</span>
          <div className="text-sm font-bold text-gov-text-primary mt-1 truncate">
            {activeReferral?.slot.confirmedDate || 'Pending'}
          </div>
          <span className="text-[11px] text-slate-500 truncate block">
            {activeReferral?.slot.status === 'CONFIRMED' ? 'Confirmed by Facility' : 'Requested slot'}
          </span>
        </div>

        <div className="p-4 bg-white rounded-gov border border-gov-border shadow-gov-sm">
          <span className="text-[11px] font-medium text-gov-text-secondary uppercase">Care Status</span>
          <div className="text-sm font-bold mt-1">
            {activeReferral?.hasGapAlert ? (
              <span className="text-red-700 font-bold">Follow-Up Required</span>
            ) : activeReferral ? (
              <span className="text-gov-green-800">In Progress</span>
            ) : (
              <span className="text-slate-600">No Active Cases</span>
            )}
          </div>
          <span className="text-[11px] text-slate-500">
            {activeReferral?.hasGapAlert ? 'ASHA recovery in progress' : 'Scheduled visit'}
          </span>
        </div>

        <div className="p-4 bg-white rounded-gov border border-gov-border shadow-gov-sm">
          <span className="text-[11px] font-medium text-gov-text-secondary uppercase">Continuum Alerts</span>
          <div className="text-2xl font-bold text-amber-700 mt-1">
            {unreadNotifs}
          </div>
          <Link to="/patient/notifications" className="text-[11px] text-gov-green-800 hover:underline font-medium">
            View notification updates
          </Link>
        </div>
      </div>

      {/* Primary Section: Active Referral Card */}
      {activeReferral ? (
        <Card className="border-gov-green-200 border-2 shadow-gov-card">
          <CardHeader className="bg-gov-green-50/70">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold text-gov-green-950">
                    {activeReferral.referralNumber}
                  </span>
                  <StatusBadge status={activeReferral.status} size="sm" />
                  <StatusBadge priority={activeReferral.priority} size="sm" />
                </div>
                <CardTitle className="mt-1 text-base text-gov-green-950">
                  {activeReferral.targetDepartment} — {activeReferral.targetFacilityName}
                </CardTitle>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link to={`/patient/referrals/${activeReferral.id}/journey`}>
                  <Button variant="outline" size="sm" leftIcon={<Compass className="w-3.5 h-3.5" />}>
                    Care Journey
                  </Button>
                </Link>
                <Link to={`/patient/referrals/${activeReferral.id}`}>
                  <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                    Full Slip
                  </Button>
                </Link>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-5 space-y-4">
            {/* Gap Alert Notification within Active Referral */}
            {activeReferral.hasGapAlert && (
              <div className="p-3.5 bg-red-50 border-l-4 border-l-red-600 rounded-gov border border-red-200 text-xs">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-red-950 block">
                      {activeReferral.gapReason?.toLowerCase().includes('cannot proceed') || activeReferral.status === 'CANCELLED'
                        ? 'Facility unable to proceed — referral requires rerouting'
                        : 'Continuum Gap Detected: Missed Appointment'}
                    </strong>
                    <p className="text-red-800 mt-0.5 leading-relaxed">
                      {activeReferral.gapReason}. Your assigned health worker is reviewing alternative facilities to reroute your referral.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Core Referral Logistics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-gov border border-gov-border">
                <span className="text-slate-500 block mb-0.5 font-medium">Receiving Hospital:</span>
                <strong className="text-gov-text-primary block">{activeReferral.targetFacilityName}</strong>
                <span className="text-[11px] text-slate-500">{activeReferral.targetFacilityType}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-gov border border-gov-border">
                <span className="text-slate-500 block mb-0.5 font-medium">Appointment Slot:</span>
                {activeReferral.slot.status === 'CONFIRMED' ? (
                  <div>
                    <strong className="text-gov-green-900 block">
                      {activeReferral.slot.confirmedDate} ({activeReferral.slot.confirmedTimeWindow})
                    </strong>
                    <span className="text-[11px] text-emerald-700 font-medium">
                      ✓ Confirmed by Hospital
                    </span>
                  </div>
                ) : activeReferral.slot.status === 'ALTERNATIVE_PROPOSED' ? (
                  <div>
                    <strong className="text-amber-900 block">
                      Proposed: {activeReferral.slot.counterProposedSlot}
                    </strong>
                    <span className="text-[11px] text-amber-700 font-medium">
                      Facility Counter-Proposal
                    </span>
                  </div>
                ) : (
                  <div>
                    <strong className="text-slate-700 block">
                      Requested: {activeReferral.slot.requestedDate} ({activeReferral.slot.requestedTimeWindow})
                    </strong>
                    <span className="text-[11px] text-slate-500">
                      Pending Facility Confirmation
                    </span>
                  </div>
                )}
              </div>

              <div className="p-3 bg-slate-50 rounded-gov border border-gov-border">
                <span className="text-slate-500 block mb-0.5 font-medium">Referral Date:</span>
                <strong className="text-gov-text-primary block">
                  {new Date(activeReferral.createdAt).toLocaleDateString()}
                </strong>
                <span className="text-[11px] text-slate-500">
                  Last update: {new Date(activeReferral.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>

            {/* Referring ASHA Worker Card */}
            <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-gov flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-gov-green-800 font-bold">
                  {activeReferral.referringWorkerCadre}
                </div>
                <div>
                  <span className="font-bold text-emerald-950">Assigned Community Health Worker:</span>
                  <div className="text-emerald-900 font-medium">
                    {activeReferral.referringWorkerName} • {activeReferral.originSubCenter}
                  </div>
                </div>
              </div>
              <a
                href={`tel:${activeReferral.referringWorkerPhone}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-emerald-300 text-emerald-900 rounded font-semibold hover:bg-emerald-100 self-start sm:self-auto shadow-gov-sm"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-700" />
                <span>Call ASHA {activeReferral.referringWorkerPhone}</span>
              </a>
            </div>

            {/* Mini Continuum Stepper Preview */}
            <div className="pt-2 border-t border-gov-border">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-bold text-gov-text-primary">Continuum Progress Preview:</span>
                <Link
                  to={`/patient/referrals/${activeReferral.id}/journey`}
                  className="text-gov-green-800 hover:underline text-[11px] font-medium"
                >
                  View full continuum event logs →
                </Link>
              </div>
              <div className="grid grid-cols-6 gap-1 text-center text-[10px] font-bold">
                <div className="p-1.5 bg-emerald-100 text-emerald-900 rounded border border-emerald-300">
                  1. MATCH ✓
                </div>
                <div className="p-1.5 bg-emerald-100 text-emerald-900 rounded border border-emerald-300">
                  2. REFER ✓
                </div>
                <div className="p-1.5 bg-emerald-100 text-emerald-900 rounded border border-emerald-300">
                  3. TRACK ✓
                </div>
                <div className="p-1.5 bg-red-100 text-red-900 rounded border border-red-300 animate-pulse">
                  4. DETECT !
                </div>
                <div className="p-1.5 bg-amber-50 text-amber-800 rounded border border-amber-200">
                  5. RECOVER
                </div>
                <div className="p-1.5 bg-slate-100 text-slate-500 rounded border border-slate-200">
                  6. COMPLETE
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="p-6 text-center">
          <CheckCircle2 className="w-8 h-8 text-gov-green-700 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-gov-text-primary">No Active Referrals Pending</h3>
          <p className="text-xs text-gov-text-secondary mt-1 max-w-sm mx-auto">
            You currently have no open referral cases. When your village ASHA worker issues a referral, it will appear here.
          </p>
          <div className="mt-4">
            <Link to="/patient/history">
              <Button variant="outline" size="sm">
                View Past Completed Referrals
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Quick Navigation Sections */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link to="/patient/referrals" className="group">
          <Card className="hover:border-gov-green-300 transition-colors h-full">
            <CardContent className="p-4 flex items-start gap-3">
              <div className="p-2 bg-gov-green-100 text-gov-green-900 rounded-gov group-hover:bg-gov-green-200">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gov-text-primary">My Referrals</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Track ongoing referral slips and scheduled slots.
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/patient/history" className="group">
          <Card className="hover:border-gov-green-300 transition-colors h-full">
            <CardContent className="p-4 flex items-start gap-3">
              <div className="p-2 bg-slate-100 text-slate-700 rounded-gov group-hover:bg-slate-200">
                <History className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gov-text-primary">Care History</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Review completed hospital visits and past records.
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/patient/notifications" className="group">
          <Card className="hover:border-gov-green-300 transition-colors h-full">
            <CardContent className="p-4 flex items-start gap-3">
              <div className="p-2 bg-amber-100 text-amber-900 rounded-gov group-hover:bg-amber-200">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gov-text-primary">Notifications ({unreadNotifs})</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  View appointment reminders and slot alerts.
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
};
