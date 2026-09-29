import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/layout';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  Button, 
  EmptyState 
} from '@/components/ui';
import { mockReferrals, mockFacilities } from '@/mock';
import { 
  Clock, 
  Phone, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft, 
  Printer, 
  ShieldCheck,
  Compass
} from 'lucide-react';

export const PatientAppointment: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const referral = mockReferrals.find((r) => r.id === id);

  if (!referral) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <EmptyState
          title="Appointment Record Not Found"
          description="The requested appointment information could not be located."
          actionLabel="Back to Referrals"
          onAction={() => navigate('/patient/referrals')}
        />
      </div>
    );
  }

  const facility = mockFacilities.find((f) => f.id === referral.targetFacilityId);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Hospital Appointment & Facility Slip"
        subtitle={`Consultation details for ${referral.targetDepartment} at ${referral.targetFacilityName}`}
        breadcrumbs={[
          { label: 'Patient Portal', href: '/patient' },
          { label: 'My Referrals', href: '/patient/referrals' },
          { label: referral.referralNumber, href: `/patient/referrals/${referral.id}` },
          { label: 'Appointment Slip' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Printer className="w-3.5 h-3.5" />}
              onClick={() => window.print()}
            >
              Print Appointment Slip
            </Button>
            <Link to={`/patient/referrals/${referral.id}/journey`}>
              <Button variant="primary" size="sm" leftIcon={<Compass className="w-3.5 h-3.5" />}>
                View Care Journey
              </Button>
            </Link>
          </div>
        }
      />

      {/* Appointment Status Callout Banner */}
      {referral.slot.status === 'CONFIRMED' ? (
        <div className="p-4 bg-emerald-50 border-l-4 border-l-emerald-600 rounded-gov border border-emerald-200">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div className="text-xs">
              <h4 className="font-bold text-emerald-950 uppercase tracking-wide">
                Appointment Status: Confirmed by Receiving Facility
              </h4>
              <p className="text-emerald-800 mt-0.5 leading-relaxed">
                {referral.targetFacilityName} has officially confirmed your consultation slot for{' '}
                <strong>{referral.slot.confirmedDate} ({referral.slot.confirmedTimeWindow})</strong>.
              </p>
            </div>
          </div>
        </div>
      ) : referral.slot.status === 'ALTERNATIVE_PROPOSED' ? (
        <div className="p-4 bg-amber-50 border-l-4 border-l-amber-600 rounded-gov border border-amber-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-xs">
              <h4 className="font-bold text-amber-950 uppercase tracking-wide">
                Appointment Status: Alternate Slot Proposed by Facility
              </h4>
              <p className="text-amber-800 mt-0.5 leading-relaxed">
                The hospital was unable to accommodate the requested time. They have counter-proposed:{' '}
                <strong>{referral.slot.counterProposedSlot}</strong>. Reason: {referral.slot.facilityRemarks || 'Specialist duty roster conflict.'}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-slate-100 border-l-4 border-l-slate-500 rounded-gov border border-slate-300">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-slate-700 shrink-0 mt-0.5" />
            <div className="text-xs">
              <h4 className="font-bold text-slate-900 uppercase tracking-wide">
                Appointment Status: Requested (Awaiting Facility Confirmation)
              </h4>
              <p className="text-slate-700 mt-0.5 leading-relaxed">
                Your health worker requested <strong>{referral.slot.requestedDate} ({referral.slot.requestedTimeWindow})</strong>. The receiving hospital is reviewing duty doctor availability.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Structured Appointment Slip Card */}
      <Card className="shadow-gov-card border-gov-green-200">
        <CardHeader className="bg-gov-green-50/60 border-b border-gov-green-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gov-green-900">
                Official Outpatient Referral Slip
              </span>
              <CardTitle className="text-base text-gov-green-950 mt-0.5">
                {referral.targetFacilityName}
              </CardTitle>
            </div>
            <div className="font-mono text-xs font-bold text-slate-700 bg-white px-2.5 py-1 rounded border border-gov-border">
              Slip #{referral.referralNumber}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-5 space-y-5 text-xs">
          {/* Patient Details Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50 rounded-gov border border-gov-border">
            <div>
              <span className="text-slate-500 block text-[11px]">Patient Name:</span>
              <strong className="text-gov-text-primary">{referral.patientName}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Age / Gender:</span>
              <strong className="text-gov-text-primary">{referral.patientAge} yrs • {referral.patientGender}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Village of Origin:</span>
              <strong className="text-gov-text-primary">{referral.village}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Priority Triage:</span>
              <strong className="text-gov-green-900">{referral.priority}</strong>
            </div>
          </div>

          {/* Department & Scheduled Window */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded-gov border border-gov-border space-y-1.5">
              <span className="text-slate-500 text-[11px] font-semibold uppercase block">
                Target Department
              </span>
              <div className="text-sm font-bold text-gov-text-primary">
                {referral.targetDepartment}
              </div>
              <p className="text-slate-600 text-[11px]">
                Facility Type: {referral.targetFacilityType}
              </p>
              {referral.slot.facilityRemarks && (
                <div className="text-[11px] text-slate-700 bg-slate-50 p-2 rounded mt-2 border border-gov-border">
                  <strong>Hospital Remark:</strong> {referral.slot.facilityRemarks}
                </div>
              )}
            </div>

            <div className="p-4 bg-white rounded-gov border border-gov-border space-y-1.5">
              <span className="text-slate-500 text-[11px] font-semibold uppercase block">
                Consultation Window
              </span>
              <div className="text-sm font-bold text-gov-green-950">
                {referral.slot.confirmedDate || referral.slot.requestedDate}
              </div>
              <div className="text-xs text-slate-700">
                Timing: {referral.slot.confirmedTimeWindow || referral.slot.requestedTimeWindow}
              </div>
              <div className="text-[11px] text-slate-500 mt-2">
                {referral.slot.status === 'CONFIRMED' ? (
                  <span className="text-emerald-700 font-semibold">✓ Confirmed Slot</span>
                ) : (
                  <span className="text-amber-800 font-semibold">Slot Pending Confirmation</span>
                )}
              </div>
            </div>
          </div>

          {/* Facility Location and Assistance Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 bg-slate-50 rounded-gov border border-gov-border space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                <MapPin className="w-4 h-4 text-gov-green-800" />
                <span>Hospital Location & Contact</span>
              </div>
              <div className="text-slate-700">
                {facility?.name || referral.targetFacilityName}
              </div>
              <div className="text-slate-600 text-[11px]">
                Block: {facility?.block || 'Haveli'}, District: {facility?.district || 'Pune'}
              </div>
              <div className="text-slate-600 text-[11px]">
                Facility Code: {facility?.code || 'HFR-2725-CHC-0044'}
              </div>
              <div className="text-slate-700 font-medium pt-1">
                Helpdesk Phone: {facility?.contactNumber || '+91 2113 222100'}
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-gov border border-gov-border space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                <Phone className="w-4 h-4 text-gov-green-800" />
                <span>Referring Village Worker</span>
              </div>
              <div className="text-slate-700">
                {referral.referringWorkerName} ({referral.referringWorkerCadre})
              </div>
              <div className="text-slate-600 text-[11px]">
                Sub-Centre: {referral.originSubCenter}
              </div>
              <div className="text-slate-600 text-[11px]">
                Contact: {referral.referringWorkerPhone}
              </div>
              <p className="text-[11px] text-slate-500 pt-1">
                Contact your ASHA if you need village transport assistance.
              </p>
            </div>
          </div>

          {/* Patient Checklist for Hospital Visit */}
          <div className="p-4 bg-emerald-50/50 rounded-gov border border-emerald-200 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-emerald-950">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>What to Bring to the Hospital:</span>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-slate-700 text-[11px]">
              <li>✓ This CareLoop Referral Slip (or Referral Number)</li>
              <li>✓ Government Photo ID (Aadhaar or Voter ID)</li>
              <li>✓ Ayushman Bharat Health Account (ABHA) Card</li>
              <li>✓ Previous prescriptions and ANC mother-child tracking card</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Back button */}
      <div className="pt-2 flex items-center justify-between">
        <Link to={`/patient/referrals/${referral.id}`}>
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
            Back to Referral Details
          </Button>
        </Link>
        <Link to="/patient/referrals">
          <Button variant="ghost" size="sm">
            All Referrals List
          </Button>
        </Link>
      </div>
    </div>
  );
};
