import { DollarSign, TrendingUp, AlertCircle, Calendar } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useState } from "react";
import { SubscriptionDetailsModal } from "./SubscriptionDetailsModal";
import { useThemeColors } from "../hooks/useThemeColors";

// Mock data for subscriptions
interface DashboardSubscription {
  id: number;
  name: string;
  imageUrl: string;
  imageAlt?: string;
  cost: number;
  currency: string;
  billingDate: string;
  billingCycle: string;
  status: string;
  category: string;
  paymentMethod: string;
  color: string;
  notes: string;
}

const mockSubscriptions: DashboardSubscription[] = [
  {
    id: 1,
    name: "Netflix",
    imageUrl: "https://placehold.co/80x80/E50914/FFFFFF?text=N",
    imageAlt: "Logo de Netflix",
    cost: 15.99,
    currency: "USD",
    billingDate: "2026-04-15",
    billingCycle: "Mensual",
    status: "Activa",
    category: "Entretenimiento",
    paymentMethod: "Tarjeta Visa *1234",
    color: "#E50914",
    notes: "Plan Premium - 4 pantallas",
  },
  {
    id: 2,
    name: "Spotify",
    imageUrl: "https://placehold.co/80x80/1DB954/FFFFFF?text=S",
    imageAlt: "Logo de Spotify",
    cost: 9.99,
    currency: "USD",
    billingDate: "2026-04-10",
    billingCycle: "Mensual",
    status: "Activa",
    category: "Música",
    paymentMethod: "Tarjeta Master *5678",
    color: "#1DB954",
    notes: "Plan Individual",
  },
  {
    id: 3,
    name: "Adobe Creative Cloud",
    imageUrl: "https://placehold.co/80x80/FF0000/FFFFFF?text=A",
    imageAlt: "Logo de Adobe Creative Cloud",
    cost: 52.99,
    currency: "USD",
    billingDate: "2026-04-20",
    billingCycle: "Mensual",
    status: "Activa",
    category: "Productividad",
    paymentMethod: "Tarjeta Visa *1234",
    color: "#FF0000",
    notes: "Todas las aplicaciones",
  },
  {
    id: 4,
    name: "Amazon Prime",
    imageUrl: "https://placehold.co/80x80/FF9900/FFFFFF?text=P",
    imageAlt: "Logo de Amazon Prime",
    cost: 14.99,
    currency: "USD",
    billingDate: "2026-04-08",
    billingCycle: "Mensual",
    status: "Activa",
    category: "Entretenimiento",
    paymentMethod: "Tarjeta Visa *1234",
    color: "#FF9900",
    notes: "Envío gratis + Prime Video",
  },
  {
    id: 5,
    name: "GitHub Pro",
    imageUrl: "https://placehold.co/80x80/24292E/FFFFFF?text=G",
    imageAlt: "Logo de GitHub Pro",
    cost: 7.00,
    currency: "USD",
    billingDate: "2026-04-12",
    billingCycle: "Mensual",
    status: "Activa",
    category: "Desarrollo",
    paymentMethod: "Tarjeta Master *5678",
    color: "#24292e",
    notes: "Repositorios privados ilimitados",
  },
  {
    id: 6,
    name: "Dropbox",
    imageUrl: "https://placehold.co/80x80/0061FF/FFFFFF?text=D",
    imageAlt: "Logo de Dropbox",
    cost: 11.99,
    currency: "USD",
    billingDate: "2026-04-18",
    billingCycle: "Mensual",
    status: "Activa",
    category: "Almacenamiento",
    paymentMethod: "PayPal",
    color: "#0061FF",
    notes: "2TB de almacenamiento",
  },
];

// Mock chart data
const chartData = [
  { month: "Oct", amount: 95 },
  { month: "Nov", amount: 105 },
  { month: "Dic", amount: 112 },
  { month: "Ene", amount: 98 },
  { month: "Feb", amount: 110 },
  { month: "Mar", amount: 112 },
];

// Mock alerts
const upcomingPayments = [
  { service: "Amazon Prime", date: "2026-04-08", amount: 14.99, daysLeft: 3 },
  { service: "Spotify", date: "2026-04-10", amount: 9.99, daysLeft: 5 },
  { service: "GitHub Pro", date: "2026-04-12", amount: 7.00, daysLeft: 7 },
];

const categoryColors: Record<string, string> = {
  Entretenimiento: "#f59e0b",
  Música: "#10b981",
  Productividad: "#3b82f6",
  Desarrollo: "#8b5cf6",
  Almacenamiento: "#06b6d4",
};

const getCategoryColor = (category: string) => categoryColors[category] || "#6b7d5c";

