import { X, Eye, EyeOff } from "lucide-react";
import { useState, useEffect } from "react";
import { useThemeColors } from "../hooks/useThemeColors";

interface CredentialFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (credential: any) => void;
  editData?: any;
}

const emptyForm = () => ({ service: "", username: "", email: "", password: "", website: "" });

export function CredentialForm({ isOpen, onClose, onSave, editData }: CredentialFormProps) {
  const colors = useThemeColors();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState(editData || emptyForm());

  useEffect(() => {
    setFormData(editData || emptyForm());
    setShowPassword(false);
  }, [editData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      id: editData?.id || Date.now(),
      lastModified: new Date().toISOString().split('T')[0],
    });
    setFormData(emptyForm());
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}>
      <div 
        id="credential-form-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="credential-form-title"
        className="w-full max-w-2xl rounded-lg border max-h-[90vh] overflow-y-auto"
        style={{ 
          backgroundColor: colors.bgSurface,
          borderColor: colors.border
        }}
      >
        <div 
          className="flex items-center justify-between p-6 border-b sticky top-0 z-10"
          style={{ 
            backgroundColor: colors.bgSurface,
            borderColor: colors.border
          }}
        >
          <h2 id="credential-form-title" className="text-2xl text-foreground">
            {editData ? "Editar Credencial" : "Nueva Credencial"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar formulario de credencial"
            className="p-2 rounded-lg hover:opacity-80 transition-all"
            style={{ backgroundColor: colors.primaryAction }}
          >
            <X className="w-5 h-5" aria-hidden="true" style={{ color: colors.primaryForeground }} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-sm text-secondary mb-2 block">Nombre del Servicio *</label>
              <input
                type="text"
                value={formData.service}
                onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                placeholder="Ej: Netflix, Gmail, Banco..."
                required
                className="w-full px-4 py-3 rounded-lg outline-none"
                style={{ backgroundColor: colors.bgBase, color: colors.textPrimary }}
              />
            </div>

            <div>
              <label className="text-sm text-secondary mb-2 block">Nombre de Usuario</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="usuario123"
                className="w-full px-4 py-3 rounded-lg outline-none"
                style={{ backgroundColor: colors.bgBase, color: colors.textPrimary }}
              />
            </div>

            <div>
              <label className="text-sm text-secondary mb-2 block">Correo Electrónico</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="usuario@email.com"
                className="w-full px-4 py-3 rounded-lg outline-none"
                style={{ backgroundColor: colors.bgBase, color: colors.textPrimary }}
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm text-secondary mb-2 block">Contraseña *</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 pr-12 rounded-lg outline-none"
                  style={{ backgroundColor: colors.bgBase, color: colors.textPrimary }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" aria-hidden="true" /> : <Eye className="w-5 h-5" aria-hidden="true" />}
                </button>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="text-sm text-secondary mb-2 block">Sitio Web / URL (Opcional)</label>
              <input
                type="text"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://ejemplo.com"
                className="w-full px-4 py-3 rounded-lg outline-none"
                style={{ backgroundColor: colors.bgBase, color: colors.textPrimary }}
              />
            </div>

          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-lg border transition-all hover:opacity-80"
              style={{ borderColor: colors.border, color: colors.textSecondary }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 rounded-lg transition-all hover:opacity-90"
              style={{ backgroundColor: colors.primaryAction, color: colors.primaryForeground }}
            >
              {editData ? "Guardar Cambios" : "Agregar Credencial"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
