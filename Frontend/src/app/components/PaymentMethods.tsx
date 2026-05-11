import { Plus, Edit, Trash2, CreditCard, Wallet } from "lucide-react";
import { useState } from "react";
import { PaymentMethodForm } from "./PaymentMethodForm";
import { useThemeColors } from "../hooks/useThemeColors";

interface PaymentMethod {
  id: number;
  alias: string;
  type: string;
  details: string;
  isDefault: boolean;
}

export function PaymentMethods() {
  const colors = useThemeColors();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [methods, setMethods] = useState<PaymentMethod[]>([
    { id: 1, alias: "Tarjeta Visa Principal", type: "Tarjeta de Crédito", details: "Termina en 1234", isDefault: true },
    { id: 2, alias: "Mastercard Personal", type: "Tarjeta de Débito", details: "Termina en 5678", isDefault: false },
    { id: 3, alias: "PayPal Business", type: "Cartera Digital", details: "business@email.com", isDefault: false },
  ]);

  const handleSave = (method: PaymentMethod) => {
    if (editingMethod) {
      setMethods(methods.map(m => m.id === method.id ? method : m));
    } else {
      setMethods([...methods, { ...method, isDefault: methods.length === 0 }]);
    }
    setEditingMethod(null);
  };

  const handleEdit = (method: PaymentMethod) => {
    setEditingMethod(method);
    setIsFormOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("¿Estás seguro de eliminar este método de pago?")) {
      setMethods(methods.filter(method => method.id !== id));
    }
  };

  const handleAddNew = () => {
    setEditingMethod(null);
    setIsFormOpen(true);
  };

  const setDefault = (id: number) => {
    setMethods(methods.map(method => ({
      ...method,
      isDefault: method.id === id
    })));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl text-foreground">Métodos de Pago</h3>
          <p className="text-sm text-secondary mt-1">Gestiona los métodos de pago que usas para tus suscripciones</p>
        </div>
        <button
          onClick={handleAddNew}
          className="px-6 py-2.5 rounded-lg flex items-center gap-2 transition-all hover:opacity-90"
          style={{ backgroundColor: colors.primaryAction, color: colors.primaryForeground }}
        >
          <Plus className="w-5 h-5" />
          Nuevo Método
        </button>
      </div>

      {/* Payment Methods List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {methods.map((method) => (
          <div 
            key={method.id}
            className="p-6 rounded-lg border"
            style={{
              backgroundColor: colors.bgSurface,
              borderColor: method.isDefault ? colors.primaryAction : colors.border
            }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3 flex-1">
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: colors.primaryAction }}
                >
                  {method.type.includes("Tarjeta") ? (
                    <CreditCard className="w-6 h-6 text-foreground" />
                  ) : (
                    <Wallet className="w-6 h-6 text-foreground" />
                  )}
                </div>
                <div className="min-w-0">
                  <h4 className="text-lg text-foreground truncate">{method.alias}</h4>
                  <p className="text-sm text-muted-foreground">{method.type}</p>
                  {method.details && (
                    <p className="text-sm text-secondary mt-1">{method.details}</p>
                  )}
                </div>
              </div>
              {method.isDefault && (
                <span 
                  className="px-3 py-1 rounded-full text-xs whitespace-nowrap ml-2"
                  style={{ backgroundColor: colors.primaryAction, color: colors.primaryForeground }}
                >
                  Predeterminado
                </span>
              )}
            </div>
            
            <div className="flex gap-2">
              {!method.isDefault && (
                <button
                  onClick={() => setDefault(method.id)}
                  className="flex-1 px-4 py-2 rounded-lg border transition-all hover:opacity-80 text-sm"
                  style={{ borderColor: colors.primaryAction, color: colors.primaryAction }}
                >
                  Predeterminado
                </button>
              )}
              <button
                onClick={() => handleEdit(method)}
                className="px-4 py-2 rounded-lg hover:opacity-80 transition-all"
                style={{ backgroundColor: colors.primaryAction, color: colors.primaryForeground }}
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(method.id)}
                className="px-4 py-2 rounded-lg hover:opacity-80 transition-all"
                style={{ backgroundColor: colors.destructive, color: '#ffffff' }}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {methods.length === 0 && (
        <div 
          className="text-center py-12 rounded-lg border"
          style={{
            backgroundColor: colors.bgSurface,
            borderColor: colors.border
          }}
        >
          <CreditCard className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-secondary">No hay métodos de pago registrados</p>
          <p className="text-sm text-muted-foreground mt-2">Agrega tus métodos de pago para gestionar tus suscripciones</p>
        </div>
      )}

      {/* Payment Method Form Modal */}
      <PaymentMethodForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingMethod(null);
        }}
        onSave={handleSave}
        editData={editingMethod}
      />
    </div>
  );
}