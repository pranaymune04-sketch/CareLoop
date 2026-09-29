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
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from '@/components/ui';
import { CareLoopStore } from '@/mock';
import { Facility, FacilityService } from '@/types';
import { careLoopApi, ApiError } from '@/api/client';
import { 
  Bed, 
  Stethoscope, 
  Siren, 
  Truck, 
  Save, 
  CheckCircle2, 
  AlertCircle,
  Loader2
} from 'lucide-react';

export const FacilityCapacity: React.FC = () => {
  // Active facility: Bhor CHC (fac_chc_01)
  const initialFacility = CareLoopStore.getFacilities().find((f) => f.id === 'fac_chc_01') || CareLoopStore.getFacilities()[1];
  const [facility, setFacility] = useState<Facility>({ ...initialFacility });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Form edit state
  const [totalBeds, setTotalBeds] = useState<number>(facility.totalBeds);
  const [availableBeds, setAvailableBeds] = useState<number>(facility.availableBeds);
  const [icuBeds, setIcuBeds] = useState<number>(facility.icuBedsAvailable);
  const [emergency24x7, setEmergency24x7] = useState<boolean>(facility.emergencyAvailable24x7);
  const [ambulanceAvailable, setAmbulanceAvailable] = useState<boolean>(facility.ambulanceAvailable);
  const [services, setServices] = useState<FacilityService[]>([...facility.services]);

  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setLoading(true);
    setApiError(null);
    careLoopApi.getFacilityById('fac_chc_01')
      .then((fac) => {
        setFacility(fac);
        setTotalBeds(fac.totalBeds);
        setAvailableBeds(fac.availableBeds);
        setIcuBeds(fac.icuBedsAvailable);
        setEmergency24x7(fac.emergencyAvailable24x7);
        setAmbulanceAvailable(fac.ambulanceAvailable);
        setServices([...fac.services]);
      })
      .catch((err) => {
        const msg = err instanceof ApiError ? err.message : 'Failed to fetch facility capacity.';
        setApiError(msg);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleServiceChange = (index: number, field: keyof FacilityService, value: any) => {
    const updated = [...services];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    setServices(updated);
  };

  const handleSaveCapacity = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setApiError(null);

    const updates = {
      totalBeds: Number(totalBeds),
      availableBeds: Number(availableBeds),
      icuBedsAvailable: Number(icuBeds),
      emergencyAvailable24x7: emergency24x7,
      ambulanceAvailable: ambulanceAvailable,
      services: services,
    };

    try {
      const updated = await careLoopApi.updateFacilityCapacity(facility.id, updates);
      // Local store sync
      CareLoopStore.updateFacilityCapacity(facility.id, updates);
      setFacility({ ...updated });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 5000);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to update facility capacity.';
      setApiError(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto py-12 text-center">
        <Loader2 className="w-8 h-8 text-gov-green-700 animate-spin mx-auto" />
        <p className="text-xs text-slate-500">Loading facility capacity configuration from backend API...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <PageHeader
        title="Facility Capacity Management"
        subtitle={`Configure live bed readiness, availability roster, and operational capacity for ${facility.name}`}
        breadcrumbs={[
          { label: 'Facility Portal', href: '/facility' },
          { label: 'Capacity & Rostering' },
        ]}
      />

      {/* Demo Prototype Notice */}
      <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-gov text-xs text-amber-950 flex items-start gap-2.5 shadow-gov-sm">
        <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong>Backend Capacity Integration Notice:</strong> Capacity and rostering updates are transmitted directly to the CareLoop Express backend.
          Changes update parameters consumed by CareLoop Smart Facility Matching.
        </div>
      </div>

      {apiError && (
        <div className="p-3.5 bg-red-50 border border-red-300 rounded-gov text-xs text-red-950 flex items-center gap-2 shadow-gov-sm animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-red-700 shrink-0" />
          <span>{apiError}</span>
        </div>
      )}

      {savedSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-gov text-xs text-emerald-950 flex items-center gap-2 shadow-gov-sm animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>Facility capacity configuration successfully updated on CareLoop backend!</span>
        </div>
      )}

      <form onSubmit={handleSaveCapacity} className="space-y-6">
        {/* Metric Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2.5 bg-emerald-50 rounded-gov text-emerald-800">
                <Bed className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl font-bold text-gov-text-primary">
                  {availableBeds} / {totalBeds}
                </div>
                <p className="text-xs text-slate-500">General Ward Available Beds</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2.5 bg-purple-50 rounded-gov text-purple-800">
                <Bed className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl font-bold text-purple-900">
                  {icuBeds} Beds
                </div>
                <p className="text-xs text-slate-500">ICU / Emergency Critical Care</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2.5 bg-sky-50 rounded-gov text-sky-800">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl font-bold text-sky-900">
                  {services.filter((s) => s.specialistAvailable).length} Active
                </div>
                <p className="text-xs text-slate-500">Specialist OPDs on Duty</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Edit Bed Counts & Emergency Readiness */}
        <Card className="shadow-gov-card">
          <CardHeader className="bg-slate-50 border-b border-gov-border/60">
            <CardTitle className="text-sm">1. Bed Capacity & Emergency Readiness (Demo Values)</CardTitle>
            <CardDescription className="text-xs">
              Configure current ward vacancies used by referring health workers during Smart Facility Matching.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-5 space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField label="Total Approved Beds" required>
                <Input
                  type="number"
                  value={totalBeds}
                  onChange={(e) => setTotalBeds(Number(e.target.value))}
                  min={1}
                  required
                />
              </FormField>

              <FormField label="Currently Available Beds" required>
                <Input
                  type="number"
                  value={availableBeds}
                  onChange={(e) => setAvailableBeds(Number(e.target.value))}
                  min={0}
                  max={totalBeds}
                  required
                />
              </FormField>

              <FormField label="ICU / HDU Beds Available" required>
                <Input
                  type="number"
                  value={icuBeds}
                  onChange={(e) => setIcuBeds(Number(e.target.value))}
                  min={0}
                  required
                />
              </FormField>
            </div>

            <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 rounded border border-gov-border flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <Siren className="w-4 h-4 text-red-600" />
                    24x7 Casualty & Emergency Care
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Accepts critical emergency triage referrals from field workers
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={emergency24x7}
                  onChange={(e) => setEmergency24x7(e.target.checked)}
                  className="rounded border-gov-border text-gov-green-700 focus:ring-gov-green-600 h-4 w-4"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded border border-gov-border flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-emerald-700" />
                    Ambulance Support (Demo Info)
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Simulated facility transport readiness indicator
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={ambulanceAvailable}
                  onChange={(e) => setAmbulanceAvailable(e.target.checked)}
                  className="rounded border-gov-border text-gov-green-700 focus:ring-gov-green-600 h-4 w-4"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Department Queue & Duty Rostering Table */}
        <Card className="shadow-gov-card">
          <CardHeader className="bg-slate-50 border-b border-gov-border/60">
            <CardTitle className="text-sm">2. Department Demo Roster & Queue Estimates (Mock Availability)</CardTitle>
            <CardDescription className="text-xs">
              Duty doctors and queue waiting time estimates shown to health workers when matching referrals.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Clinical Department</TableHead>
                  <TableHead>Doctor on Duty</TableHead>
                  <TableHead>Specialist Active</TableHead>
                  <TableHead>Queue (Patients)</TableHead>
                  <TableHead>Est. Wait (Mins)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.map((svc, idx) => (
                  <TableRow key={svc.id}>
                    <TableCell className="font-semibold text-xs text-gov-text-primary">
                      {svc.name}
                    </TableCell>

                    <TableCell>
                      <Input
                        type="text"
                        value={svc.activeDoctorName || ''}
                        onChange={(e) => handleServiceChange(idx, 'activeDoctorName', e.target.value)}
                        placeholder="e.g. Dr. Anita Joshi"
                        className="py-1 px-2 text-xs h-7"
                      />
                    </TableCell>

                    <TableCell>
                      <label className="inline-flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={svc.specialistAvailable}
                          onChange={(e) => handleServiceChange(idx, 'specialistAvailable', e.target.checked)}
                          className="rounded border-gov-border text-gov-green-700 focus:ring-gov-green-600 h-3.5 w-3.5"
                        />
                        <span className="text-xs font-medium text-slate-700">
                          {svc.specialistAvailable ? 'Specialist' : 'Medical Officer'}
                        </span>
                      </label>
                    </TableCell>

                    <TableCell>
                      <Input
                        type="number"
                        value={svc.currentQueueLength}
                        onChange={(e) => handleServiceChange(idx, 'currentQueueLength', Number(e.target.value))}
                        min={0}
                        className="py-1 px-2 text-xs h-7 w-20"
                      />
                    </TableCell>

                    <TableCell>
                      <Input
                        type="number"
                        value={svc.estimatedWaitMinutes}
                        onChange={(e) => handleServiceChange(idx, 'estimatedWaitMinutes', Number(e.target.value))}
                        min={0}
                        className="py-1 px-2 text-xs h-7 w-20"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>

          <div className="p-4 bg-slate-50 border-t border-gov-border flex items-center justify-between">
            <span className="text-[11px] text-slate-500">
              Changes update CareLoop Smart Facility Match algorithm parameters on the backend.
            </span>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={saving}
              leftIcon={saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            >
              {saving ? 'Saving...' : 'Save Capacity Settings'}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
};
