import { Outlet, Link, useLocation, useNavigate } from "react-router";
import { Home, CreditCard, Clock, Lock, Settings, Bell, Plus, User, FolderOpen, Wallet, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { NotificationsModal } from "./NotificationsModal";
import { AccountModal } from "./AccountModal";
import { SubscriptionForm } from "./SubscriptionForm";
import { useTheme } from "../contexts/ThemeContext";
import { getSubscriptionFormData, createSubscription } from "../lib/api";

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const [badgeCount, setBadgeCount] = useState(() =>
    parseInt(localStorage.getItem('notification_unread_count') ?? '0')
  );
  const [showSubscriptionForm, setShowSubscriptionForm] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [catalog, setCatalog] = useState<{
    categorias: Array<{ id: number; name: string }>;
    ciclosFacturacion: Array<{ id: number; description: string }>;
    estados: Array<{ id: number; description: string }>;
    metodosPago: Array<{ id: number; alias: string }>;
  }>({ categorias: [], ciclosFacturacion: [], estados: [], metodosPago: [] });

  useEffect(() => {
    getSubscriptionFormData().then((data: any) => {
      setCatalog({
        categorias: data.categorias ?? [],
        ciclosFacturacion: data.ciclosFacturacion ?? [],
        estados: data.estados ?? [],
        metodosPago: data.metodosPago ?? [],
      });
    }).catch(() => {});
  }, []);

  const currentUser = (() => {
    try { return JSON.parse(localStorage.getItem("user") ?? "{}"); } catch { return {}; }
  })();

  const handleLogout = () => {
    if (!confirm("¿Estás seguro de que quieres cerrar la sesión?")) return;
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleSaveSubscription = async (subscription: any) => {
    try {
      const categoriaId = catalog.categorias.find(c => c.name === subscription.category)?.id ?? null;
      const cicloId = catalog.ciclosFacturacion.find(c => c.description === subscription.billingCycle)?.id ?? null;
      const estadoId = catalog.estados.find(e => e.description === subscription.status)?.id ?? null;
      const metodoDePagoId = catalog.metodosPago.find(m => m.alias === subscription.paymentMethod)?.id ?? null;
      if (!cicloId) { alert(`Ciclo de facturación no reconocido: "${subscription.billingCycle}"`); return; }
      if (!estadoId) { alert(`Estado no reconocido: "${subscription.status}"`); return; }
      if (!metodoDePagoId) { alert('Selecciona un método de pago válido.'); return; }
      await createSubscription({
        descripcion: subscription.name,
        costo: subscription.cost,
        fechaRenovacion: subscription.billingDate || subscription.nextBillingDate,
        categoriaId,
        cicloFacturacionId: cicloId,
        estadoId,
        metodoDePagoId,
        imageUrl: subscription.imageUrl || null,
        imageAlt: subscription.imageAlt || null,
      });
      window.dispatchEvent(new CustomEvent('subscription-saved'));
    } catch (err) {
      alert("Error al guardar suscripción: " + (err as Error).message);
    }
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
                    color: isActive ? ('#ffffff') : 'var(--text-secondary)',
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
              style={{ backgroundColor: theme === 'dark' ? '#E61445' : '#dc2626', color: '#ffffff' }}
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
              onClick={() => {
                getSubscriptionFormData().then((data: any) => {
                  setCatalog({
                    categorias: data.categorias ?? [],
                    ciclosFacturacion: data.ciclosFacturacion ?? [],
                    estados: data.estados ?? [],
                    metodosPago: data.metodosPago ?? [],
                  });
                }).catch(() => {});
                setShowSubscriptionForm(true);
              }}
              className="px-6 py-2.5 rounded-lg flex items-center gap-2 transition-all hover:opacity-90"
              style={{ backgroundColor: 'var(--color-primary-action)', color: '#ffffff' }}
            >
              <Plus className="w-5 h-5" />
              Agregar Suscripción
            </button>
            <button
              type="button"
              onClick={() => setShowNotifications(true)}
              aria-haspopup="dialog"
              aria-expanded={showNotifications}
              aria-controls="notifications-modal"
              className="p-2 rounded-lg relative transition-all hover:opacity-80"
              style={{ backgroundColor: 'var(--color-primary-action)', color: '#ffffff' }}
            >
              <span className="sr-only">Notificaciones</span>
              <Bell className="w-5 h-5" />
              {badgeCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center"
                  style={{ backgroundColor: theme === 'dark' ? '#E61445' : '#dc2626', color: '#fff' }}
                >
                  {badgeCount > 99 ? '99+' : badgeCount}
                </span>
              )}
            </button>
            <button
              type="button"
              aria-label="Cuenta"
              aria-haspopup="dialog"
              aria-expanded={showAccountModal}
              aria-controls="account-modal"
              className="p-2 rounded-lg transition-all hover:opacity-80"
              style={{ backgroundColor: 'var(--color-primary-action)', color: '#ffffff' }}
              onClick={() => setShowAccountModal(true)}
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
        onClose={() => {
          setShowNotifications(false);
          setBadgeCount(parseInt(localStorage.getItem('notification_unread_count') ?? '0'));
        }}
      />
      <AccountModal
        isOpen={showAccountModal}
        onClose={() => setShowAccountModal(false)}
        onNavigate={(path) => navigate(path)}
        onLogout={handleLogout}
        user={{ name: currentUser.nombre || currentUser.name || 'Usuario', email: currentUser.correo || currentUser.email || '' }}
      />
      <SubscriptionForm
        isOpen={showSubscriptionForm}
        onClose={() => setShowSubscriptionForm(false)}
        onSave={handleSaveSubscription}
        categories={catalog.categorias.map(c => c.name)}
        paymentMethods={catalog.metodosPago}
      />
    </div>
  );
}