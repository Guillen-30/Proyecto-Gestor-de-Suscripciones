import { X } from "lucide-react";
import { useState } from "react";
import { useThemeColors } from "../hooks/useThemeColors";

interface PaymentHistoryFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payment: any) => void;
  subscriptions: Array<{ id: number; name: string; category: string }>;
  paymentMethods: Array<{ id: number; alias: string }>;
}

export function PaymentHistoryForm({ isOpen, onClose, onSave, subscriptions, paymentMethods }: PaymentHistoryFormProps) {
  const colors = useThemeColors();
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    subscriptionId: "",
    paymentMethodId: "",
    amount: "",
    notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const subscription = subscriptions.find(s => s.id.toString() === formData.subscriptionId);
    const paymentMethod = paymentMethods.find(p => p.id.toString() === formData.paymentMethodId);
    
    onSave({
      id: Date.now(),
      date: formData.date,
      service: subscription?.name || "",
      category: subscription?.category || "",
      paymentMethod: paymentMethod?.alias || "",
      amount: parseFloat(formData.amount),
      notes: formData.notes,
    });
    
    setFormData({
      date: new Date().toISOString().split('T')[0],
      subscriptionId: "",
      paymentMethodId: "",
      amount: "",
      notes: "",
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}>
      <div 
        id="payment-history-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="payment-history-title"
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
          <h2 id="payment-history-title" className="text-2xl text-foreground">Registrar Pago Manual</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar registro de pago"
            className="p-2 rounded-lg hover:opacity-80 transition-all"
            style={{ backgroundColor: colors.primaryAction }}
          >
            <X className="w-5 h-5 text-foreground" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-sm text-secondary mb-2 block">Fecha de Pago *</label>
            <input
              aria-label="Fecha de pago"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
              className="w-full px-4 py-3 rounded-lg outline-none"
              style={{ backgroundColor: colors.bgBase, color: colors.textPrimary }}
            />
          </div>

          <div>
            <label className="text-sm text-secondary mb-2 block">Suscripción *</label>
            <select
              aria-label="Suscripción"
              value={formData.subscriptionId}
              onChange={(e) => setFormData({ ...formData, subscriptionId: e.target.value })}
              required
              className="w-full px-4 py-3 rounded-lg outline-none"
              style={{ backgroundColor: colors.bgBase, color: colors.textPrimary }}
            >
              <option value="">Seleccionar suscripción</option>
              {subscriptions.map((sub) => (
                <option key={sub.id} value={sub.id}>{sub.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-secondary mb-2 block">Método de Pago *</label>
            <select
              aria-label="Método de pago"
              value={formData.paymentMethodId}
              onChange={(e) => setFormData({ ...formData, paymentMethodId: e.target.value })}
              required
              className="w-full px-4 py-3 rounded-lg outline-none"
              style={{ backgroundColor: colors.bgBase, color: colors.textPrimary }}
            >
              <option value="">Seleccionar método</option>
              {paymentMethods.map((method) => (
                <option key={method.id} value={method.id}>{method.alias}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-secondary mb-2 block">Monto *</label>
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="0.00"
              required
              className="w-full px-4 py-3 rounded-lg outline-none"
              style={{ backgroundColor: colors.bgBase, color: colors.textPrimary }}
            />
          </div>

          <div>
            <label className="text-sm text-secondary mb-2 block">Notas (Opcional)</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Información adicional sobre este pago..."
              rows={3}
              className="w-full px-4 py-3 rounded-lg outline-none resize-none"
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
              style={{ backgroundColor: colors.primaryAction, color: colors.textPrimary }}
            >
              Registrar Pago
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
