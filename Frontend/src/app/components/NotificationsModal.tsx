import { X, Bell, Calendar, CreditCard, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useThemeColors } from "../hooks/useThemeColors";
import { useTheme } from "../contexts/ThemeContext";
import { getSubscriptions } from "../lib/api";

const CURRENCY_SYMBOLS: Record<string, string> = { USD: '$', EUR: '€', CRC: '₡', MXN: '$MX ' };
const CURRENCY_RATES: Record<string, number> = { USD: 1, EUR: 0.92, CRC: 518, MXN: 17.5 };
const READ_KEY = 'notifications_read';
const DELETED_KEY = 'notifications_deleted';
export const NOTIF_PREFS_KEY = 'notification_prefs';

interface Notification {
  id: string;
  subscriptionId?: number;
  type: 'warning' | 'info' | 'success';
  title: string;
  message: string;
  date: string;
}

interface NotifPrefs {
  upcomingEnabled: boolean;
  allSubsEnabled: boolean;
  allowedSubIds: number[];
}

function getPrefs(): NotifPrefs {
  try {
    const raw = localStorage.getItem(NOTIF_PREFS_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return {
      upcomingEnabled: parsed.upcomingEnabled ?? true,
      allSubsEnabled: parsed.allSubsEnabled ?? true,
      allowedSubIds: parsed.allowedSubIds ?? [],
    };
  } catch {
    return { upcomingEnabled: true, allSubsEnabled: true, allowedSubIds: [] };
  }
}

function getReadIds(): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem(READ_KEY) ?? '[]')); }
  catch { return new Set(); }
}

function saveReadIds(ids: Set<string>) {
  localStorage.setItem(READ_KEY, JSON.stringify([...ids]));
}

function getDeletedIds(): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem(DELETED_KEY) ?? '[]')); }
  catch { return new Set(); }
}

