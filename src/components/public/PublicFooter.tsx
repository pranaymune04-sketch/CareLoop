import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ExternalLink } from 'lucide-react';

export const PublicFooter: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gov-border text-gov-text-secondary text-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Column 1: Brand & Philosophy */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-gov bg-gov-green-800 flex items-center justify-center text-white font-bold">
                <Shield className="w-4 h-4 text-emerald-300" />
              </div>
              <span className="text-base font-bold text-gov-green-950 tracking-tight">
                CareLoop
              </span>
            </div>
            <p className="text-xs text-slate-600 max-w-md leading-relaxed">
              CareLoop is a public healthcare coordination platform focused on rural and underserved healthcare delivery. Built on the operational principle: <strong>"Referral created ≠ Care completed."</strong>
            </p>
            <div className="pt-2 text-[11px] text-slate-500 font-mono">
              MATCH → REFER → TRACK → DETECT → RECOVER → COMPLETE
            </div>
          </div>

          {/* Column 2: Stakeholder Portals */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-gov-text-primary uppercase tracking-wider">
              Stakeholder Access
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link to="/login?role=patient" className="hover:text-gov-green-800 transition-colors">
                  Patient Portal
                </Link>
              </li>
              <li>
                <Link to="/login?role=health_worker" className="hover:text-gov-green-800 transition-colors">
                  Health Worker (ASHA/ANM)
                </Link>
              </li>
              <li>
                <Link to="/login?role=facility" className="hover:text-gov-green-800 transition-colors">
                  Facility Triage Desk
                </Link>
              </li>
              <li>
                <Link to="/login?role=admin" className="hover:text-gov-green-800 transition-colors">
                  District Health Office
                </Link>
              </li>
              <li>
                <Link to="/portal-gateway" className="text-gov-green-800 font-medium hover:underline flex items-center gap-1">
                  <span>Component Showcase</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Policy & Transparency Placeholders */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-gov-text-primary uppercase tracking-wider">
              Platform & Governance
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-600">
              <li>
                <span className="text-slate-700 font-medium">Privacy Information</span>
                <span className="text-[10px] text-slate-400 block">Role-governed record access</span>
              </li>
              <li>
                <span className="text-slate-700 font-medium">Terms of Service</span>
                <span className="text-[10px] text-slate-400 block">Continuum operational standards</span>
              </li>
              <li>
                <span className="text-slate-700 font-medium">Helpdesk / Technical Support</span>
                <span className="text-[10px] text-slate-400 block">Field coordination inquiries</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright & disclaimer */}
        <div className="mt-8 pt-6 border-t border-gov-border/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} CareLoop Healthcare Coordination Platform. All rights reserved.</p>
          <p className="text-center sm:text-right">
            Stage 1 Prototype • Public Healthcare Continuum Architecture
          </p>
        </div>
      </div>
    </footer>
  );
};
