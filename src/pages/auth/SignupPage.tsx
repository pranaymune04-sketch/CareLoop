import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRole } from '@/context/RoleContext';
import { 
  Button, 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter,
  FormField, 
  Input, 
  Select 
} from '@/components/ui';
import { Shield, HeartPulse, ArrowRight } from 'lucide-react';

export const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { setRole } = useRole();

  // Basic demographic fields only (no intrusive medical fields during basic signup)
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('female');
  const [village, setVillage] = useState('');
  const [district, setDistrict] = useState('Pune');
  const [state, setState] = useState('Maharashtra');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) {
      alert('Please agree to the CareLoop terms to register.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setRole('patient');
      setIsLoading(false);
      alert('Patient account registered successfully! Redirecting to Patient Portal...');
      navigate('/patient');
    }, 400);
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8 sm:py-12">
      <div className="text-center mb-6 space-y-1">
        <div className="inline-flex items-center gap-2 p-1 px-2.5 rounded bg-gov-green-50 border border-gov-green-200 text-gov-green-900 text-[11px] font-semibold">
          <Shield className="w-3.5 h-3.5 text-gov-green-700" />
          <span>Patient Registration • Public Healthcare Access</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-gov-text-primary">
          Register for CareLoop
        </h1>
        <p className="text-xs text-gov-text-secondary max-w-sm mx-auto">
          Create an account to track your outpatient referrals, scheduled consultation slots, and health center visits.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gov-green-50 rounded-gov text-gov-green-800">
              <HeartPulse className="w-4 h-4" />
            </div>
            <div>
              <CardTitle>Basic Patient Details</CardTitle>
              <CardDescription>
                Only basic demographic information is required for account creation.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <form onSubmit={handleSignupSubmit}>
          <CardContent className="space-y-3.5">
            <FormField label="Full Name (as per Aadhaar / Official ID)" required>
              <Input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Kavita Ramesh Patil"
                required
              />
            </FormField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField label="Mobile Number" required helperText="For appointment slot alerts">
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  required
                />
              </FormField>

              <div className="grid grid-cols-2 gap-2">
                <FormField label="Age (Years)" required>
                  <Input
                    type="number"
                    min="1"
                    max="120"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="e.g. 30"
                    required
                  />
                </FormField>

                <FormField label="Gender" required>
                  <Select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    options={[
                      { value: 'female', label: 'Female' },
                      { value: 'male', label: 'Male' },
                      { value: 'other', label: 'Other' },
                    ]}
                  />
                </FormField>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <FormField label="Village / Town" required>
                <Input
                  type="text"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  placeholder="e.g. Khed Shivapur"
                  required
                />
              </FormField>

              <FormField label="District" required>
                <Input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="e.g. Pune"
                  required
                />
              </FormField>

              <FormField label="State" required>
                <Input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="e.g. Maharashtra"
                  required
                />
              </FormField>
            </div>

            {/* Terms and consent */}
            <div className="pt-2 border-t border-gov-border">
              <label className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="rounded border-gov-border text-gov-green-800 focus:ring-gov-green-800 mt-0.5"
                  required
                />
                <span className="leading-relaxed">
                  I agree to allow health workers and referral facilities to coordinate my care appointments under CareLoop.
                </span>
              </label>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <Link to="/login?role=patient" className="text-xs text-gov-green-800 hover:underline">
              Already have an account? Sign In
            </Link>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Complete Registration
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Note for other roles */}
      <div className="mt-4 p-3 bg-slate-50 border border-gov-border rounded-gov text-xs text-slate-600 text-center">
        Are you a Health Worker or Facility Representative?{' '}
        <Link to="/login" className="text-gov-green-800 font-semibold hover:underline">
          Go to Official Login
        </Link>
      </div>
    </div>
  );
};
