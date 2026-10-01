import { DollarSign, TrendingUp, AlertCircle, Calendar } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useState, useEffect } from "react";
import { SubscriptionDetailsModal } from "./SubscriptionDetailsModal";
import { useThemeColors } from "../hooks/useThemeColors";
import { useTheme } from "../contexts/ThemeContext";
import { useStaggerIn, CountUp } from "../lib/motion";
import { getDashboardSummary, getDashboardUpcoming, getDashboardExpenses } from "../lib/api";

const CURRENCY_SYMBOLS: Record<string, string> = { USD: '$', EUR: '€', CRC: '₡', MXN: '$MX ' };
const CURRENCY_RATES: Record<string, number> = { USD: 1, EUR: 0.92, CRC: 518, MXN: 17.5 };

export function Dashboard() {
  const colors = useThemeColors();
  const { currency } = useTheme();
  const sym = CURRENCY_SYMBOLS[currency] ?? currency + ' ';
  const rate = CURRENCY_RATES[currency] ?? 1;
  const toDisplay = (usd: number) => (usd * rate).toFixed(2);
  const [selectedSubscription, setSelectedSubscription] = useState<any>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const [summary, setSummary] = useState<{ totalSuscripcionesActivas: number; gastoMensualTotal: number; listaSuscripciones: any[] } | null>(null);
  const [upcoming, setUpcoming] = useState<{ proximoPago: any | null; pagosDeLaSemana: any[] }>({ proximoPago: null, pagosDeLaSemana: [] });
  const [chartData, setChartData] = useState<Array<{ month: string; amount: number }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [sum, up, expenses] = await Promise.all([
          getDashboardSummary(),
          getDashboardUpcoming(),
          getDashboardExpenses(),
        ]);
        setSummary(sum);
        setUpcoming(up);
        setChartData(expenses);
      } catch (err) {
        console.error("Error cargando dashboard:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const containerRef = useStaggerIn<HTMLDivElement>(".stagger-item", [isLoading, currency]);

  const handleSubscriptionClick = (subscription: any) => {
    setSelectedSubscription({
      ...subscription,
      category: subscription.categoryName || '',
      currency: 'USD',
      notes: '',
    });
    setIsDetailsModalOpen(true);
  };

  const getDaysLabel = (dateStr: string) => {
    const days = Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (days <= 0) return 'Vence hoy';
    if (days === 1) return 'Próximo pago mañana';
    return `Próximo pago en ${days} días`;
  };

  const getDaysUrgent = (dateStr: string) => {
    return Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) <= 3;
  };

  if (isLoading) {
    return (
      <div className="space-y-6" aria-busy="true" aria-label="Cargando dashboard">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[0, 1, 2, 3].map(i => <div key={i} className="skeleton h-[104px]" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="skeleton lg:col-span-2 h-[372px]" />
          <div className="skeleton h-[372px]" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[0, 1, 2].map(i => <div key={i} className="skeleton h-[180px]" />)}
        </div>
      </div>
    );
  }

  const subscriptions = summary?.listaSuscripciones ?? [];
  const alertPayments = upcoming?.pagosDeLaSemana ?? [];
  const convertedChartData = (chartData ?? []).map(d => ({ ...d, amount: parseFloat(((d.amount ?? 0) * rate).toFixed(2)) }));

  return (
    <div ref={containerRef} className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="stagger-item lift p-6 rounded-lg border" style={{ backgroundColor: colors.bgSurface, borderColor: colors.border }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary mb-1">Gasto Mensual Total</p>
              <h3 className="text-3xl text-foreground"><CountUp value={(summary?.gastoMensualTotal ?? 0) * rate} decimals={2} prefix={sym} /></h3>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: colors.primaryAction }}>
              <DollarSign className="w-6 h-6" style={{ color: colors.primaryForeground }} />
            </div>
          </div>
        </div>

        <div className="stagger-item lift p-6 rounded-lg border" style={{ backgroundColor: colors.bgSurface, borderColor: colors.border }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary mb-1">Suscripciones Activas</p>
              <h3 className="text-3xl text-foreground"><CountUp value={summary?.totalSuscripcionesActivas ?? 0} /></h3>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: colors.primaryAction }}>
              <TrendingUp className="w-6 h-6" style={{ color: colors.primaryForeground }} />
            </div>
          </div>
        </div>

        <div className="stagger-item lift p-6 rounded-lg border" style={{ backgroundColor: colors.bgSurface, borderColor: colors.border }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary mb-1">Próximo Pago</p>
              <h3 className="text-3xl text-foreground">
                {upcoming.proximoPago ? `${sym}${toDisplay(parseFloat(upcoming.proximoPago.cost))}` : '—'}
              </h3>
              {upcoming.proximoPago && (
                <p className="text-xs text-muted-foreground mt-1">{upcoming.proximoPago.name}</p>
              )}
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: colors.primaryAction }}>
              <Calendar className="w-6 h-6" style={{ color: colors.primaryForeground }} />
            </div>
          </div>
        </div>

        <div className="stagger-item lift p-6 rounded-lg border" style={{ backgroundColor: colors.bgSurface, borderColor: colors.border }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary mb-1">Alertas Pendientes</p>
              <h3 className="text-3xl text-foreground"><CountUp value={alertPayments.length} /></h3>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: colors.primaryAction }}>
              <AlertCircle className="w-6 h-6" style={{ color: colors.primaryForeground }} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section */}
        <div className="stagger-item lg:col-span-2 p-6 rounded-lg border" style={{ backgroundColor: colors.bgSurface, borderColor: colors.border }}>
          <h3 className="text-lg text-foreground mb-6">Resumen de Gastos Recurrentes</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={convertedChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                <XAxis dataKey="month" stroke={colors.textSecondary} tick={{ fill: colors.textSecondary }} />
                <YAxis stroke={colors.textSecondary} tick={{ fill: colors.textSecondary }} />
                <Tooltip
                  contentStyle={{ backgroundColor: colors.bgSurface, border: `1px solid ${colors.border}`, borderRadius: '8px', color: colors.textPrimary }}
                  labelStyle={{ color: colors.textPrimary }}
                  itemStyle={{ color: colors.textPrimary }}
                  cursor={{ fill: colors.border, opacity: 1 }}
                />
                <Bar dataKey="amount" fill={colors.primaryAction} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48">
              <p className="text-secondary">Sin historial de gastos aún</p>
            </div>
          )}
        </div>

        {/* Alerts Panel */}
        <div className="stagger-item lift p-6 rounded-lg border" style={{ backgroundColor: colors.bgSurface, borderColor: colors.border }}>
          <h3 className="text-lg text-foreground mb-6">Alertas de Pagos Próximos</h3>
          {alertPayments.length === 0 ? (
            <p className="text-secondary text-sm">Sin pagos próximos esta semana</p>
          ) : (
            <div className="space-y-4">
              {alertPayments.map((payment: any) => (
                  <div key={payment.id} className="lift p-4 rounded-lg border" style={{ backgroundColor: colors.bgBase, borderColor: colors.border }}>
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-foreground">{payment.name}</h4>
                      <span
                        className="px-2 py-1 rounded text-xs text-right max-w-[60%]"
                        style={{ backgroundColor: getDaysUrgent(payment.billingDate) ? colors.destructive : colors.primaryAction, color: getDaysUrgent(payment.billingDate) ? '#ffffff' : colors.primaryForeground }}
                      >
                        {getDaysLabel(payment.billingDate)}
                      </span>
                    </div>
                    <p className="text-sm text-secondary mb-1">
                      Fecha: {new Date(payment.billingDate).toLocaleDateString('es-ES')}
                    </p>
                    <p className="text-lg text-foreground">{sym}{toDisplay(parseFloat(payment.cost))}</p>
                  </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Active Subscriptions Grid */}
      <div>
        <h3 className="text-xl text-foreground mb-4">Suscripciones Activas</h3>
        {subscriptions.length === 0 ? (
          <p className="text-secondary">No hay suscripciones activas</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subscriptions.map((sub: any) => (
              <button
                key={sub.id}
                className="stagger-item lift p-6 rounded-lg border cursor-pointer"
                style={{ backgroundColor: colors.bgSurface, borderColor: 'rgba(255, 255, 255, 0.1)' }}
                onClick={() => handleSubscriptionClick(sub)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg overflow-hidden flex items-center justify-center" style={{ backgroundColor: colors.primaryAction }}>
                    {sub.imageUrl ? (
                      <img src={sub.imageUrl} alt="" aria-hidden="true" className="w-full h-full object-cover" />
                    ) : (
                      <span aria-hidden="true" className="text-white text-xl">{sub.name?.charAt(0)}</span>
                    )}
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs" style={{ backgroundColor: colors.primaryAction, color: colors.primaryForeground }}>
                    {sub.status}
                  </span>
                </div>
                <h4 className="text-lg text-foreground mb-2">{sub.name}</h4>
                <p className="text-sm text-secondary mb-4">{sub.paymentMethod}</p>
                <div className="flex items-center justify-between">
                  <p className="text-2xl text-foreground">
                    {sym}{toDisplay(parseFloat(sub.cost))}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(sub.billingDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <SubscriptionDetailsModal
        isOpen={isDetailsModalOpen}
        subscription={selectedSubscription}
        onClose={() => setIsDetailsModalOpen(false)}
      />
    </div>
  );
}
