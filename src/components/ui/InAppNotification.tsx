import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, CheckCircle2, AlertTriangle, Clock, Info, Check, X, Inbox } from 'lucide-react';
import { useNotification, Notification } from '@/hooks/useNotification';
import { useAuth } from '@/contexts/AuthContext';

export interface InAppNotificationProps {
  onNotificationPress?: (notification: Notification) => void;
}

export default function InAppNotification({ onNotificationPress }: InAppNotificationProps) {
  const { user } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead, fetchNotifications } = useNotification();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user, fetchNotifications]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const handleToggleDropdown = () => {
    setShowDropdown(prev => !prev);
  };

  const handleNotificationPress = async (notification: Notification) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }
    if (onNotificationPress) {
      onNotificationPress(notification);
    }
    setShowDropdown(false);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'demande_validee':
        return (
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
            <CheckCircle2 className="h-4 w-4" />
          </div>
        );
      case 'demande_rejetee':
        return (
          <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
            <AlertTriangle className="h-4 w-4" />
          </div>
        );
      case 'demande_examen':
        return (
          <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
            <Clock className="h-4 w-4" />
          </div>
        );
      default:
        return (
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <Bell className="h-4 w-4" />
          </div>
        );
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "À l'instant";
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours} h`;
    if (diffDays === 1) return 'Hier';
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={handleToggleDropdown}
        className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition-all relative cursor-pointer"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 h-4 min-w-[16px] px-1 bg-rose-500 text-white text-[9px] font-extrabold rounded-full border-2 border-white flex items-center justify-center animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 md:w-96 max-h-[480px] bg-white rounded-2xl border border-slate-150 shadow-xl overflow-hidden z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 bg-slate-50 border-b border-slate-100">
              <span className="font-extrabold text-sm text-slate-800">Notifications</span>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer flex items-center gap-1"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>Tout marquer comme lu</span>
                </button>
              )}
            </div>

            {/* List */}
            <div className="overflow-y-auto max-h-[380px] divide-y divide-slate-100">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 px-5 text-center">
                  <div className="p-3 bg-slate-50 rounded-full text-slate-300 mb-3">
                    <Inbox className="h-6 w-6" />
                  </div>
                  <p className="text-xs font-bold text-slate-800">Aucune notification</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Nous vous préviendrons dès que quelque chose change.</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationPress(notification)}
                    className={`
                      w-full text-left p-4 flex items-start gap-3 transition-colors select-none cursor-pointer
                      ${notification.is_read ? 'bg-white hover:bg-slate-50/50' : 'bg-blue-50/20 hover:bg-blue-50/40'}
                    `}
                  >
                    <div className="shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-xs font-bold text-slate-800 truncate ${!notification.is_read ? 'font-extrabold' : ''}`}>
                          {notification.titre}
                        </p>
                        <span className="text-[10px] font-medium text-slate-400 shrink-0 mt-0.5">
                          {formatDate(notification.created_at)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-normal">
                        {notification.message}
                      </p>
                    </div>
                    {!notification.is_read && (
                      <div className="shrink-0 w-2 h-2 rounded-full bg-blue-600 self-center" />
                    )}
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
