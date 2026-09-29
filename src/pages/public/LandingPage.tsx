import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { 
  Shield, 
  ArrowRight, 
  CheckCircle2, 
  Stethoscope, 
  Building2, 
  Activity, 
  HeartPulse, 
  Siren, 
  FileCheck2, 
  Compass, 
  RefreshCw
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const workflowStages = [
    {
      step: '01',
      title: 'MATCH',
      summary: 'Finds optimal facilities based on clinical capability, available beds, on-duty specialists, and distance.',
    },
    {
      step: '02',
      title: 'REFER',
      summary: 'Health worker drafts structured clinical referral and requests an appointment time slot.',
    },
    {
      step: '03',
      title: 'TRACK',
      summary: 'Target facility confirms or counter-proposes a slot. System monitors patient transit and check-in.',
    },
    {
      step: '04',
      title: 'DETECT',
      summary: 'Automated gap alerts trigger when a patient misses a confirmed consultation window or fails to arrive.',
    },
    {
      step: '05',
      title: 'RECOVER',
      summary: 'Frontline ASHA/ANM workers receive timely recovery tasks to follow up with the family and reroute if needed.',
    },
    {
      step: '06',
      title: 'COMPLETE',
      summary: 'Consultation and clinical care delivered; discharge notes registered. Continuum loop successfully closed.',
    },
  ];

  return (
    <div className="space-y-12 sm:space-y-16 py-6 sm:py-10">
      {/* 1. HERO SECTION */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-gov border border-gov-border p-6 sm:p-10 shadow-gov-card">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-gov-green-50 border border-gov-green-200 text-gov-green-900 text-xs font-semibold">
              <Shield className="w-4 h-4 text-gov-green-700" />
              <span>Public Healthcare Coordination Platform</span>
            </div>

            <div className="space-y-1.5">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gov-text-primary tracking-tight leading-tight">
                From Referral Creation to Care Completion
              </h1>
              <p className="text-sm sm:text-base font-semibold text-gov-green-800">
                "Referral created ≠ Care completed"
              </p>
            </div>

            <p className="text-xs sm:text-sm text-gov-text-secondary leading-relaxed max-w-2xl">
              CareLoop helps community healthcare workers coordinate referrals, track patient visits, detect stalled care, and support timely rerouting when a referral cannot proceed.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link to="/signup">
                <Button variant="primary" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Get Started
                </Button>
              </Link>
              <a href="#how-it-works">
                <Button variant="outline" size="md">
                  How CareLoop Works
                </Button>
              </a>
              <Link to="/login">
                <Button variant="ghost" size="md">
                  Portal Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. HOW CARELOOP WORKS (CONTINUUM WORKFLOW) */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-4 sm:px-6 scroll-mt-20">
        <div className="mb-6 space-y-1">
          <div className="text-xs font-bold uppercase tracking-wider text-gov-green-800">
            Care Continuum Architecture
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gov-text-primary tracking-tight">
            How CareLoop Works
          </h2>
          <p className="text-xs sm:text-sm text-gov-text-secondary max-w-2xl leading-relaxed">
            In public healthcare, a paper slip does not guarantee patient arrival. CareLoop follows through every stage of the patient journey until actual care is delivered.
          </p>
        </div>

        {/* 6 Stage Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {workflowStages.map((stg) => (
            <div
              key={stg.step}
              className="p-4 bg-white rounded-gov border border-gov-border shadow-gov-sm flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-400">
                    {stg.step}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-gov-green-50 text-gov-green-900 border border-gov-green-200">
                    {stg.title}
                  </span>
                </div>
                <p className="text-xs text-gov-text-secondary leading-relaxed">
                  {stg.summary}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Core Principle Callout */}
        <div className="mt-4 p-3.5 bg-gov-green-50 rounded-gov border border-gov-green-200 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-2 text-gov-green-950 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-gov-green-700 shrink-0" />
            <span>Operational Metric: <strong>Success = Care Completed</strong></span>
          </div>
          <span className="text-[11px] text-gov-green-800 font-medium">
            Closing the loop from village sub-centre to tertiary hospital
          </span>
        </div>
      </section>

      {/* 3. THREE CORE USP SECTIONS */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="mb-6 space-y-1">
          <div className="text-xs font-bold uppercase tracking-wider text-gov-green-800">
            Core Platform Capabilities
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gov-text-primary tracking-tight">
            Designed for Practical Healthcare Delivery
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* USP 1: Smart Facility Matching */}
          <Card className="flex flex-col justify-between">
            <CardHeader className="space-y-2">
              <div className="w-8 h-8 rounded-gov bg-sky-50 text-sky-800 flex items-center justify-center">
                <Compass className="w-4 h-4" />
              </div>
              <CardTitle className="text-sm">1. Smart Facility Matching</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-gov-text-secondary leading-relaxed">
              <p>
                Matches required clinical needs with appropriate public health facilities using objective readiness signals:
              </p>
              <ul className="space-y-1 text-[11px] text-slate-700 bg-slate-50 p-2.5 rounded border border-gov-border">
                <li>• <strong>Capability:</strong> Specialist clinical services required</li>
                <li>• <strong>Availability:</strong> Active general & ICU beds</li>
                <li>• <strong>Readiness:</strong> On-duty medical officer rosters</li>
                <li>• <strong>24/7 Support:</strong> Round-the-clock emergency triage</li>
                <li>• <strong>Ambulance:</strong> Transport readiness & EMS access</li>
                <li>• <strong>Geographic Suitability:</strong> Proximity to village</li>
              </ul>
            </CardContent>
          </Card>

          {/* USP 2: Referral Closure Engine */}
          <Card className="flex flex-col justify-between">
            <CardHeader className="space-y-2">
              <div className="w-8 h-8 rounded-gov bg-emerald-50 text-emerald-800 flex items-center justify-center">
                <FileCheck2 className="w-4 h-4" />
              </div>
              <CardTitle className="text-sm">2. Referral Closure Engine</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-gov-text-secondary leading-relaxed">
              <p>
                Continuously tracks the referral lifecycle beyond initial generation to verify that scheduled care actually takes place:
              </p>
              <div className="space-y-1.5 p-2.5 bg-slate-50 rounded border border-gov-border font-mono text-[11px]">
                <div className="flex items-center gap-1 text-slate-600">
                  <span className="font-semibold text-slate-800">Created:</span> Drafted by ASHA/ANM
                </div>
                <div className="flex items-center gap-1 text-slate-600">
                  <span className="font-semibold text-slate-800">Accepted:</span> Facility confirms slot
                </div>
                <div className="flex items-center gap-1 text-slate-600">
                  <span className="font-semibold text-slate-800">In Progress:</span> Checked in at hospital
                </div>
                <div className="flex items-center gap-1 text-emerald-800 font-semibold">
                  <span>Completed:</span> Clinical care delivered
                </div>
              </div>
            </CardContent>
          </Card>

          {/* USP 3: Exception Recovery */}
          <Card className="flex flex-col justify-between">
            <CardHeader className="space-y-2">
              <div className="w-8 h-8 rounded-gov bg-amber-50 text-amber-800 flex items-center justify-center">
                <RefreshCw className="w-4 h-4" />
              </div>
              <CardTitle className="text-sm">3. Exception Recovery</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-gov-text-secondary leading-relaxed">
              <p>
                When a patient cannot travel, misses their appointment, or the target facility is overloaded, CareLoop provides recovery mechanisms:
              </p>
              <div className="space-y-1.5 p-2.5 bg-amber-50/70 rounded border border-amber-200 text-[11px] text-amber-950">
                <div><strong>Detect:</strong> Identifies expired appointment window</div>
                <div><strong>Find Alternative:</strong> Identifies next available facility</div>
                <div><strong>Reroute:</strong> Updates patient & worker with new slot</div>
                <div><strong>Continue Care:</strong> Closes the gap without dropping out</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 4. ROLE ENTRY SECTION (THE 4 LOCKED USERS) */}
      <section id="roles" className="max-w-6xl mx-auto px-4 sm:px-6 scroll-mt-20">
        <div className="mb-6 space-y-1">
          <div className="text-xs font-bold uppercase tracking-wider text-gov-green-800">
            Stakeholder Roles
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gov-text-primary tracking-tight">
            Role-Based Coordination
          </h2>
          <p className="text-xs sm:text-sm text-gov-text-secondary leading-relaxed">
            CareLoop is built around four specific user roles. Each role has focused permissions and tools designed for its operational responsibilities.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Patient */}
          <div id="for-patients" className="p-5 bg-white rounded-gov border border-gov-border shadow-gov-sm flex flex-col justify-between scroll-mt-20">
            <div className="space-y-3">
              <div className="w-8 h-8 rounded-gov bg-slate-100 flex items-center justify-center text-gov-green-800">
                <HeartPulse className="w-4 h-4 text-gov-green-800" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gov-text-primary">Patient</h3>
                <p className="text-[11px] text-slate-500 font-medium">Citizen & Family</p>
              </div>
              <p className="text-xs text-gov-text-secondary leading-relaxed">
                View referrals, consultation windows, facility directions, notifications, and previous health records.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-gov-border/60">
              <Link to="/login?role=patient">
                <Button variant="outline" size="sm" className="w-full justify-center">
                  Patient Sign In
                </Button>
              </Link>
            </div>
          </div>

          {/* 2. Health Worker */}
          <div id="for-health-workers" className="p-5 bg-white rounded-gov border border-gov-border shadow-gov-sm flex flex-col justify-between scroll-mt-20">
            <div className="space-y-3">
              <div className="w-8 h-8 rounded-gov bg-slate-100 flex items-center justify-center text-gov-green-800">
                <Stethoscope className="w-4 h-4 text-gov-green-800" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gov-text-primary">Health Worker</h3>
                <p className="text-[11px] text-slate-500 font-medium">ASHA, ANM, CHO</p>
              </div>
              <p className="text-xs text-gov-text-secondary leading-relaxed">
                Register village patients, draft normal & emergency referrals, request slots, track journeys, and handle recovery cases.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-gov-border/60">
              <Link to="/login?role=health_worker">
                <Button variant="outline" size="sm" className="w-full justify-center">
                  Worker Sign In
                </Button>
              </Link>
            </div>
          </div>

          {/* 3. Facility */}
          <div id="for-facilities" className="p-5 bg-white rounded-gov border border-gov-border shadow-gov-sm flex flex-col justify-between scroll-mt-20">
            <div className="space-y-3">
              <div className="w-8 h-8 rounded-gov bg-slate-100 flex items-center justify-center text-sky-800">
                <Building2 className="w-4 h-4 text-sky-800" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gov-text-primary">Facility</h3>
                <p className="text-[11px] text-slate-500 font-medium">PHC, CHC, SDH, DH</p>
              </div>
              <p className="text-xs text-gov-text-secondary leading-relaxed">
                Review incoming referrals, confirm or propose appointment slots, update care progress, and complete referrals.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-gov-border/60">
              <Link to="/login?role=facility">
                <Button variant="outline" size="sm" className="w-full justify-center">
                  Facility Sign In
                </Button>
              </Link>
            </div>
          </div>

          {/* 4. Admin */}
          <div className="p-5 bg-white rounded-gov border border-gov-border shadow-gov-sm flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-8 h-8 rounded-gov bg-slate-100 flex items-center justify-center text-purple-800">
                <Activity className="w-4 h-4 text-purple-800" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gov-text-primary">Admin</h3>
                <p className="text-[11px] text-slate-500 font-medium">District Health Office</p>
              </div>
              <p className="text-xs text-gov-text-secondary leading-relaxed">
                Monitor users, facility network capacity, referral completion rates, and system-wide continuum audit logs.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-gov-border/60">
              <Link to="/login?role=admin">
                <Button variant="outline" size="sm" className="w-full justify-center">
                  Admin Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. EMERGENCY INFORMATION (CLEAR PATHWAY NOT A ROLE) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="p-5 sm:p-6 bg-red-50/80 rounded-gov border border-red-200">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-red-100 text-red-900 border border-red-300 text-[11px] font-bold uppercase tracking-wider">
                <Siren className="w-3.5 h-3.5 text-red-700 animate-pulse" />
                <span>Emergency Referral Pathway</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-red-950">
                Emergency is a Referral Type, Not a Separate Portal
              </h3>
              <p className="text-xs text-red-900 leading-relaxed">
                Emergency cases (trauma, acute obstetric emergencies, severe pediatric distress) are handled directly within the <strong>Health Worker Dashboard</strong>. Prior citizen registration or login is <strong>not required</strong> to initiate emergency referral triage.
              </p>

              {/* Informational Continuum Flow */}
              <div className="pt-2 text-[11px] text-red-950 font-medium leading-relaxed">
                <span className="font-bold">Pathway:</span> Health Worker → Create Referral → Emergency Referral → Existing Patient / Patient Not Registered → Facility Matching → Refer → Track → Recover → Complete
              </div>
              <p className="text-[10px] text-red-800">
                * CareLoop coordinates referral records and facility alerts; physical emergency ambulance dispatch continues via national emergency services (108).
              </p>
            </div>

            <div className="shrink-0 self-stretch sm:self-auto flex items-center justify-center">
              <Link to="/login?role=health_worker">
                <Button variant="emergency" size="sm" leftIcon={<Siren className="w-3.5 h-3.5" />}>
                  Access Worker Emergency Desk
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. TRUST & SAFETY SECTION */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="p-6 bg-white rounded-gov border border-gov-border shadow-gov-card space-y-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-gov-green-800" />
            <h3 className="text-base font-bold text-gov-text-primary">
              Platform Integrity & Responsible Design
            </h3>
          </div>
          <p className="text-xs text-gov-text-secondary leading-relaxed max-w-3xl">
            CareLoop is built specifically around the realities of rural and underserved public health delivery. The platform is designed around:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1 text-xs">
            <div className="p-3 bg-slate-50 rounded-gov border border-gov-border">
              <strong className="text-gov-text-primary block mb-0.5">Referral Tracking</strong>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Every referral has a structured audit record from origin sub-centre to final hospital consultation.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-gov border border-gov-border">
              <strong className="text-gov-text-primary block mb-0.5">Role-Based Workflows</strong>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Access is segmented strictly across patients, frontline workers, facility triage teams, and district admin.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-gov border border-gov-border">
              <strong className="text-gov-text-primary block mb-0.5">Structured Information</strong>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Referral records standardize chief complaints, provisional diagnoses, and transport requirements.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
