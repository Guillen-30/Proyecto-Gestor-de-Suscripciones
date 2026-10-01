import { Search, Eye, EyeOff, Copy, Edit, Trash2, Shield, Plus, Lock } from "lucide-react";
import { useState, useEffect } from "react";
import { useStaggerIn } from "../lib/motion";

import { CredentialForm } from "./CredentialForm";
import { useThemeColors } from "../hooks/useThemeColors";
import { getCredentials, createCredential, updateCredential, deleteCredential } from "../lib/api";

interface Credential {
  id: number;
  service: string;
  username: string;
  email: string;
  password: string;
  website: string;
  lastModified: string;
  notes: string;
}

export function CredentialVault() {
  const colors = useThemeColors();
  const [searchTerm, setSearchTerm] = useState("");
  const [visiblePasswords, setVisiblePasswords] = useState<Set<number>>(new Set());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCredential, setEditingCredential] = useState<any>(null);
  const [credentials, setCredentials] = useState<Credential[]>([]);

  async function loadCredentials() {
    try {
      const data = await getCredentials();
      setCredentials(data.credenciales.map((c: any) => ({
        id: c.id,
        service: c.name || '',
        username: c.username || '',
        email: c.username || '',
        password: c.password || '',
        website: c.url || '',
        lastModified: '',
        notes: '',
      })));
    } catch (err) {
      console.error("Error cargando credenciales:", err);
    }
  }

  useEffect(() => { loadCredentials(); }, []);

  const handleSaveCredential = async (formData: any) => {
    try {
      const body = {
        suscripcionId: null,
        contrasena: formData.password,
        nombreUsuario: formData.username || formData.email || '',
        url: formData.website || null,
        descripcion: formData.service,
      };
      if (editingCredential) {
        await updateCredential(editingCredential.id, body);
      } else {
        await createCredential(body);
      }
      setEditingCredential(null);
      await loadCredentials();
    } catch (err) {
      alert("Error: " + (err as Error).message);
    }
  };

  const handleEdit = (credential: Credential) => {
    setEditingCredential(credential);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar esta credencial?")) return;
    try {
      await deleteCredential(id);
      await loadCredentials();
    } catch (err) {
      alert("Error: " + (err as Error).message);
    }
  };

  const handleAddNew = () => {
    setEditingCredential(null);
    setIsFormOpen(true);
  };

  const togglePasswordVisibility = (id: number) => {
    setVisiblePasswords(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const filteredCredentials = credentials.filter(cred =>
    (cred.service?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (cred.username?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (cred.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const containerRef = useStaggerIn<HTMLDivElement>(".stagger-item", [credentials.length]);

  return (
    <div ref={containerRef} className="space-y-6">
      <div className="p-6 rounded-lg border flex items-start gap-4" style={{ backgroundColor: colors.primaryAction, borderColor: colors.border }}>
        <Shield className="w-6 h-6 flex-shrink-0 mt-1" style={{ color: colors.primaryForeground }} />
        <div>
          <h3 className="text-lg mb-2" style={{ color: colors.primaryForeground }}>Almacenamiento Seguro</h3>
          <p className="text-sm" style={{ color: colors.primaryForeground }}>
            Todas tus credenciales están almacenadas de forma segura con encriptación de nivel empresarial.
            Nunca se guardan en texto plano y solo tú tienes acceso a esta información.
          </p>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h3 className="text-xl text-foreground">Credenciales Almacenadas</h3>
        <button
          type="button"
          onClick={handleAddNew}
          aria-labelledby="add-credential-label"
          className="px-6 py-2.5 rounded-lg flex items-center gap-2 transition-all hover:opacity-90 whitespace-nowrap"
          style={{ backgroundColor: colors.primaryAction, color: colors.primaryForeground }}
        >
          <Plus className="w-5 h-5" aria-hidden="true" />
          <span id="add-credential-label">Agregar Credencial</span>
        </button>
      </div>

      <div className="relative">
        <input
          type="text"
          aria-label="Buscar credencial"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar credencial..."
          className="w-full px-4 py-3 rounded-lg bg-background text-foreground placeholder-secondary border border-textPrimary focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <Search className="absolute right-4 top-4 w-5 h-5 text-secondary" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredCredentials.map((cred) => (
          <div key={cred.id} className="stagger-item lift p-6 rounded-lg border" style={{ backgroundColor: colors.bgSurface, borderColor: colors.border }}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: colors.primaryAction }}>
                  <Lock className="w-6 h-6" style={{ color: colors.primaryForeground }} />
                </div>
                <div>
                  <h4 className="text-lg text-foreground">{cred.service}</h4>
                  {cred.lastModified && (
                    <p className="text-xs text-muted-foreground">
                      Actualizado: {new Date(cred.lastModified).toLocaleDateString('es-ES')}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleEdit(cred)}
                  aria-label={`Editar ${cred.service}`}
                  className="p-2 rounded-lg hover:opacity-80 transition-all"
                  style={{ backgroundColor: colors.primaryAction, color: colors.primaryForeground }}
                >
                  <Edit className="w-4 h-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(cred.id)}
                  aria-label={`Eliminar ${cred.service}`}
                  className="p-2 rounded-lg hover:opacity-80 transition-all"
                  style={{ backgroundColor: colors.destructive, color: '#ffffff' }}
                >
                  <Trash2 className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-secondary mb-2 block">Usuario</label>
                <div className="flex items-center justify-between px-4 py-3 rounded-lg" style={{ backgroundColor: colors.bgBase }}>
                  <span className="text-foreground">{cred.username}</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(cred.username)}
                    aria-label="Copiar usuario"
                    className="p-1.5 rounded hover:opacity-80 transition-all"
                    style={{ backgroundColor: colors.primaryAction }}
                  >
                    <Copy className="w-4 h-4" style={{ color: colors.primaryForeground }} aria-hidden="true" />
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm text-secondary mb-2 block">Contraseña</label>
                <div className="flex items-center justify-between px-4 py-3 rounded-lg" style={{ backgroundColor: colors.bgBase }}>
                  <span className="text-foreground font-mono">
                    {visiblePasswords.has(cred.id) ? cred.password : '••••••••••••'}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility(cred.id)}
                      aria-label={visiblePasswords.has(cred.id) ? "Ocultar contraseña" : "Mostrar contraseña"}
                      className="p-1.5 rounded hover:opacity-80 transition-all"
                      style={{ backgroundColor: colors.primaryAction }}
                    >
                      {visiblePasswords.has(cred.id)
                        ? <EyeOff className="w-4 h-4" style={{ color: colors.primaryForeground }} aria-hidden="true" />
                        : <Eye className="w-4 h-4" style={{ color: colors.primaryForeground }} aria-hidden="true" />
                      }
                    </button>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(cred.password)}
                      aria-label="Copiar contraseña"
                      className="p-1.5 rounded hover:opacity-80 transition-all"
                      style={{ backgroundColor: colors.primaryAction }}
                    >
                      <Copy className="w-4 h-4" style={{ color: colors.primaryForeground }} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>

              {cred.website && (
                <div>
                  <label className="text-sm text-secondary mb-2 block">Sitio Web</label>
                  <div className="px-4 py-3 rounded-lg" style={{ backgroundColor: colors.bgBase }}>
                    <span className="text-foreground text-sm">{cred.website}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredCredentials.length === 0 && !searchTerm && (
        <div className="text-center py-12 rounded-lg border" style={{ backgroundColor: colors.bgSurface, borderColor: colors.border }}>
          <Lock className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-secondary">No hay credenciales guardadas</p>
        </div>
      )}

      <div className="p-6 rounded-lg border" style={{ backgroundColor: colors.bgSurface, borderColor: 'rgba(255, 255, 255, 0.1)' }}>
        <h3 className="text-lg text-foreground mb-4">Consejos de Seguridad</h3>
        <ul className="space-y-2 text-secondary">
          <li className="flex items-start gap-2"><span className="text-primary mt-1">•</span><span>Usa contraseñas únicas y complejas para cada servicio</span></li>
          <li className="flex items-start gap-2"><span className="text-primary mt-1">•</span><span>Actualiza tus contraseñas regularmente (cada 3-6 meses)</span></li>
          <li className="flex items-start gap-2"><span className="text-primary mt-1">•</span><span>Habilita la autenticación de dos factores cuando sea posible</span></li>
          <li className="flex items-start gap-2"><span className="text-primary mt-1">•</span><span>Nunca compartas tus credenciales con terceros</span></li>
        </ul>
      </div>

      <CredentialForm
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setEditingCredential(null); }}
        onSave={handleSaveCredential}
        editData={editingCredential}
      />
    </div>
  );
}
