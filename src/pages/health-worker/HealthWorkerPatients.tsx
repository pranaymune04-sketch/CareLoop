import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/layout';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  SearchField, 
  Button, 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell
} from '@/components/ui';
import { mockHealthWorker } from '@/mock';
import { careLoopApi, ApiError } from '@/api/client';
import { Patient, Referral } from '@/types';
import { FilePlus2, User, UserPlus, CheckCircle2, AlertCircle } from 'lucide-react';

export const HealthWorkerPatients: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setLoading(true);
        const [patList, refList] = await Promise.all([
          careLoopApi.getPatients(),
          careLoopApi.getReferrals(),
        ]);
        if (isMounted) {
          setPatients(patList);
          setReferrals(refList);
          setError(null);
        }
      } catch (err: unknown) {
        if (isMounted) {
          const msg = err instanceof ApiError ? err.message : 'Failed to retrieve patient registry from server.';
          setError(msg);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const assignedPatients = patients;
  const allReferrals = referrals;

  const filtered = assignedPatients.filter((p) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return (
      p.fullName.toLowerCase().includes(term) ||
      (p.abhaId && p.abhaId.toLowerCase().includes(term)) ||
      (p.id && p.id.toLowerCase().includes(term)) ||
      (p.phone && p.phone.includes(term)) ||
      p.village.toLowerCase().includes(term)
    );
  });

  const hasSearch = searchTerm.trim().length > 0;
  const isExistingFound = hasSearch && filtered.length > 0;
  const isNotFound = hasSearch && filtered.length === 0;

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-12 text-center text-sm text-gov-text-secondary">
        Loading village patient registry from server...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-gov text-sm">
          {error}
        </div>
      )}
      <PageHeader
        title="Village Patient Registry"
        subtitle={`Assigned Sub-Centre: ${mockHealthWorker.assignedSubCenter} (${mockHealthWorker.assignedVillage}, ${mockHealthWorker.district})`}
        breadcrumbs={[
          { label: 'Health Worker Portal', href: '/health-worker' },
          { label: 'Village Patients' },
        ]}
        actions={
          <Link to="/health-worker/patients/register">
            <Button variant="primary" size="sm" leftIcon={<UserPlus className="w-4 h-4" />}>
              + Register New Patient
            </Button>
          </Link>
        }
      />

      {/* Search-Before-Register Guidance Card */}
      <Card className="border-gov-green-200 bg-gov-green-50/40">
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className="text-xs font-bold text-gov-green-950 uppercase tracking-wide">
                Search Patient Before Registering
              </h4>
              <p className="text-xs text-slate-600 mt-0.5">
                Check whether the patient already has an active record in your sub-centre jurisdiction before initiating duplicate registration.
              </p>
            </div>
            <span className="text-[11px] text-gov-green-900 bg-gov-green-100 px-2.5 py-1 rounded font-medium shrink-0">
              Role: {mockHealthWorker.cadre} (Jurisdiction: {mockHealthWorker.assignedVillage})
            </span>
          </div>

          <SearchField
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search by Patient Name, ID/ABHA, Mobile number or village..."
            className="w-full bg-white"
          />

          {/* Existing Patient Found Feedback Banner */}
          {isExistingFound && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded text-xs text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>
                  <strong>Existing patient record found:</strong> Found {filtered.length} registered patient(s) matching "{searchTerm}". Please open the profile or initiate referral rather than re-registering.
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/health-worker/patients/${filtered[0].id}`)}
                >
                  Open Patient
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate(`/health-worker/create-referral/normal?patientId=${filtered[0].id}`)}
                >
                  Create Referral
                </Button>
              </div>
            </div>
          )}

          {/* No Matching Patient Found Feedback Banner */}
          {isNotFound && (
            <div className="p-3 bg-amber-50 border border-amber-300 rounded text-xs text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                <span>
                  <strong>No matching patient found</strong> in your assigned village registry for "{searchTerm}". You may register this citizen as a new patient.
                </span>
              </div>
              <Link to={`/health-worker/patients/register?name=${encodeURIComponent(searchTerm)}`}>
                <Button variant="primary" size="sm" leftIcon={<UserPlus className="w-3.5 h-3.5" />}>
                  Register New Patient
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Patient Registry Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Assigned Village Patients</CardTitle>
              <CardDescription>
                Demo view: patient access is scoped to the assigned health worker ({mockHealthWorker.assignedSubCenter}).
              </CardDescription>
            </div>
            <span className="text-xs text-slate-500 font-semibold">
              Showing {filtered.length} of {assignedPatients.length}
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient Name</TableHead>
                <TableHead>Identifier / ABHA</TableHead>
                <TableHead>Age / Gender</TableHead>
                <TableHead>Village / District</TableHead>
                <TableHead>Active Referrals</TableHead>
                <TableHead>Last Care Record</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((patient) => {
                const patientRefs = allReferrals.filter((r) => r.patientId === patient.id);
                const activeCount = patientRefs.filter((r) => r.status !== 'COMPLETED' && r.status !== 'CANCELLED').length;
                const lastRef = patientRefs[0];

                return (
                  <TableRow key={patient.id}>
                    <TableCell>
                      <div className="font-semibold text-gov-text-primary">{patient.fullName}</div>
                      <div className="text-[11px] text-slate-500">
                        {patient.phone ? `Phone: ${patient.phone}` : 'No direct mobile registered'}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-[11px] text-slate-600">
                      {patient.abhaId || <span className="text-slate-400">ID: {patient.id}</span>}
                    </TableCell>
                    <TableCell>
                      {patient.age} yrs • {patient.gender}
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-slate-800">{patient.village}</span>
                      <span className="text-[11px] text-slate-500 block">{patient.district}</span>
                    </TableCell>
                    <TableCell>
                      {activeCount > 0 ? (
                        <span className="px-2 py-0.5 rounded bg-gov-green-100 text-gov-green-900 font-bold text-[11px] border border-gov-green-200">
                          {activeCount} Active
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">None</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {lastRef ? (
                        <div className="text-[11px]">
                          <span className="text-slate-700 font-medium block truncate max-w-[140px]">
                            {lastRef.targetFacilityName}
                          </span>
                          <span className="text-slate-500">
                            {new Date(lastRef.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px]">No history</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/health-worker/patients/${patient.id}`}>
                          <Button variant="ghost" size="sm" leftIcon={<User className="w-3.5 h-3.5" />}>
                            Open Patient
                          </Button>
                        </Link>
                        <Link to={`/health-worker/create-referral/normal?patientId=${patient.id}`}>
                          <Button variant="outline" size="sm" leftIcon={<FilePlus2 className="w-3.5 h-3.5" />}>
                            Refer
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
