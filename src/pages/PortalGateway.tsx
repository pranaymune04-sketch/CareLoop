import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRole } from '@/context/RoleContext';
import { UserRole } from '@/types';
import { 
  Stethoscope, 
  Building2, 
  HeartPulse, 
  Activity, 
  ArrowRight, 
  Siren, 
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { 
  Button, 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  StatusBadge, 
  FormField, 
  Input, 
  Select, 
  SearchField, 
  EmptyState, 
  LoadingState, 
  ErrorState, 
  Modal, 
  ConfirmationDialog, 
  TabsList, 
  TabsTrigger, 
  TabsContent 
} from '@/components/ui';

export const PortalGateway: React.FC = () => {
  const { setRole } = useRole();
  const navigate = useNavigate();

  // Component showcase state
  const [activeTab, setActiveTab] = useState<'components' | 'continuum'>('continuum');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectVal, setSelectVal] = useState('phc');

  const handlePortalEnter = (role: UserRole, path: string) => {
    setRole(role);
    navigate(path);
  };

  const portals = [
    {
      role: 'health_worker' as UserRole,
      title: 'Health Worker Portal',
      subtitle: 'ASHA, ANM & CHO Field Workers',
      description: 'Create normal & emergency referrals, track patient visits, detect missed slots, and perform recovery interventions.',
      path: '/health-worker',
      icon: <Stethoscope className="w-5 h-5 text-gov-green-800" />,
      badge: 'Frontline Engine',
      accentBorder: 'border-l-4 border-l-gov-green-800',
    },
    {
      role: 'facility' as UserRole,
      title: 'Health Facility Portal',
      subtitle: 'PHC, CHC, SDH & District Hospitals',
      description: 'Receive incoming referrals, confirm requested slots or propose alternatives, manage bed availability & discharge slips.',
      path: '/facility',
      icon: <Building2 className="w-5 h-5 text-sky-700" />,
      badge: 'Provider Desk',
      accentBorder: 'border-l-4 border-l-sky-700',
    },
    {
      role: 'patient' as UserRole,
      title: 'Patient & Family Portal',
      subtitle: 'Citizens & Beneficiaries',
      description: 'View referral details, confirmed appointments, facility directions, and follow-up guidance linked with ABHA ID.',
      path: '/patient',
      icon: <HeartPulse className="w-5 h-5 text-rose-700" />,
      badge: 'Citizen Access',
      accentBorder: 'border-l-4 border-l-rose-700',
    },
    {
      role: 'admin' as UserRole,
      title: 'District Administration',
      subtitle: 'DHO, CMO & Health Supervisors',
      description: 'Continuum governance, block-level referral drop-off analysis, emergency response tracking, and facility capacity audits.',
      path: '/admin',
      icon: <Activity className="w-5 h-5 text-purple-800" />,
      badge: 'Continuum Oversight',
      accentBorder: 'border-l-4 border-l-purple-800',
    },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-2">
      {/* Platform Banner */}
      <div className="bg-white rounded-gov border border-gov-border p-6 sm:p-8 shadow-gov-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-gov-green-50 border border-gov-green-200 text-gov-green-900 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-gov-green-700" />
              <span>National Healthcare Public Infrastructure — Stage 1 Frontend</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gov-text-primary tracking-tight">
              CareLoop Healthcare Coordination
            </h1>
            <p className="text-sm text-gov-text-secondary leading-relaxed">
              Bridging the gap between initial referral creation and actual care completion in rural and underserved districts.
            </p>
            <div className="pt-1 flex items-center gap-2 font-mono text-xs font-bold text-gov-green-900">
              <span className="px-2 py-0.5 bg-gov-green-100 rounded">Referral created ≠ Care completed</span>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-gov border border-gov-border/80 w-full md:w-auto shrink-0 text-xs space-y-1.5">
            <div className="font-semibold text-slate-700">Workflow Pipeline:</div>
            <div className="flex items-center gap-1 text-slate-600 font-medium">
              <span>MATCH</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span>REFER</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span>TRACK</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-red-700 font-bold">DETECT</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-amber-700 font-bold">RECOVER</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-emerald-700 font-bold">COMPLETE</span>
            </div>
          </div>
        </div>
      </div>

      {/* Role Navigation Portals */}
      <div>
        <div className="mb-4">
          <h2 className="text-base font-bold text-gov-text-primary">Select User Portal</h2>
          <p className="text-xs text-gov-text-secondary">
            Access any of the 4 locked stakeholder environments to verify routing, layout shell, and continuum flows.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {portals.map((portal) => (
            <div
              key={portal.role}
              className={`bg-white rounded-gov border border-gov-border shadow-gov-card hover:shadow-gov-md transition-shadow p-5 flex flex-col justify-between ${portal.accentBorder}`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-slate-100 rounded-gov">
                      {portal.icon}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gov-text-primary">
                        {portal.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 font-medium">{portal.subtitle}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {portal.badge}
                  </span>
                </div>
                <p className="text-xs text-gov-text-secondary mt-3 leading-relaxed">
                  {portal.description}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-gov-border/60 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-mono">Route: {portal.path}</span>
                <Button
                  variant="primary"
                  size="sm"
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                  onClick={() => handlePortalEnter(portal.role, portal.path)}
                >
                  Enter Portal
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Verification Tabs: Continuum Overview vs Component Showcase */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle>Architecture & Design System Verification</CardTitle>
              <CardDescription>
                Test live components, design tokens, responsive states, and workflow models.
              </CardDescription>
            </div>
            <TabsList>
              <TabsTrigger
                active={activeTab === 'continuum'}
                onClick={() => setActiveTab('continuum')}
              >
                Continuum Rules
              </TabsTrigger>
              <TabsTrigger
                active={activeTab === 'components'}
                onClick={() => setActiveTab('components')}
              >
                Component Library
              </TabsTrigger>
            </TabsList>
          </div>
        </CardHeader>

        <CardContent>
          {/* Tab 1: Continuum Rules */}
          <TabsContent value="continuum" activeTab={activeTab}>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-gov border border-gov-border bg-slate-50/70 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-gov-text-primary">
                    <span className="w-5 h-5 rounded-full bg-gov-green-800 text-white flex items-center justify-center text-[10px]">1</span>
                    <span>Locked Roles Only</span>
                  </div>
                  <p className="text-xs text-gov-text-secondary leading-relaxed">
                    Patient, Health Worker, Facility, Admin. Emergency is NOT a role; it is an urgent referral pathway inside the Health Worker dashboard.
                  </p>
                </div>

                <div className="p-4 rounded-gov border border-gov-border bg-slate-50/70 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-gov-text-primary">
                    <span className="w-5 h-5 rounded-full bg-gov-green-800 text-white flex items-center justify-center text-[10px]">2</span>
                    <span>Zero-Friction Emergency</span>
                  </div>
                  <p className="text-xs text-gov-text-secondary leading-relaxed">
                    Supports both registered and unregistered emergency patients. Patient login is never required prior to critical triage.
                  </p>
                </div>

                <div className="p-4 rounded-gov border border-gov-border bg-slate-50/70 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-gov-text-primary">
                    <span className="w-5 h-5 rounded-full bg-gov-green-800 text-white flex items-center justify-center text-[10px]">3</span>
                    <span>Slot Negotiation</span>
                  </div>
                  <p className="text-xs text-gov-text-secondary leading-relaxed">
                    Health worker requesting a slot does NOT equal confirmed appointment. The receiving facility confirms or proposes an alternative.
                  </p>
                </div>
              </div>

              {/* Status Badges Continuum Matrix */}
              <div className="mt-4 pt-4 border-t border-gov-border">
                <h4 className="text-xs font-bold text-gov-text-primary mb-2">
                  Care Continuum Status Matrix:
                </h4>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge status="CREATED" />
                  <StatusBadge status="MATCHED" />
                  <StatusBadge status="REFERRED" />
                  <StatusBadge status="SLOT_PROPOSED" />
                  <StatusBadge status="CONFIRMED" />
                  <StatusBadge status="TRANSIT_DISPATCHED" />
                  <StatusBadge status="ARRIVED" />
                  <StatusBadge status="GAP_DETECTED" />
                  <StatusBadge status="RECOVERED" />
                  <StatusBadge status="COMPLETED" />
                  <StatusBadge type="EMERGENCY" />
                  <StatusBadge type="NORMAL" />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Tab 2: Live Component Library Showcase */}
          <TabsContent value="components" activeTab={activeTab}>
            <div className="space-y-6">
              {/* Buttons */}
              <div>
                <h4 className="text-xs font-bold text-gov-text-primary mb-2">Button Variants:</h4>
                <div className="flex flex-wrap gap-2">
                  <Button variant="primary">Primary Green</Button>
                  <Button variant="secondary">Secondary Tint</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="emergency" leftIcon={<Siren className="w-4 h-4" />}>
                    Emergency
                  </Button>
                  <Button variant="destructive">Destructive</Button>
                  <Button variant="primary" isLoading>Loading</Button>
                </div>
              </div>

              {/* Form Controls */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField label="Search Field" helperText="Type to test live filtering">
                  <SearchField
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder="Search mock records..."
                  />
                </FormField>

                <FormField label="Standard Input" required helperText="With validation feedback">
                  <Input placeholder="e.g. ABHA ID (14 digits)" />
                </FormField>

                <FormField label="Select Dropdown" helperText="Tiered health centers">
                  <Select
                    value={selectVal}
                    onChange={(e) => setSelectVal(e.target.value)}
                    options={[
                      { value: 'sub_center', label: 'Sub-Centre' },
                      { value: 'phc', label: 'Primary Health Centre (PHC)' },
                      { value: 'chc', label: 'Community Health Centre (CHC)' },
                      { value: 'dh', label: 'District Hospital (DH)' },
                    ]}
                  />
                </FormField>
              </div>

              {/* Dialog triggers */}
              <div>
                <h4 className="text-xs font-bold text-gov-text-primary mb-2">Dialogs & Modals:</h4>
                <div className="flex gap-2.5">
                  <Button variant="outline" size="sm" onClick={() => setIsModalOpen(true)}>
                    Open Reusable Modal
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setIsConfirmOpen(true)}>
                    Open Confirmation Dialog
                  </Button>
                </div>
              </div>

              {/* Feedback States */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <LoadingState message="Testing skeleton loader..." variant="skeleton" rows={2} />
                <ErrorState
                  title="Mock Connectivity Test"
                  message="Testing error alert with recovery action button."
                  onRetry={() => alert('Retry triggered successfully')}
                />
                <EmptyState
                  title="No Pending Discharges"
                  description="All referral care loops for this shift are completed."
                />
              </div>
            </div>
          </TabsContent>
        </CardContent>
      </Card>

      {/* Modals for verification */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Reusable Modal Component"
        description="Public healthcare accessible modal with keyboard ESC handling"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Close
            </Button>
            <Button variant="primary" size="sm" onClick={() => setIsModalOpen(false)}>
              Acknowledge
            </Button>
          </>
        }
      >
        <p className="text-xs text-gov-text-secondary leading-relaxed">
          This modal demonstrates the centralized dialog structure built for CareLoop. It satisfies public healthcare accessibility requirements with visible focus states and backdrop dismissibility.
        </p>
      </Modal>

      <ConfirmationDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={() => {
          setIsConfirmOpen(false);
          alert('Action Confirmed');
        }}
        variant="warning"
        title="Confirm Emergency Routing?"
        message="Are you sure you want to pre-notify the district trauma bay? This immediately dispatches an automated triage alert."
        confirmText="Confirm & Dispatch"
      />
    </div>
  );
};
