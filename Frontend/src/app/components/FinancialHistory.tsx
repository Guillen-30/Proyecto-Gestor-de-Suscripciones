import { Calendar, DollarSign, TrendingDown, TrendingUp, Plus, Trash2, Edit } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { useState, useEffect } from "react";
import { PaymentHistoryForm } from "./PaymentHistoryForm";
import { useThemeColors } from "../hooks/useThemeColors";
import { getPaymentHistory, getDashboardExpenses, getPaymentFormData, registerPayment, updatePayment, deletePayment } from "../lib/api";
import { useTheme } from "../contexts/ThemeContext";

const CURRENCY_SYMBOLS: Record<string, string> = { USD: '$', EUR: '€', CRC: '₡', MXN: '$MX ' };
const CURRENCY_RATES: Record<string, number> = { USD: 1, EUR: 0.92, CRC: 518, MXN: 17.5 };

interface HistoryItem {
  id: number;
  service: string;
  date: string;
  amount: number;
  category: string;
  method: string;
  subscriptionId?: number;
  methodId?: number;
}

export function FinancialHistory() {
  const colors = useThemeColors();
  const { currency } = useTheme();
  const sym = CURRENCY_SYMBOLS[currency] ?? currency + ' ';
  const rate = CURRENCY_RATES[currency] ?? 1;
  const toDisplay = (usdAmount: number) => (usdAmount * rate).toFixed(2);
  const [isPaymentFormOpen, setIsPaymentFormOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<HistoryItem | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<HistoryItem[]>([]);
  const [monthlyTrend, setMonthlyTrend] = useState<Array<{ month: string; amount: number }>>([]);
  const [formData, setFormData] = useState<{ suscripciones: any[]; metodosPago: any[] }>({ suscripciones: [], metodosPago: [] });

  async function loadData() {
    try {
      const [histData, expenses] = await Promise.all([
        getPaymentHistory(),
        getDashboardExpenses(),
      ]);
      setPaymentHistory(histData.historial.map((h: any) => ({
        id: h.ID,
        service: h.Suscripcion || '',
        date: h.Fecha,
        amount: parseFloat(h.Monto),
        category: '',
        method: h.MetodoPago || '',
        subscriptionId: h.SuscripcionID,
        methodId: h.MetodoDePagoID ?? undefined,
      })));
      setMonthlyTrend(expenses);
    } catch (err) {
      console.error("Error cargando historial:", err);
    }
  }

  async function loadFormData() {
    try {
      const data = await getPaymentFormData();
      setFormData({
        suscripciones: data.suscripciones.map((s: any) => ({
          id: s.ID,
          name: s.Descripcion,
          category: '',
        })),
        metodosPago: data.metodosPago.map((m: any) => ({
          id: m.ID,
          alias: m.Alias,
        })),
      });
    } catch (err) {
      console.error("Error cargando datos del formulario:", err);
    }
  }

  useEffect(() => { loadData(); }, []);

  const handleOpenPaymentForm = () => {
    loadFormData();
    setIsPaymentFormOpen(true);
  };

  const handleSavePayment = async (payment: any) => {
    try {
      if (editingPayment) {
        await updatePayment(editingPayment.id, {
          monto: payment.amount / rate,
          fecha: payment.date,
          suscripcionId: payment.subscriptionId ?? null,
          metodoDePagoId: payment.paymentMethodId ?? null,
        });
      } else {
        await registerPayment({
          suscripcionId: payment.subscriptionId,
          metodoDePagoId: payment.paymentMethodId ?? null,
          monto: payment.amount / rate,
          fecha: payment.date,
        });
      }
      setEditingPayment(null);
      await loadData();
    } catch (err) {
      alert("Error al guardar pago: " + (err as Error).message);
    }
  };

  const handleEditPayment = (payment: HistoryItem) => {
    loadFormData();
    setEditingPayment(payment);
    setIsPaymentFormOpen(true);
  };

  const handleDeletePayment = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar este pago del historial?")) return;
    try {
      await deletePayment(id);
      await loadData();
    } catch (err) {
      alert("Error al eliminar pago: " + (err as Error).message);
    }
  };

  const totalSpent = paymentHistory.reduce((sum, p) => sum + p.amount, 0);
  const currentMonthAmount = monthlyTrend.length > 0 ? monthlyTrend[monthlyTrend.length - 1].amount : 0;
  const prevMonthAmount = monthlyTrend.length > 1 ? monthlyTrend[monthlyTrend.length - 2].amount : 0;
  const percentChange = prevMonthAmount > 0
    ? ((currentMonthAmount - prevMonthAmount) / prevMonthAmount * 100).toFixed(1)
    : '0.0';

  const convertedTrend = monthlyTrend.map(m => ({ ...m, amount: parseFloat((m.amount * rate).toFixed(2)) }));

  const categoryBreakdown = Object.entries(
    paymentHistory.reduce((acc: Record<string, number>, p) => {
      const key = p.category || p.service || 'Otro';
      acc[key] = (acc[key] || 0) + p.amount * rate;
      return acc;
    }, {})
  ).map(([name, value], i) => ({
    name,
    value,
    color: ['#646cff', colors.success, '#ffd166', '#E61445', '#118ab2'][i % 5],
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-lg border" style={{ backgroundColor: colors.bgSurface, borderColor: colors.border }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary mb-1">Total Gastado</p>
              <h3 className="text-3xl text-foreground">{sym}{toDisplay(totalSpent)}</h3>
              <p className="text-xs text-muted-foreground mt-1">Histórico registrado</p>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: colors.primaryAction }}>
              <DollarSign className="w-6 h-6" style={{ color: colors.primaryForeground }} />
            </div>
          </div>
        </div>

        <div className="p-6 rounded-lg border" style={{ backgroundColor: colors.bgSurface, borderColor: colors.border }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary mb-1">Mes Actual</p>
              <h3 className="text-3xl text-foreground">{sym}{toDisplay(currentMonthAmount)}</h3>
              <div className="flex items-center gap-1 mt-1">
                {parseFloat(percentChange) > 0
                  ? <TrendingUp className="w-4 h-4 text-[#E61445]" />
                  : <TrendingDown className="w-4 h-4" style={{ color: colors.success }} />}
                <p className="text-xs text-secondary">{percentChange}% vs mes anterior</p>
              </div>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: colors.primaryAction }}>
              <Calendar className="w-6 h-6" style={{ color: colors.primaryForeground }} />
            </div>
          </div>
        </div>

        <div className="p-6 rounded-lg border" style={{ backgroundColor: colors.bgSurface, borderColor: colors.border }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary mb-1">Promedio Mensual</p>
              <h3 className="text-3xl text-foreground">
                {sym}{monthlyTrend.length > 0 ? toDisplay(monthlyTrend.reduce((s, m) => s + m.amount, 0) / monthlyTrend.length) : '0.00'}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">Últimos {monthlyTrend.length} meses</p>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: colors.primaryAction }}>
              <TrendingUp className="w-6 h-6" style={{ color: colors.primaryForeground }} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-lg border" style={{ backgroundColor: colors.bgSurface, borderColor: colors.border }}>
          <h3 className="text-lg text-foreground mb-6">Tendencia de Gastos Mensuales</h3>
          {monthlyTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={convertedTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                <XAxis dataKey="month" stroke={colors.textSecondary} tick={{ fill: colors.textSecondary }} />
                <YAxis stroke={colors.textSecondary} tick={{ fill: colors.textSecondary }} />
                <Tooltip
                  contentStyle={{ backgroundColor: colors.bgSurface, border: `1px solid ${colors.border}`, borderRadius: '8px', color: colors.textPrimary }}
                  itemStyle={{ color: colors.textPrimary }}
                />
                <Line type="monotone" dataKey="amount" stroke={colors.textMuted} strokeWidth={2} dot={{ fill: colors.primaryAction, r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48">
              <p className="text-secondary">Sin historial de gastos aún</p>
            </div>
          )}
        </div>

        <div className="p-6 rounded-lg border" style={{ backgroundColor: colors.bgSurface, borderColor: colors.border }}>
          <h3 className="text-lg text-foreground mb-6">Gastos por Suscripción</h3>
          {categoryBreakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => (percent ?? 0) >= 0.05 ? `${name}: ${((percent ?? 0) * 100).toFixed(0)}%` : ''}
                  outerRadius={100}
                  dataKey="value"
                >
                  {categoryBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: colors.bgSurface, border: `1px solid ${colors.border}`, borderRadius: '8px', color: colors.textPrimary }}
                  itemStyle={{ color: colors.textPrimary }}
                />
                <Legend wrapperStyle={{ color: colors.textSecondary }} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48">
              <p className="text-secondary">Sin datos de pagos aún</p>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-lg border overflow-hidden" style={{ backgroundColor: colors.bgSurface, borderColor: 'rgba(255, 255, 255, 0.1)' }}>
        <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${colors.border}` }}>
          <h3 className="text-lg text-foreground">Historial de Pagos</h3>
          <button
            onClick={handleOpenPaymentForm}
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
                <th className="text-left px-6 py-4 text-secondary font-medium">Método de Pago</th>
                <th className="text-right px-6 py-4 text-secondary font-medium">Monto</th>
                <th className="text-center px-6 py-4 text-secondary font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paymentHistory.map((payment) => (
                <tr key={payment.id} style={{ borderBottom: `1px solid ${colors.border}` }} className="hover:bg-primary/20 transition-colors">
                  <td className="px-6 py-4 text-secondary">
                    {new Date(payment.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4 text-foreground">{payment.service}</td>
                  <td className="px-6 py-4 text-secondary">{payment.method}</td>
                  <td className="px-6 py-4 text-right text-foreground">{sym}{toDisplay(payment.amount)}</td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleEditPayment(payment)}
                        aria-label={`Editar pago de ${payment.service}`}
                        className="p-2 rounded-lg hover:opacity-80 transition-all"
                        style={{ backgroundColor: colors.primaryAction, color: colors.primaryForeground }}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePayment(payment.id)}
                        aria-label={`Eliminar pago de ${payment.service}`}
                        className="p-2 rounded-lg hover:opacity-80 transition-all"
                        style={{ backgroundColor: colors.destructive, color: '#ffffff' }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {paymentHistory.length === 0 && (
            <div className="text-center py-12">
              <p className="text-secondary">Sin pagos registrados aún</p>
            </div>
          )}
        </div>
      </div>

      <PaymentHistoryForm
        isOpen={isPaymentFormOpen}
        onClose={() => { setIsPaymentFormOpen(false); setEditingPayment(null); }}
        onSave={handleSavePayment}
        subscriptions={formData.suscripciones}
        paymentMethods={formData.metodosPago}
        editData={editingPayment ? {
          id: editingPayment.id,
          service: editingPayment.service,
          method: editingPayment.method,
          date: editingPayment.date,
          amount: editingPayment.amount,
          subscriptionId: editingPayment.subscriptionId,
          methodId: editingPayment.methodId,
        } : null}
      />
    </div>
  );
}
