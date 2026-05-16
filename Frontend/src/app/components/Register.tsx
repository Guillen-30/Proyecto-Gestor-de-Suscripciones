import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, User, UserPlus } from "lucide-react";
import { useNavigate } from "react-router";
import { useThemeColors } from "../hooks/useThemeColors";

export function Register() {
  const navigate = useNavigate();
  const colors = useThemeColors();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setIsLoading(true);

    try {
      // NOTA: Ajusta el puerto o el prefijo (/api/users) según lo que tengas en index.js
      const response = await fetch("http://localhost:3000/api/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre: formData.name,        // Mapeado a lo que espera userController.js
          correo: formData.email,       // Mapeado a lo que espera userController.js
          contrasena: formData.password // Mapeado a lo que espera userController.js
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Ocurrió un error al registrar la cuenta");
      }

      // Si fue exitoso, limpiamos el formulario y mandamos a login
      alert("¡Cuenta creada exitosamente! Por favor, inicia sesión.");
      navigate("/login");

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: colors.bgBase, borderColor: colors.border }}
    >
      <div 
        className="w-full max-w-md p-8 rounded-lg border"
        style={{ 
          backgroundColor: colors.bgSurface,
          borderColor: colors.border
        }}
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl text-foreground mb-2">Crear Cuenta</h1>
          <p className="text-secondary">Comienza a gestionar tus suscripciones</p>
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
            <label className="text-sm text-secondary mb-2 block">Nombre Completo</label>
            <div 
              className="flex items-center gap-3 px-4 py-3 rounded-lg border"
              style={{ backgroundColor: colors.bgBase, borderColor: colors.border }}
            >
              <User className="w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Tu nombre"
                required
                className="bg-transparent outline-none text-foreground flex-1"
              />
            </div>
          </div>

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
                minLength={8}
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

          <div>
            <label className="text-sm text-secondary mb-2 block">Confirmar Contraseña</label>
            <div 
              className="flex items-center gap-3 px-4 py-3 rounded-lg border"
              style={{ backgroundColor: colors.bgBase, borderColor: colors.border }}
            >
              <Lock className="w-5 h-5 text-muted-foreground" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="••••••••"
                required
                minLength={8}
                className="bg-transparent outline-none text-foreground flex-1"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-6 py-3 rounded-lg flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: colors.primaryAction, color: colors.primaryForeground }}
          >
            <UserPlus className="w-5 h-5" />
            {isLoading ? "Creando cuenta..." : "Crear Cuenta"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <span className="text-secondary">¿Ya tienes cuenta? </span>
          <button
            onClick={() => navigate("/login")}
            style={{ color: colors.primaryAction }}
            className="hover:opacity-80 transition-opacity"
          >
            Inicia sesión aquí
          </button>
        </div>
      </div>
    </div>
  );
}