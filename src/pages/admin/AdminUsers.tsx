import React, { useState, useMemo } from 'react';
import { PageHeader } from '@/components/layout';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from '@/components/ui';
import { DemoAdminBanner } from './DemoAdminBanner';
import { mockDistrictUsers, DistrictUser } from '@/mock';
import { 
  Search, 
  Phone, 
  Mail, 
  Lock
} from 'lucide-react';

export const AdminUsers: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'health_worker' | 'facility' | 'admin'>('all');

  const filteredUsers = useMemo(() => {
    return mockDistrictUsers.filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.cadreOrDesignation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.assignedArea.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.block.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRole = roleFilter === 'all' || u.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [searchTerm, roleFilter]);

  const getRoleBadge = (role: DistrictUser['role']) => {
    switch (role) {
      case 'health_worker':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-gov-green-100 text-gov-green-900 border border-gov-green-200">
            Health Worker
          </span>
        );
      case 'facility':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-900 border border-purple-200">
            Facility Medical Officer
          </span>
        );
      case 'admin':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-900 border border-blue-200">
            District Administration
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="District Health Workforce & Stakeholder Directory"
        subtitle="Roster of registered frontline health workers (ASHA/ANM/CHO), hospital superintendents, and district administrators"
        breadcrumbs={[
          { label: 'Admin Portal', href: '/admin' },
          { label: 'User Directory' },
        ]}
      />

      {/* Mandatory Demo Disclosures */}
      <DemoAdminBanner 
        title="Demo User Directory" 
        badgeText="Personnel Telemetry" 
        variant="info" 
      />

      {/* Privacy Notice */}
      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-gov text-xs text-slate-700 flex items-start gap-2.5">
        <Lock className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-semibold text-slate-900">
            Data Privacy &amp; Credential Protection Safeguard
          </span>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            In compliance with national digital health standards, passwords, session tokens, and authentication secrets are strictly scrubbed from administrative view. Only operational contact, designation, and caseload data are accessible.
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-4 bg-white rounded-gov border border-gov-border shadow-gov-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Total Personnel</span>
          <div className="text-2xl font-bold text-gov-text-primary mt-1">{mockDistrictUsers.length}</div>
          <span className="text-[11px] text-slate-500">Across Pune district</span>
        </div>

        <div className="p-4 bg-white rounded-gov border border-gov-border shadow-gov-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Frontline Workers</span>
          <div className="text-2xl font-bold text-gov-green-800 mt-1">
            {mockDistrictUsers.filter((u) => u.role === 'health_worker').length}
          </div>
          <span className="text-[11px] text-gov-green-800 font-medium">ASHAs, ANMs, CHOs</span>
        </div>

        <div className="p-4 bg-white rounded-gov border border-gov-border shadow-gov-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Facility Staff / MOs</span>
          <div className="text-2xl font-bold text-purple-900 mt-1">
            {mockDistrictUsers.filter((u) => u.role === 'facility').length}
          </div>
          <span className="text-[11px] text-slate-500">Superintendents &amp; In-Charges</span>
        </div>

        <div className="p-4 bg-white rounded-gov border border-gov-border shadow-gov-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Active on Duty</span>
          <div className="text-2xl font-bold text-emerald-700 mt-1">100%</div>
          <span className="text-[11px] text-emerald-700 font-medium">Full district coverage</span>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <Card>
        <CardContent className="p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search name, designation, sub-centre, or block..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-gov border border-gov-border focus:outline-none focus:ring-1 focus:ring-gov-green-500 bg-white"
            />
          </div>

          {/* Role Filter Tabs */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setRoleFilter('all')}
              className={`px-3 py-1.5 rounded-gov text-xs font-semibold whitespace-nowrap transition-colors ${
                roleFilter === 'all'
                  ? 'bg-gov-green-800 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Personnel ({mockDistrictUsers.length})
            </button>
            <button
              onClick={() => setRoleFilter('health_worker')}
              className={`px-3 py-1.5 rounded-gov text-xs font-semibold whitespace-nowrap transition-colors ${
                roleFilter === 'health_worker'
                  ? 'bg-gov-green-800 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Health Workers
            </button>
            <button
              onClick={() => setRoleFilter('facility')}
              className={`px-3 py-1.5 rounded-gov text-xs font-semibold whitespace-nowrap transition-colors ${
                roleFilter === 'facility'
                  ? 'bg-gov-green-800 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Facility Staff
            </button>
            <button
              onClick={() => setRoleFilter('admin')}
              className={`px-3 py-1.5 rounded-gov text-xs font-semibold whitespace-nowrap transition-colors ${
                roleFilter === 'admin'
                  ? 'bg-gov-green-800 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Admins
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Directory Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle>District Operational Stakeholder Roster</CardTitle>
            <CardDescription>
              Verified personnel managing patient referral pipelines and hospital service coordination
            </CardDescription>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Showing {filteredUsers.length} personnel
          </span>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User Name</TableHead>
                <TableHead>Role &amp; Cadre</TableHead>
                <TableHead>Assigned Post / Facility</TableHead>
                <TableHead>Block</TableHead>
                <TableHead>Contact Telemetry</TableHead>
                <TableHead>Covered Patients</TableHead>
                <TableHead>Referrals Logged</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="font-semibold text-gov-text-primary text-xs">
                      {user.name}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      ID: {user.id}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {getRoleBadge(user.role)}
                      <span className="text-xs text-slate-700 block font-medium">
                        {user.cadreOrDesignation}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs font-semibold text-gov-text-primary">
                      {user.assignedArea}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-slate-700">
                    {user.block}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-0.5 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-600 font-mono text-[11px]">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{user.phone}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500 text-[10px]">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span>{user.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs">
                    {user.patientsCount ? (
                      <span className="font-semibold text-slate-800">{user.patientsCount}</span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs font-bold text-gov-green-800">
                    {user.referralsCount}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {user.activeStatus}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
              {filteredUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-slate-500 text-xs">
                    No stakeholders found matching the current search parameters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
