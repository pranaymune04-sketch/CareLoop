import React, { useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AppShell } from '@/components/layout';
import { PublicLayout } from '@/components/public';
import { useRole } from '@/context/RoleContext';

// Public & Auth Pages
import { LandingPage } from '@/pages/public/LandingPage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { SignupPage } from '@/pages/auth/SignupPage';
import { PortalGateway } from '@/pages/PortalGateway';
import { NotFound } from '@/pages/NotFound';

// Health Worker Pages
import { HealthWorkerDashboard } from '@/pages/health-worker/HealthWorkerDashboard';
import { HealthWorkerReferrals } from '@/pages/health-worker/HealthWorkerReferrals';
import { HealthWorkerReferralDetail } from '@/pages/health-worker/HealthWorkerReferralDetail';
import { HealthWorkerAtRiskReferrals } from '@/pages/health-worker/HealthWorkerAtRiskReferrals';
import { CreateReferralEntry } from '@/pages/health-worker/CreateReferralEntry';
import { CreateNormalReferral } from '@/pages/health-worker/CreateNormalReferral';
import { CreateEmergencyReferral } from '@/pages/health-worker/CreateEmergencyReferral';
import { HealthWorkerPatients } from '@/pages/health-worker/HealthWorkerPatients';
import { HealthWorkerPatientProfile } from '@/pages/health-worker/HealthWorkerPatientProfile';
import { HealthWorkerRegisterPatient } from '@/pages/health-worker/HealthWorkerRegisterPatient';

// Facility Pages
import { 
  FacilityDashboard, 
  FacilityIncoming, 
  FacilityReferrals, 
  FacilityReferralDetail, 
  FacilityCapacity 
} from '@/pages/facility';

// Patient Pages
import { PatientDashboard } from '@/pages/patient/PatientDashboard';
import { PatientProfile } from '@/pages/patient/PatientProfile';
import { PatientReferrals } from '@/pages/patient/PatientReferrals';
import { PatientReferralDetail } from '@/pages/patient/PatientReferralDetail';
import { PatientJourney } from '@/pages/patient/PatientJourney';
import { PatientAppointment } from '@/pages/patient/PatientAppointment';
import { PatientNotifications } from '@/pages/patient/PatientNotifications';
import { PatientHistory } from '@/pages/patient/PatientHistory';

// Admin Pages
import { 
  AdminDashboard, 
  AdminNetworkDashboard, 
  AdminReferralAnalytics, 
  AdminGapMonitoring, 
  AdminFacilityPerformance, 
  AdminReferralDetail, 
  AdminUsers, 
  AdminOverview, 
  AdminAudit 
} from '@/pages/admin';

