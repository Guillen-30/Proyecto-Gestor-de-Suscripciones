import { Plus, Edit, Trash2, FolderOpen } from "lucide-react";
import { useState } from "react";
import { useThemeColors } from "../hooks/useThemeColors";

interface Category {
  id: number;
  name: string;
  subscriptionCount: number;
}

export function Categories() {
  const colors = useThemeColors();
  const [categories, setCategories] = useState<Category[]>([
    { id: 1, name: "Entretenimiento", subscriptionCount: 3 },
    { id: 2, name: "Música", subscriptionCount: 1 },
    { id: 3, name: "Productividad", subscriptionCount: 2 },
    { id: 4, name: "Desarrollo", subscriptionCount: 1 },
    { id: 5, name: "Almacenamiento", subscriptionCount: 1 },
  ]);
  
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [inputValue, setInputValue] = useState("");

  const handleAdd = () => {
    if (inputValue.trim()) {
      setCategories([...categories, {
        id: Date.now(),
        name: inputValue,
        subscriptionCount: 0,
      }]);
      setInputValue("");
      setIsAdding(false);
    }
  };

  const handleEdit = (id: number) => {
    if (inputValue.trim()) {
      setCategories(categories.map(cat =>
        cat.id === id ? { ...cat, name: inputValue } : cat
      ));
      setInputValue("");
      setEditingId(null);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("¿Estás seguro de eliminar esta categoría?")) {
      setCategories(categories.filter(cat => cat.id !== id));
    }
  };

  const startEdit = (category: Category) => {
    setEditingId(category.id);
    setInputValue(category.name);
    setIsAdding(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl text-foreground">Gestión de Categorías</h3>
          <p className="text-sm text-secondary mt-1">Organiza tus suscripciones por categorías personalizadas</p>
        </div>
        <button
          onClick={() => {
            setIsAdding(true);
            setEditingId(null);
            setInputValue("");
          }}
          className="px-6 py-2.5 rounded-lg flex items-center gap-2 transition-all hover:opacity-90"
          style={{ backgroundColor: colors.primaryAction, color: colors.primaryForeground }}
        >
          <Plus className="w-5 h-5" />
          Nueva Categoría
        </button>
      </div>

      {/* Add New Category Form */}
      {isAdding && (
        <div 
          className="p-6 rounded-lg border"
          style={{ 
            backgroundColor: colors.bgSurface,
            borderColor: colors.border
          }}
        >
          <h4 className="text-lg text-foreground mb-4">Nueva Categoría</h4>
          <div className="flex gap-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Nombre de la categoría"
              autoFocus
              onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
              className="flex-1 px-4 py-3 rounded-lg outline-none"
              style={{ backgroundColor: colors.bgBase, color: colors.textPrimary }}
            />
            <button
              onClick={handleAdd}
              className="px-6 py-3 rounded-lg transition-all hover:opacity-90"
              style={{ backgroundColor: colors.primaryAction, color: colors.primaryForeground }}
            >
              Guardar
            </button>
            <button
              onClick={() => {
                setIsAdding(false);
                setInputValue("");
              }}
              className="px-6 py-3 rounded-lg border transition-all hover:opacity-80"
              style={{ borderColor: colors.border, color: colors.textSecondary }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <div 
            key={category.id}
            className="p-6 rounded-lg border"
            style={{ 
              backgroundColor: colors.bgSurface,
              borderColor: 'rgba(255, 255, 255, 0.1)'
            }}
          >
            {editingId === category.id ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleEdit(category.id)}
                  autoFocus
                  className="w-full px-4 py-2 rounded-lg outline-none"
                  style={{ backgroundColor: colors.bgBase, color: colors.textPrimary }}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(category.id)}
                    className="flex-1 px-4 py-2 rounded-lg transition-all hover:opacity-90 text-sm"
                    style={{ backgroundColor: colors.primaryAction, color: colors.primaryForeground }}
                  >
                    Guardar
                  </button>
                  <button
                    onClick={() => {
                      setEditingId(null);
                      setInputValue("");
                    }}
                    className="flex-1 px-4 py-2 rounded-lg border transition-all hover:opacity-80 text-sm"
                    style={{ borderColor: colors.border, color: colors.textSecondary }}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: colors.primaryAction }}
                    >
                      <FolderOpen className="w-6 h-6 text-foreground" />
                    </div>
                    <div>
                      <h4 className="text-lg text-foreground">{category.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {category.subscriptionCount} suscripción{category.subscriptionCount !== 1 ? 'es' : ''}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(category)}
                    className="flex-1 p-2 rounded-lg hover:opacity-80 transition-all flex items-center justify-center gap-2"
                    style={{ backgroundColor: colors.primaryAction, color: colors.primaryForeground }}
                  >
                    <Edit className="w-4 h-4" />
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    disabled={category.subscriptionCount > 0}
                    className="flex-1 p-2 rounded-lg hover:opacity-80 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: colors.destructive, color: '#ffffff' }}
                    title={category.subscriptionCount > 0 ? "No puedes eliminar una categoría con suscripciones" : ""}
                  >
                    <Trash2 className="w-4 h-4" />
                    Eliminar
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {categories.length === 0 && (
        <div 
          className="text-center py-12 rounded-lg border"
          style={{ 
            backgroundColor: colors.bgSurface,
            borderColor: colors.border
          }}
        >
          <FolderOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-secondary">No hay categorías creadas</p>
          <p className="text-sm text-muted-foreground mt-2">Crea tu primera categoría para organizar tus suscripciones</p>
        </div>
      )}
    </div>
  );
}
