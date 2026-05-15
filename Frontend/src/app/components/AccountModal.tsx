import { X, Settings, Clock, LogOut, User as UserIcon } from "lucide-react";
import { useThemeColors } from "../hooks/useThemeColors";

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
  onLogout: () => void;
  user?: { name?: string; email?: string };
}

export function AccountModal({ isOpen, onClose, onNavigate, onLogout, user }: AccountModalProps) {
  const colors = useThemeColors();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-4" onClick={onClose}>
      <div
        className="w-full max-w-sm mt-16 mr-4 rounded-lg border shadow-2xl overflow-hidden"
        style={{
          backgroundColor: colors.bgSurface,
          borderColor: colors.border,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between p-4 border-b sticky top-0 z-10"
          style={{ backgroundColor: colors.bgSurface, borderColor: colors.border }}
        >
          <div className="flex items-center gap-3">
            <UserIcon className="w-6 h-6 text-foreground" />
            <h2 className="text-lg text-foreground">Cuenta</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:opacity-80 transition-all"
            style={{ backgroundColor: colors.primaryAction }}
          >
            <X className="w-5 h-5" style={{ color: colors.primaryForeground }} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center text-xl"
              style={{ backgroundColor: colors.primaryAction }}
            >
              <span className="text-foreground">{(user && user.name ? user.name.charAt(0) : "U")}</span>
            </div>
            <div>
              <p className="text-foreground font-medium">{user?.name || "Usuario"}</p>
              <p className="text-sm text-secondary">{user?.email || "usuario@ejemplo.com"}</p>
            </div>
          </div>

          <div className="divide-y" style={{ borderColor: colors.border }}>
            <div className="py-3">
              <button
                onClick={() => { onNavigate('/configuracion'); onClose(); }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-opacity-10 transition-all"
                style={{ backgroundColor: 'transparent', color: colors.textPrimary }}
              >
                <Settings className="w-5 h-5" />
                <span>Configuración de Cuenta</span>
              </button>
            </div>
            <div className="py-3">
              <button
                onClick={() => { onNavigate('/historial'); onClose(); }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-opacity-10 transition-all"
                style={{ backgroundColor: 'transparent', color: colors.textPrimary }}
              >
                <Clock className="w-5 h-5" />
                <span>Historial Financiero</span>
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => { onLogout(); onClose(); }}
              className="w-full px-3 py-2 rounded-lg transition-all hover:opacity-80"
              style={{ backgroundColor: colors.destructive, color: '#ffffff' }}
            >
              <div className="flex items-center justify-center gap-2">
                <LogOut className="w-4 h-4" />
                <span>Cerrar Sesión</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
