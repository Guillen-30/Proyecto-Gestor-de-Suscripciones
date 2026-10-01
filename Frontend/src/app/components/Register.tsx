import { useState, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Mail, Lock, Eye, EyeOff, User, UserPlus } from "lucide-react";
import { useNavigate } from "react-router";
import { useThemeColors } from "../hooks/useThemeColors";
import { registerUser } from "../lib/api";

export function Register() {
  const navigate = useNavigate();
  const colors = useThemeColors();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }
    setError("");
    setIsLoading(true);
    try {
      await registerUser(formData.name, formData.email, formData.password);
      navigate("/login");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const rootRef = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.timeline({ defaults: { ease: "power3.out" } })
        .from(".auth-card", { autoAlpha: 0, y: 30, scale: 0.97, duration: 0.6 })
        .from(".auth-card h1, .auth-card form > *", { autoAlpha: 0, y: 12, duration: 0.4, stagger: 0.06, clearProps: "transform,opacity,visibility" }, "-=0.3");
    });
  }, { scope: rootRef });

  return (
    <div
      ref={rootRef}
      className="auth-bg min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: colors.bgBase, borderColor: colors.border }}
    >
      <div 
        className="auth-card w-full max-w-md p-8 rounded-lg border"
        style={{ 
          backgroundColor: colors.bgSurface,
          borderColor: colors.border
        }}
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl text-foreground mb-2">Crear Cuenta</h1>
          <p className="text-secondary">Comienza a gestionar tus suscripciones</p>
        </div>

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
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
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
                aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
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
            <UserPlus className="w-5 h-5" />
            {isLoading ? "Creando cuenta..." : "Crear Cuenta"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <span className="text-secondary">¿Ya tienes cuenta? </span>
          <button
            onClick={() => navigate("/login")}
            style={{ color: colors.textPrimary }}
            className="hover:opacity-80 transition-opacity"
          >
            Inicia sesión aquí
          </button>
        </div>
      </div>
    </div>
  );
}
