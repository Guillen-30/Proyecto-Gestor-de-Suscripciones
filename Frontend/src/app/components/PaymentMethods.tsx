import { Plus, Edit, Trash2, CreditCard, Wallet } from "lucide-react";
import { useState, useEffect } from "react";
import { PaymentMethodForm } from "./PaymentMethodForm";
import { useThemeColors } from "../hooks/useThemeColors";
import {
  getPaymentMethods, getPaymentTypes,
  createPaymentMethod, updatePaymentMethod, deletePaymentMethod, setDefaultPaymentMethod,
} from "../lib/api";

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
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [paymentTypes, setPaymentTypes] = useState<Array<{ id: number; description: string }>>([]);

  async function loadData() {
    try {
      const [methodsData, typesData] = await Promise.all([
        getPaymentMethods(),
        getPaymentTypes(),
      ]);
      setMethods(methodsData.metodosPago);
      setPaymentTypes(typesData.tipos);
    } catch (err) {
      console.error("Error cargando métodos de pago:", err);
    }
  }

  useEffect(() => { loadData(); }, []);

  const handleSave = async (method: any) => {
    try {
      const tipoId = paymentTypes.find(t => t.description === method.type)?.id ?? paymentTypes[0]?.id ?? 1;
      if (editingMethod) {
        await updatePaymentMethod(editingMethod.id, { tipoId, alias: method.alias, detalles: method.details || null });
      } else {
        await createPaymentMethod({ tipoId, alias: method.alias, detalles: method.details || null });
      }
      setEditingMethod(null);
      await loadData();
    } catch (err) {
      alert("Error: " + (err as Error).message);
    }
  };

  const handleEdit = (method: PaymentMethod) => {
    setEditingMethod(method);
    setIsFormOpen(true);
  };

  const handleSetDefault = async (id: number) => {
    if (!confirm('Establecer este método como predeterminado?')) return;
    try {
      await setDefaultPaymentMethod(id);
      await loadData();
    } catch (err) {
      alert('Error: ' + (err as Error).message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar este método de pago?")) return;
    try {
      await deletePaymentMethod(id);
      await loadData();
    } catch (err) {
      alert("Error: " + (err as Error).message);
    }
  };

  const handleAddNew = () => {
    setEditingMethod(null);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl text-foreground">Métodos de Pago</h3>
          <p className="text-sm text-secondary mt-1">Gestiona los métodos de pago que usas para tus suscripciones</p>
        </div>
        <button
          type="button"
          onClick={handleAddNew}
          aria-labelledby="add-payment-method-label"
          className="px-6 py-2.5 rounded-lg flex items-center gap-2 transition-all hover:opacity-90"
          style={{ backgroundColor: colors.primaryAction, color: colors.primaryForeground }}
        >
          <Plus className="w-5 h-5" aria-hidden="true" />
          <span id="add-payment-method-label">Nuevo Método</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {methods.map((method) => (
          <div
            key={method.id}
            className="p-6 rounded-lg border"
            style={{ backgroundColor: colors.bgSurface, borderColor: method.isDefault ? colors.primaryAction : colors.border }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: colors.primaryAction }}>
                  {(method.type || '').includes("Tarjeta") ? (
                    <CreditCard className="w-6 h-6" style={{ color: colors.primaryForeground }} />
                  ) : (
                    <Wallet className="w-6 h-6" style={{ color: colors.primaryForeground }} />
                  )}
                </div>
                <div className="min-w-0">
                  <h4 className="text-lg text-foreground truncate">{method.alias}</h4>
                  <p className="text-sm text-muted-foreground">{method.type}</p>
                  {method.details && <p className="text-sm text-secondary mt-1">{method.details}</p>}
                </div>
              </div>
              {method.isDefault && (
                <span className="px-3 py-1 rounded-full text-xs whitespace-nowrap ml-2" style={{ backgroundColor: colors.primaryAction, color: colors.primaryForeground }}>
                  Predeterminado
                </span>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleEdit(method)}
                aria-label={`Editar ${method.alias}`}
                className="px-4 py-2 rounded-lg hover:opacity-80 transition-all"
                style={{ backgroundColor: colors.primaryAction, color: colors.primaryForeground }}
              >
                <Edit className="w-4 h-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => handleDelete(method.id)}
                aria-label={`Eliminar ${method.alias}`}
                className="px-4 py-2 rounded-lg hover:opacity-80 transition-all"
                style={{ backgroundColor: colors.destructive, color: '#ffffff' }}
              >
                <Trash2 className="w-4 h-4" aria-hidden="true" />
              </button>
              {!method.isDefault && (
                <button
                  type="button"
                  onClick={() => handleSetDefault(method.id)}
                  aria-label={`Establecer como predeterminado`}
                  className="px-4 py-2 rounded-lg hover:opacity-80 transition-all"
                  style={{ backgroundColor: colors.primaryAction, color: colors.primaryForeground }}
                >
                  Establecer como predeterminado
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {methods.length === 0 && (
        <div className="text-center py-12 rounded-lg border" style={{ backgroundColor: colors.bgSurface, borderColor: colors.border }}>
          <CreditCard className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-secondary">No hay métodos de pago registrados</p>
          <p className="text-sm text-muted-foreground mt-2">Agrega tus métodos de pago para gestionar tus suscripciones</p>
        </div>
      )}

      <PaymentMethodForm
        key={editingMethod?.id ?? 'new'}
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setEditingMethod(null); }}
        onSave={handleSave}
        editData={editingMethod}
        typeOptions={paymentTypes.map(t => t.description)}
      />
    </div>
  );
}
