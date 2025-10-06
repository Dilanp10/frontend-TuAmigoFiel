import React from 'react';
import { format } from 'date-fns';

export default function SaleDetailModal({ sale, onClose }) {
  if (!sale) return null;

  console.log('🔍 [Modal DEBUG] Venta recibida:', sale); // ← DEBUG

  const total = sale.total;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-2xl mx-4 bg-white rounded-2xl shadow-2xl overflow-auto max-h-[90vh]">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold">Venta #{sale.id?.slice(-6)}</h3>
              <p className="text-sm text-gray-500">Fecha: {sale.created_at ? format(new Date(sale.created_at), 'dd/MM/yyyy HH:mm') : '-'}</p>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
          </div>

          <div className="space-y-3">
            {sale.items && sale.items.length > 0 ? (
              sale.items.map((it, index) => {
                console.log('📦 [Modal DEBUG] Item:', it); // ← DEBUG por item
                
                // Usar los campos correctos que vienen del backend
                const nombre = it.nombre || (it.product?.nombre) || (it.service?.nombre) || 'Item sin nombre';
                const precioUnitario = it.precio_unitario || it.unit_price || 0;
                const cantidad = it.qty || 0;
                const subtotal = it.line_total || (precioUnitario * cantidad);

                return (
                  <div key={it.id || index} className="flex items-center justify-between border-b py-2">
                    <div className="flex-1">
                      <div className="font-medium">{nombre}</div>
                      <div className="text-xs text-gray-500">
                        Tipo: {it.tipo || (it.product ? 'Producto' : (it.service ? 'Servicio' : 'N/A'))}
                      </div>
                      <div className="text-xs text-gray-500">
                        Precio unitario: {Number(precioUnitario).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{cantidad} unid.</div>
                      <div className="text-sm text-gray-600">
                        {Number(subtotal).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-sm text-gray-500">Sin items</div>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">Total</div>
            <div className="text-xl font-bold text-indigo-700">
              {Number(total).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button onClick={onClose} className="px-4 py-2 rounded-lg border hover:bg-gray-50">Cerrar</button>
          </div>
        </div>
      </div>
    </div>
  );
}