import { Calendar, DollarSign, TrendingDown, TrendingUp, Plus } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { useState } from "react";
import { PaymentHistoryForm } from "./PaymentHistoryForm";
import { useThemeColors } from "../hooks/useThemeColors";

const mockSubscriptions = [
  { id: 1, name: "Netflix", category: "Entretenimiento" },
  { id: 2, name: "Spotify", category: "Música" },
  { id: 3, name: "Adobe CC", category: "Productividad" },
  { id: 4, name: "Amazon Prime", category: "Entretenimiento" },
  { id: 5, name: "GitHub Pro", category: "Desarrollo" },
  { id: 6, name: "Dropbox", category: "Almacenamiento" },
];

const mockPaymentMethods = [
  { id: 1, alias: "Tarjeta Visa *1234" },
  { id: 2, alias: "Tarjeta Master *5678" },
  { id: 3, alias: "PayPal" },
];

const monthlyTrend = [
  { month: "Oct", amount: 95 },
  { month: "Nov", amount: 105 },
  { month: "Dic", amount: 112 },
  { month: "Ene", amount: 98 },
  { month: "Feb", amount: 110 },
  { month: "Mar", amount: 112 },
];

const categoryBreakdown = [
  { name: "Entretenimiento", value: 45.97, color: "#646cff" },
  { name: "Productividad", value: 52.99, color: "#52b788" },
  { name: "Música", value: 9.99, color: "#ffd166" },
  { name: "Desarrollo", value: 7.00, color: "#ef476f" },
  { name: "Almacenamiento", value: 11.99, color: "#118ab2" },
];

