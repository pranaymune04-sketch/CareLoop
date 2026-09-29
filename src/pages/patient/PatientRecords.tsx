import React from 'react';
import { PageHeader } from '@/components/layout';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from '@/components/ui';
import { mockPatients } from '@/mock';
import { ShieldCheck } from 'lucide-react';

export const PatientRecords: React.FC = () => {
  const patient = mockPatients[0];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Ayushman Bharat Health Account (ABHA) - Demonstration"
        subtitle="Simulated patient identification for platform demonstration (Mock Data — Not connected to live ABDM)"
        breadcrumbs={[
          { label: 'Patient Portal', href: '/patient' },
          { label: 'Health Records' },
        ]}
      />

      {/* ABHA Card */}
      <div className="p-5 bg-gov-green-900 text-white rounded-gov border border-gov-green-950 shadow-gov-card space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
              ABHA Profile (Demonstration / Mock Data)
            </span>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-800 text-emerald-100">
            Mock Record
          </span>
        </div>
        <div className="p-2 bg-gov-green-950/70 rounded text-[11px] text-emerald-200">
          Notice: This profile is a mock representation. CareLoop is not connected to ABDM and does not access live government health records.
        </div>
        <div>
          <div className="text-lg font-bold">{patient.fullName}</div>
          <div className="font-mono text-sm text-emerald-200 tracking-wider mt-0.5">
            {patient.abhaId}
          </div>
        </div>
        <div className="pt-2 border-t border-gov-green-800 flex flex-wrap justify-between text-xs text-emerald-200">
          <div>DOB/Age: {patient.age} yrs • Gender: {patient.gender}</div>
          <div>District: {patient.district}, {patient.state}</div>
        </div>
      </div>

      {/* Vitals History */}
      <Card>
        <CardHeader>
          <CardTitle>Field Vitals Recorded by ASHA Worker</CardTitle>
          <CardDescription>
            Last measured: {patient.latestVitals ? new Date(patient.latestVitals.recordedAt).toLocaleDateString() : 'N/A'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 bg-slate-50 rounded-gov border border-gov-border">
              <span className="text-[11px] text-slate-500 font-medium">Blood Pressure</span>
              <div className="text-base font-bold text-gov-text-primary mt-1">
                {patient.latestVitals?.bpSystolic}/{patient.latestVitals?.bpDiastolic} <span className="text-[10px] font-normal">mmHg</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-gov border border-gov-border">
              <span className="text-[11px] text-slate-500 font-medium">Pulse Rate</span>
              <div className="text-base font-bold text-gov-text-primary mt-1">
                {patient.latestVitals?.pulseRate} <span className="text-[10px] font-normal">bpm</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-gov border border-gov-border">
              <span className="text-[11px] text-slate-500 font-medium">Blood Oxygen (SpO2)</span>
              <div className="text-base font-bold text-emerald-700 mt-1">
                {patient.latestVitals?.spO2}%
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-gov border border-gov-border">
              <span className="text-[11px] text-slate-500 font-medium">Temperature</span>
              <div className="text-base font-bold text-gov-text-primary mt-1">
                {patient.latestVitals?.temperature}°F
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
