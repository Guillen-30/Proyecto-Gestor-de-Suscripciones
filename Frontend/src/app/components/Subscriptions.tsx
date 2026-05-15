import { Plus, Edit, Trash2, Search } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { SubscriptionForm } from "./SubscriptionForm";
import { useThemeColors } from "../hooks/useThemeColors";

const mockCategories = ["Entretenimiento", "Música", "Productividad", "Desarrollo", "Almacenamiento"];
const mockPaymentMethods = [
  { id: 1, alias: "Tarjeta Visa *1234" },
  { id: 2, alias: "Tarjeta Master *5678" },
  { id: 3, alias: "PayPal" },
];

const categoryColors: Record<string, string> = {
  Entretenimiento: "#f59e0b",
  Música: "#10b981",
  Productividad: "#3b82f6",
  Desarrollo: "#8b5cf6",
  Almacenamiento: "#06b6d4",
};

const getCategoryColor = (category: string) => categoryColors[category] || "#6b7d5c";

const categories = ["Todas", ...mockCategories];

const truncateNotes = (notes: string, maxLength = 64) => {
  if (notes.length <= maxLength) {
    return notes;
  }

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
  const [subscriptions, setSubscriptions] = useState([
    {
      id: 1,
      name: "Netflix",
      imageUrl: "https://placehold.co/80x80/E50914/FFFFFF?text=N",
      cost: 15.99,
      currency: "USD",
      billingDate: "2026-04-15",
      billingCycle: "Mensual",
      status: "Activa",
      category: "Entretenimiento",
      paymentMethod: "Tarjeta Visa *1234",
      notes: "Plan Premium - 4 pantallas",
    },
    {
      id: 2,
      name: "Spotify",
      imageUrl: "https://placehold.co/80x80/1DB954/FFFFFF?text=S",
      cost: 9.99,
      currency: "USD",
      billingDate: "2026-04-10",
      billingCycle: "Mensual",
      status: "Activa",
      category: "Música",
      paymentMethod: "Tarjeta Master *5678",
      notes: "Plan Individual",
    },
    {
      id: 3,
      name: "Adobe Creative Cloud",
      imageUrl: "https://placehold.co/80x80/FF0000/FFFFFF?text=A",
      cost: 52.99,
      currency: "USD",
      billingDate: "2026-04-20",
      billingCycle: "Mensual",
      status: "Activa",
      category: "Productividad",
      paymentMethod: "Tarjeta Visa *1234",
      notes: "Todas las aplicaciones",
    },
    {
      id: 4,
      name: "Amazon Prime",
      imageUrl: "https://placehold.co/80x80/FF9900/FFFFFF?text=P",
      cost: 14.99,
      currency: "USD",
      billingDate: "2026-04-08",
      billingCycle: "Mensual",
      status: "Activa",
      category: "Entretenimiento",
      paymentMethod: "Tarjeta Visa *1234",
      notes: "Envío gratis + Prime Video",
    },
    {
      id: 5,
      name: "GitHub Pro",
      imageUrl: "https://placehold.co/80x80/24292E/FFFFFF?text=G",
      cost: 7.00,
      currency: "USD",
      billingDate: "2026-04-12",
      billingCycle: "Mensual",
      status: "Activa",
      category: "Desarrollo",
      paymentMethod: "Tarjeta Master *5678",
      notes: "Repositorios privados ilimitados",
    },
    {
      id: 6,
      name: "Dropbox",
      imageUrl: "https://placehold.co/80x80/0061FF/FFFFFF?text=D",
      cost: 11.99,
      currency: "USD",
      billingDate: "2026-04-18",
      billingCycle: "Mensual",
      status: "Activa",
      category: "Almacenamiento",
      paymentMethod: "PayPal",
      notes: "2TB de almacenamiento",
    },
  ]);

  const handleSaveSubscription = (subscription: any) => {
    if (editingSubscription) {
      setSubscriptions(subscriptions.map(s => s.id === subscription.id ? subscription : s));
    } else {
      setSubscriptions([...subscriptions, subscription]);
    }
    setEditingSubscription(null);
  };

  const handleEdit = (subscription: any) => {
    setEditingSubscription(subscription);
    setIsFormOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("¿Estás seguro de eliminar esta suscripción?")) {
      setSubscriptions(subscriptions.filter(s => s.id !== id));
    }
  };

  const handleAddNew = () => {
    setEditingSubscription(null);
    setIsFormOpen(true);
  };

  // Open edit form when navigated here with state.editId
  useEffect(() => {
    const editId = (location && (location as any).state && (location as any).state.editId) || null;
    if (editId) {
      const sub = subscriptions.find((s) => s.id === editId);
      if (sub) {
        setEditingSubscription(sub);
        setIsFormOpen(true);
        // clear navigation state to avoid reopening
        navigate(location.pathname, { replace: true, state: {} });
      }
    }
  }, [location, subscriptions, navigate]);

  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesSearch = sub.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "Todas" || sub.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <button
          onClick={handleAddNew}
          className="px-6 py-2.5 rounded-lg flex items-center gap-2 transition-all hover:opacity-90 whitespace-nowrap"
          style={{ backgroundColor: colors.primaryAction, color: colors.primaryForeground }}
        >
          <Plus className="w-5 h-5" />
          Nueva Suscripción
        </button>
      </div>

      {/* Subscriptions Table */}
      <div 
        className="rounded-lg border overflow-hidden"
        style={{ 
          borderColor: 'rgba(255, 255, 255, 0.1)',
          backgroundColor: colors.bgSurface,
        }}
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
                  className="hover:bg-primary/20 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center"
                        style={{ backgroundColor: getCategoryColor(sub.category) }}
                      >
                        {sub.imageUrl ? (
                          <img
                            src={sub.imageUrl}
                            alt={sub.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-foreground">{sub.name.charAt(0)}</span>
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
                    ${sub.cost} <span className="text-muted-foreground">{sub.currency}</span>
                  </td>
                  <td className="px-6 py-4 text-secondary">{sub.billingCycle}</td>
                  <td className="px-6 py-4 text-secondary">
                    {new Date(sub.billingDate).toLocaleDateString('es-ES')}
                  </td>
                  <td className="px-6 py-4 text-secondary">{sub.paymentMethod}</td>
                  <td className="px-6 py-4">
                    <span 
                      className="px-3 py-1 rounded-full text-xs"
                      style={{
                        backgroundColor: colors.primaryAction,
                        color: colors.primaryForeground
                      }}
                    >
                      {sub.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleEdit(sub)}
                        className="p-2 rounded-lg hover:opacity-80 transition-all"
                        style={{ backgroundColor: colors.primaryAction, color: colors.primaryForeground }}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
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
          style={{ 
            borderColor: 'rgba(255, 255, 255, 0.1)',
            backgroundColor: colors.bgSurface,
          }}
        >
          <p className="text-secondary">No se encontraron suscripciones</p>
        </div>
      )}

      {/* Subscription Form Modal */}
      <SubscriptionForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingSubscription(null);
        }}
        onSave={handleSaveSubscription}
        editData={editingSubscription}
        categories={mockCategories}
        paymentMethods={mockPaymentMethods}
      />
    </div>
  );
}