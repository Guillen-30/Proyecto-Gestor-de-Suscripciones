import { User, Bell, Shield, Moon, Sun, Globe, Check, AlertCircle } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { useState, useEffect } from "react";
import { getSubscriptions, updateUser } from "../lib/api";
import { NOTIF_PREFS_KEY } from "./NotificationsModal";

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

function savePrefs(prefs: NotifPrefs) {
  localStorage.setItem(NOTIF_PREFS_KEY, JSON.stringify(prefs));
}

export function AccountSettings() {
  const { theme, toggleTheme, currency, setCurrency } = useTheme();

  const borderColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
  const inputStyle = {
    borderColor,
    backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
  };

  // ── Profile ──────────────────────────────────────────────────────────
  const storedUser = (() => {
    try { return JSON.parse(localStorage.getItem('user') ?? '{}'); } catch { return {}; }
  })();

  const [nombre, setNombre] = useState<string>(storedUser.nombre || '');
  const [profileMsg, setProfileMsg] = useState<{ text: string; ok: boolean } | null>(null);

  const handleSaveProfile = async () => {
    try {
      await updateUser(storedUser.id, { nombre });
      localStorage.setItem('user', JSON.stringify({ ...storedUser, nombre }));
      setProfileMsg({ text: 'Cambios guardados correctamente', ok: true });
    } catch (err) {
      setProfileMsg({ text: 'Error al guardar: ' + (err as Error).message, ok: false });
    }
    setTimeout(() => setProfileMsg(null), 4000);
  };

  // ── Notification prefs ────────────────────────────────────────────────
  const [prefs, setPrefs] = useState<NotifPrefs>(getPrefs());
  const [subscriptions, setSubscriptions] = useState<Array<{ id: number; name: string }>>([]);

  useEffect(() => {
    getSubscriptions()
      .then(data => setSubscriptions(
        (data.suscripciones ?? []).map((s: any) => ({ id: s.id, name: s.name }))
      ))
      .catch(() => {});
  }, []);

  const updatePrefs = (changes: Partial<NotifPrefs>) => {
    const next = { ...prefs, ...changes };
    setPrefs(next);
    savePrefs(next);
  };

  const handleAllSubsToggle = (enabled: boolean) => {
    if (enabled) {
      updatePrefs({ allSubsEnabled: true, allowedSubIds: [] });
    } else {
      // Pre-select all subscriptions so user can deselect specific ones
      updatePrefs({ allSubsEnabled: false, allowedSubIds: subscriptions.map(s => s.id) });
    }
  };

  const toggleSubId = (id: number) => {
    const current = prefs.allowedSubIds;
    const next = current.includes(id) ? current.filter(x => x !== id) : [...current, id];
    updatePrefs({ allowedSubIds: next });
  };

  return (
    <div className="h-full grid grid-cols-1 lg:grid-cols-2 gap-6 auto-rows-min">

      {/* ── Profile ── */}
      <div className="p-6 rounded-lg border bg-card" style={{ borderColor }}>
        <h3 className="text-lg text-foreground mb-6 flex items-center gap-2">
          <User className="w-5 h-5" aria-hidden="true" />
          Información de Perfil
        </h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm mb-2 block" style={{ color: 'var(--text-secondary)' }}>Nombre Completo</label>
            <input
              type="text"
              aria-label="Nombre Completo"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              className="w-full px-4 py-3 rounded-lg outline-none transition-all focus:ring-2 text-foreground border"
              style={inputStyle}
            />
          </div>
          <div>
            <label className="text-sm mb-2 block" style={{ color: 'var(--text-secondary)' }}>Correo Electrónico</label>
            <input
              readOnly
              type="email"
              aria-label="Correo Electrónico"
              value={storedUser.correo || ''}
              className="w-full px-4 py-3 rounded-lg outline-none text-foreground border opacity-60 cursor-not-allowed"
              style={inputStyle}
            />
          </div>
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={handleSaveProfile}
              aria-label="Guardar cambios"
              className="px-6 py-2.5 rounded-lg transition-all hover:opacity-90"
              style={{ backgroundColor: 'var(--color-primary-action)', color: theme === 'dark' ? '#e8e8e8' : '#ffffff' }}
            >
              Guardar Cambios
            </button>
            {profileMsg && (
              <span className="flex items-center gap-1 text-sm" style={{ color: profileMsg.ok ? '#52b788' : '#E61445' }}>
                {profileMsg.ok ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                {profileMsg.text}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Notification Prefs ── */}
      <div className="p-6 rounded-lg border bg-card" style={{ borderColor }}>
        <h3 className="text-lg text-foreground mb-6 flex items-center gap-2">
          <Bell className="w-5 h-5" aria-hidden="true" />
          Preferencias de Notificaciones
        </h3>
        <div className="space-y-4">

          {/* Type toggles */}
          <Toggle
            label="Alertas de Próximos Pagos"
            description="Notificaciones de renovaciones próximas"
            checked={prefs.upcomingEnabled}
            onChange={v => updatePrefs({ upcomingEnabled: v })}
            primaryColor="var(--color-primary-action)"
          />

          {/* Per-subscription filter */}
          <div className="border-t pt-4" style={{ borderColor }}>
            <p className="text-sm font-medium text-foreground mb-3">Suscripciones</p>
            <Toggle
              label="Todas las suscripciones"
              description="Recibir notificaciones de todas"
              checked={prefs.allSubsEnabled}
              onChange={handleAllSubsToggle}
              primaryColor="var(--color-primary-action)"
            />

            {!prefs.allSubsEnabled && (
              <div className="mt-3 space-y-2 pl-2">
                {subscriptions.length === 0 && (
                  <p className="text-xs text-secondary">Cargando suscripciones…</p>
                )}
                {subscriptions.map(sub => (
                  <label key={sub.id} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={prefs.allowedSubIds.includes(sub.id)}
                      onChange={() => toggleSubId(sub.id)}
                      className="sr-only"
                      aria-label={`Notificaciones de ${sub.name}`}
                    />
                    <div
                      className="w-5 h-5 rounded border flex items-center justify-center transition-all flex-shrink-0"
                      style={{
                        backgroundColor: prefs.allowedSubIds.includes(sub.id) ? 'var(--color-primary-action)' : 'transparent',
                        borderColor: prefs.allowedSubIds.includes(sub.id) ? 'var(--color-primary-action)' : borderColor,
                      }}
                    >
                      {prefs.allowedSubIds.includes(sub.id) && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className="text-sm text-foreground">{sub.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Security ── */}
      <div className="p-6 rounded-lg border bg-card" style={{ borderColor }}>
        <h3 className="text-lg text-foreground mb-6 flex items-center gap-2">
          <Shield className="w-5 h-5" aria-hidden="true" />
          Seguridad
        </h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm mb-2 block" style={{ color: 'var(--text-secondary)' }}>Contraseña Actual</label>
            <input
              type="password"
              aria-label="Contraseña Actual"
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-lg outline-none transition-all focus:ring-2 text-foreground border"
              style={inputStyle}
            />
          </div>
          <div>
            <label className="text-sm mb-2 block" style={{ color: 'var(--text-secondary)' }}>Nueva Contraseña</label>
            <input
              type="password"
              aria-label="Nueva Contraseña"
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-lg outline-none transition-all focus:ring-2 text-foreground border"
              style={inputStyle}
            />
          </div>
          <div>
            <label className="text-sm mb-2 block" style={{ color: 'var(--text-secondary)' }}>Confirmar Nueva Contraseña</label>
            <input
              type="password"
              aria-label="Confirmar Nueva Contraseña"
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-lg outline-none transition-all focus:ring-2 text-foreground border"
              style={inputStyle}
            />
          </div>
          <div className="pt-2">
            <button
              type="button"
              aria-label="Actualizar contraseña"
              className="px-6 py-2.5 rounded-lg transition-all hover:opacity-90"
              style={{ backgroundColor: 'var(--color-primary-action)', color: theme === 'dark' ? '#e8e8e8' : '#ffffff' }}
            >
              Actualizar Contraseña
            </button>
          </div>
        </div>
      </div>

      {/* ── General Preferences ── */}
      <div className="p-6 rounded-lg border bg-card" style={{ borderColor }}>
        <h3 className="text-lg text-foreground mb-6 flex items-center gap-2">
          <Globe className="w-5 h-5" aria-hidden="true" />
          Preferencias Generales
        </h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm mb-2 block" style={{ color: 'var(--text-secondary)' }}>Idioma</label>
            <select
              defaultValue="es"
              aria-label="Idioma"
              className="w-full px-4 py-3 rounded-lg outline-none transition-all focus:ring-2 text-foreground border"
              style={inputStyle}
            >
              <option value="es">Español</option>
              <option value="en">English</option>
              <option value="pt">Português</option>
            </select>
          </div>
          <div>
            <label className="text-sm mb-2 block" style={{ color: 'var(--text-secondary)' }}>Moneda Predeterminada</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              aria-label="Moneda predeterminada"
              className="w-full px-4 py-3 rounded-lg outline-none transition-all focus:ring-2 text-foreground border"
              style={inputStyle}
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
              type="button"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'}
              aria-pressed={theme === 'dark'}
              className="p-2 rounded-lg transition-all hover:opacity-90"
              style={{ backgroundColor: 'var(--color-primary-action)' }}
            >
              {theme === 'dark' ? (
                <Moon className="w-5 h-5" style={{ color: '#e8e8e8' }} aria-hidden="true" />
              ) : (
                <Sun className="w-5 h-5" style={{ color: '#ffffff' }} aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── Danger Zone ── */}
      <div
        className="p-6 rounded-lg border lg:col-span-2 bg-card"
        style={{ borderColor: theme === 'dark' ? '#FF7A7A' : '#dc2626' }}
      >
        <h3 className="text-lg mb-4" style={{ color: theme === 'dark' ? '#FF7A7A' : '#dc2626' }}>Zona de Peligro</h3>
        <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
          Las siguientes acciones son permanentes y no se pueden deshacer.
        </p>
        <button
          type="button"
          aria-label="Eliminar cuenta permanentemente"
          className="px-6 py-2.5 rounded-lg border transition-all hover:opacity-90"
          style={{
            borderColor: theme === 'dark' ? '#FF7A7A' : '#dc2626',
            color: theme === 'dark' ? '#FF7A7A' : '#dc2626',
            backgroundColor: 'transparent',
          }}
        >
          Eliminar Cuenta Permanentemente
        </button>
      </div>
    </div>
  );
}

// ── Small reusable toggle ──────────────────────────────────────────────────────
function Toggle({
  label, description, checked, onChange, primaryColor,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  primaryColor: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-foreground">{label}</p>
        {description && <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{description}</p>}
      </div>
      <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 ml-4">
        <input
          type="checkbox"
          aria-label={label}
          checked={checked}
          onChange={e => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div
          className="w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"
          style={{ backgroundColor: checked ? primaryColor : 'rgba(128,128,128,0.4)' }}
        />
      </label>
    </div>
  );
}
