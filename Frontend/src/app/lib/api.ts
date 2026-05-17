const USER_API = 'http://localhost:3001';
const SUBS_API = 'http://localhost:3002';

const getToken = () => localStorage.getItem('token') ?? '';

const authHeaders = (): HeadersInit => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`,
});

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  if (!res.ok) {
    let msg = `Error ${res.status}`;
    try {
      const body = await res.json();
      msg = body.error || body.message || msg;
    } catch {}
    throw new Error(msg);
  }
  return res.json();
}

// ==========================================
// AUTH
// ==========================================
export async function login(correo: string, contrasena: string) {
  return request<{ token: string; user: { id: number; nombre: string; correo: string } }>(
    `${USER_API}/api/users/login`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ correo, contrasena }) }
  );
}

export async function registerUser(nombre: string, correo: string, contrasena: string) {
  return request<{ message: string }>(
    `${USER_API}/api/users/register`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nombre, correo, contrasena }) }
  );
}

export async function updateUser(id: number, data: { nombre?: string; contrasena?: string }) {
  return request<{ message: string }>(
    `${USER_API}/api/users/${id}`,
    { method: 'PUT', headers: authHeaders(), body: JSON.stringify(data) }
  );
}

// ==========================================
// DASHBOARD
// ==========================================
export async function getDashboardSummary() {
  return request<{ totalSuscripcionesActivas: number; gastoMensualTotal: number; listaSuscripciones: any[] }>(
    `${SUBS_API}/api/dashboard/summary`, { headers: authHeaders() }
  );
}

export async function getDashboardUpcoming() {
  return request<{ proximoPago: any | null; pagosDeLaSemana: any[] }>(
    `${SUBS_API}/api/dashboard/upcoming`, { headers: authHeaders() }
  );
}

export async function getDashboardExpenses() {
  return request<Array<{ month: string; amount: number }>>(
    `${SUBS_API}/api/dashboard/expenses`, { headers: authHeaders() }
  );
}

// ==========================================
// SUBSCRIPTIONS
// ==========================================
export async function getSubscriptions() {
  return request<{ suscripciones: any[] }>(
    `${SUBS_API}/api/subscriptions`, { headers: authHeaders() }
  );
}

export async function createSubscription(data: Record<string, unknown>) {
  return request<{ message: string; id: number }>(
    `${SUBS_API}/api/subscriptions`,
    { method: 'POST', headers: authHeaders(), body: JSON.stringify(data) }
  );
}

export async function updateSubscription(id: number, data: Record<string, unknown>) {
  return request<{ message: string }>(
    `${SUBS_API}/api/subscriptions/${id}`,
    { method: 'PUT', headers: authHeaders(), body: JSON.stringify(data) }
  );
}

export async function deleteSubscription(id: number) {
  return request<{ message: string }>(
    `${SUBS_API}/api/subscriptions/${id}`,
    { method: 'DELETE', headers: authHeaders() }
  );
}

export async function getSubscriptionFormData() {
  return request<{
    categorias: Array<{ id: number; name: string; color: string }>;
    metodosPago: Array<{ id: number; alias: string }>;
    ciclosFacturacion: Array<{ id: number; description: string }>;
    estados: Array<{ id: number; description: string }>;
  }>(
    `${SUBS_API}/api/catalogs/subscription-form`, { headers: authHeaders() }
  );
}

// ==========================================
// CATEGORIES
// ==========================================
export async function getCategories() {
  return request<{ categorias: any[] }>(
    `${SUBS_API}/api/categories`, { headers: authHeaders() }
  );
}

export async function createCategory(data: { nombre: string; descripcion?: string; color?: string }) {
  return request<{ message: string; id: number }>(
    `${SUBS_API}/api/categories`,
    { method: 'POST', headers: authHeaders(), body: JSON.stringify(data) }
  );
}

export async function updateCategory(id: number, data: { nombre: string; descripcion?: string; color?: string }) {
  return request<{ message: string }>(
    `${SUBS_API}/api/categories/${id}`,
    { method: 'PUT', headers: authHeaders(), body: JSON.stringify(data) }
  );
}

export async function deleteCategory(id: number) {
  return request<{ message: string }>(
    `${SUBS_API}/api/categories/${id}`,
    { method: 'DELETE', headers: authHeaders() }
  );
}

// ==========================================
// PAYMENT METHODS
// ==========================================
export async function getPaymentMethods() {
  return request<{ metodosPago: any[] }>(
    `${SUBS_API}/api/payment-methods`, { headers: authHeaders() }
  );
}

export async function getPaymentTypes() {
  return request<{ tipos: Array<{ id: number; description: string }> }>(
    `${SUBS_API}/api/payment-methods/types`, { headers: authHeaders() }
  );
}

export async function createPaymentMethod(data: { tipoId: number; alias: string; detalles?: string | null }) {
  return request<{ message: string; id: number }>(
    `${SUBS_API}/api/payment-methods`,
    { method: 'POST', headers: authHeaders(), body: JSON.stringify(data) }
  );
}

export async function updatePaymentMethod(id: number, data: { tipoId: number; alias: string; detalles?: string | null }) {
  return request<{ message: string }>(
    `${SUBS_API}/api/payment-methods/${id}`,
    { method: 'PUT', headers: authHeaders(), body: JSON.stringify(data) }
  );
}

export async function deletePaymentMethod(id: number) {
  return request<{ message: string }>(
    `${SUBS_API}/api/payment-methods/${id}`,
    { method: 'DELETE', headers: authHeaders() }
  );
}

// ==========================================
// CREDENTIALS
// ==========================================
export async function getCredentials() {
  return request<{ credenciales: any[] }>(
    `${SUBS_API}/api/credentials`, { headers: authHeaders() }
  );
}

export async function createCredential(data: {
  suscripcionId?: number | null;
  contrasena: string;
  nombreUsuario: string;
  url?: string;
  descripcion?: string;
}) {
  return request<{ message: string; id: number }>(
    `${SUBS_API}/api/credentials`,
    { method: 'POST', headers: authHeaders(), body: JSON.stringify(data) }
  );
}

export async function updateCredential(id: number, data: {
  suscripcionId?: number | null;
  contrasena?: string;
  nombreUsuario?: string;
  url?: string;
  descripcion?: string;
}) {
  return request<{ message: string }>(
    `${SUBS_API}/api/credentials/${id}`,
    { method: 'PUT', headers: authHeaders(), body: JSON.stringify(data) }
  );
}

export async function deleteCredential(id: number) {
  return request<{ message: string }>(
    `${SUBS_API}/api/credentials/${id}`,
    { method: 'DELETE', headers: authHeaders() }
  );
}

// ==========================================
// PAYMENT HISTORY
// ==========================================
export async function getPaymentHistory() {
  return request<{ historial: any[] }>(
    `${SUBS_API}/api/payments/history`, { headers: authHeaders() }
  );
}

export async function getPaymentFormData() {
  return request<{ suscripciones: any[]; metodosPago: any[] }>(
    `${SUBS_API}/api/payments/form-data`, { headers: authHeaders() }
  );
}

export async function registerPayment(data: { suscripcionId: number; metodoDePagoId: number; monto: number; fecha: string }) {
  return request<{ message: string; nuevaFechaRenovacion: string }>(
    `${SUBS_API}/api/payments`,
    { method: 'POST', headers: authHeaders(), body: JSON.stringify(data) }
  );
}

export async function updatePayment(id: number, data: { monto: number; fecha: string }) {
  return request<{ message: string }>(
    `${SUBS_API}/api/payments/${id}`,
    { method: 'PUT', headers: authHeaders(), body: JSON.stringify(data) }
  );
}

export async function deletePayment(id: number) {
  return request<{ message: string }>(
    `${SUBS_API}/api/payments/${id}`,
    { method: 'DELETE', headers: authHeaders() }
  );
}
