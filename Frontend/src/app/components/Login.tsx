import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, LogIn } from "lucide-react";
import { useNavigate } from "react-router";
import { useThemeColors } from "../hooks/useThemeColors";
import { login } from "../lib/api";

export function Login() {
  const navigate = useNavigate();
  const colors = useThemeColors();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const data = await login(formData.email, formData.password);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: colors.bgBase }}
    >
      <div
        className="w-full max-w-md p-8 rounded-lg border"
        style={{
          backgroundColor: colors.bgSurface,
          borderColor: colors.border
        }}
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl text-foreground mb-2">Bienvenido de Nuevo</h1>
          <p className="text-secondary">Inicia sesión en tu cuenta</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-secondary mb-2 block">Correo Electrónico</label>
            <div
              className="flex items-center gap-3 px-4 py-3 rounded-lg border"
              style={{ backgroundColor: colors.bgBase, borderColor: colors.border }}
            >
              <Mail className="w-5 h-5 text-muted-foreground" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="usuario@email.com"
                required
                className="bg-transparent outline-none text-foreground flex-1"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-secondary mb-2 block">Contraseña</label>
            <div
              className="flex items-center gap-3 px-4 py-3 rounded-lg border"
              style={{ backgroundColor: colors.bgBase, borderColor: colors.border }}
            >
              <Lock className="w-5 h-5 text-muted-foreground" />
              <input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                required
                className="bg-transparent outline-none text-foreground flex-1"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-center" style={{ color: colors.destructive }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-6 py-3 rounded-lg flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-60"
            style={{ backgroundColor: colors.primaryAction, color: colors.primaryForeground }}
          >
            <LogIn className="w-5 h-5" />
            {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <span className="text-secondary">¿No tienes cuenta? </span>
          <button
            onClick={() => navigate("/register")}
            style={{ color: colors.primaryAction }}
            className="hover:opacity-80 transition-opacity"
          >
            Regístrate aquí
          </button>
        </div>
      </div>
    </div>
  );
}
