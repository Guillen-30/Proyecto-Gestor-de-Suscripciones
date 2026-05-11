import { X, Calendar, DollarSign, CreditCard, Repeat, Tag, FileText } from "lucide-react";
import { useThemeColors } from "../hooks/useThemeColors";

interface SubscriptionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: {
    id: number;
    name: string;
    cost: number;
    currency?: string;
    billingDate: string;
    billingCycle: string;
    category: string;
    paymentMethod?: string;
    status: string;
    notes?: string;
  } | null;
}

export function SubscriptionDetailsModal({ isOpen, onClose, subscription }: SubscriptionDetailsModalProps) {
  const colors = useThemeColors();
  if (!isOpen || !subscription) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Activa":
        return "#52b788";
      case "Pausada":
        return "#ffd166";
      case "Cancelada":
        return "#ef476f";
      default:
        return "#8a8a8a";
    }
  };

  const getCycleLabel = (cycle: string) => {
    const cycles: { [key: string]: string } = {
      "Semanal": "Cada semana",
      "Quincenal": "Cada 15 días",
      "Mensual": "Cada mes",
      "Bimestral": "Cada 2 meses",
      "Trimestral": "Cada 3 meses",
      "Semestral": "Cada 6 meses",
      "Anual": "Cada año",
    };
    return cycles[cycle] || cycle;
  };

  const nextPaymentDate = new Date(subscription.billingDate);
  const today = new Date();
  const daysUntil = Math.ceil((nextPaymentDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4" 
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl rounded-lg border overflow-hidden"
        style={{ 
          backgroundColor: colors.bgSurface,
          borderColor: colors.border
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between p-6 border-b"
          style={{ borderColor: colors.border }}
        >
          <div className="flex items-center gap-4">
            <div 
              className="w-14 h-14 rounded-lg flex items-center justify-center text-2xl"
              style={{ backgroundColor: colors.primaryAction }}
            >
              {subscription.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-2xl text-foreground">{subscription.name}</h2>
              <span 
                className="inline-block px-3 py-1 rounded-full text-sm mt-1"
                style={{ 
                  backgroundColor: getStatusColor(subscription.status) + '20',
                  color: getStatusColor(subscription.status)
                }}
              >
                {subscription.status}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:opacity-80 transition-all"
            style={{ backgroundColor: colors.primaryAction }}
          >
            <X className="w-5 h-5 text-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Cost Section */}
          <div 
            className="p-6 rounded-lg text-center border"
            style={{ 
              backgroundColor: colors.primaryAction,
              borderColor: colors.border
            }}
          >
            <p className="text-sm text-foreground/80 mb-2">Costo de Suscripción</p>
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-4xl text-foreground">
                ${subscription.cost.toFixed(2)}
              </span>
              <span className="text-xl text-foreground/80">
                {subscription.currency || "USD"}
              </span>
            </div>
            <p className="text-sm text-foreground/70 mt-2">
              {getCycleLabel(subscription.billingCycle)}
            </p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category */}
            <div 
              className="p-4 rounded-lg border"
              style={{ 
                backgroundColor: colors.bgBase,
                borderColor: colors.border
              }}
            >
              <div className="flex items-center gap-3 mb-2">
                <Tag className="w-5 h-5" style={{ color: colors.primaryAction }} />
                <span className="text-sm text-secondary">Categoría</span>
              </div>
              <p className="text-lg text-foreground ml-8">{subscription.category}</p>
            </div>

            {/* Billing Cycle */}
            <div 
              className="p-4 rounded-lg border"
              style={{ 
                backgroundColor: colors.bgBase,
                borderColor: colors.border
              }}
            >
              <div className="flex items-center gap-3 mb-2">
                <Repeat className="w-5 h-5" style={{ color: colors.primaryAction }} />
                <span className="text-sm text-secondary">Ciclo de Facturación</span>
              </div>
              <p className="text-lg text-foreground ml-8">{subscription.billingCycle}</p>
            </div>

            {/* Next Payment Date */}
            <div 
              className="p-4 rounded-lg border"
              style={{ 
                backgroundColor: colors.bgBase,
                borderColor: colors.border
              }}
            >
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="w-5 h-5" style={{ color: colors.primaryAction }} />
                <span className="text-sm text-secondary">Próximo Pago</span>
              </div>
              <p className="text-lg text-foreground ml-8">
                {nextPaymentDate.toLocaleDateString('es-ES', { 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </p>
              <p className="text-sm text-muted-foreground ml-8 mt-1">
                {daysUntil > 0 ? `En ${daysUntil} día${daysUntil !== 1 ? 's' : ''}` : daysUntil === 0 ? 'Hoy' : 'Vencido'}
              </p>
            </div>

            {/* Payment Method */}
            {subscription.paymentMethod && (
              <div 
                className="p-4 rounded-lg border"
                style={{ 
                  backgroundColor: colors.bgBase,
                  borderColor: colors.border
                }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <CreditCard className="w-5 h-5" style={{ color: colors.primaryAction }} />
                  <span className="text-sm text-secondary">Método de Pago</span>
                </div>
                <p className="text-lg text-foreground ml-8">{subscription.paymentMethod}</p>
              </div>
            )}
          </div>

          {/* Notes */}
          {subscription.notes && (
            <div 
              className="p-4 rounded-lg border"
              style={{ 
                backgroundColor: colors.bgBase,
                borderColor: colors.border
              }}
            >
              <div className="flex items-center gap-3 mb-2">
                <FileText className="w-5 h-5" style={{ color: colors.primaryAction }} />
                <span className="text-sm text-secondary">Notas</span>
              </div>
              <p className="text-foreground ml-8">{subscription.notes}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-lg border transition-all hover:opacity-80"
              style={{ borderColor: colors.border, color: '#b4b4b4' }}
            >
              Cerrar
            </button>
            <button
              className="flex-1 px-6 py-3 rounded-lg transition-all hover:opacity-90"
              style={{ backgroundColor: colors.primaryAction, color: colors.primaryForeground }}
            >
              Editar Suscripción
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
