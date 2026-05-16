import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, LogIn } from "lucide-react";
import { useNavigate } from "react-router";
import { useThemeColors } from "../hooks/useThemeColors";

export function Login() {
  const navigate = useNavigate();
  const colors = useThemeColors();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // NOTA: Cambia el puerto 3000 por el que le hayas puesto al user-api en tu .env
      const response = await fetch("http://localhost:3000/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          correo: formData.email,       // Mapeo al nombre que espera el backend
          contrasena: formData.password // Mapeo al nombre que espera el backend
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Si el backend responde con error (ej. 401 Credenciales inválidas)
        console.error("Error en login:", error);
        throw new Error(data.error || "Ocurrió un error al iniciar sesión");
      }

      // Guardamos el token JWT y los datos del usuario que devuelve el backend
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("isAuthenticated", "true");

      navigate("/");
    } catch (err: any) {
      setError(err.message);
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

        {/* Mensaje de error dinámico */}
        {error && (
          <div
            className="p-3 rounded-lg mb-4 text-sm text-center border"
            style={{
              backgroundColor:
                colors.theme === "dark"
                  ? "rgba(220,38,38,0.04)"
                  : "rgba(220,38,38,0.04)",
              color: colors.theme === "dark" ? "var(--color-destructive-foreground)" : colors.destructive,
              borderColor: colors.destructive,
            }}
          >
            {error}
          </div>
        )}

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

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-secondary cursor-pointer">
              <input type="checkbox" className="rounded" />
              Recordarme
            </label>
            <button type="button" style={{ color: colors.primaryAction }} className="hover:opacity-80 transition-opacity">
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-6 py-3 rounded-lg flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-50"
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