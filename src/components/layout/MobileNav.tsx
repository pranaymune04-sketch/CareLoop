import React from 'react';
import { NavLink } from 'react-router-dom';
import { useRole } from '@/context/RoleContext';
import { 
  Home, 
  FilePlus2, 
  Clock, 
  Users, 
  Building2, 
  BarChart3, 
  AlertOctagon,
  CalendarDays,
  Bell,
  History,
  User
} from 'lucide-react';

export const MobileNav: React.FC = () => {
  const { currentRole } = useRole();

  const getMobileLinks = () => {
    switch (currentRole) {
      case 'health_worker':
        return [
          { label: 'Home', path: '/health-worker', icon: <Home className="w-5 h-5" /> },
          { label: 'Referrals', path: '/health-worker/referrals', icon: <Clock className="w-5 h-5" /> },
          { label: '+ Refer', path: '/health-worker/create-referral', icon: <FilePlus2 className="w-5 h-5" />, primary: true },
          { label: 'Patients', path: '/health-worker/patients', icon: <Users className="w-5 h-5" /> },
        ];
      case 'facility':
        return [
          { label: 'Home', path: '/facility', icon: <Home className="w-5 h-5" /> },
          { label: 'Incoming', path: '/facility/incoming', icon: <CalendarDays className="w-5 h-5" /> },
          { label: 'Referrals', path: '/facility/referrals', icon: <Clock className="w-5 h-5" /> },
          { label: 'Capacity', path: '/facility/capacity', icon: <Building2 className="w-5 h-5" /> },
        ];
      case 'patient':
        return [
          { label: 'Dashboard', path: '/patient', icon: <Home className="w-5 h-5" /> },
          { label: 'Referrals', path: '/patient/referrals', icon: <Clock className="w-5 h-5" /> },
          { label: 'Alerts', path: '/patient/notifications', icon: <Bell className="w-5 h-5" /> },
          { label: 'History', path: '/patient/history', icon: <History className="w-5 h-5" /> },
          { label: 'Profile', path: '/patient/profile', icon: <User className="w-5 h-5" /> },
        ];
      case 'admin':
        return [
          { label: 'Admin', path: '/admin', icon: <Home className="w-5 h-5" /> },
          { label: 'Network', path: '/admin/network', icon: <BarChart3 className="w-5 h-5" /> },
          { label: 'Gaps', path: '/admin/gaps', icon: <AlertOctagon className="w-5 h-5" /> },
          { label: 'Facilities', path: '/admin/facilities', icon: <Building2 className="w-5 h-5" /> },
        ];
    }
  };

  const links = getMobileLinks();

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gov-border shadow-gov-md flex items-center justify-around py-1.5 px-2"
      aria-label="Mobile Bottom Navigation"
    >
      {links.map((link) => (
        <NavLink
          key={link.path}
          to={link.path}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 px-3 rounded text-[11px] font-medium transition-colors ${
              link.primary
                ? 'text-white bg-gov-green-800 font-semibold px-4 py-1.5 rounded-gov shadow-gov-sm -mt-3'
                : isActive
                ? 'text-gov-green-900 font-semibold'
                : 'text-slate-500 hover:text-slate-900'
            }`
          }
        >
          {link.icon}
          <span className="mt-0.5">{link.label}</span>
        </NavLink>
      ))}
    </nav>
  );
};
