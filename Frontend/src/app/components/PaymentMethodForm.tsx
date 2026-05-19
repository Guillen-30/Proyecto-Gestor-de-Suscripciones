import { X, CreditCard, Wallet } from "lucide-react";
import { useState } from "react";
import { useThemeColors } from "../hooks/useThemeColors";

interface PaymentMethodFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (method: any) => void;
  editData?: any;
  typeOptions?: string[];
}

export function PaymentMethodForm({ isOpen, onClose, onSave, editData, typeOptions }: PaymentMethodFormProps) {
  const colors = useThemeColors();
  const [formData, setFormData] = useState(editData || {
    alias: "",
    type: "Tarjeta de Crédito",
    details: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      id: editData?.id || Date.now(),
      isDefault: editData?.isDefault || false,
    });
    setFormData({ alias: "", type: "Tarjeta de Crédito", details: "" });
    onClose();
  };

  const methodTypes = typeOptions && typeOptions.length > 0
    ? typeOptions
    : ["Tarjeta de Crédito", "Tarjeta de Débito", "Cartera Digital", "Transferencia Bancaria", "Otro"];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}>
      <div 
        className="w-full max-w-lg rounded-lg border"
        style={{ 
          backgroundColor: colors.bgSurface,
          borderColor: colors.border
        }}
      >
        <div 
          className="flex items-center justify-between p-6 border-b"
          style={{ borderColor: colors.border }}
        >
          <h2 className="text-2xl text-foreground">
            {editData ? "Editar Método de Pago" : "Nuevo Método de Pago"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar registro de metodo de pago"
            className="p-2 rounded-lg hover:opacity-80 transition-all"
            style={{ backgroundColor: colors.primaryAction }}
          >
            <X className="w-5 h-5" aria-hidden="true" style={{ color: colors.primaryForeground }}/>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-sm text-secondary mb-2 block">Alias / Nombre *</label>
            <input
              type="text"
              value={formData.alias}
              onChange={(e) => setFormData({ ...formData, alias: e.target.value })}
              placeholder="Ej: Tarjeta Visa Principal"
              required
              autoFocus
              className="w-full px-4 py-3 rounded-lg outline-none"
              style={{ backgroundColor: colors.bgBase, color: colors.textPrimary }}
            />
          </div>

          <div>
            <label className="text-sm text-secondary mb-2 block">Tipo de Método *</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              aria-label="Tipo de Método"
              required
              className="w-full px-4 py-3 rounded-lg outline-none"
              style={{ backgroundColor: colors.bgBase, color: colors.textPrimary }}
            >
              {methodTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-secondary mb-2 block">Detalles Adicionales</label>
            <input
              type="text"
              value={formData.details}
              onChange={(e) => setFormData({ ...formData, details: e.target.value })}
              placeholder="Ej: Termina en 1234, email@ejemplo.com, etc."
              className="w-full px-4 py-3 rounded-lg outline-none"
              style={{ backgroundColor: colors.bgBase, color: colors.textPrimary }}
            />
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
              {editData ? "Guardar Cambios" : "Agregar Método"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
