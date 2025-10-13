// src/component/RegisterPaymentModal.jsx
import React, { useState, useEffect } from 'react';
import axios from '../lib/axios';
import toast from 'react-hot-toast';

export default function RegisterPaymentModal({ sale, customer, onClose, onSaved }) {
  const [amount, setAmount] = useState(String(sale?.outstanding ?? ''));
  const [loading, setLoading] = useState(false);

  const authHeader = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };

  // Keep amount in sync if sale changes
  useEffect(() => {
    setAmount(String(sale?.outstanding ?? ''));
  }, [sale]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const amt = Number(amount);
    if (!amt || amt <= 0) return toast.error('Monto inválido');
    setLoading(true);
    try {
      const payload = { saleId: sale.id, customerId: customer?.id, amount: amt };
      await axios.post('/api/payments', payload, authHeader);
      toast.success('Pago registrado');
      onSaved && onSaved();
    } catch (err) {
      console.error('Error registrando pago', err);
      toast.error(err?.response?.data?.message || 'Error al registrar pago');
    } finally {
      setLoading(false);
    }
  };

  if (!sale) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="register-payment-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-4 sm:p-6">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <h3 id="register-payment-title" className="text-lg font-semibold text-gray-800">
                Registrar pago — Venta #{sale.id}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Cliente: {customer?.nombre ?? '—'}
              </p>
            </div>
            <button
              onClick={onClose}
              aria-label="Cerrar"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:bg-gray-100"
            >
              ✕
            </button>
          </div>

          <div className="mb-4 p-3 bg-gray-50 rounded">
            <div className="text-sm text-gray-600">Pendiente</div>
            <div className="text-lg font-bold text-indigo-700">
              {Number(sale.outstanding || 0).toLocaleString('es-AR', { style:'currency', currency:'ARS' })}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block">
              <span className="text-sm text-gray-700">Monto a registrar</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="mt-2 w-full px-3 py-3 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 text-sm"
                aria-label="Monto a pagar"
                inputMode="decimal"
              />
            </label>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-3 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-60"
              >
                {loading ? 'Guardando...' : 'Registrar pago'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}