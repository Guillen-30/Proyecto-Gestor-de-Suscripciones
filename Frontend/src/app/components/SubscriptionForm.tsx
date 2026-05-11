import { X } from "lucide-react";
import { useState } from "react";
import { useThemeColors } from "../hooks/useThemeColors";

interface SubscriptionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (subscription: any) => void;
  editData?: any;
  categories: string[];
  paymentMethods: Array<{ id: number; alias: string }>;
}

export function SubscriptionForm({ isOpen, onClose, onSave, editData, categories, paymentMethods }: SubscriptionFormProps) {
  const colors = useThemeColors();
  const [formData, setFormData] = useState(editData || {
    name: "",
    category: "",
    cost: "",
    currency: "USD",
    billingCycle: "Mensual",
    nextBillingDate: "",
    paymentMethod: "",
    status: "Activa",
    notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      id: editData?.id || Date.now(),
      cost: parseFloat(formData.cost),
      billingDate: formData.nextBillingDate,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}>
      <div 
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
          <h2 className="text-2xl text-foreground">
            {editData ? "Editar Suscripción" : "Nueva Suscripción"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:opacity-80 transition-all"
            style={{ backgroundColor: colors.primaryAction }}
          >
            <X className="w-5 h-5 text-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-sm text-secondary mb-2 block">Nombre del Servicio *</label>
              <input
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
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
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
                value={formData.billingCycle}
                onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value })}
                required
                className="w-full px-4 py-3 rounded-lg outline-none"
                style={{ backgroundColor: colors.bgBase, color: colors.textPrimary }}
              >
                <option value="Semanal">Semanal</option>
                <option value="Quincenal">Quincenal</option>
                <option value="Mensual">Mensual</option>
                <option value="Bimestral">Bimestral</option>
                <option value="Trimestral">Trimestral</option>
                <option value="Semestral">Semestral</option>
                <option value="Anual">Anual</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-secondary mb-2 block">Costo *</label>
              <input
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
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full px-4 py-3 rounded-lg outline-none"
                style={{ backgroundColor: colors.bgBase, color: colors.textPrimary }}
              >
                <option value="USD">USD - Dólar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="CRC">CRC - Colón</option>
                <option value="MXN">MXN - Peso</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-secondary mb-2 block">Próxima Fecha de Pago *</label>
              <input
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
              <label className="text-sm text-secondary mb-2 block">Notas (Opcional)</label>
              <textarea
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
              {editData ? "Guardar Cambios" : "Crear Suscripción"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}