export const AppRoutes: React.FC = () => {
  const location = useLocation();
  const { setRole } = useRole();

  // Automatically sync role context when navigating to internal role sections
  useEffect(() => {
    const path = location.pathname;
    if (path.startsWith('/health-worker')) {
      setRole('health_worker');
    } else if (path.startsWith('/facility')) {
      setRole('facility');
    } else if (path.startsWith('/patient')) {
      setRole('patient');
    } else if (path.startsWith('/admin')) {
      setRole('admin');
    }
  }, [location.pathname, setRole]);

  return (
    <Routes>
      {/* Public Pages with PublicLayout */}
      <Route
        path="/"
        element={
          <PublicLayout>
            <LandingPage />
          </PublicLayout>
        }
      />
      <Route
        path="/login"
        element={
          <PublicLayout>
            <LoginPage />
          </PublicLayout>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicLayout>
            <SignupPage />
          </PublicLayout>
        }
      />

      {/* Internal Portal Shell Routes with AppShell */}
      <Route
        path="/portal-gateway"
        element={
          <AppShell>
            <PortalGateway />
          </AppShell>
        }
      />

      {/* Health Worker Routes */}
      <Route
        path="/health-worker"
        element={
          <AppShell>
            <HealthWorkerDashboard />
          </AppShell>
        }
      />
      <Route
        path="/health-worker/patients"
        element={
          <AppShell>
            <HealthWorkerPatients />
          </AppShell>
        }
      />
      <Route
        path="/health-worker/patients/register"
        element={
          <AppShell>
            <HealthWorkerRegisterPatient />
          </AppShell>
        }
      />
      <Route
        path="/health-worker/patients/:id"
        element={
          <AppShell>
            <HealthWorkerPatientProfile />
          </AppShell>
        }
      />
      <Route
        path="/health-worker/create-referral"
        element={
          <AppShell>
            <CreateReferralEntry />
          </AppShell>
        }
      />
      <Route
        path="/health-worker/create-referral/normal"
        element={
          <AppShell>
            <CreateNormalReferral />
          </AppShell>
        }
      />
      <Route
        path="/health-worker/create-referral/emergency"
        element={
          <AppShell>
            <CreateEmergencyReferral />
          </AppShell>
        }
      />
      <Route
        path="/health-worker/referrals"
        element={
          <AppShell>
            <HealthWorkerReferrals />
          </AppShell>
        }
      />
      <Route
        path="/health-worker/referrals/at-risk"
        element={
          <AppShell>
            <HealthWorkerAtRiskReferrals />
          </AppShell>
        }
      />
      <Route
        path="/health-worker/referrals/:id"
        element={
          <AppShell>
            <HealthWorkerReferralDetail />
          </AppShell>
        }
      />

      {/* Facility Routes */}
      <Route
        path="/facility"
        element={
          <AppShell>
            <FacilityDashboard />
          </AppShell>
        }
      />
      <Route
        path="/facility/incoming"
        element={
          <AppShell>
            <FacilityIncoming />
          </AppShell>
        }
      />
      <Route
        path="/facility/incoming/:id"
        element={
          <AppShell>
            <FacilityReferralDetail />
          </AppShell>
        }
      />
      <Route
        path="/facility/referrals"
        element={
          <AppShell>
            <FacilityReferrals />
          </AppShell>
        }
      />
      <Route
        path="/facility/referrals/:id"
        element={
          <AppShell>
            <FacilityReferralDetail />
          </AppShell>
        }
      />
      <Route
        path="/facility/capacity"
        element={
          <AppShell>
            <FacilityCapacity />
          </AppShell>
        }
      />

      {/* Patient Routes */}
      <Route
        path="/patient"
        element={
          <AppShell>
            <PatientDashboard />
          </AppShell>
        }
      />
      <Route
        path="/patient/profile"
        element={
          <AppShell>
            <PatientProfile />
          </AppShell>
        }
      />
      <Route
        path="/patient/referrals"
        element={
          <AppShell>
            <PatientReferrals />
          </AppShell>
        }
      />
      <Route
        path="/patient/referrals/:id"
        element={
          <AppShell>
            <PatientReferralDetail />
          </AppShell>
        }
      />
      <Route
        path="/patient/referrals/:id/journey"
        element={
          <AppShell>
            <PatientJourney />
          </AppShell>
        }
      />
      <Route
        path="/patient/referrals/:id/appointment"
        element={
          <AppShell>
            <PatientAppointment />
          </AppShell>
        }
      />
      <Route
        path="/patient/notifications"
        element={
          <AppShell>
            <PatientNotifications />
          </AppShell>
        }
      />
      <Route
        path="/patient/history"
        element={
          <AppShell>
            <PatientHistory />
          </AppShell>
        }
      />

      {/* Backward-compatibility redirects for Step 1/2 links */}
      <Route path="/patient/my-referrals" element={<Navigate to="/patient/referrals" replace />} />
      <Route path="/patient/records" element={<Navigate to="/patient/profile" replace />} />

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <AppShell>
            <AdminDashboard />
          </AppShell>
        }
      />
      <Route
        path="/admin/network"
        element={
          <AppShell>
            <AdminNetworkDashboard />
          </AppShell>
        }
      />
      <Route
        path="/admin/referrals"
        element={
          <AppShell>
            <AdminReferralAnalytics />
          </AppShell>
        }
      />
      <Route
        path="/admin/referrals/:id"
        element={
          <AppShell>
            <AdminReferralDetail />
          </AppShell>
        }
      />
      <Route
        path="/admin/gaps"
        element={
          <AppShell>
            <AdminGapMonitoring />
          </AppShell>
        }
      />
      <Route
        path="/admin/facilities"
        element={
          <AppShell>
            <AdminFacilityPerformance />
          </AppShell>
        }
      />
      <Route
        path="/admin/users"
        element={
          <AppShell>
            <AdminUsers />
          </AppShell>
        }
      />
      <Route
        path="/admin/audit"
        element={
          <AppShell>
            <AdminAudit />
          </AppShell>
        }
      />
      <Route
        path="/admin/overview"
        element={
          <AppShell>
            <AdminOverview />
          </AppShell>
        }
      />

      {/* Fallback 404 handler */}
      <Route
        path="*"
        element={
          <PublicLayout>
            <NotFound />
          </PublicLayout>
        }
      />
    </Routes>
  );
};
