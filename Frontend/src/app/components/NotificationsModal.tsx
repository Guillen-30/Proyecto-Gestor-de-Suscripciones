import { X, Bell, Calendar, CheckCircle } from "lucide-react";
import { useThemeColors } from "../hooks/useThemeColors";

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationsModal({ isOpen, onClose }: NotificationsModalProps) {
  const colors = useThemeColors();
  const notifications = [
    {
      id: 1,
      type: "warning",
      title: "Próximo Pago",
      message: "Netflix se renovará en 3 días (15 de Abril)",
      date: "Hace 2 horas",
      read: false,
    },
    {
      id: 2,
      type: "info",
      title: "Pago Procesado",
      message: "Se procesó el pago de Spotify ($9.99)",
      date: "Hace 1 día",
      read: false,
    },
    {
      id: 3,
      type: "success",
      title: "Suscripción Actualizada",
      message: "Adobe Creative Cloud ha sido actualizado",
      date: "Hace 2 días",
      read: true,
    },
    {
      id: 4,
      type: "warning",
      title: "Próximo Pago",
      message: "Amazon Prime se renovará en 5 días",
      date: "Hace 3 días",
      read: true,
    },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-4" onClick={onClose}>
      <div
        id="notifications-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="notifications-title"
        className="w-full max-w-md mt-16 mr-4 rounded-lg border shadow-2xl max-h-[80vh] overflow-hidden"
        style={{
          backgroundColor: colors.bgSurface,
          borderColor: colors.border
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between p-4 border-b sticky top-0 z-10"
          style={{
            backgroundColor: colors.bgSurface,
            borderColor: colors.border
          }}
        >
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-foreground" />
            <h2 id="notifications-title" className="text-xl text-foreground">Notificaciones</h2>
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

        <div className="overflow-y-auto max-h-[calc(80vh-80px)]">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="p-4 border-b hover:bg-opacity-50 transition-all cursor-pointer"
              style={{
                backgroundColor: notification.read ? 'transparent' : 'rgba(69, 76, 61, 0.2)',
                borderColor: colors.border
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    backgroundColor: notification.type === 'warning'
                      ? '#ffd166'
                      : notification.type === 'success'
                      ? '#52b788'
                      : colors.primaryAction
                  }}
                >
                  {notification.type === 'warning' && <Calendar className="w-5 h-5" style={{ color: colors.theme === 'dark' ? '#282727' : '#1a1a1a' }} />}
                  {notification.type === 'info' && <Bell className="w-5 h-5" style={{ color: colors.primaryForeground }} />}
                  {notification.type === 'success' && <CheckCircle className="w-5 h-5" style={{ color: colors.theme === 'dark' ? '#282727' : '#1a1a1a' }} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-foreground font-medium">{notification.title}</h4>
                    {!notification.read && (
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5"
                        style={{ backgroundColor: colors.destructive }}
                      />
                    )}
                  </div>
                  <p className="text-sm text-secondary mt-1">{notification.message}</p>
                  <p className="text-xs text-muted-foreground mt-2">{notification.date}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div
          className="p-4 border-t"
          style={{ borderColor: colors.border }}
        >
          <button
            className="w-full py-2 text-sm transition-all hover:opacity-80"
            style={{ color: colors.textPrimary }}
          >
            Marcar todas como leídas
          </button>
        </div>
      </div>
    </div>
  );
}
