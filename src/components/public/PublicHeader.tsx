import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Menu, X, Shield, ArrowRight, LogIn } from 'lucide-react';

export const PublicHeader: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleScrollTo = (elementId: string) => {
    setMobileMenuOpen(false);
    if (location.pathname !== '/') {
      navigate('/' + elementId);
      return;
    }
    const elem = document.querySelector(elementId);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gov-border shadow-gov-sm">
      {/* Informational Restrained Top Bar */}
      <div className="bg-gov-green-900 text-white text-[11px] px-4 py-1.5 flex items-center justify-between">
        <div className="flex items-center gap-2 max-w-6xl mx-auto w-full">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
          <span className="font-medium tracking-wide truncate">
            CareLoop — Public Healthcare Referral Coordination Platform
          </span>
          <span className="hidden md:inline text-gov-green-300">|</span>
          <span className="hidden md:inline text-gov-green-100">
            Referral created ≠ Care completed
          </span>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Logo & Product Title */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-gov bg-gov-green-800 flex items-center justify-center text-white font-bold shadow-gov-sm group-hover:bg-gov-green-900 transition-colors">
            <Shield className="w-4 h-4 text-emerald-300" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold text-gov-green-950 tracking-tight leading-none">
                CareLoop
              </span>
            </div>
            <p className="text-[10px] text-gov-text-secondary font-medium tracking-tight mt-0.5">
              Care Continuum Coordination
            </p>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-medium text-slate-700">
          <Link to="/" className="hover:text-gov-green-800 transition-colors">
            Home
          </Link>
          <button
            type="button"
            onClick={() => handleScrollTo('#how-it-works')}
            className="hover:text-gov-green-800 transition-colors"
          >
            How CareLoop Works
          </button>
          <button
            type="button"
            onClick={() => handleScrollTo('#for-patients')}
            className="hover:text-gov-green-800 transition-colors"
          >
            For Patients
          </button>
          <button
            type="button"
            onClick={() => handleScrollTo('#for-health-workers')}
            className="hover:text-gov-green-800 transition-colors"
          >
            For Health Workers
          </button>
          <button
            type="button"
            onClick={() => handleScrollTo('#for-facilities')}
            className="hover:text-gov-green-800 transition-colors"
          >
            For Facilities
          </button>
        </nav>

        {/* Desktop Action Buttons */}
        <div className="hidden sm:flex items-center gap-2.5">
          <Link to="/login">
            <Button variant="outline" size="sm" leftIcon={<LogIn className="w-3.5 h-3.5" />}>
              Sign In
            </Button>
          </Link>
          <Link to="/signup">
            <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              Get Started
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Hamburger Button */}
        <div className="lg:hidden flex items-center gap-2">
          <Link to="/login" className="sm:hidden">
            <Button variant="outline" size="sm">
              Sign In
            </Button>
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-gov border border-gov-border text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            aria-label="Toggle navigation"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gov-border bg-white px-4 pt-3 pb-4 space-y-2.5 shadow-gov-md animate-in fade-in duration-150">
          <nav className="flex flex-col space-y-2 text-xs font-medium text-slate-700">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 px-2 hover:bg-slate-50 rounded"
            >
              Home
            </Link>
            <button
              type="button"
              onClick={() => handleScrollTo('#how-it-works')}
              className="py-1.5 px-2 hover:bg-slate-50 rounded text-left"
            >
              How CareLoop Works
            </button>
            <button
              type="button"
              onClick={() => handleScrollTo('#for-patients')}
              className="py-1.5 px-2 hover:bg-slate-50 rounded text-left"
            >
              For Patients
            </button>
            <button
              type="button"
              onClick={() => handleScrollTo('#for-health-workers')}
              className="py-1.5 px-2 hover:bg-slate-50 rounded text-left"
            >
              For Health Workers
            </button>
            <button
              type="button"
              onClick={() => handleScrollTo('#for-facilities')}
              className="py-1.5 px-2 hover:bg-slate-50 rounded text-left"
            >
              For Facilities
            </button>
          </nav>

          <div className="pt-3 border-t border-gov-border flex flex-col gap-2">
            <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="outline" size="sm" className="w-full justify-center">
                Sign In to Portal
              </Button>
            </Link>
            <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="primary" size="sm" className="w-full justify-center">
                Patient Registration
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
