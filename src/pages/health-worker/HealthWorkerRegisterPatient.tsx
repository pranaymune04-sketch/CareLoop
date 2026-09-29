import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { PageHeader } from '@/components/layout';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter,
  Button, 
  FormField, 
  Input 
} from '@/components/ui';
import { CareLoopStore, mockHealthWorker } from '@/mock';
import { Gender } from '@/types';
import { UserPlus, ArrowLeft, ShieldCheck, AlertCircle } from 'lucide-react';

export const HealthWorkerRegisterPatient: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const initialName = searchParams.get('name') || '';

  const [fullName, setFullName] = useState(initialName);
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<Gender>('female');
  const [phone, setPhone] = useState('');
  const [relativePhone, setRelativePhone] = useState('');
  const [village, setVillage] = useState(mockHealthWorker.assignedVillage);
  const [subDistrict, setSubDistrict] = useState('Haveli');
  const [district, setDistrict] = useState(mockHealthWorker.district);
  const state = mockHealthWorker.state;
  const [bloodGroup, setBloodGroup] = useState('B+');
  const [preExistingConditions, setPreExistingConditions] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) {
      setError('Patient Full Name is required.');
      return;
    }
    const ageNum = parseInt(age, 10);
    if (isNaN(ageNum) || ageNum <= 0 || ageNum > 120) {
      setError('Please enter a valid age in years.');
      return;
    }
    if (!village.trim()) {
      setError('Village name is required.');
      return;
    }

    setIsSubmitting(true);

    const conditionsArray = preExistingConditions
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const newPatient = CareLoopStore.registerPatient({
      fullName: fullName.trim(),
      age: ageNum,
      gender,
      phone: phone.trim() || undefined,
      relativePhone: relativePhone.trim() || undefined,
      village: village.trim(),
      subDistrict: subDistrict.trim(),
      district: district.trim(),
      state: state.trim(),
      bloodGroup: bloodGroup || undefined,
      preExistingConditions: conditionsArray.length > 0 ? conditionsArray : undefined,
      registrationStatus: 'registered',
      abhaId: `91-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
    });

    setIsSubmitting(false);
    // Route to new patient's profile
    navigate(`/health-worker/patients/${newPatient.id}`);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <PageHeader
        title="Register New Village Citizen"
        subtitle={`Register citizen profile under Sub-Centre: ${mockHealthWorker.assignedSubCenter} (${mockHealthWorker.assignedVillage})`}
        breadcrumbs={[
          { label: 'Health Worker', href: '/health-worker' },
          { label: 'Village Patients', href: '/health-worker/patients' },
          { label: 'Register Patient' },
        ]}
      />

      {/* Guidance Notice */}
      <div className="p-3.5 bg-gov-green-50 border border-gov-green-200 rounded-gov text-xs text-gov-green-950 flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-gov-green-700 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong>Field Registration Principle:</strong> Only collect essential identification information required for referral coordination and contact follow-up. Do not administer invasive or non-relevant medical surveys.
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="shadow-gov-card">
          <CardHeader>
            <CardTitle>Citizen Demographic Details</CardTitle>
            <CardDescription>
              Fields marked with an asterisk (<span className="text-red-600">*</span>) are mandatory.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-5 space-y-4 text-xs">
            {error && (
              <div className="p-3 bg-red-50 border border-red-300 rounded text-red-900 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Full Name" required helperText="As known in village / ration card">
                <Input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Sunanda Mahadev Rao"
                  required
                />
              </FormField>

              <div className="grid grid-cols-2 gap-2">
                <FormField label="Age (Years)" required>
                  <Input
                    type="number"
                    min="0"
                    max="120"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="e.g. 32"
                    required
                  />
                </FormField>

                <FormField label="Gender" required>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as Gender)}
                    className="w-full px-3 py-2 text-xs border border-gov-border rounded-gov bg-white focus:outline-none focus:ring-1 focus:ring-gov-green-700"
                  >
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="other">Other</option>
                  </select>
                </FormField>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Primary Contact Mobile" helperText="Where appointment SMS updates will be queued">
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98XXX XXXXX"
                />
              </FormField>

              <FormField label="Family / Relative Mobile" helperText="Secondary backup contact">
                <Input
                  type="tel"
                  value={relativePhone}
                  onChange={(e) => setRelativePhone(e.target.value)}
                  placeholder="+91 98XXX XXXXX"
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50 rounded border border-gov-border">
              <FormField label="Village / Habitation" required>
                <Input
                  type="text"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  required
                />
              </FormField>

              <FormField label="Block / Sub-District" required>
                <Input
                  type="text"
                  value={subDistrict}
                  onChange={(e) => setSubDistrict(e.target.value)}
                  required
                />
              </FormField>

              <FormField label="District" required>
                <Input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  required
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Blood Group (Optional)">
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gov-border rounded-gov bg-white focus:outline-none focus:ring-1 focus:ring-gov-green-700"
                >
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="">Unknown / Not Tested</option>
                </select>
              </FormField>

              <FormField label="Pre-existing Conditions / Notes (Optional)" helperText="Comma-separated (e.g. Hypertension, Week 28 ANC)">
                <Input
                  type="text"
                  value={preExistingConditions}
                  onChange={(e) => setPreExistingConditions(e.target.value)}
                  placeholder="e.g. High Blood Pressure, Asthma"
                />
              </FormField>
            </div>
          </CardContent>

          <CardFooter className="bg-slate-50 border-t border-gov-border flex items-center justify-between">
            <Link to="/health-worker/patients">
              <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              leftIcon={<UserPlus className="w-3.5 h-3.5" />}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Registering...' : 'Save & Open Patient Profile'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
};
