import React from 'react';
import { format } from 'date-fns';

export default function SaleDetailModal({ sale, onClose }) {
  if (!sale) return null;

  const total = sale.total;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-2xl mx-4 bg-white rounded-2xl shadow-2xl overflow-auto max-h-[90vh]">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold">Venta #{sale.id}</h3>
              <p className="text-sm text-gray-500">Fecha: {sale.created_at ? format(new Date(sale.created_at), 'dd/MM/yyyy HH:mm') : '-'}</p>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
          </div>

          <div className="space-y-3">
            {sale.items && sale.items.length > 0 ? (
              sale.items.map(it => (
                <div key={it.id} className="flex items-center justify-between border-b py-2">
                  <div>
                    <div className="font-medium">
                      {/* Mostrar nombre de producto o servicio */}
                      {it.product_nombre || it.service_nombre || 'Item'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {/* Mostrar tipo de item */}
                      Tipo: {it.product_nombre ? 'Producto' : (it.service_nombre ? 'Servicio' : 'N/A')}
                    </div>
                    <div className="text-xs text-gray-500">
                      Precio: {Number(it.price).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{it.qty} unid.</div>
                    <div className="text-sm text-gray-600">{(it.price * it.qty).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-500">Sin items</div>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">Total</div>
            <div className="text-xl font-bold text-indigo-700">{Number(total).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}</div>
          </div>

          <div className="mt-4 flex justify-end">
            <button onClick={onClose} className="px-4 py-2 rounded-lg border hover:bg-gray-50">Cerrar</button>
          </div>
        </div>
      </div>
    </div>
  );
}