function saveDeletedIds(ids: Set<string>) {
  localStorage.setItem(DELETED_KEY, JSON.stringify([...ids]));
}

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationsModal({ isOpen, onClose }: NotificationsModalProps) {
  const colors = useThemeColors();
  const { currency } = useTheme();
  const sym = CURRENCY_SYMBOLS[currency] ?? currency + ' ';
  const rate = CURRENCY_RATES[currency] ?? 1;

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(getReadIds());
  const [deletedIds, setDeletedIds] = useState<Set<string>>(getDeletedIds());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    const prefs = getPrefs();

    getSubscriptions()
      .then((subsData) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let notifs: Notification[] = (subsData.suscripciones ?? [])
          .filter((sub: any) => sub.status === 'Activa' || sub.status === 'Por vencer')
          .sort((a: any, b: any) => new Date(a.billingDate).getTime() - new Date(b.billingDate).getTime())
          .map((sub: any) => {
            const billing = new Date(sub.billingDate);
            billing.setHours(0, 0, 0, 0);
            const days = Math.round((billing.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            let when: string;
            if (days === 0) when = 'hoy';
            else if (days > 0) when = days === 1 ? 'mañana' : `en ${days} días`;
            else when = Math.abs(days) === 1 ? 'hace 1 día' : `hace ${Math.abs(days)} días`;
            const cost = ((parseFloat(sub.cost) || 0) * rate).toFixed(2);
            const type: Notification['type'] = days <= 3 && days >= 0 ? 'warning' : 'info';
            return {
              id: `upcoming-${sub.id}`,
              subscriptionId: sub.id,
              type,
              title: days < 0 ? 'Vencido' : days === 0 ? 'Vence Hoy' : 'Próximo Pago',
              message: `${sub.name} se renueva ${when} — ${sym}${cost}`,
              date: billing.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' }),
            };
          });

        if (!prefs.upcomingEnabled) notifs = [];

        if (!prefs.allSubsEnabled && prefs.allowedSubIds.length > 0) {
          notifs = notifs.filter(n =>
            n.subscriptionId == null || prefs.allowedSubIds.includes(n.subscriptionId)
          );
        }

        setNotifications(notifs);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isOpen, currency]);

  // Keep badge count in localStorage for Layout to read
  const visibleNotifications = notifications.filter(n => !deletedIds.has(n.id));
  const unreadCount = visibleNotifications.filter(n => !readIds.has(n.id)).length;

  useEffect(() => {
    localStorage.setItem('notification_unread_count', String(unreadCount));
  }, [unreadCount]);

  const toggleRead = (id: string) => {
    const next = new Set(readIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    saveReadIds(next);
    setReadIds(next);
  };

  const deleteNotification = (id: string) => {
    const nextDel = new Set(deletedIds);
    nextDel.add(id);
    saveDeletedIds(nextDel);
    setDeletedIds(nextDel);
    const nextRead = new Set(readIds);
    nextRead.delete(id);
    saveReadIds(nextRead);
    setReadIds(nextRead);
  };

  const markAllRead = () => {
    const allIds = new Set(visibleNotifications.map(n => n.id));
    saveReadIds(allIds);
    setReadIds(allIds);
  };

  if (!isOpen) return null;

  return (
    <div className="popover-overlay fixed inset-0 z-50 flex items-start justify-end p-4" onClick={onClose}>
      <div
        id="notifications-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="notifications-title"
        className="w-full max-w-md mt-16 mr-4 rounded-lg border shadow-2xl max-h-[80vh] overflow-hidden"
        style={{ backgroundColor: colors.bgSurface, borderColor: colors.border }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between p-4 border-b sticky top-0 z-10"
          style={{ backgroundColor: colors.bgSurface, borderColor: colors.border }}
        >
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-foreground" />
            <h2 id="notifications-title" className="text-xl text-foreground">Notificaciones</h2>
            {unreadCount > 0 && (
              <span
                className="px-2 py-0.5 rounded-full text-xs font-medium"
                style={{ backgroundColor: colors.destructive, color: '#fff' }}
              >
                {unreadCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:opacity-80 transition-all"
            style={{ backgroundColor: colors.primaryAction }}
            aria-label="Cerrar notificaciones"
          >
            <X className="w-5 h-5" style={{ color: colors.primaryForeground }} />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(80vh-120px)]">
          {loading && (
            <div className="text-center py-8">
              <p className="text-secondary text-sm">Cargando notificaciones…</p>
            </div>
          )}

          {!loading && visibleNotifications.length === 0 && (
            <div className="text-center py-8">
              <Bell className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
              <p className="text-secondary text-sm">Sin notificaciones</p>
            </div>
          )}

          {!loading && visibleNotifications.map((notification) => {
            const isRead = readIds.has(notification.id);
            return (
              <div
                key={notification.id}
                className="p-4 border-b hover:bg-opacity-50 transition-all cursor-pointer"
                style={{
                  backgroundColor: isRead ? 'transparent' : 'rgba(69, 76, 61, 0.15)',
                  borderColor: colors.border,
                }}
                onClick={() => toggleRead(notification.id)}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                      backgroundColor:
                        notification.type === 'warning' ? '#ffd166' :
                        notification.type === 'success' ? colors.success :
                        colors.primaryAction,
                    }}
                  >
                    {notification.type === 'warning' && <Calendar className="w-5 h-5" style={{ color: '#1a1a1a' }} />}
                    {notification.type === 'info' && <CreditCard className="w-5 h-5" style={{ color: colors.primaryForeground }} />}
                    {notification.type === 'success' && <CheckCircle className="w-5 h-5" style={{ color: '#1a1a1a' }} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-foreground font-medium text-sm">{notification.title}</h4>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {!isRead && (
                          <span className="w-2 h-2 rounded-full mt-1.5" style={{ backgroundColor: colors.destructive }} />
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteNotification(notification.id); }}
                          aria-label="Eliminar notificación"
                          className="p-1 rounded hover:opacity-70 transition-all"
                          style={{ color: colors.textSecondary }}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-secondary mt-1">{notification.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{notification.date}</p>
                    <p className="text-xs mt-1" style={{ color: isRead ? colors.textSecondary : colors.primaryAction }}>
                      {isRead ? 'Leída — clic para marcar como no leída' : 'No leída — clic para marcar como leída'}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-4 border-t" style={{ borderColor: colors.border }}>
          <button
            onClick={markAllRead}
            disabled={unreadCount === 0}
            className="w-full py-2 text-sm transition-all hover:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ color: colors.textPrimary }}
          >
            Marcar todas como leídas
          </button>
        </div>
      </div>
    </div>
  );
}
