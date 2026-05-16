import { Plus, Edit, Trash2, Search, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { SubscriptionForm } from "./SubscriptionForm";
import { useThemeColors } from "../hooks/useThemeColors";

const categoryColors: Record<string, string> = {
  Entretenimiento: "#f59e0b",
  Música: "#10b981",
  Productividad: "#3b82f6",
  Desarrollo: "#8b5cf6",
  Almacenamiento: "#06b6d4",
};

const getCategoryColor = (category?: string) => category ? categoryColors[category] || "#6b7d5c" : "#6b7d5c";

const truncateNotes = (notes?: string, maxLength = 64) => {
  if (!notes) return "";
  if (notes.length <= maxLength) return notes;
  return `${notes.slice(0, maxLength - 1)}…`;
};

export function Subscriptions() {
  const colors = useThemeColors();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<any>(null);

  // Estados para conectar con el backend
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [catalogs, setCatalogs] = useState({
    categorias: [], metodosPago: [], ciclosFacturacion: [], estados: []
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const API_BASE_URL = "http://localhost:3001/api"; // Asegúrate del puerto y prefijo

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { "Authorization": `Bearer ${token}` };

      // Hacemos ambas peticiones en paralelo (Lista y Catálogos)
      const [subsRes, catsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/subscriptions`, { headers }),
        fetch(`${API_BASE_URL}/catalogs/subscription-form`, { headers })
      ]);
      
      if (!subsRes.ok || !catsRes.ok) throw new Error("Error al cargar los datos del servidor");
      
      const subsData = await subsRes.json();
      const catsData = await catsRes.json();
      
      setSubscriptions(subsData.suscripciones || []);
      setCatalogs(catsData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar esta suscripción?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/subscriptions/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Error al eliminar la suscripción");
      }
      
      setSubscriptions(subscriptions.filter(s => s.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSaveSubscription = async (payload: any) => {
    try {
      const token = localStorage.getItem("token");
      const isEdit = !!editingSubscription;
      const url = isEdit ? `${API_BASE_URL}/subscriptions/${editingSubscription.id}` : `${API_BASE_URL}/subscriptions`;
      
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Error al guardar la suscripción");
      }

      // Si fue exitoso, recargamos la tabla desde la BD para tener los datos actualizados
      await fetchInitialData();
      setIsFormOpen(false);
      setEditingSubscription(null);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleEdit = (subscription: any) => {
    setEditingSubscription(subscription);
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setEditingSubscription(null);
    setIsFormOpen(true);
  };

  const realCategories = ["Todas", ...Array.from(new Set(subscriptions.map(s => s.categoryName).filter(Boolean)))];

  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesSearch = sub.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "Todas" || sub.categoryName === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-muted-foreground" style={{ color: colors.primaryAction }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg m-6 text-center">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex gap-4 flex-1">
          <div 
            className="flex items-center gap-2 px-4 py-2 rounded-lg flex-1 max-w-md"
            style={{ backgroundColor: colors.bgSurface, borderColor: colors.border }}
          >
            <Search className="w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar suscripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent outline-none text-foreground flex-1"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 rounded-lg outline-none text-foreground"
            style={{ backgroundColor: colors.bgSurface, borderColor: colors.border }}
          >
            {realCategories.map(cat => (
              <option key={cat as string} value={cat as string}>{cat as string}</option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={handleAddNew}
          className="px-6 py-2.5 rounded-lg flex items-center gap-2 transition-all hover:opacity-90 whitespace-nowrap"
          style={{ backgroundColor: colors.primaryAction, color: colors.primaryForeground }}
        >
          <Plus className="w-5 h-5" />
          Nueva Suscripción
        </button>
      </div>

      {/* Subscriptions Table */}
      <div className="rounded-lg border overflow-hidden" style={{ borderColor: 'rgba(255, 255, 255, 0.1)', backgroundColor: colors.bgSurface }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
                <th className="text-left px-6 py-4 text-secondary font-medium">Servicio</th>
                <th className="text-left px-6 py-4 text-secondary font-medium">Categoría</th>
                <th className="text-left px-6 py-4 text-secondary font-medium">Costo</th>
                <th className="text-left px-6 py-4 text-secondary font-medium">Ciclo</th>
                <th className="text-left px-6 py-4 text-secondary font-medium">Próximo Pago</th>
                <th className="text-left px-6 py-4 text-secondary font-medium">Método</th>
                <th className="text-left px-6 py-4 text-secondary font-medium">Estado</th>
                <th className="text-left px-6 py-4 text-secondary font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubscriptions.map((sub) => (
                <tr 
                  key={sub.id}
                  style={{ borderBottom: `1px solid ${colors.border}` }}
                  className="hover:bg-primary/20 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center"
                        style={{ backgroundColor: getCategoryColor(sub.categoryName) }}
                      >
                        {sub.imageUrl ? (
                          <img src={sub.imageUrl} alt={sub.imageAlt || sub.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-white">{sub.name ? sub.name.charAt(0) : '?'}</span>
                        )}
                      </div>
                      <div>
                        <p className="text-foreground">{sub.name}</p>
                        <p className="text-xs text-muted-foreground">{truncateNotes(sub.notes)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-secondary">{sub.categoryName || 'N/A'}</td>
                  <td className="px-6 py-4 text-foreground">
                    ${sub.cost.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-secondary">{sub.billingCycle}</td>
                  <td className="px-6 py-4 text-secondary">
                    {new Date(sub.billingDate).toLocaleDateString('es-ES', { timeZone: 'UTC' })}
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
                        className="p-2 rounded-lg hover:opacity-80 transition-all"
                        style={{ backgroundColor: colors.primaryAction, color: colors.primaryForeground }}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        type="button"
                        onClick={() => handleDelete(sub.id)}
                        className="p-2 rounded-lg hover:opacity-80 transition-all"
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

      {/* Aquí está la corrección: pasamos catalogs en lugar de categories y paymentMethods */}
      <SubscriptionForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingSubscription(null);
        }}
        onSave={handleSaveSubscription}
        editData={editingSubscription}
        catalogs={catalogs}
      />
    </div>
  );
}