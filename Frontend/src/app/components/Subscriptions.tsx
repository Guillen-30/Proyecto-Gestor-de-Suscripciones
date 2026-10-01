import { Plus, Edit, Trash2, Search } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { useStaggerIn } from "../lib/motion";
import { SubscriptionForm } from "./SubscriptionForm";
import { useThemeColors } from "../hooks/useThemeColors";
import { useTheme } from "../contexts/ThemeContext";
import {
  getSubscriptions, createSubscription, updateSubscription, deleteSubscription,
  getSubscriptionFormData,
} from "../lib/api";

const RATES: Record<string, number> = { USD: 1, EUR: 0.92, CRC: 518, MXN: 17.5 };
const SYMBOLS: Record<string, string> = { USD: '$', EUR: '€', CRC: '₡', MXN: '$MX ' };

interface SubscriptionItem {
  id: number;
  name: string;
  imageUrl: string;
  imageAlt?: string;
  cost: number;
  currency: string;
  billingDate: string;
  billingCycle: string;
  status: string;
  category: string;
  categoryName?: string;
  categoryColor?: string;
  paymentMethod: string;
  notes: string;
}

interface Catalog {
  categorias: Array<{ id: number; name: string; color: string }>;
  metodosPago: Array<{ id: number; alias: string }>;
  ciclosFacturacion: Array<{ id: number; description: string }>;
  estados: Array<{ id: number; description: string }>;
}

const truncateNotes = (notes: string, maxLength = 64) =>
  notes.length <= maxLength ? notes : `${notes.slice(0, maxLength - 1)}…`;

const formatDateNoTimezoneShift = (value: string) => {
  const isoDate = String(value || '').split('T')[0];
  const parts = isoDate.split('-');
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString('es-ES');
};

