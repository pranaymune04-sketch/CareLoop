import React, { useState } from 'react';
import { PageHeader } from '@/components/layout';
import { 
  Card, 
  CardContent, 
  Button, 
  TabsList, 
  TabsTrigger, 
  EmptyState 
} from '@/components/ui';
import { mockNotifications } from '@/mock';
import { Notification } from '@/types';
import { 
  AlertTriangle, 
  Info, 
  AlertCircle, 
  Check, 
  CheckCheck
} from 'lucide-react';

export const PatientNotifications: React.FC = () => {
  // Get patient notifications
  const [notifications, setNotifications] = useState<Notification[]>(
    mockNotifications.filter((n) => n.recipientRole === 'patient')
  );

  const [filter, setFilter] = useState<'ALL' | 'UNREAD' | 'CRITICAL'>('ALL');

  const filtered = notifications.filter((n) => {
    if (filter === 'UNREAD') return !n.isRead;
    if (filter === 'CRITICAL') return n.severity === 'critical' || n.severity === 'high';
    return true;
  });

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Notifications & Care Alerts"
        subtitle="Real-time updates regarding appointment confirmations, slot proposals, and follow-up alerts"
        breadcrumbs={[
          { label: 'Patient Portal', href: '/patient' },
          { label: 'Notifications' },
        ]}
        actions={
          unreadCount > 0 ? (
            <Button
              variant="outline"
              size="sm"
              leftIcon={<CheckCheck className="w-3.5 h-3.5" />}
              onClick={handleMarkAllRead}
            >
              Mark All as Read
            </Button>
          ) : undefined
        }
      />

      {/* Filter Tabs Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <TabsList>
          <TabsTrigger active={filter === 'ALL'} onClick={() => setFilter('ALL')}>
            All Notifications ({notifications.length})
          </TabsTrigger>
          <TabsTrigger active={filter === 'UNREAD'} onClick={() => setFilter('UNREAD')}>
            Unread ({unreadCount})
          </TabsTrigger>
          <TabsTrigger active={filter === 'CRITICAL'} onClick={() => setFilter('CRITICAL')}>
            Important Alerts
          </TabsTrigger>
        </TabsList>

        <span className="text-[11px] text-slate-500 font-medium">
          Channel concept: Alerts are mirrored via SMS / WhatsApp service
        </span>
      </div>

      {/* Notifications List */}
      {filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((notif) => (
            <Card
              key={notif.id}
              className={`transition-all duration-150 ${
                !notif.isRead
                  ? 'border-gov-green-300 bg-white shadow-gov-sm'
                  : 'border-gov-border bg-slate-50/50 opacity-80'
              }`}
            >
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-gov bg-slate-100 mt-0.5 shrink-0">
                      {notif.severity === 'critical' ? (
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                      ) : notif.severity === 'high' ? (
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                      ) : (
                        <Info className="w-4 h-4 text-sky-600" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-xs font-bold text-gov-text-primary">
                          {notif.title}
                        </h4>
                        {!notif.isRead && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-gov-green-100 text-gov-green-900 border border-gov-green-300">
                            New
                          </span>
                        )}
                        <span className="text-[10px] uppercase font-bold text-slate-400">
                          Severity: {notif.severity}
                        </span>
                      </div>
                      <p className="text-xs text-gov-text-secondary leading-relaxed">
                        {notif.message}
                      </p>
                      <div className="text-[11px] text-slate-400 font-mono pt-1">
                        Received: {new Date(notif.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {!notif.isRead && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMarkAsRead(notif.id)}
                      className="shrink-0 text-slate-500 hover:text-gov-green-800"
                    >
                      <Check className="w-3.5 h-3.5 mr-1" /> Mark Read
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No Notifications Found"
          description={
            filter === 'UNREAD'
              ? 'You have read all pending notifications.'
              : 'You have no notifications in this view.'
          }
          actionLabel={filter !== 'ALL' ? 'View All Notifications' : undefined}
          onAction={filter !== 'ALL' ? () => setFilter('ALL') : undefined}
        />
      )}
    </div>
  );
};