export function Dashboard() {
  const colors = useThemeColors();
  const [selectedSubscription, setSelectedSubscription] = useState<typeof mockSubscriptions[0] | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const handleSubscriptionClick = (subscription: typeof mockSubscriptions[0]) => {
    setSelectedSubscription(subscription);
    setIsDetailsModalOpen(true);
  };

  const totalMonthly = mockSubscriptions.reduce((sum, sub) => sum + sub.cost, 0);
  const activeCount = mockSubscriptions.filter(sub => sub.status === "Activa").length;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div 
          className="p-6 rounded-lg border"
          style={{ 
            backgroundColor: colors.bgSurface,
            borderColor: colors.border
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary mb-1">Gasto Mensual Total</p>
              <h3 className="text-3xl text-foreground">${totalMonthly.toFixed(2)}</h3>
            </div>
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: colors.primaryAction }}
            >
              <DollarSign className="w-6 h-6 text-foreground" style={{ color: '#ffffff' }}/>
            </div>
          </div>
        </div>

        <div 
          className="p-6 rounded-lg border"
          style={{ 
            backgroundColor: colors.bgSurface,
            borderColor: colors.border
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary mb-1">Suscripciones Activas</p>
              <h3 className="text-3xl text-foreground">{activeCount}</h3>
            </div>
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: colors.primaryAction }}
            >
              <TrendingUp className="w-6 h-6 text-foreground" style={{ color: '#ffffff' }}/>
            </div>
          </div>
        </div>

        <div 
          className="p-6 rounded-lg border"
          style={{ 
            backgroundColor: colors.bgSurface,
            borderColor: colors.border
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary mb-1">Próximo Pago</p>
              <h3 className="text-3xl text-foreground">${upcomingPayments[0].amount}</h3>
              <p className="text-xs text-muted-foreground mt-1">{upcomingPayments[0].service}</p>
            </div>
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: colors.primaryAction }}
            >
              <Calendar className="w-6 h-6 text-foreground" style={{ color: '#ffffff' }} />
            </div>
          </div>
        </div>

        <div 
          className="p-6 rounded-lg border"
          style={{ 
            backgroundColor: colors.bgSurface,
            borderColor: colors.border
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary mb-1">Alertas Pendientes</p>
              <h3 className="text-3xl text-foreground">{upcomingPayments.length}</h3>
            </div>
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: colors.primaryAction }}
            >
              <AlertCircle className="w-6 h-6 text-foreground" style={{ color: '#ffffff' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section */}
        <div 
          className="lg:col-span-2 p-6 rounded-lg border"
          style={{ 
            backgroundColor: colors.bgSurface,
            borderColor: colors.border
          }}
        >
          <h3 className="text-lg text-foreground mb-6">Resumen de Gastos Recurrentes</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
              <XAxis
                dataKey="month"
                stroke={colors.textSecondary}
                tick={{ fill: colors.textSecondary }}
              />
              <YAxis
                stroke={colors.textSecondary}
                tick={{ fill: colors.textSecondary }}
              />
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
        <div 
          className="p-6 rounded-lg border"
          style={{ 
            backgroundColor: colors.bgSurface,
            borderColor: colors.border
          }}
        >
          <h3 className="text-lg text-foreground mb-6">Alertas de Pagos Próximos</h3>
          <div className="space-y-4">
            {upcomingPayments.map((payment, index) => (
              <div 
                key={index}
                className="p-4 rounded-lg border"
                style={{
                  backgroundColor: colors.bgBase,
                  borderColor: colors.border
                }}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-foreground">{payment.service}</h4>
                  <span 
                    className="px-2 py-1 rounded text-xs"
                    style={{
                      backgroundColor: payment.daysLeft <= 3 ? colors.destructive : colors.primaryAction,
                      color: '#FFFFFF'
                    }}
                  >
                    {payment.daysLeft} días
                  </span>
                </div>
                <p className="text-sm text-secondary mb-1">
                  Fecha: {new Date(payment.date).toLocaleDateString('es-ES')}
                </p>
                <p className="text-lg text-foreground">${payment.amount}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Active Subscriptions Grid */}
      <div>
        <h3 className="text-xl text-foreground mb-4">Suscripciones Activas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockSubscriptions.map((subscription) => (
            <div 
              key={subscription.id}
              className="p-6 rounded-lg border transition-all hover:scale-105 cursor-pointer"
              style={{ 
                backgroundColor: colors.bgSurface,
                borderColor: 'rgba(255, 255, 255, 0.1)'
              }}
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
                  style={{ 
                    backgroundColor: colors.primaryAction,
                    color: '#e8e8e8'
                  }}
                >
                  {subscription.status}
                </span>
              </div>
              <h4 className="text-lg text-foreground mb-2">{subscription.name}</h4>
              <p className="text-sm text-secondary mb-4">{subscription.category}</p>
              <div className="flex items-center justify-between">
                <p className="text-2xl text-foreground">
                  ${subscription.cost}
                  <span className="text-sm text-secondary">/{subscription.currency}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(subscription.billingDate).toLocaleDateString('es-ES', { 
                    day: 'numeric', 
                    month: 'short' 
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Subscription Details Modal */}
      <SubscriptionDetailsModal 
        isOpen={isDetailsModalOpen}
        subscription={selectedSubscription}
        onClose={() => setIsDetailsModalOpen(false)}
      />
    </div>
  );
}