export function Subscriptions() {
  const colors = useThemeColors();
  const { currency: preferredCurrency } = useTheme();
  const sym = SYMBOLS[preferredCurrency] ?? preferredCurrency + ' ';
  const location = useLocation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<any>(null);
  const [subscriptions, setSubscriptions] = useState<SubscriptionItem[]>([]);
  const [catalog, setCatalog] = useState<Catalog | null>(null);

  async function loadAll() {
    try {
      const [subsData, catalogData] = await Promise.all([
        getSubscriptions(),
        getSubscriptionFormData(),
      ]);
      setCatalog(catalogData);
      setSubscriptions(subsData.suscripciones.map((s: any) => ({
        ...s,
        category: s.categoryName || '',
        currency: 'USD',
        notes: s.notes || '',
      })));
    } catch (err) {
      console.error("Error cargando suscripciones:", err);
    }
  }

  useEffect(() => {
    loadAll();
    const handler = () => loadAll();
    window.addEventListener('subscription-saved', handler);
    return () => window.removeEventListener('subscription-saved', handler);
  }, []);

  const handleSaveSubscription = async (formData: any) => {
    if (!catalog) return;
    try {
      const categoriaId = catalog.categorias.find(c => c.name === formData.category)?.id ?? null;
      const cicloId = catalog.ciclosFacturacion.find(c => c.description === formData.billingCycle)?.id ?? null;
      const estadoId = catalog.estados.find(e => e.description === formData.status)?.id ?? null;
      const metodoPagoId = catalog.metodosPago.find(m => m.alias === formData.paymentMethod)?.id ?? null;

      if (!cicloId) { alert(`Ciclo de facturación no reconocido: "${formData.billingCycle}"`); return; }
      if (!estadoId) { alert(`Estado no reconocido: "${formData.status}"`); return; }

      const body = {
        metodoDePagoId: metodoPagoId || null,
        cicloFacturacionId: cicloId,
        estadoId,
        categoriaId,
        descripcion: formData.name,
        costo: formData.cost,
        fechaRenovacion: formData.billingDate || formData.nextBillingDate,
        imageUrl: formData.imageUrl || null,
        imageAlt: formData.imageAlt || null,
        notas: formData.notes,
      };

      if (editingSubscription) {
        await updateSubscription(editingSubscription.id, body);
      } else {
        await createSubscription(body);
      }
      setEditingSubscription(null);
      await loadAll();
    } catch (err) {
      alert("Error: " + (err as Error).message);
    }
  };

  const handleEdit = (sub: SubscriptionItem) => {
    setEditingSubscription({
      ...sub,
      category: sub.categoryName || sub.category || '',
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar esta suscripción?")) return;
    try {
      await deleteSubscription(id);
      await loadAll();
    } catch (err) {
      alert("Error: " + (err as Error).message);
    }
  };

  const handleAddNew = () => {
    setEditingSubscription(null);
    setIsFormOpen(true);
  };

  useEffect(() => {
    const editId = (location?.state as any)?.editId;
    if (editId) {
      const sub = subscriptions.find(s => s.id === editId);
      if (sub) {
        setEditingSubscription({ ...sub, category: sub.categoryName || sub.category || '' });
        setIsFormOpen(true);
        navigate(location.pathname, { replace: true, state: {} });
      }
    }
  }, [location, subscriptions, navigate]);

  const categoryOptions = ["Todas", ...(catalog?.categorias.map(c => c.name) ?? [])];

  const containerRef = useStaggerIn<HTMLDivElement>(".sub-row", [subscriptions.length, selectedCategory], { y: 12, stagger: 0.04, duration: 0.45 });

  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesSearch = (sub.name ?? '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "Todas" || sub.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (sub: SubscriptionItem) =>
    sub.categoryColor || catalog?.categorias.find(c => c.name === sub.category)?.color || '#6b7d5c';

  return (
    <div ref={containerRef} className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex gap-4 flex-1">
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-lg flex-1 max-w-md"
            style={{ backgroundColor: colors.bgSurface, borderColor: colors.border }}
          >
            <Search className="w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              aria-label="Buscar suscripción"
              placeholder="Buscar suscripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent outline-none text-foreground flex-1"
            />
          </div>
          <select
            aria-label="Filtrar por categoría"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 rounded-lg outline-none text-foreground"
            style={{ backgroundColor: colors.bgSurface, borderColor: colors.border }}
          >
            {categoryOptions.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={handleAddNew}
          aria-labelledby="new-subscription-label"
          className="press px-6 py-2.5 rounded-lg flex items-center gap-2 hover:opacity-90 whitespace-nowrap"
          style={{ backgroundColor: colors.primaryAction, color: colors.primaryForeground }}
        >
          <Plus className="w-5 h-5" aria-hidden="true" />
          <span id="new-subscription-label">Nueva Suscripción</span>
        </button>
      </div>

      <div
        className="rounded-lg border overflow-hidden"
        style={{ borderColor: 'rgba(255, 255, 255, 0.1)', backgroundColor: colors.bgSurface }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
                <th className="text-left px-6 py-4 text-secondary font-medium">Servicio</th>
                <th className="text-left px-6 py-4 text-secondary font-medium">Categoría</th>
                <th className="text-left px-6 py-4 text-secondary font-medium">Costo</th>
                <th className="text-left px-6 py-4 text-secondary font-medium">Ciclo</th>
                <th className="text-left px-6 py-4 text-secondary font-medium">Próximo Pago</th>
                <th className="text-left px-6 py-4 text-secondary font-medium">Método de Pago</th>
                <th className="text-left px-6 py-4 text-secondary font-medium">Estado</th>
                <th className="text-left px-6 py-4 text-secondary font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubscriptions.map((sub) => (
                <tr
                  key={sub.id}
                  style={{ borderBottom: `1px solid ${colors.border}` }}
                  className="sub-row hover:bg-primary/20 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center"
                        style={{ backgroundColor: getCategoryColor(sub) }}
                      >
                        {sub.imageUrl ? (
                          <img src={sub.imageUrl} alt={sub.imageAlt || sub.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-white">{sub.name?.charAt(0)}</span>
                        )}
                      </div>
                      <div>
                        <p className="text-foreground">{sub.name}</p>
                        <p className="text-xs text-muted-foreground">{truncateNotes(sub.notes)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-secondary">{sub.category}</td>
                  <td className="px-6 py-4 text-foreground">
                    {sym}{((parseFloat(String(sub.cost)) / RATES.USD) * (RATES[preferredCurrency] ?? 1)).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-secondary">{sub.billingCycle}</td>
                  <td className="px-6 py-4 text-secondary">
                    {formatDateNoTimezoneShift(sub.billingDate)}
                  </td>
                  <td className="px-6 py-4 text-secondary">{sub.paymentMethod}</td>
                  <td className="px-6 py-4">
                    <span
                      className="px-3 py-1 rounded-full text-xs"
                      style={{ backgroundColor: colors.primaryAction, color: colors.primaryForeground }}
                    >
                      {sub.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(sub)}
                        aria-label={`Editar ${sub.name}`}
                        className="press p-2 rounded-lg hover:opacity-80"
                        style={{ backgroundColor: colors.primaryAction, color: colors.primaryForeground }}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(sub.id)}
                        aria-label={`Eliminar ${sub.name}`}
                        className="press p-2 rounded-lg hover:opacity-80"
                        style={{ backgroundColor: colors.destructive, color: '#ffffff' }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredSubscriptions.length === 0 && (
        <div
          className="text-center py-12 rounded-lg border"
          style={{ borderColor: 'rgba(255, 255, 255, 0.1)', backgroundColor: colors.bgSurface }}
        >
          <p className="text-secondary">No se encontraron suscripciones</p>
        </div>
      )}

      <SubscriptionForm
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setEditingSubscription(null); }}
        onSave={handleSaveSubscription}
        editData={editingSubscription}
        categories={catalog?.categorias.map(c => c.name) ?? []}
        paymentMethods={catalog?.metodosPago ?? []}
      />
    </div>
  );
}