export function FinancialHistory() {
  const colors = useThemeColors();
  const [isPaymentFormOpen, setIsPaymentFormOpen] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState([
    { id: 1, service: "Netflix", date: "2026-03-15", amount: 15.99, category: "Entretenimiento", method: "Tarjeta Visa *1234" },
    { id: 2, service: "Spotify", date: "2026-03-10", amount: 9.99, category: "Música", method: "Tarjeta Master *5678" },
    { id: 3, service: "Adobe CC", date: "2026-03-20", amount: 52.99, category: "Productividad", method: "Tarjeta Visa *1234" },
    { id: 4, service: "Amazon Prime", date: "2026-03-08", amount: 14.99, category: "Entretenimiento", method: "Tarjeta Visa *1234" },
    { id: 5, service: "GitHub Pro", date: "2026-03-12", amount: 7.00, category: "Desarrollo", method: "Tarjeta Master *5678" },
    { id: 6, service: "Dropbox", date: "2026-03-18", amount: 11.99, category: "Almacenamiento", method: "PayPal" },
    { id: 7, service: "Netflix", date: "2026-02-15", amount: 15.99, category: "Entretenimiento", method: "Tarjeta Visa *1234" },
    { id: 8, service: "Spotify", date: "2026-02-10", amount: 9.99, category: "Música", method: "Tarjeta Master *5678" },
    { id: 9, service: "Adobe CC", date: "2026-02-20", amount: 52.99, category: "Productividad", method: "Tarjeta Visa *1234" },
    { id: 10, service: "Amazon Prime", date: "2026-02-08", amount: 14.99, category: "Entretenimiento", method: "Tarjeta Visa *1234" },
  ]);

  const handleSavePayment = (payment: any) => {
    setPaymentHistory([payment, ...paymentHistory]);
  };

  const totalSpent = paymentHistory.reduce((sum, payment) => sum + payment.amount, 0);
  const currentMonth = 112.95;
  const previousMonth = 110.00;
  const percentChange = ((currentMonth - previousMonth) / previousMonth * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div 
          className="p-6 rounded-lg border"
          style={{ 
            backgroundColor: colors.bgSurface,
            borderColor: colors.border
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary mb-1">Total Gastado</p>
              <p className="text-3xl text-foreground">${totalSpent.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground mt-1">Últimos 6 meses</p>
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
              <p className="text-sm text-secondary mb-1">Mes Actual</p>
              <p className="text-3xl text-foreground">${currentMonth.toFixed(2)}</p>
              <div className="flex items-center gap-1 mt-1">
                {parseFloat(percentChange) > 0 ? (
                  <TrendingUp className="w-4 h-4 text-[#ef476f]" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-[#52b788]" />
                )}
                <p className={`text-xs ${parseFloat(percentChange) > 0 ? 'text-[#ef476f]' : 'text-[#52b788]'}`}>
                  {percentChange}% vs mes anterior
                </p>
              </div>
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
              <p className="text-sm text-secondary mb-1">Promedio Mensual</p>
              <p className="text-3xl text-foreground">${(totalSpent / 6).toFixed(2)}</p>
              <p className="text-xs text-muted-foreground mt-1">Últimos 6 meses</p>
            </div>
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: colors.primaryAction }}
            >
              <TrendingUp className="w-6 h-6 text-foreground" style={{ color: '#ffffff' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend Chart */}
        <div 
          className="p-6 rounded-lg border"
          style={{ 
            backgroundColor: colors.bgSurface,
            borderColor: colors.border
          }}
        >
          <h3 className="text-lg text-foreground mb-6">Tendencia de Gastos Mensuales</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyTrend}>
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
                itemStyle={{ color: colors.textPrimary }}
              />
              <Line 
                type="monotone" 
                dataKey="amount" 
                stroke={colors.textMuted} 
                strokeWidth={2}
                dot={{ fill: colors.primaryAction, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Category Breakdown Pie Chart */}
        <div 
          className="p-6 rounded-lg border"
          style={{ 
            backgroundColor: colors.bgSurface,
            borderColor: colors.border
          }}
        >
          <h3 className="text-lg text-foreground mb-6">Gastos por Categoría</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryBreakdown}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: colors.bgSurface,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '8px',
                  color: colors.textPrimary
                }}
                itemStyle={{ color: colors.textPrimary }}
              />
              <Legend
                wrapperStyle={{ color: colors.textSecondary }}
                iconType="circle"
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Payment History Table */}
      <div 
        className="rounded-lg border overflow-hidden"
        style={{ 
          backgroundColor: colors.bgSurface,
          borderColor: 'rgba(255, 255, 255, 0.1)'
        }}
      >
        <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${colors.border}` }}>
          <h3 className="text-lg text-foreground">Historial de Pagos</h3>
          <button
            onClick={() => setIsPaymentFormOpen(true)}
            className="px-4 py-2 rounded-lg flex items-center gap-2 transition-all hover:opacity-90"
            style={{ backgroundColor: colors.primaryAction, color: colors.primaryForeground }}
          >
            <Plus className="w-4 h-4" />
            Registrar Pago Manual
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
                <th className="text-left px-6 py-4 text-secondary font-medium">Fecha</th>
                <th className="text-left px-6 py-4 text-secondary font-medium">Servicio</th>
                <th className="text-left px-6 py-4 text-secondary font-medium">Categoría</th>
                <th className="text-left px-6 py-4 text-secondary font-medium">Método de Pago</th>
                <th className="text-right px-6 py-4 text-secondary font-medium">Monto</th>
              </tr>
            </thead>
            <tbody>
              {paymentHistory.map((payment) => (
                <tr 
                  key={payment.id}
                  style={{ borderBottom: `1px solid ${colors.border}` }}
                  className="hover:bg-primary/20 transition-colors"
                >
                  <td className="px-6 py-4 text-secondary">
                    {new Date(payment.date).toLocaleDateString('es-ES', { 
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </td>
                  <td className="px-6 py-4 text-foreground">{payment.service}</td>
                  <td className="px-6 py-4 text-secondary">{payment.category}</td>
                  <td className="px-6 py-4 text-secondary">{payment.method}</td>
                  <td className="px-6 py-4 text-right text-foreground">${payment.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment History Form Modal */}
      <PaymentHistoryForm
        isOpen={isPaymentFormOpen}
        onClose={() => setIsPaymentFormOpen(false)}
        onSave={handleSavePayment}
        subscriptions={mockSubscriptions}
        paymentMethods={mockPaymentMethods}
      />
    </div>
  );
}