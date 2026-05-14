import { User, Mail, Bell, Shield, Moon, Sun, Globe } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

export function AccountSettings() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="h-full grid grid-cols-1 lg:grid-cols-2 gap-6 auto-rows-min">
      {/* Profile Section */}
      <div
        className="p-6 rounded-lg border bg-card"
        style={{
          borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
        }}
      >
        <h3 className="text-lg text-foreground mb-6 flex items-center gap-2">
          <User className="w-5 h-5" />
          Información de Perfil
        </h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm mb-2 block" style={{ color: 'var(--text-secondary)' }}>Nombre Completo</label>
            <input
              type="text"
              defaultValue="Usuario Demo"
              className="w-full px-4 py-3 rounded-lg outline-none transition-all focus:ring-2 bg-background text-foreground border"
              style={{
                borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
              }}
            />
          </div>
          <div>
            <label className="text-sm mb-2 block" style={{ color: 'var(--text-secondary)' }}>Correo Electrónico</label>
            <input
              readOnly
              type="email"
              defaultValue="usuario@email.com"
              className="w-full px-4 py-3 rounded-lg outline-none transition-all focus:ring-2 bg-background text-foreground border"
              style={{
                borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
              }}
            />
          </div>
          <div className="pt-2">
            <button
              className="px-6 py-2.5 rounded-lg transition-all hover:opacity-90"
              style={{ backgroundColor: 'var(--color-primary-action)', color: theme === 'dark' ? '#e8e8e8' : '#ffffff' }}
            >
              Guardar Cambios
            </button>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div
        className="p-6 rounded-lg border bg-card"
        style={{
          borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
        }}
      >
        <h3 className="text-lg text-foreground mb-6 flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Preferencias de Notificaciones
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-foreground">Alertas de Próximos Pagos</p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Recibe notificaciones 3 días antes de cada pago</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div
                className="w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"
                style={{ backgroundColor: 'var(--color-primary-action)' }}
              />
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-foreground">Resumen Mensual</p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Recibe un resumen de tus gastos al final de cada mes</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div
                className="w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"
                style={{ backgroundColor: 'var(--color-primary-action)' }}
              />
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-foreground">Notificaciones por Email</p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Recibe alertas también por correo electrónico</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div
                className="w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"
                style={{ backgroundColor: 'var(--color-primary-action)' }}
              />
            </label>
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div
        className="p-6 rounded-lg border bg-card"
        style={{
          borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
        }}
      >
        <h3 className="text-lg text-foreground mb-6 flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Seguridad
        </h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm mb-2 block" style={{ color: 'var(--text-secondary)' }}>Contraseña Actual</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-lg outline-none transition-all focus:ring-2 bg-background text-foreground border"
              style={{
                borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
              }}
            />
          </div>
          <div>
            <label className="text-sm mb-2 block" style={{ color: 'var(--text-secondary)' }}>Nueva Contraseña</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-lg outline-none transition-all focus:ring-2 bg-background text-foreground border"
              style={{
                borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
              }}
            />
          </div>
          <div>
            <label className="text-sm mb-2 block" style={{ color: 'var(--text-secondary)' }}>Confirmar Nueva Contraseña</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-lg outline-none transition-all focus:ring-2 bg-background text-foreground border"
              style={{
                borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
              }}
            />
          </div>
          <div className="pt-2">
            <button
              className="px-6 py-2.5 rounded-lg transition-all hover:opacity-90"
              style={{ backgroundColor: 'var(--color-primary-action)', color: theme === 'dark' ? '#e8e8e8' : '#ffffff' }}
            >
              Actualizar Contraseña
            </button>
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div
        className="p-6 rounded-lg border bg-card"
        style={{
          borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
        }}
      >
        <h3 className="text-lg text-foreground mb-6 flex items-center gap-2">
          <Globe className="w-5 h-5" />
          Preferencias Generales
        </h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm mb-2 block" style={{ color: 'var(--text-secondary)' }}>Idioma</label>
            <select
              defaultValue="es"
              className="w-full px-4 py-3 rounded-lg outline-none transition-all focus:ring-2 bg-background text-foreground border"
              style={{
                borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
              }}
            >
              <option value="es">Español</option>
              <option value="en">English</option>
              <option value="pt">Português</option>
            </select>
          </div>
          <div>
            <label className="text-sm mb-2 block" style={{ color: 'var(--text-secondary)' }}>Moneda Predeterminada</label>
            <select
              defaultValue="USD"
              className="w-full px-4 py-3 rounded-lg outline-none transition-all focus:ring-2 bg-background text-foreground border"
              style={{
                borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
              }}
            >
              <option value="USD">USD - Dólar Estadounidense</option>
              <option value="EUR">EUR - Euro</option>
              <option value="CRC">CRC - Colón Costarricense</option>
              <option value="MXN">MXN - Peso Mexicano</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-foreground">Modo de Apariencia</p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {theme === 'dark' ? 'Modo oscuro activado' : 'Modo claro activado'}
              </p>
            </div>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg transition-all hover:opacity-90"
              style={{ backgroundColor: 'var(--color-primary-action)' }}
            >
              {theme === 'dark' ? (
                <Moon className="w-5 h-5" style={{ color: '#e8e8e8' }} />
              ) : (
                <Sun className="w-5 h-5" style={{ color: '#ffffff' }} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Danger Zone - Full Width */}
      <div
        className="p-6 rounded-lg border lg:col-span-2 bg-card"
        style={{
          borderColor: theme === 'dark' ? '#ef476f' : '#dc2626'
        }}
      >
        <h3 className="text-lg mb-4" style={{ color: theme === 'dark' ? '#ef476f' : '#dc2626' }}>Zona de Peligro</h3>
        <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
          Las siguientes acciones son permanentes y no se pueden deshacer.
        </p>
        <div className="flex gap-3">
          <button
            className="px-6 py-2.5 rounded-lg border transition-all hover:opacity-90"
            style={{
              borderColor: theme === 'dark' ? '#ef476f' : '#dc2626',
              color: theme === 'dark' ? '#ef476f' : '#dc2626',
              backgroundColor: 'transparent'
            }}
          >
            Eliminar Cuenta Permanentemente
          </button>
        </div>
      </div>
    </div>
  );
}