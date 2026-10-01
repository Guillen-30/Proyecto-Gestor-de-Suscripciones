import { Plus, Edit, Trash2, FolderOpen } from "lucide-react";
import { useState, useEffect } from "react";
import { useStaggerIn } from "../lib/motion";

import { useThemeColors } from "../hooks/useThemeColors";
import { getCategories, createCategory, updateCategory, deleteCategory } from "../lib/api";

interface Category {
  id: number;
  name: string;
  subscriptionCount: number;
  color: string;
}

const defaultCategoryColor = "#6b7d5c";

export function Categories() {
  const colors = useThemeColors();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [selectedColor, setSelectedColor] = useState(defaultCategoryColor);

  async function loadCategories() {
    try {
      const data = await getCategories();
      setCategories(data.categorias);
    } catch (err) {
      console.error("Error cargando categorías:", err);
    }
  }

  useEffect(() => { loadCategories(); }, []);

  const handleAdd = async () => {
    if (!inputValue.trim()) return;
    try {
      await createCategory({ nombre: inputValue.trim(), color: selectedColor });
      setInputValue("");
      setSelectedColor(defaultCategoryColor);
      setIsAdding(false);
      await loadCategories();
    } catch (err) {
      alert("Error al crear categoría: " + (err as Error).message);
    }
  };

  const handleEdit = async (id: number) => {
    if (!inputValue.trim()) return;
    try {
      await updateCategory(id, { nombre: inputValue.trim(), color: selectedColor });
      setInputValue("");
      setSelectedColor(defaultCategoryColor);
      setEditingId(null);
      await loadCategories();
    } catch (err) {
      alert("Error al actualizar categoría: " + (err as Error).message);
    }
  };

  const handleDelete = async (category: Category) => {
    const msg = category.subscriptionCount > 0
      ? `En esta categoría hay ${category.subscriptionCount} suscripción${category.subscriptionCount !== 1 ? 'es' : ''}. ¿Estás seguro de eliminarla? Las suscripciones y sus datos no se perderán.`
      : "¿Estás seguro de eliminar esta categoría?";
    if (!confirm(msg)) return;
    try {
      await deleteCategory(category.id);
      await loadCategories();
    } catch (err) {
      alert("Error al eliminar: " + (err as Error).message);
    }
  };

  const startEdit = (category: Category) => {
    setEditingId(category.id);
    setInputValue(category.name);
    setSelectedColor(category.color || defaultCategoryColor);
    setIsAdding(false);
  };

  const containerRef = useStaggerIn<HTMLDivElement>(".stagger-item", [categories.length]);

  return (
    <div ref={containerRef} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl text-foreground">Gestión de Categorías</h3>
          <p className="text-sm text-secondary mt-1">Organiza tus suscripciones por categorías personalizadas</p>
        </div>
        <button
          onClick={() => { setIsAdding(true); setEditingId(null); setInputValue(""); setSelectedColor(defaultCategoryColor); }}
          className="px-6 py-2.5 rounded-lg flex items-center gap-2 transition-all hover:opacity-90"
          style={{ backgroundColor: colors.primaryAction, color: colors.primaryForeground }}
        >
          <Plus className="w-5 h-5" aria-hidden="true" />
          Nueva Categoría
        </button>
      </div>

      {isAdding && (
        <div className="reveal p-6 rounded-lg border" style={{ backgroundColor: colors.bgSurface, borderColor: colors.border }}>
          <h4 className="text-lg text-foreground mb-4">Nueva Categoría</h4>
          <div className="flex flex-col md:flex-row gap-3 md:items-center">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Nombre de la categoría"
              aria-label="Nombre de la categoría"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              className="flex-1 px-4 py-3 rounded-lg outline-none"
              style={{ backgroundColor: colors.bgBase, color: colors.textPrimary }}
            />
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg border" style={{ borderColor: colors.border, backgroundColor: colors.bgBase }}>
              <input
                type="color"
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                className="w-10 h-10 cursor-pointer bg-transparent border-0 p-0"
                aria-label="Color de categoría"
              />
              <span className="text-sm text-secondary">Color</span>
            </div>
            <button
              onClick={handleAdd}
              className="px-6 py-3 rounded-lg transition-all hover:opacity-90"
              style={{ backgroundColor: colors.primaryAction, color: colors.primaryForeground }}
            >
              Guardar
            </button>
            <button
              onClick={() => { setIsAdding(false); setInputValue(""); setSelectedColor(defaultCategoryColor); }}
              className="px-6 py-3 rounded-lg border transition-all hover:opacity-80"
              style={{ borderColor: colors.border, color: colors.textSecondary }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <div
            key={category.id}
            className="stagger-item lift p-6 rounded-lg border"
            style={{ backgroundColor: colors.bgSurface, borderColor: "rgba(255, 255, 255, 0.1)" }}
          >
            {editingId === category.id ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  aria-label="Nombre de la categoría"
                  onKeyDown={(e) => e.key === "Enter" && handleEdit(category.id)}
                  autoFocus
                  className="w-full px-4 py-2 rounded-lg outline-none"
                  style={{ backgroundColor: colors.bgBase, color: colors.textPrimary }}
                />
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg border" style={{ borderColor: colors.border, backgroundColor: colors.bgBase }}>
                  <input
                    type="color"
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                    className="w-10 h-10 cursor-pointer bg-transparent border-0 p-0"
                    aria-label="Color de categoría"
                  />
                  <span className="text-sm text-secondary">Color</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(category.id)}
                    className="flex-1 px-4 py-2 rounded-lg transition-all hover:opacity-90 text-sm"
                    style={{ backgroundColor: colors.primaryAction, color: colors.primaryForeground }}
                  >
                    Guardar
                  </button>
                  <button
                    onClick={() => { setEditingId(null); setInputValue(""); setSelectedColor(defaultCategoryColor); }}
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
                      style={{ backgroundColor: category.color || defaultCategoryColor }}
                    >
                      <FolderOpen className="w-6 h-6" style={{ color: "#ffffff" }} aria-hidden="true" />
                    </div>
                    <div>
                      <h4 className="text-lg text-foreground">{category.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {category.subscriptionCount} suscripción{category.subscriptionCount !== 1 ? "es" : ""}
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
                    <Edit className="w-4 h-4" aria-hidden="true" />
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(category)}
                    className="flex-1 p-2 rounded-lg hover:opacity-80 transition-all flex items-center justify-center gap-2"
                    style={{ backgroundColor: colors.destructive, color: "#ffffff" }}
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                    Eliminar
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-12 rounded-lg border" style={{ backgroundColor: colors.bgSurface, borderColor: colors.border }}>
          <FolderOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" aria-hidden="true" />
          <p className="text-secondary">No hay categorías creadas</p>
          <p className="text-sm text-muted-foreground mt-2">Crea tu primera categoría para organizar tus suscripciones</p>
        </div>
      )}
    </div>
  );
}
