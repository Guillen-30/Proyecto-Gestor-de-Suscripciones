import { Search, Eye, EyeOff, Copy, Edit, Trash2, Shield, Plus, Lock } from "lucide-react";
import { useState } from "react";
import { CredentialForm } from "./CredentialForm";
import { useThemeColors } from "../hooks/useThemeColors";

export function CredentialVault() {
  const colors = useThemeColors();
  const [searchTerm, setSearchTerm] = useState("");
  const [visiblePasswords, setVisiblePasswords] = useState<Set<number>>(new Set());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCredential, setEditingCredential] = useState<any>(null);
  const [credentials, setCredentials] = useState([
    {
      id: 1,
      service: "Netflix",
      username: "usuario123",
      email: "usuario@email.com",
      password: "NflxPass2024!",
      website: "https://netflix.com",
      lastModified: "2026-03-15",
      notes: "Cuenta compartida con familia",
    },
    {
      id: 2,
      service: "Spotify",
      username: "music123",
      email: "music@email.com",
      password: "SpotifyPass2024!",
      website: "https://spotify.com",
      lastModified: "2026-03-10",
      notes: "Plan Individual",
    },
    {
      id: 3,
      service: "Adobe Creative Cloud",
      username: "design123",
      email: "design@email.com",
      password: "AdobePass2024!",
      website: "https://adobe.com",
      lastModified: "2026-03-20",
      notes: "Todas las aplicaciones",
    },
    {
      id: 4,
      service: "Amazon Prime",
      username: "shopping123",
      email: "shopping@email.com",
      password: "AmazonPass2024!",
      website: "https://amazon.com",
      lastModified: "2026-03-08",
      notes: "Cuenta principal",
    },
  ]);

  const handleSaveCredential = (credential: any) => {
    if (editingCredential) {
      setCredentials(credentials.map(c => c.id === credential.id ? credential : c));
    } else {
      setCredentials([...credentials, credential]);
    }
    setEditingCredential(null);
  };

  const handleEdit = (credential: any) => {
    setEditingCredential(credential);
    setIsFormOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("¿Estás seguro de eliminar esta credencial?")) {
      setCredentials(credentials.filter(c => c.id !== id));
    }
  };

  const handleAddNew = () => {
    setEditingCredential(null);
    setIsFormOpen(true);
  };

  const togglePasswordVisibility = (id: number) => {
    if (visiblePasswords.has(id)) {
      setVisiblePasswords(prev => new Set([...prev].filter(pid => pid !== id)));
    } else {
      setVisiblePasswords(prev => new Set([...prev, id]));
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // In a real app, show a toast notification
  };

  const filteredCredentials = credentials.filter(cred => 
    cred.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cred.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cred.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cred.notes.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Security Notice */}
      <div 
        className="p-6 rounded-lg border flex items-start gap-4"
        style={{ 
          backgroundColor: colors.primaryAction,
          borderColor: colors.border
        }}
      >
        <Shield className="w-6 h-6 text-foreground flex-shrink-0 mt-1" style={{ color: '#ffffff' }}/>
        <div>
          <h3 className="text-lg text-foreground mb-2" style={{ color: '#ffffff' }}>Almacenamiento Seguro </h3>
          <p className="text-sm text-foreground/90" style={{ color: '#ffffff' }}>
            Todas tus credenciales están almacenadas de forma segura con encriptación de nivel empresarial. 
            Nunca se guardan en texto plano y solo tú tienes acceso a esta información.
          </p>
        </div>
      </div>

      {/* Add New Credential Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-xl text-foreground">Credenciales Almacenadas</h3>
        <button
          onClick={handleAddNew}
          className="px-6 py-2.5 rounded-lg flex items-center gap-2 transition-all hover:opacity-90 whitespace-nowrap"
          style={{ backgroundColor: colors.primaryAction, color: colors.primaryForeground }}
        >
          <Plus className="w-5 h-5" />
          Agregar Credencial
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar credencial..."
          className="w-full px-4 py-3 rounded-lg bg-background text-foreground placeholder-secondary border border-textPrimary focus:outline-none focus:ring-2 focus:ring-primary"

        />
        <Search className="absolute right-4 top-4 w-5 h-5 text-secondary" />
      </div>

      {/* Credentials Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredCredentials.map((cred) => (
          <div 
            key={cred.id}
            className="p-6 rounded-lg border"
            style={{ 
              backgroundColor: colors.bgSurface,
              borderColor: colors.border
            }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: colors.primaryAction }}
                >
                  <Lock className="w-6 h-6 text-foreground" style={{ color: '#ffffff' }}/>
                </div>
                <div>
                  <h4 className="text-lg text-foreground">{cred.service}</h4>
                  <p className="text-xs text-muted-foreground">
                    Actualizado: {new Date(cred.lastModified).toLocaleDateString('es-ES')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleEdit(cred)}
                  className="p-2 rounded-lg hover:opacity-80 transition-all"
                  style={{ backgroundColor: colors.primaryAction, color: colors.primaryForeground }}
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDelete(cred.id)}
                  className="p-2 rounded-lg hover:opacity-80 transition-all"
                  style={{ backgroundColor: colors.destructive, color: '#ffffff' }}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {/* Email Field */}
              <div>
                <label className="text-sm text-secondary mb-2 block">Correo Electrónico</label>
                <div 
                  className="flex items-center justify-between px-4 py-3 rounded-lg"
                  style={{ backgroundColor: colors.bgBase }}
                >
                  <span className="text-foreground">{cred.email}</span>
                  <button
                    onClick={() => copyToClipboard(cred.email)}
                    className="p-1.5 rounded hover:opacity-80 transition-all"
                    style={{ backgroundColor: colors.primaryAction }}
                  >
                    <Copy className="w-4 h-4 text-foreground" style={{ color: '#ffffff' }}/>
                  </button>
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="text-sm text-secondary mb-2 block">Contraseña</label>
                <div 
                  className="flex items-center justify-between px-4 py-3 rounded-lg"
                  style={{ backgroundColor: colors.bgBase }}
                >
                  <span className="text-foreground font-mono">
                    {visiblePasswords.has(cred.id) ? "SuperSecurePass123!" : cred.password}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => togglePasswordVisibility(cred.id)}
                      className="p-1.5 rounded hover:opacity-80 transition-all"
                      style={{ backgroundColor: colors.primaryAction }}
                    >
                      {visiblePasswords.has(cred.id) ? (
                        <EyeOff className="w-4 h-4 text-foreground" style={{ color: '#ffffff' }} />
                      ) : (
                        <Eye className="w-4 h-4 text-foreground" style={{ color: '#ffffff' }} />
                      )}
                    </button>
                    <button
                      onClick={() => copyToClipboard("SuperSecurePass123!")}
                      className="p-1.5 rounded hover:opacity-80 transition-all"
                      style={{ backgroundColor: colors.primaryAction }}
                    >
                      <Copy className="w-4 h-4 text-foreground" style={{ color: '#ffffff' }} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Notes Field */}
              {cred.notes && (
                <div>
                  <label className="text-sm text-secondary mb-2 block">Notas</label>
                  <div 
                    className="px-4 py-3 rounded-lg"
                    style={{ backgroundColor: colors.bgBase }}
                  >
                    <span className="text-foreground text-sm">{cred.notes}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Security Tips */}
      <div 
        className="p-6 rounded-lg border"
        style={{ 
          backgroundColor: colors.bgSurface,
          borderColor: 'rgba(255, 255, 255, 0.1)'
        }}
      >
        <h3 className="text-lg text-foreground mb-4">Consejos de Seguridad</h3>
        <ul className="space-y-2 text-secondary">
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">•</span>
            <span>Usa contraseñas únicas y complejas para cada servicio</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">•</span>
            <span>Actualiza tus contraseñas regularmente (cada 3-6 meses)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">•</span>
            <span>Habilita la autenticación de dos factores cuando sea posible</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">•</span>
            <span>Nunca compartas tus credenciales con terceros</span>
          </li>
        </ul>
      </div>

      {/* Credential Form Modal */}
      <CredentialForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingCredential(null);
        }}
        onSave={handleSaveCredential}
        editData={editingCredential}
      />
    </div>
  );
}