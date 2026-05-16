import { DollarSign, TrendingUp, AlertCircle, Calendar, Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useState, useEffect } from "react";
import { SubscriptionDetailsModal } from "./SubscriptionDetailsModal";
import { useThemeColors } from "../hooks/useThemeColors";

const categoryColors: Record<string, string> = {
  Entretenimiento: "#f59e0b",
  Música: "#10b981",
  Productividad: "#3b82f6",
  Desarrollo: "#8b5cf6",
  Almacenamiento: "#06b6d4",
};

const getCategoryColor = (category?: string) => category ? categoryColors[category] || "#6b7d5c" : "#6b7d5c";

export function Dashboard() {
  const colors = useThemeColors();
  const [selectedSubscription, setSelectedSubscription] = useState<any | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Estados para los datos reales del backend
  const [summaryData, setSummaryData] = useState({ totalSuscripcionesActivas: 0, gastoMensualTotal: 0, listaSuscripciones: [] });
  const [upcomingData, setUpcomingData] = useState({ proximoPago: null as any, pagosDeLaSemana: [] as any[] });
  const [chartData, setChartData] = useState([]);
  
  // Estados de control de UI
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError("");

      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No hay sesión activa. Por favor inicia sesión.");

        const headers = {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        };

        // NOTA: Ajusta el puerto 3000 o el prefijo de la URL según cómo esté tu servidor
        const BASE_URL = "http://localhost:3001/api/dashboard";

        const [summaryRes, upcomingRes, expensesRes] = await Promise.all([
          fetch(`${BASE_URL}/summary`, { headers }),
          fetch(`${BASE_URL}/upcoming`, { headers }),
          fetch(`${BASE_URL}/expenses`, { headers })
        ]);

        if (!summaryRes.ok || !upcomingRes.ok || !expensesRes.ok) {
          throw new Error("Error al sincronizar datos del dashboard.");
        }

        const summary = await summaryRes.json();
        const upcoming = await upcomingRes.json();
        const expenses = await expensesRes.json();

        setSummaryData(summary);
        setUpcomingData(upcoming);
        setChartData(expenses);

      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleSubscriptionClick = (subscription: any) => {
    setSelectedSubscription(subscription);
    setIsDetailsModalOpen(true);
  };

  // Función auxiliar para calcular días restantes en el frontend
  const getDaysLeft = (targetDate: string) => {
    const today = new Date();
    const billingDate = new Date(targetDate);
    // Vuelve a ceros la hora para comparar solo fechas
    today.setHours(0, 0, 0, 0);
    billingDate.setHours(0, 0, 0, 0);
    const diffTime = billingDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin" style={{ color: colors.primaryAction }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg m-6 text-center">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-lg border" style={{ backgroundColor: colors.bgSurface, borderColor: colors.border }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary mb-1">Gasto Mensual Real</p>
              <h3 className="text-3xl text-foreground">${summaryData.gastoMensualTotal.toFixed(2)}</h3>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: colors.primaryAction }}>
              <DollarSign className="w-6 h-6 text-foreground" style={{ color: '#ffffff' }}/>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-lg border" style={{ backgroundColor: colors.bgSurface, borderColor: colors.border }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary mb-1">Suscripciones Activas</p>
              <h3 className="text-3xl text-foreground">{summaryData.totalSuscripcionesActivas}</h3>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: colors.primaryAction }}>
              <TrendingUp className="w-6 h-6 text-foreground" style={{ color: '#ffffff' }}/>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-lg border" style={{ backgroundColor: colors.bgSurface, borderColor: colors.border }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary mb-1">Próximo Pago</p>
              <h3 className="text-3xl text-foreground">
                ${upcomingData.proximoPago ? upcomingData.proximoPago.cost.toFixed(2) : "0.00"}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                {upcomingData.proximoPago ? upcomingData.proximoPago.name : "Sin pagos próximos"}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: colors.primaryAction }}>
              <Calendar className="w-6 h-6 text-foreground" style={{ color: '#ffffff' }} />
            </div>
          </div>
        </div>

        <div className="p-6 rounded-lg border" style={{ backgroundColor: colors.bgSurface, borderColor: colors.border }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary mb-1">Alertas en 7 Días</p>
              <h3 className="text-3xl text-foreground">{upcomingData.pagosDeLaSemana.length}</h3>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: colors.primaryAction }}>
              <AlertCircle className="w-6 h-6 text-foreground" style={{ color: '#ffffff' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section */}
        <div className="lg:col-span-2 p-6 rounded-lg border" style={{ backgroundColor: colors.bgSurface, borderColor: colors.border }}>
          <h3 className="text-lg text-foreground mb-6">Tendencia de Gastos (Últimos 6 Meses)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
              <XAxis dataKey="month" stroke={colors.textSecondary} tick={{ fill: colors.textSecondary }} />
              <YAxis stroke={colors.textSecondary} tick={{ fill: colors.textSecondary }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: colors.bgSurface,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '8px',
                  color: colors.textPrimary
                }}
                labelStyle={{ color: colors.textPrimary }}
                itemStyle={{ color: colors.textPrimary }}
                wrapperStyle={{ color: colors.textPrimary }}
                cursor={{ fill: colors.border, opacity: 1 }}
              />
              <Bar dataKey="amount" fill={colors.primaryAction} radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Alerts Panel */}
        <div className="p-6 rounded-lg border" style={{ backgroundColor: colors.bgSurface, borderColor: colors.border }}>
          <h3 className="text-lg text-foreground mb-6">Alertas de Pagos Próximos</h3>
          <div className="space-y-4">
            {upcomingData.pagosDeLaSemana.length === 0 ? (
              <p className="text-sm text-secondary text-center py-4">No hay pagos próximos esta semana.</p>
            ) : (
              upcomingData.pagosDeLaSemana.map((payment, index) => {
                const daysLeft = getDaysLeft(payment.billingDate);
                return (
                  <div key={index} className="p-4 rounded-lg border" style={{ backgroundColor: colors.bgBase, borderColor: colors.border }}>
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-foreground">{payment.name}</h4>
                      <span 
                        className="px-2 py-1 rounded text-xs"
                        style={{
                          backgroundColor: daysLeft <= 3 ? colors.destructive : colors.primaryAction,
                          color: '#FFFFFF'
                        }}
                      >
                        {daysLeft === 0 ? "¡Hoy!" : `${daysLeft} días`}
                      </span>
                    </div>
                    <p className="text-sm text-secondary mb-1">
                      Fecha: {new Date(payment.billingDate).toLocaleDateString('es-ES', { timeZone: 'UTC' })}
                    </p>
                    <p className="text-lg text-foreground">${payment.cost.toFixed(2)}</p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Active Subscriptions Grid */}
      <div>
        <h3 className="text-xl text-foreground mb-4">Suscripciones Activas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {summaryData.listaSuscripciones.map((subscription: any) => (
            <div 
              key={subscription.id}
              className="p-6 rounded-lg border transition-all hover:scale-105 cursor-pointer"
              style={{ backgroundColor: colors.bgSurface, borderColor: 'rgba(255, 255, 255, 0.1)' }}
              onClick={() => handleSubscriptionClick(subscription)}
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-12 h-12 rounded-lg overflow-hidden flex items-center justify-center"
                  style={{ backgroundColor: getCategoryColor(subscription.category) }}
                >
                  {subscription.imageUrl ? (
                    <img
                      src={subscription.imageUrl}
                      alt={subscription.imageAlt || subscription.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white text-xl">{subscription.name.charAt(0)}</span>
                  )}
                </div>
                <span 
                  className="px-3 py-1 rounded-full text-xs"
                  style={{ backgroundColor: colors.primaryAction, color: '#e8e8e8' }}
                >
                  {subscription.status}
                </span>
              </div>
              <h4 className="text-lg text-foreground mb-2">{subscription.name}</h4>
              <p className="text-sm text-secondary mb-4">{subscription.billingCycle}</p>
              <div className="flex items-center justify-between">
                <p className="text-2xl text-foreground">
                  ${subscription.cost.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(subscription.billingDate).toLocaleDateString('es-ES', { 
                    timeZone: 'UTC',
                    day: 'numeric', 
                    month: 'short' 
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <SubscriptionDetailsModal 
        isOpen={isDetailsModalOpen}
        subscription={selectedSubscription}
        onClose={() => setIsDetailsModalOpen(false)}
      />
    </div>
  );
}