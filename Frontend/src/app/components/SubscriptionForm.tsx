import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { useThemeColors } from "../hooks/useThemeColors";
import { useTheme } from "../contexts/ThemeContext";


interface SubscriptionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (subscription: any) => void;
  editData?: any;
  categories: string[];
  paymentMethods: Array<{ id: number; alias: string }>;
}

const RATES: Record<string, number> = { USD: 1, EUR: 0.92, CRC: 518, MXN: 17.5 };

export function SubscriptionForm({ isOpen, onClose, onSave, editData, categories, paymentMethods }: SubscriptionFormProps) {
  const colors = useThemeColors();
  const { currency: preferredCurrency } = useTheme();

  const toDateInput = (d: string) => d ? String(d).split('T')[0] : '';

  const createInitialFormData = (data?: any) => data ? {
    ...data,
    currency: preferredCurrency,
    cost: data.cost
      ? (parseFloat(String(data.cost)) * (RATES[preferredCurrency] ?? 1)).toFixed(2)
      : '',
    nextBillingDate: data.nextBillingDate
      ? toDateInput(data.nextBillingDate)
      : toDateInput(data.billingDate),
  } : {
    name: "",
    category: "",
    cost: "",
    currency: preferredCurrency,
    billingCycle: "Mensual",
    nextBillingDate: "",
    paymentMethod: "",
    status: "Activa",
    imageUrl: "",
    imageAlt: "",
    notes: "",
  };

  const [formData, setFormData] = useState(createInitialFormData(editData));

  useEffect(() => {
    setFormData(createInitialFormData(editData));
  }, [editData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rate = RATES[preferredCurrency] ?? 1;
    onSave({
      ...formData,
      id: editData?.id || Date.now(),
      cost: parseFloat(formData.cost) / rate,
      billingDate: formData.nextBillingDate,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}>
      <div 
        id="subscription-form-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="subscription-form-title"
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
            borderColor: 'rgba(255, 255, 255, 0.1)'
          }}
        >
          <h2 id="subscription-form-title" className="text-2xl text-foreground">
            {editData ? "Editar Suscripción" : "Nueva Suscripción"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar formulario"
            className="p-2 rounded-lg hover:opacity-80 transition-all"
            style={{ backgroundColor: colors.primaryAction }}
          >
            <X className="w-5 h-5 text-foreground" style={{ color: '#ffffff' }} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-sm text-secondary mb-2 block">Nombre del Servicio *</label>
              <input
                aria-label="Nombre del servicio"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Netflix, Spotify..."
                required
                className="w-full px-4 py-3 rounded-lg outline-none"
                style={{ backgroundColor: colors.bgBase, color: colors.textPrimary }}
              />
            </div>

            <div>
              <label className="text-sm text-secondary mb-2 block">Categoría *</label>
              <select
                aria-label="Categoría"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 rounded-lg outline-none"
                style={{ backgroundColor: colors.bgBase, color: colors.textPrimary }}
              >
                <option value="">Seleccionar categoría</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm text-secondary mb-2 block">Ciclo de Facturación *</label>
              <select
                aria-label="Ciclo de facturación"
                value={formData.billingCycle}
                onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value })}
                required
                className="w-full px-4 py-3 rounded-lg outline-none"
                style={{ backgroundColor: colors.bgBase, color: colors.textPrimary }}
              >
                <option value="Semanal">Semanal</option>
                <option value="Mensual">Mensual</option>
                <option value="Trimestral">Trimestral</option>
                <option value="Semestral">Semestral</option>
                <option value="Anual">Anual</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-secondary mb-2 block">Costo *</label>
              <input
                aria-label="Costo"
                type="number"
                step="0.01"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                placeholder="0.00"
                required
                className="w-full px-4 py-3 rounded-lg outline-none"
                style={{ backgroundColor: colors.bgBase, color: colors.textPrimary }}
              />
            </div>

            <div>
              <label className="text-sm text-secondary mb-2 block">Moneda</label>
              <div
                className="w-full px-4 py-3 rounded-lg text-sm"
                style={{ backgroundColor: colors.bgBase, color: colors.textPrimary, opacity: 0.7 }}
              >
                {preferredCurrency === 'USD' && 'USD - Dólar'}
                {preferredCurrency === 'EUR' && 'EUR - Euro'}
                {preferredCurrency === 'CRC' && 'CRC - Colón'}
                {preferredCurrency === 'MXN' && 'MXN - Peso'}
              </div>
            </div>

            <div>
              <label className="text-sm text-secondary mb-2 block">Próxima Fecha de Pago *</label>
              <input
                aria-label="Próxima fecha de pago"
                type="date"
                value={formData.nextBillingDate}
                onChange={(e) => setFormData({ ...formData, nextBillingDate: e.target.value })}
                required
                className="w-full px-4 py-3 rounded-lg outline-none"
                style={{ backgroundColor: colors.bgBase, color: colors.textPrimary }}
              />
            </div>

            <div>
              <label className="text-sm text-secondary mb-2 block">Método de Pago *</label>
              <select
                aria-label="Método de pago"
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                required
                className="w-full px-4 py-3 rounded-lg outline-none"
                style={{ backgroundColor: colors.bgBase, color: colors.textPrimary }}
              >
                <option value="">Seleccionar método</option>
                {paymentMethods.map((method) => (
                  <option key={method.id} value={method.alias}>{method.alias}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm text-secondary mb-2 block">Estado</label>
              <select
                aria-label="Estado"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-3 rounded-lg outline-none"
                style={{ backgroundColor: colors.bgBase, color: colors.textPrimary }}
              >
                <option value="Activa">Activa</option>
                <option value="Pausada">Pausada</option>
                <option value="Cancelada">Cancelada</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="text-sm text-secondary mb-2 block">Imagen de la Suscripción (URL)</label>
              <input
                aria-label="Imagen de la suscripción (URL)"
                type="url"
                value={formData.imageUrl || ""}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://..."
                className="w-full px-4 py-3 rounded-lg outline-none"
                style={{ backgroundColor: colors.bgBase, color: colors.textPrimary }}
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm text-secondary mb-2 block">Texto alternativo de la imagen</label>
              <input
                aria-label="Texto alternativo de la imagen"
                type="text"
                value={formData.imageAlt || ""}
                onChange={(e) => setFormData({ ...formData, imageAlt: e.target.value })}
                placeholder="Ej: Logo de Netflix"
                className="w-full px-4 py-3 rounded-lg outline-none"
                style={{ backgroundColor: colors.bgBase, color: colors.textPrimary }}
              />
              <p className="text-xs text-muted-foreground mt-2">
                Se usa cuando la imagen se carga y para accesibilidad.
              </p>
            </div>

            <div className="md:col-span-2">
              <label className="text-sm text-secondary mb-2 block">Notas (Opcional)</label>
              <textarea
                aria-label="Notas"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Información adicional sobre la suscripción..."
                rows={3}
                className="w-full px-4 py-3 rounded-lg outline-none resize-none"
                style={{ backgroundColor: colors.bgBase, color: colors.textPrimary }}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              aria-label="Cancelar creación de suscripción"
              className="flex-1 px-6 py-3 rounded-lg border transition-all hover:opacity-80"
              style={{ borderColor: colors.border, color: colors.textSecondary }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              aria-label={editData ? "Guardar cambios" : "Crear suscripción"}
              className="flex-1 px-6 py-3 rounded-lg transition-all hover:opacity-90"
              style={{ backgroundColor: colors.primaryAction, color: colors.primaryForeground }}
            >
              {editData ? "Guardar Cambios" : "Crear Suscripción"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}