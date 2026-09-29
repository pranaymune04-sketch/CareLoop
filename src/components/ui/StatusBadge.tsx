import React from 'react';
import { ReferralStatus, ReferralType, ReferralPriority } from '@/types';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Ambulance, 
  CheckCheck, 
  CalendarClock, 
  AlertCircle,
  Siren,
  FileText
} from 'lucide-react';

interface StatusBadgeProps {
  status?: ReferralStatus;
  type?: ReferralType;
  priority?: ReferralPriority;
  label?: string;
  size?: 'sm' | 'md';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  type,
  priority,
  label,
  size = 'md',
  className = '',
}) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  // If referral type is provided
  if (type) {
    if (type === 'EMERGENCY') {
      return (
        <span
          className={`inline-flex items-center gap-1 font-semibold rounded bg-red-100 text-red-800 border border-red-300 ${sizeClasses} ${className}`}
        >
          <Siren className="w-3.5 h-3.5 text-red-700 animate-pulse" />
          <span>{label || 'EMERGENCY REFERRAL'}</span>
        </span>
      );
    }
    return (
      <span
        className={`inline-flex items-center gap-1 font-medium rounded bg-emerald-50 text-emerald-800 border border-emerald-200 ${sizeClasses} ${className}`}
      >
        <FileText className="w-3.5 h-3.5 text-emerald-700" />
        <span>{label || 'Normal Referral'}</span>
      </span>
    );
  }

  // If priority is provided
  if (priority) {
    if (priority === 'CRITICAL_EMERGENCY') {
      return (
        <span
          className={`inline-flex items-center gap-1 font-semibold rounded bg-red-100 text-red-900 border border-red-400 ${sizeClasses} ${className}`}
        >
          <AlertCircle className="w-3.5 h-3.5 text-red-700" />
          <span>Critical Emergency</span>
        </span>
      );
    }
    if (priority === 'URGENT') {
      return (
        <span
          className={`inline-flex items-center gap-1 font-semibold rounded bg-amber-100 text-amber-900 border border-amber-300 ${sizeClasses} ${className}`}
        >
          <Clock className="w-3.5 h-3.5 text-amber-700" />
          <span>Urgent</span>
        </span>
      );
    }
    return (
      <span
        className={`inline-flex items-center gap-1 font-medium rounded bg-slate-100 text-slate-800 border border-slate-300 ${sizeClasses} ${className}`}
      >
        <span>Routine</span>
      </span>
    );
  }

  // If workflow status is provided: MATCH → REFER → TRACK → DETECT → RECOVER → COMPLETE
  switch (status) {
    case 'CREATED':
      return (
        <span className={`inline-flex items-center gap-1 font-medium rounded bg-slate-100 text-slate-800 border border-slate-300 ${sizeClasses} ${className}`}>
          <FileText className="w-3.5 h-3.5 text-slate-600" />
          <span>{label || 'Draft Created'}</span>
        </span>
      );

    case 'MATCHED':
      return (
        <span className={`inline-flex items-center gap-1 font-medium rounded bg-sky-50 text-sky-800 border border-sky-300 ${sizeClasses} ${className}`}>
          <Clock className="w-3.5 h-3.5 text-sky-700" />
          <span>{label || 'Matched to Facility'}</span>
        </span>
      );

    case 'REFERRED':
      return (
        <span className={`inline-flex items-center gap-1 font-medium rounded bg-blue-50 text-blue-800 border border-blue-300 ${sizeClasses} ${className}`}>
          <CalendarClock className="w-3.5 h-3.5 text-blue-700" />
          <span>{label || 'Slot Requested (Pending Confirmation)'}</span>
        </span>
      );

    case 'SLOT_PROPOSED':
      return (
        <span className={`inline-flex items-center gap-1 font-semibold rounded bg-amber-50 text-amber-800 border border-amber-300 ${sizeClasses} ${className}`}>
          <CalendarClock className="w-3.5 h-3.5 text-amber-700" />
          <span>{label || 'Alternative Slot Proposed'}</span>
        </span>
      );

    case 'CONFIRMED':
      return (
        <span className={`inline-flex items-center gap-1 font-medium rounded bg-emerald-50 text-emerald-800 border border-emerald-300 ${sizeClasses} ${className}`}>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
          <span>{label || 'Appointment Confirmed'}</span>
        </span>
      );

    case 'TRANSIT_DISPATCHED':
      return (
        <span className={`inline-flex items-center gap-1 font-medium rounded bg-purple-50 text-purple-900 border border-purple-300 ${sizeClasses} ${className}`}>
          <Ambulance className="w-3.5 h-3.5 text-purple-700" />
          <span>{label || 'Patient Travelling (Demo)'}</span>
        </span>
      );

    case 'ARRIVED':
    case 'IN_CONSULTATION':
      return (
        <span className={`inline-flex items-center gap-1 font-medium rounded bg-teal-50 text-teal-800 border border-teal-300 ${sizeClasses} ${className}`}>
          <CheckCircle2 className="w-3.5 h-3.5 text-teal-700" />
          <span>{label || 'Arrived / In Consultation'}</span>
        </span>
      );

    case 'GAP_DETECTED':
      return (
        <span className={`inline-flex items-center gap-1 font-semibold rounded bg-red-100 text-red-900 border border-red-300 ${sizeClasses} ${className}`}>
          <AlertTriangle className="w-3.5 h-3.5 text-red-700" />
          <span>{label || 'Gap Detected (Action Required)'}</span>
        </span>
      );

    case 'RECOVERED':
      return (
        <span className={`inline-flex items-center gap-1 font-medium rounded bg-indigo-50 text-indigo-900 border border-indigo-300 ${sizeClasses} ${className}`}>
          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-700" />
          <span>{label || 'Gap Recovered / Followed Up'}</span>
        </span>
      );

    case 'COMPLETED':
      return (
        <span className={`inline-flex items-center gap-1 font-semibold rounded bg-green-100 text-green-900 border border-green-400 ${sizeClasses} ${className}`}>
          <CheckCheck className="w-3.5 h-3.5 text-green-700" />
          <span>{label || 'Care Completed'}</span>
        </span>
      );

    case 'CANCELLED':
      return (
        <span className={`inline-flex items-center gap-1 font-semibold rounded bg-amber-50 text-amber-900 border border-amber-300 ${sizeClasses} ${className}`}>
          <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
          <span>{label || 'Facility Unable to Proceed (Recovery Required)'}</span>
        </span>
      );

    default:
      return (
        <span className={`inline-flex items-center gap-1 font-medium rounded bg-slate-100 text-slate-700 border border-slate-300 ${sizeClasses} ${className}`}>
          <span>{label || status || 'Unknown'}</span>
        </span>
      );
  }
};
