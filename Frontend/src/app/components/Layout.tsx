import { Outlet, Link, useLocation, useNavigate } from "react-router";
import { Home, CreditCard, Clock, Lock, Settings, Bell, Plus, User, FolderOpen, Wallet, LogOut } from "lucide-react";
import { useState } from "react";
import { NotificationsModal } from "./NotificationsModal";
import { SubscriptionForm } from "./SubscriptionForm";
import { useTheme } from "../contexts/ThemeContext";

const mockCategories = ["Entretenimiento", "Música", "Productividad", "Desarrollo", "Almacenamiento"];
const mockPaymentMethods = [
  { id: 1, alias: "Tarjeta Visa *1234" },
  { id: 2, alias: "Tarjeta Master *5678" },
  { id: 3, alias: "PayPal" },
];

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSubscriptionForm, setShowSubscriptionForm] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    navigate("/login");
  };

  const handleSaveSubscription = (subscription: any) => {
    console.log("Nueva suscripción:", subscription);
    // In a real app, this would save to state management or backend
  };

  const navItems = [
    { path: "/", label: "Inicio / Dashboard", icon: Home },
    { path: "/suscripciones", label: "Mis Suscripciones", icon: CreditCard },
    { path: "/historial", label: "Historial Financiero", icon: Clock },
    { path: "/boveda", label: "Bóveda de Credenciales", icon: Lock },
    { path: "/categorias", label: "Categorías", icon: FolderOpen },
    { path: "/metodos-pago", label: "Métodos de Pago", icon: Wallet },
    { path: "/configuracion", label: "Configuración de Cuenta", icon: Settings },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Fixed Left Sidebar */}
      <aside
        className="w-64 flex-shrink-0 border-r overflow-y-auto bg-card"
        style={{
          borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
        }}
      >
        <div className="p-6">
          <h2 className="text-xl text-foreground mb-8">
            Sistema Gestor de Suscripciones
          </h2>
          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all"
                  style={{
                    backgroundColor: isActive ? 'var(--color-primary-action)' : 'transparent',
                    color: isActive ? (theme === 'dark' ? '#e8e8e8' : '#ffffff') : 'var(--text-secondary)',
                  }}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Logout Button */}
          <div className="mt-8 pt-6 border-t" style={{ borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }}>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all hover:opacity-80"
              style={{ backgroundColor: theme === 'dark' ? '#ef476f' : '#dc2626', color: '#ffffff' }}
            >
              <LogOut className="w-5 h-5" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header
          className="border-b px-8 py-4 flex items-center justify-between flex-shrink-0 bg-card"
          style={{
            borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
          }}
        >
          <h1 className="text-2xl text-foreground">
            {navItems.find(item => item.path === location.pathname)?.label || "Dashboard"}
          </h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowSubscriptionForm(true)}
              className="px-6 py-2.5 rounded-lg flex items-center gap-2 transition-all hover:opacity-90"
              style={{ backgroundColor: 'var(--color-primary-action)', color: theme === 'dark' ? '#e8e8e8' : '#ffffff' }}
            >
              <Plus className="w-5 h-5" />
              Agregar Suscripción
            </button>
            <button
              onClick={() => setShowNotifications(true)}
              className="p-2 rounded-lg relative transition-all hover:opacity-80"
              style={{ backgroundColor: 'var(--color-primary-action)', color: theme === 'dark' ? '#e8e8e8' : '#ffffff' }}
            >
              <Bell className="w-5 h-5" />
              <span
                className="absolute top-1 right-1 w-2 h-2 rounded-full"
                style={{ backgroundColor: theme === 'dark' ? '#ef476f' : '#dc2626' }}
              />
            </button>
            <button
              className="p-2 rounded-lg transition-all hover:opacity-80"
              style={{ backgroundColor: 'var(--color-primary-action)', color: theme === 'dark' ? '#e8e8e8' : '#ffffff' }}
            >
              <User className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>

      {/* Modals */}
      <NotificationsModal 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)} 
      />
      <SubscriptionForm
        isOpen={showSubscriptionForm}
        onClose={() => setShowSubscriptionForm(false)}
        onSave={handleSaveSubscription}
        categories={mockCategories}
        paymentMethods={mockPaymentMethods}
      />
    </div>
  );
}