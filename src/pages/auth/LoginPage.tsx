import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useRole } from '@/context/RoleContext';
import { UserRole } from '@/types';
import { 
  Button, 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  FormField, 
  Input, 
  Modal 
} from '@/components/ui';
import { 
  Shield, 
  HeartPulse, 
  Stethoscope, 
  Building2, 
  Activity, 
  Lock, 
  Smartphone, 
  ArrowRight,
  Info
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setRole } = useRole();

  const initialRoleParam = searchParams.get('role') as UserRole;
  const validRoles: UserRole[] = ['patient', 'health_worker', 'facility', 'admin'];
  const [selectedRole, setSelectedRole] = useState<UserRole>(
    validRoles.includes(initialRoleParam) ? initialRoleParam : 'patient'
  );

  const [authMode, setAuthMode] = useState<'password' | 'otp'>('password');
  const [identifier, setIdentifier] = useState('');
  const [credential, setCredential] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const roleParam = searchParams.get('role') as UserRole;
    if (roleParam && validRoles.includes(roleParam)) {
      setSelectedRole(roleParam);
    }
  }, [searchParams]);

  // Set default placeholder credentials based on selected role
  useEffect(() => {
    if (selectedRole === 'patient') {
      setIdentifier('+91 94210 56789');
    } else if (selectedRole === 'health_worker') {
      setIdentifier('ASHA-MH-PUN-084');
    } else if (selectedRole === 'facility') {
      setIdentifier('chc.bhor@health.gov.in');
    } else if (selectedRole === 'admin') {
      setIdentifier('dho.pune@maharashtra.gov.in');
    }
    setCredential('••••••••');
  }, [selectedRole]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setRole(selectedRole);
      setIsLoading(false);

      if (selectedRole === 'patient') {
        navigate('/patient');
      } else if (selectedRole === 'health_worker') {
        navigate('/health-worker');
      } else if (selectedRole === 'facility') {
        navigate('/facility');
      } else if (selectedRole === 'admin') {
        navigate('/admin');
      }
    }, 400);
  };

  const roleMeta = {
    patient: {
      title: 'Patient Sign In',
      desc: 'Access your referral slips, scheduled consultation slots, and health history.',
      icon: <HeartPulse className="w-4 h-4 text-gov-green-800" />,
      idLabel: 'Mobile Number or ABHA ID',
      placeholder: '+91 94210 56789 or 14-digit ABHA',
    },
    health_worker: {
      title: 'Health Worker Sign In',
      desc: 'ASHA, ANM, and CHO frontline workers managing community referrals.',
      icon: <Stethoscope className="w-4 h-4 text-gov-green-800" />,
      idLabel: 'Worker ID / Mobile Number',
      placeholder: 'e.g. ASHA-MH-PUN-084',
    },
    facility: {
      title: 'Health Facility Sign In',
      desc: 'Primary & Community Health Centres, Sub-District and District Hospitals.',
      icon: <Building2 className="w-4 h-4 text-sky-800" />,
      idLabel: 'Facility HFR Code / Email',
      placeholder: 'e.g. HFR-2725-CHC-0044',
    },
    admin: {
      title: 'District Administration',
      desc: 'District Health Officers and continuum oversight supervisors.',
      icon: <Activity className="w-4 h-4 text-purple-800" />,
      idLabel: 'Official Gov Email / Employee ID',
      placeholder: 'e.g. dho.pune@maharashtra.gov.in',
    },
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8 sm:py-12">
      <div className="text-center mb-6 space-y-1">
        <div className="inline-flex items-center gap-2 p-1 px-2.5 rounded bg-gov-green-50 border border-gov-green-200 text-gov-green-900 text-[11px] font-semibold">
          <Shield className="w-3.5 h-3.5 text-gov-green-700" />
          <span>CareLoop Portal Authentication (Frontend Prototype)</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-gov-text-primary">
          Sign In to CareLoop
        </h1>
        <p className="text-xs text-gov-text-secondary">
          Select your designated stakeholder role to proceed.
        </p>
      </div>

      <Card>
        {/* Role Selection Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-gov-border bg-slate-50/70 p-1.5 gap-1 text-xs">
          {(['patient', 'health_worker', 'facility', 'admin'] as UserRole[]).map((r) => {
            const isSelected = selectedRole === r;
            return (
              <button
                key={r}
                type="button"
                onClick={() => setSelectedRole(r)}
                className={`py-2 px-2 rounded font-medium text-center transition-colors flex flex-col items-center justify-center gap-1 ${
                  isSelected
                    ? 'bg-white text-gov-green-900 shadow-gov-sm font-semibold border border-gov-border'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <span>{roleMeta[r].icon}</span>
                <span className="capitalize">{r.replace('_', ' ')}</span>
              </button>
            );
          })}
        </div>

        <CardHeader>
          <CardTitle>{roleMeta[selectedRole].title}</CardTitle>
          <CardDescription>{roleMeta[selectedRole].desc}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Notice for administrative roles */}
          {selectedRole !== 'patient' && (
            <div className="p-3 bg-slate-50 border border-gov-border rounded-gov text-xs text-slate-700 flex items-start gap-2">
              <Info className="w-4 h-4 text-gov-green-800 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <span>
                  Official credentials for {selectedRole.replace('_', ' ')} are issued by the District Health Authority.
                </span>
                <span className="block text-[11px] text-gov-green-800 font-semibold mt-0.5">
                  Demo shortcut: Pre-filled credentials can be submitted directly below.
                </span>
              </div>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {/* Identifier field */}
            <FormField label={roleMeta[selectedRole].idLabel} required>
              <Input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={roleMeta[selectedRole].placeholder}
                required
              />
            </FormField>

            {/* Auth Mode Toggle: Password vs OTP */}
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="font-semibold text-gov-text-primary">Authentication Method:</span>
              <div className="inline-flex rounded-gov border border-gov-border p-0.5 bg-slate-50">
                <button
                  type="button"
                  onClick={() => setAuthMode('password')}
                  className={`px-2.5 py-1 text-[11px] rounded transition-colors ${
                    authMode === 'password'
                      ? 'bg-white text-gov-green-900 font-semibold shadow-gov-sm'
                      : 'text-slate-600'
                  }`}
                >
                  Password
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode('otp')}
                  className={`px-2.5 py-1 text-[11px] rounded transition-colors ${
                    authMode === 'otp'
                      ? 'bg-white text-gov-green-900 font-semibold shadow-gov-sm'
                      : 'text-slate-600'
                  }`}
                >
                  OTP / Passcode
                </button>
              </div>
            </div>

            {/* Credential Field */}
            {authMode === 'password' ? (
              <FormField label="Password" required>
                <div className="relative">
                  <Input
                    type="password"
                    value={credential}
                    onChange={(e) => setCredential(e.target.value)}
                    placeholder="Enter password"
                    required
                  />
                  <Lock className="w-3.5 h-3.5 absolute right-3 top-2.5 text-slate-400 pointer-events-none" />
                </div>
              </FormField>
            ) : (
              <FormField label="One-Time Passcode (OTP)" required helperText="Mock OTP is active for demonstration">
                <div className="relative">
                  <Input
                    type="text"
                    value={credential}
                    onChange={(e) => setCredential(e.target.value)}
                    placeholder="Enter 6-digit OTP sent to registered mobile"
                    required
                  />
                  <Smartphone className="w-3.5 h-3.5 absolute right-3 top-2.5 text-slate-400 pointer-events-none" />
                </div>
              </FormField>
            )}

            {/* Remember Me and Forgot Password */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-gov-border text-gov-green-800 focus:ring-gov-green-800"
                />
                <span>Remember session</span>
              </label>

              <button
                type="button"
                onClick={() => setForgotModalOpen(true)}
                className="text-gov-green-800 hover:underline font-medium"
              >
                Need assistance?
              </button>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full justify-center"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In as {selectedRole.replace('_', ' ').toUpperCase()}
            </Button>
          </form>

          {/* Patient Registration Callout */}
          {selectedRole === 'patient' && (
            <div className="pt-4 border-t border-gov-border/80 text-center text-xs text-slate-600">
              <span>New patient without an account? </span>
              <Link to="/signup" className="text-gov-green-800 font-semibold hover:underline">
                Create Patient Account
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Forgot Password / Helpdesk Modal */}
      <Modal
        isOpen={forgotModalOpen}
        onClose={() => setForgotModalOpen(false)}
        title="Sign-In Assistance"
        description="Help with password recovery and authorized account access"
        footer={
          <Button variant="outline" size="sm" onClick={() => setForgotModalOpen(false)}>
            Close
          </Button>
        }
      >
        <div className="space-y-3 text-xs text-gov-text-secondary leading-relaxed">
          <p>
            <strong>Patients:</strong> You can sign in using your registered mobile number and OTP. If your number has changed, please contact your village ASHA worker to update your record.
          </p>
          <p>
            <strong>Health Workers, Facilities & Admin:</strong> Password resets are managed by the District Health Informatics Office. Please reach out to your district nodal officer or facility administrator.
          </p>
        </div>
      </Modal>
    </div>
  );
};
