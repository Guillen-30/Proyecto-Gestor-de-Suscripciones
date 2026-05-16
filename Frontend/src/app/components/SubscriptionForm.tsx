import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { useThemeColors } from "../hooks/useThemeColors";

interface SubscriptionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (subscription: any) => void;
  editData?: any;
  catalogs: {
    categorias: any[];
    metodosPago: any[];
    ciclosFacturacion: any[];
    estados: any[];
  };
}

export function SubscriptionForm({ isOpen, onClose, onSave, editData, catalogs }: SubscriptionFormProps) {
  const colors = useThemeColors();

  const createInitialFormData = (data?: any) => {
    if (data) {
      // Si estamos editando, buscamos los IDs correspondientes a los textos que vienen en la tabla
      const categoriaId = catalogs.categorias.find(c => c.name === data.categoryName)?.id || "";
      const metodoDePagoId = catalogs.metodosPago.find(m => m.alias === data.paymentMethod)?.id || "";
      const cicloFacturacionId = catalogs.ciclosFacturacion.find(c => c.description === data.billingCycle)?.id || "";
      const estadoId = catalogs.estados.find(e => e.description === data.status)?.id || "";

      return {
        descripcion: data.name || "",
        categoriaId: categoriaId.toString(),
        costo: data.cost?.toString() || "",
        cicloFacturacionId: cicloFacturacionId.toString(),
        fechaRenovacion: data.billingDate ? data.billingDate.split('T')[0] : "", // Formato YYYY-MM-DD
        metodoDePagoId: metodoDePagoId.toString(),
        estadoId: estadoId.toString(),
        imageUrl: data.imageUrl || "",
        imageAlt: data.imageAlt || "",
        notes: data.notes || "",
      };
    }

    // Valores por defecto para una nueva suscripción
    return {
      descripcion: "",
      categoriaId: "",
      costo: "",
      cicloFacturacionId: "",
      fechaRenovacion: "",
      metodoDePagoId: "",
      estadoId: "",
      imageUrl: "",
      imageAlt: "",
      notes: "",
    };
  };

  const [formData, setFormData] = useState(createInitialFormData(editData));

  useEffect(() => {
    setFormData(createInitialFormData(editData));
  }, [editData, isOpen, catalogs]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Armamos el objeto exacto que espera recibir tu backend (userController.js)
    const payload = {
      descripcion: formData.descripcion,
      costo: parseFloat(formData.costo),
      fechaRenovacion: formData.fechaRenovacion,
      categoriaId: formData.categoriaId ? parseInt(formData.categoriaId) : null,
      metodoDePagoId: parseInt(formData.metodoDePagoId),
      cicloFacturacionId: parseInt(formData.cicloFacturacionId),
      estadoId: parseInt(formData.estadoId),
      imageUrl: formData.imageUrl,
      imageAlt: formData.imageAlt
    };

    onSave(payload);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}>
      <div 
        className="w-full max-w-2xl rounded-lg border max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: colors.bgSurface, borderColor: colors.border }}
      >
        <div className="flex items-center justify-between p-6 border-b sticky top-0 z-10" style={{ backgroundColor: colors.bgSurface, borderColor: 'rgba(255, 255, 255, 0.1)' }}>
          <h2 className="text-2xl text-foreground">
            {editData ? "Editar Suscripción" : "Nueva Suscripción"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:opacity-80 transition-all"
            style={{ backgroundColor: colors.primaryAction }}
          >
            <X className="w-5 h-5" style={{ color: '#ffffff' }} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-sm text-secondary mb-2 block">Nombre del Servicio *</label>
              <input
                type="text"
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                placeholder="Ej: Netflix, Spotify..."
                required
                className="w-full px-4 py-3 rounded-lg outline-none"
                style={{ backgroundColor: colors.bgBase, color: colors.textPrimary }}
              />
            </div>

            <div>
              <label className="text-sm text-secondary mb-2 block">Categoría (Opcional)</label>
              <select
                value={formData.categoriaId}
                onChange={(e) => setFormData({ ...formData, categoriaId: e.target.value })}
                className="w-full px-4 py-3 rounded-lg outline-none"
                style={{ backgroundColor: colors.bgBase, color: colors.textPrimary }}
              >
                <option value="">Seleccionar categoría</option>
                {catalogs.categorias.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm text-secondary mb-2 block">Ciclo de Facturación *</label>
              <select
                value={formData.cicloFacturacionId}
                onChange={(e) => setFormData({ ...formData, cicloFacturacionId: e.target.value })}
                required
                className="w-full px-4 py-3 rounded-lg outline-none"
                style={{ backgroundColor: colors.bgBase, color: colors.textPrimary }}
              >
                <option value="">Seleccionar ciclo</option>
                {catalogs.ciclosFacturacion.map((ciclo) => (
                  <option key={ciclo.id} value={ciclo.id}>{ciclo.description}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm text-secondary mb-2 block">Costo *</label>
              <input
                type="number"
                step="0.01"
                value={formData.costo}
                onChange={(e) => setFormData({ ...formData, costo: e.target.value })}
                placeholder="0.00"
                required
                className="w-full px-4 py-3 rounded-lg outline-none"
                style={{ backgroundColor: colors.bgBase, color: colors.textPrimary }}
              />
            </div>

            <div>
              <label className="text-sm text-secondary mb-2 block">Próxima Fecha de Pago *</label>
              <input
                type="date"
                value={formData.fechaRenovacion}
                onChange={(e) => setFormData({ ...formData, fechaRenovacion: e.target.value })}
                required
                className="w-full px-4 py-3 rounded-lg outline-none"
                style={{ backgroundColor: colors.bgBase, color: colors.textPrimary }}
              />
            </div>

            <div>
              <label className="text-sm text-secondary mb-2 block">Método de Pago *</label>
              <select
                value={formData.metodoDePagoId}
                onChange={(e) => setFormData({ ...formData, metodoDePagoId: e.target.value })}
                required
                className="w-full px-4 py-3 rounded-lg outline-none"
                style={{ backgroundColor: colors.bgBase, color: colors.textPrimary }}
              >
                <option value="">Seleccionar método</option>
                {catalogs.metodosPago.map((method) => (
                  <option key={method.id} value={method.id}>{method.alias}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm text-secondary mb-2 block">Estado *</label>
              <select
                value={formData.estadoId}
                onChange={(e) => setFormData({ ...formData, estadoId: e.target.value })}
                required
                className="w-full px-4 py-3 rounded-lg outline-none"
                style={{ backgroundColor: colors.bgBase, color: colors.textPrimary }}
              >
                <option value="">Seleccionar estado</option>
                {catalogs.estados.map((estado) => (
                  <option key={estado.id} value={estado.id}>{estado.description}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="text-sm text-secondary mb-2 block">Imagen de la Suscripción (URL)</label>
              <input
                type="url"
                value={formData.imageUrl || ""}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://..."
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
              {editData ? "Guardar Cambios" : "Crear Suscripción"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}