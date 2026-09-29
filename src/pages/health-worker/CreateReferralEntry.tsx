import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/layout';
import { Card, CardContent, Button } from '@/components/ui';
import { CareLoopStore } from '@/mock';
import { FilePlus2, Siren, ArrowRight, ShieldCheck, Clock, AlertTriangle } from 'lucide-react';

export const CreateReferralEntry: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const patientId = searchParams.get('patientId');
  const patient = patientId ? CareLoopStore.getPatientById(patientId) : undefined;

  const normalUrl = patientId 
    ? `/health-worker/create-referral/normal?patientId=${patientId}` 
    : '/health-worker/create-referral/normal';

  const emergencyUrl = patientId 
    ? `/health-worker/create-referral/emergency?patientId=${patientId}` 
    : '/health-worker/create-referral/emergency';

  const referralTypeParam = searchParams.get('type');
  React.useEffect(() => {
    if (referralTypeParam === 'emergency') {
      navigate(emergencyUrl, { replace: true });
    }
  }, [referralTypeParam, emergencyUrl, navigate]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Initiate Care Referral"
        subtitle="Referral created ≠ Care completed. Select the clinical urgency level for coordination."
        breadcrumbs={[
          { label: 'Health Worker', href: '/health-worker' },
          { label: 'Referrals', href: '/health-worker/referrals' },
          { label: 'Create Referral' },
        ]}
      />

      {patient && (
        <div className="p-3.5 bg-gov-green-50 border border-gov-green-300 rounded text-xs text-gov-green-950 flex items-center justify-between">
          <div>
            Referral for: <strong>{patient.fullName}</strong> ({patient.age} yrs, {patient.village})
          </div>
          <span className="font-mono text-[11px] text-gov-green-800">
            {patient.abhaId || patient.id}
          </span>
        </div>
      )}

      {/* Two Clear Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Normal Referral Card */}
        <Card className="hover:border-gov-green-600 transition-all shadow-gov-card flex flex-col justify-between">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gov-green-100 text-gov-green-900 rounded-gov">
                <FilePlus2 className="w-6 h-6 text-gov-green-800" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gov-text-primary">Normal Referral</h3>
                <span className="text-xs text-gov-green-800 font-semibold">
                  Planned & Non-Emergency Coordination
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Use for scheduled specialist consultations, planned ANC screenings, diagnostic investigations, NCD disease management, or elective surgical review.
            </p>

            <div className="space-y-2 pt-2 border-t border-gov-border text-xs text-slate-700">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Selects preferred date & requested appointment window.</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-gov-green-700 shrink-0" />
                <span>Full Smart Facility Matching (beds, specialist queue, distance).</span>
              </div>
            </div>

            <div className="pt-3">
              <Button
                variant="primary"
                className="w-full"
                rightIcon={<ArrowRight className="w-4 h-4" />}
                onClick={() => navigate(normalUrl)}
              >
                Proceed with Normal Referral
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Referral Card */}
        <Card className="border-red-300 bg-red-50/30 hover:border-red-600 transition-all shadow-gov-card flex flex-col justify-between">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-600 text-white rounded-gov">
                <Siren className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-base font-bold text-red-950">Emergency Referral</h3>
                <span className="text-xs text-red-700 font-semibold">
                  Urgent Care Coordination
                </span>
              </div>
            </div>

            <p className="text-xs text-red-900 leading-relaxed">
              Use for obstetric hemorrhage, acute neonatal distress, polytrauma, severe chest pain, or unconscious patients. Fast triage path without administrative hurdles.
            </p>

            <div className="space-y-2 pt-2 border-t border-red-200 text-xs text-red-900">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>
                  <strong>Zero patient login required.</strong> Supports unregistered patients.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-red-600 shrink-0" />
                <span>Emergency 24x7 casualty & ICU readiness prioritized.</span>
              </div>
            </div>

            <div className="pt-3">
              <Button
                variant="emergency"
                className="w-full"
                rightIcon={<ArrowRight className="w-4 h-4" />}
                onClick={() => navigate(emergencyUrl)}
              >
                Start Emergency Coordination
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Public Service Notice */}
      <div className="p-3.5 bg-slate-50 border border-gov-border rounded-gov text-xs text-slate-600 flex items-start gap-2">
        <ShieldCheck className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <div>
          <strong>Requested Slot Principle:</strong> In all referral types, creating a referral issues a request. The receiving healthcare facility confirms or proposes alternative slots based on real-time operational capacity.
        </div>
      </div>
    </div>
  );
};
