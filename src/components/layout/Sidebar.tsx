import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useRole } from '@/context/RoleContext';
import { 
  Home, 
  FilePlus2, 
  Users, 
  Clock, 
  Building2, 
  BarChart3, 
  AlertOctagon,
  CalendarDays,
  Activity,
  Layers,
  Bell,
  History,
  User
} from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  badge?: string;
  isEmergency?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { currentRole } = useRole();
  const location = useLocation();

  // Role-specific navigation definitions
  const healthWorkerNav: NavItem[] = [
    { label: 'Worker Dashboard', path: '/health-worker', icon: <Home className="w-4 h-4" /> },
    { label: 'Referral Pipeline', path: '/health-worker/referrals', icon: <Clock className="w-4 h-4" /> },
    { label: 'Recovery Radar', path: '/health-worker/referrals/at-risk', icon: <AlertOctagon className="w-4 h-4" />, badge: 'At Risk' },
    { label: 'Create Referral', path: '/health-worker/create-referral', icon: <FilePlus2 className="w-4 h-4" /> },
    { label: 'Village Patients', path: '/health-worker/patients', icon: <Users className="w-4 h-4" /> },
  ];

  const facilityNav: NavItem[] = [
    { label: 'Facility Dashboard', path: '/facility', icon: <Home className="w-4 h-4" /> },
    { label: 'Incoming Triage & Slots', path: '/facility/incoming', icon: <CalendarDays className="w-4 h-4" /> },
    { label: 'Facility Referrals', path: '/facility/referrals', icon: <Clock className="w-4 h-4" /> },
    { label: 'Bed & Service Capacity', path: '/facility/capacity', icon: <Building2 className="w-4 h-4" /> },
  ];

  const patientNav: NavItem[] = [
    { label: 'Dashboard', path: '/patient', icon: <Home className="w-4 h-4" /> },
    { label: 'My Referrals', path: '/patient/referrals', icon: <Clock className="w-4 h-4" />, badge: '1' },
    { label: 'Notifications', path: '/patient/notifications', icon: <Bell className="w-4 h-4" />, badge: '2' },
    { label: 'History', path: '/patient/history', icon: <History className="w-4 h-4" /> },
    { label: 'Profile', path: '/patient/profile', icon: <User className="w-4 h-4" /> },
  ];

  const adminNav: NavItem[] = [
    { label: 'Dashboard', path: '/admin', icon: <Home className="w-4 h-4" /> },
    { label: 'Network Overview', path: '/admin/network', icon: <Activity className="w-4 h-4" /> },
    { label: 'Referral Analytics', path: '/admin/referrals', icon: <BarChart3 className="w-4 h-4" /> },
    { label: 'Gap Monitoring', path: '/admin/gaps', icon: <AlertOctagon className="w-4 h-4" />, badge: 'Exceptions' },
    { label: 'Facility Performance', path: '/admin/facilities', icon: <Building2 className="w-4 h-4" /> },
    { label: 'Users', path: '/admin/users', icon: <Users className="w-4 h-4" /> },
    { label: 'Audit Logs', path: '/admin/audit', icon: <Layers className="w-4 h-4" /> },
  ];

  const navMap = {
    health_worker: healthWorkerNav,
    facility: facilityNav,
    patient: patientNav,
    admin: adminNav,
  };

  const navItems = navMap[currentRole] || healthWorkerNav;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-30 w-64 bg-white border-r border-gov-border flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-0 max-lg:-translate-x-full'
        }`}
      >
        {/* Role Portal Header */}
        <div className="p-4 border-b border-gov-border bg-slate-50/60">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Active Portal
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-gov-green-100 text-gov-green-900 border border-gov-green-200">
              {currentRole.replace('_', ' ').toUpperCase()}
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`flex items-center justify-between px-3 py-2 rounded-gov text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-gov-green-50 text-gov-green-900 border border-gov-green-200/80 font-semibold'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-gov-text-primary'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={isActive ? 'text-gov-green-800' : 'text-slate-400'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                      isActive ? 'bg-gov-green-200 text-gov-green-900' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Emergency Quick Action Callout (Only in Health Worker role, as per product rules) */}
        {currentRole === 'health_worker' && (
          <div className="p-3 m-3 bg-red-50/90 border border-red-200 rounded-gov">
            <div className="flex items-center gap-1.5 text-red-900 text-xs font-bold mb-1">
              <AlertOctagon className="w-4 h-4 text-red-700" />
              <span>Emergency Referral</span>
            </div>
            <p className="text-[11px] text-red-800 leading-tight mb-2">
              Bypasses standard registration. Alerts receiving facility emergency team (Demo).
            </p>
            <NavLink
              to="/health-worker/create-referral/emergency"
              onClick={onClose}
              className="w-full inline-flex items-center justify-center gap-1 px-2.5 py-1.5 bg-red-700 hover:bg-red-800 text-white rounded text-xs font-semibold shadow-gov-sm transition-colors"
            >
              <span>+ Emergency Referral</span>
            </NavLink>
          </div>
        )}

        {/* Continuum Rule Reminder footer */}
        <div className="p-3.5 border-t border-gov-border bg-slate-50/70 text-[11px] text-slate-600">
          <div className="flex items-center gap-1.5 font-semibold text-gov-green-900 mb-0.5">
            <Activity className="w-3.5 h-3.5 text-gov-green-800" />
            <span>Care Continuum Principle</span>
          </div>
          <p className="text-[10px] text-slate-500 leading-tight">
            MATCH → REFER → TRACK → DETECT → RECOVER → COMPLETE
          </p>
        </div>
      </aside>
    </>
  );
};
