import React, { useState } from 'react';
import axios from '../lib/axios';
import toast from 'react-hot-toast';

export default function RegisterPaymentModal({ sale, customer, onClose, onSaved }) {
  const [amount, setAmount] = useState(String(sale?.outstanding ?? ''));
  const [loading, setLoading] = useState(false);

  const authHeader = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };

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
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <h3 className="text-lg font-semibold mb-2">Registrar pago — Venta #{sale.id}</h3>
        <p className="text-sm text-gray-500 mb-4">Pendiente: {Number(sale.outstanding || 0).toLocaleString('es-AR', { style:'currency', currency:'ARS' })}</p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input type="number" step="0.01" min="0" value={amount} onChange={e => setAmount(e.target.value)} className="w-full p-2 border rounded" />
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-3 py-2 bg-gray-100 rounded">Cancelar</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded">{loading ? 'Guardando...' : 'Registrar pago'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}