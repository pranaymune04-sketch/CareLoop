import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRole } from '@/context/RoleContext';
import { UserRole } from '@/types';
import { mockNotifications } from '@/mock/notifications';
import { 
  Bell, 
  Menu, 
  ShieldCheck, 
  PhoneCall, 
  ChevronDown, 
  User, 
  Check,
  Building2,
  Stethoscope,
  Activity,
  HeartPulse
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { NotificationItem } from '@/components/ui/NotificationItem';

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { currentRole, currentUser, setRole } = useRole();
  const navigate = useNavigate();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifModal, setShowNotifModal] = useState(false);

  const unreadCount = mockNotifications.filter((n) => !n.isRead).length;

  const roleLabels: Record<UserRole, { label: string; icon: React.ReactNode; path: string }> = {
    health_worker: { label: 'Health Worker (ASHA/ANM)', icon: <Stethoscope className="w-3.5 h-3.5" />, path: '/health-worker' },
    facility: { label: 'Health Facility (PHC/CHC/DH)', icon: <Building2 className="w-3.5 h-3.5" />, path: '/facility' },
    patient: { label: 'Patient & Family Portal', icon: <HeartPulse className="w-3.5 h-3.5" />, path: '/patient' },
    admin: { label: 'District Admin / DHO', icon: <Activity className="w-3.5 h-3.5" />, path: '/admin' },
  };

  const handleRoleSelect = (role: UserRole) => {
    setRole(role);
    setShowRoleMenu(false);
    navigate(roleLabels[role].path);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-gov-border shadow-gov-sm">
        {/* National / Public Health Top Strip */}
        <div className="bg-gov-green-900 text-white text-[11px] px-4 py-1 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="font-medium tracking-wide">National Public Healthcare Coordination Initiative</span>
            <span className="hidden sm:inline text-gov-green-300">|</span>
            <span className="hidden sm:inline text-gov-green-200">Rural & Underserved Continuum of Care</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-emerald-200 text-[11px]">
              <PhoneCall className="w-3 h-3 text-red-400 animate-pulse" />
              <span>National Ambulance: <strong className="text-white">108</strong> / Tele-MANAS: <strong className="text-white">14416</strong></span>
            </div>
          </div>
        </div>

        {/* Main Masthead Bar */}
        <div className="px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
          {/* Brand & Toggle */}
          <div className="flex items-center gap-3">
            {onToggleSidebar && (
              <button
                type="button"
                onClick={onToggleSidebar}
                className="lg:hidden p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-gov"
                aria-label="Toggle navigation menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-gov bg-gov-green-900 flex items-center justify-center text-white font-bold shadow-gov-sm group-hover:bg-gov-green-800 transition-colors">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-bold text-gov-green-950 tracking-tight leading-none">
                    CareLoop
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 bg-emerald-100 text-emerald-900 rounded border border-emerald-300">
                    Pilot
                  </span>
                </div>
                <p className="text-[10px] text-gov-text-secondary font-medium tracking-tight mt-0.5">
                  Referral created ≠ Care completed
                </p>
              </div>
            </Link>
          </div>

          {/* Right Actions: Notifications & Role Switcher */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Notification Bell */}
            <button
              type="button"
              onClick={() => setShowNotifModal(true)}
              className="relative p-2 text-slate-600 hover:text-gov-green-900 hover:bg-slate-100 rounded-gov transition-colors"
              aria-label="View system alerts"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
                </span>
              )}
            </button>

            {/* Role Switcher Dropdown for Testing / Demonstration */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center gap-2 pl-2.5 pr-2 py-1.5 rounded-gov border border-gov-border bg-slate-50 hover:bg-slate-100 transition-colors text-left"
                aria-expanded={showRoleMenu}
                aria-haspopup="true"
              >
                <div className="w-6 h-6 rounded-full bg-gov-green-800 text-white flex items-center justify-center text-xs font-semibold">
                  <User className="w-3.5 h-3.5" />
                </div>
                <div className="hidden md:block">
                  <div className="text-xs font-semibold text-gov-text-primary leading-tight flex items-center gap-1">
                    <span>{currentUser.name}</span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </div>
                  <div className="text-[10px] text-gov-text-secondary">
                    Role: <strong className="text-gov-green-800 font-semibold">{roleLabels[currentRole].label}</strong>
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 md:hidden" />
              </button>

              {/* Role Dropdown */}
              {showRoleMenu && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setShowRoleMenu(false)}
                  />
                  <div className="absolute right-0 mt-1.5 w-64 bg-white rounded-gov border border-gov-border shadow-gov-md py-1.5 z-30 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-3 py-1.5 border-b border-gov-border/60">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Switch View (Stage 1 Demonstration)
                      </p>
                    </div>
                    {(Object.keys(roleLabels) as UserRole[]).map((roleKey) => {
                      const isSelected = currentRole === roleKey;
                      const item = roleLabels[roleKey];
                      return (
                        <button
                          key={roleKey}
                          onClick={() => handleRoleSelect(roleKey)}
                          className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left transition-colors ${
                            isSelected
                              ? 'bg-gov-green-50 text-gov-green-950 font-semibold'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className={isSelected ? 'text-gov-green-800' : 'text-slate-400'}>
                              {item.icon}
                            </span>
                            <span>{item.label}</span>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-gov-green-800" />}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Notifications Modal */}
      <Modal
        isOpen={showNotifModal}
        onClose={() => setShowNotifModal(false)}
        title="Continuum Alerts & Notifications"
        description="Real-time triage, slot confirmations, and gap detection alerts"
      >
        <div className="space-y-2.5">
          {mockNotifications.map((notif) => (
            <NotificationItem key={notif.id} notification={notif} />
          ))}
        </div>
      </Modal>
    </>
  );
};
