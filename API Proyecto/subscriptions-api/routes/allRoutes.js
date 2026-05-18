const express = require('express');
const { verificarToken } = require('../middleware/auth');

// Importar todos los Controladores
const subCtrl = require('../controllers/subscriptionController');
const credCtrl = require('../controllers/credentialController');
const catCtrl = require('../controllers/categoryController');
const payMethCtrl = require('../controllers/paymentMethodController');
const payCtrl = require('../controllers/paymentController');
const dashCtrl = require('../controllers/dashboardController');
const statsCtrl = require('../controllers/statsController');
const catalogCtrl = require('../controllers/catalogController');

const router = express.Router();

// ==========================================
// PROTECCIÓN GLOBAL
// ==========================================
// El middleware verificarToken se aplica a TODAS las rutas declaradas debajo de esta línea
router.use(verificarToken);

// ==========================================
// RUTAS DE SUSCRIPCIONES (CRUD)
// ==========================================
router.post('/subscriptions', subCtrl.createSubscription);
router.put('/subscriptions/:id', subCtrl.updateSubscription);
router.delete('/subscriptions/:id', subCtrl.deleteSubscription);
router.get('/subscriptions', subCtrl.getSubscriptions);

// ==========================================
// RUTAS DE LA BÓVEDA DE CREDENCIALES
// ==========================================
router.get('/credentials', credCtrl.getCredentials);
router.post('/credentials', credCtrl.createCredential);
router.put('/credentials/:id', credCtrl.updateCredential);
router.delete('/credentials/:id', credCtrl.deleteCredential);

// ==========================================
// RUTAS DE CATEGORÍAS
// ==========================================
router.get('/categories', catCtrl.getCategories);
router.post('/categories', catCtrl.createCategory);
router.put('/categories/:id', catCtrl.updateCategory);
router.delete('/categories/:id', catCtrl.deleteCategory);

// ==========================================
// RUTAS DE MÉTODOS DE PAGO
// ==========================================
router.get('/payment-methods/types', payMethCtrl.getPaymentTypes); // Dropdown
router.get('/payment-methods', payMethCtrl.getPaymentMethods);     // Lista
router.post('/payment-methods', payMethCtrl.createPaymentMethod);
router.put('/payment-methods/:id', payMethCtrl.updatePaymentMethod);
router.put('/payment-methods/:id/default', payMethCtrl.setDefaultPaymentMethod);
router.delete('/payment-methods/:id', payMethCtrl.deletePaymentMethod);

// ==========================================
// RUTAS DE PAGOS E HISTORIAL
// ==========================================
router.get('/payments/form-data', payCtrl.getPaymentFormData);
router.get('/payments/history', payCtrl.getHistory);
router.get('/payments/upcoming', payCtrl.getUpcomingSubscriptions);
router.post('/payments', payCtrl.registerPayment);
router.put('/payments/:id', payCtrl.updatePayment);
router.delete('/payments/:id', payCtrl.deletePayment);

// ==========================================
// RUTAS DEL DASHBOARD (Pantalla 1)
// ==========================================
router.get('/dashboard/summary', dashCtrl.getDashboardSummary);
router.get('/dashboard/upcoming', dashCtrl.getUpcomingPayments);
router.get('/dashboard/expenses', dashCtrl.getExpensesPast6Months);

// ==========================================
// RUTAS DE ESTADÍSTICAS (Pantalla 3)
// ==========================================
router.get('/stats', statsCtrl.getDetailedStats);

// ==========================================
// RUTAS DE FORMULARIOS GENERALES
// ==========================================
router.get('/catalogs/subscription-form', catalogCtrl.getSubscriptionFormData);

module.exports = router;