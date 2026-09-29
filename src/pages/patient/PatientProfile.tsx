import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  Button, 
  FormField, 
  Input, 
  Modal 
} from '@/components/ui';
import { mockPatients } from '@/mock';
import { careLoopApi } from '@/api/client';
import { 
  ShieldCheck, 
  Edit3
} from 'lucide-react';

export const PatientProfile: React.FC = () => {
  const initialPatient = mockPatients[0]; // pat_001
  const [patientData, setPatientData] = useState(initialPatient);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Edit form fields
  const [editPhone, setEditPhone] = useState(patientData.phone || '');
  const [editRelativePhone, setEditRelativePhone] = useState(patientData.relativePhone || '');
  const [editVillage, setEditVillage] = useState(patientData.village);

  useEffect(() => {
    let isMounted = true;
    async function loadProfile() {
      try {
        const data = await careLoopApi.getPatientById('pat_001');
        if (isMounted) {
          setPatientData(data);
          setEditPhone(data.phone || '');
          setEditRelativePhone(data.relativePhone || '');
          setEditVillage(data.village);
        }
      } catch {
        // Fallback already in initial state
      }
    }
    loadProfile();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setPatientData((prev) => ({
      ...prev,
      phone: editPhone,
      relativePhone: editRelativePhone,
      village: editVillage,
    }));
    setIsEditModalOpen(false);
    alert('Profile contact information updated successfully (mock update)!');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Patient Profile & Health Account"
        subtitle="Demographic details and demonstration ABHA identifier (Mock Demonstration Data)"
        breadcrumbs={[
          { label: 'Patient Portal', href: '/patient' },
          { label: 'Profile' },
        ]}
        actions={
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Edit3 className="w-3.5 h-3.5" />}
            onClick={() => setIsEditModalOpen(true)}
          >
            Update Contact Details
          </Button>
        }
      />

      {/* ABHA National Digital Health Card */}
      <div className="p-6 bg-gov-green-900 text-white rounded-gov border border-gov-green-950 shadow-gov-card space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-300" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">
              ABHA Profile (Demonstration / Mock Data)
            </span>
          </div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-emerald-800 text-emerald-100 border border-emerald-700">
            Demonstration Record
          </span>
        </div>

        <div>
          <div className="text-xl font-bold tracking-tight">{patientData.fullName}</div>
          <div className="font-mono text-sm text-emerald-200 tracking-wider mt-1">
            {patientData.abhaId || 'ABHA Registration Pending'}
          </div>
        </div>

        <div className="p-2.5 bg-gov-green-950/70 rounded border border-gov-green-800 text-[11px] text-emerald-200">
          <strong>Demonstration Notice:</strong> ABHA information shown is simulated mock data. CareLoop is not connected to ABDM and does not retrieve live government records.
        </div>

        <div className="pt-3 border-t border-gov-green-800/80 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-emerald-200">
          <div>
            <span className="text-emerald-400 block text-[10px] uppercase">Age / Gender</span>
            <strong className="text-white">{patientData.age} Years • {patientData.gender}</strong>
          </div>
          <div>
            <span className="text-emerald-400 block text-[10px] uppercase">Blood Group</span>
            <strong className="text-white">{patientData.bloodGroup || 'Not Tested'}</strong>
          </div>
          <div>
            <span className="text-emerald-400 block text-[10px] uppercase">Village</span>
            <strong className="text-white">{patientData.village}</strong>
          </div>
          <div>
            <span className="text-emerald-400 block text-[10px] uppercase">District & State</span>
            <strong className="text-white">{patientData.district}, {patientData.state}</strong>
          </div>
        </div>
      </div>

      {/* Demographic Details Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Registered Demographic Information</CardTitle>
            <CardDescription>
              Basic identification information used by frontline health workers for referral matching.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-5 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 bg-slate-50 rounded-gov border border-gov-border space-y-1">
              <span className="text-slate-500 font-medium">Primary Contact Mobile:</span>
              <div className="font-bold text-gov-text-primary text-sm">
                {patientData.phone || 'No phone registered'}
              </div>
              <span className="text-[11px] text-slate-400">Used for referral appointment SMS notifications</span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-gov border border-gov-border space-y-1">
              <span className="text-slate-500 font-medium">Secondary / Relative Contact:</span>
              <div className="font-bold text-gov-text-primary text-sm">
                {patientData.relativePhone || 'Not provided'}
              </div>
              <span className="text-[11px] text-slate-400">Emergency backup contact</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50 rounded-gov border border-gov-border">
            <div>
              <span className="text-slate-500 block text-[11px]">Sub-District (Taluka):</span>
              <strong className="text-gov-text-primary">{patientData.subDistrict}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">District:</span>
              <strong className="text-gov-text-primary">{patientData.district}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">State:</span>
              <strong className="text-gov-text-primary">{patientData.state}</strong>
            </div>
          </div>

          {/* Privacy Notice */}
          <div className="p-3.5 bg-slate-100 rounded-gov border border-gov-border text-slate-600 text-xs flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-gov-green-800 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>Role-Governed Health Privacy (Prototype Demo):</strong> Demo view: patient access is scoped to the assigned health worker and receiving facility in this prototype.
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Contact Details Modal (Mock UI) */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Update Contact Details"
        description="Update your phone number or village residence for appointment coordination"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveProfile}>
              Save Changes
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveProfile} className="space-y-3.5">
          <FormField label="Primary Mobile Number" required helperText="Where slot confirmations are sent">
            <Input
              type="tel"
              value={editPhone}
              onChange={(e) => setEditPhone(e.target.value)}
              required
            />
          </FormField>

          <FormField label="Secondary / Relative Mobile" helperText="Family member backup">
            <Input
              type="tel"
              value={editRelativePhone}
              onChange={(e) => setEditRelativePhone(e.target.value)}
            />
          </FormField>

          <FormField label="Village / Residential Area" required>
            <Input
              type="text"
              value={editVillage}
              onChange={(e) => setEditVillage(e.target.value)}
              required
            />
          </FormField>
        </form>
      </Modal>
    </div>
  );
};
