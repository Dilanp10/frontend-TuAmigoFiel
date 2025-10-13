// src/component/SaleDetailModal.jsx
import React from 'react';
import { format } from 'date-fns';

export default function SaleDetailModal({ sale, onClose }) {
  if (!sale) return null;

  const total = sale.total;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sale-detail-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal container */}
      <div className="relative w-full max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl overflow-auto max-h-[90vh]">
        <div className="p-4 sm:p-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
            <div>
              <h3 id="sale-detail-title" className="text-lg sm:text-xl font-bold text-gray-800">
                Venta #{String(sale.id).slice(-6)}
              </h3>
              <p className="text-sm text-gray-500">
                Fecha: {sale.created_at ? format(new Date(sale.created_at), 'dd/MM/yyyy HH:mm') : '-'}
              </p>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <div className="hidden sm:block text-right text-sm text-gray-600">
                <div className="font-medium">Total</div>
                <div className="text-lg font-bold text-indigo-700">
                  {Number(total).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}
                </div>
              </div>

              <button
                onClick={onClose}
                className="ml-0 sm:ml-4 inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:bg-gray-100"
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Items list */}
          <div className="space-y-3">
            {sale.items && sale.items.length > 0 ? (
              sale.items.map((it, index) => {
                // Usar los campos correctos que vienen del backend
                const nombre = it.nombre || (it.product?.nombre) || (it.service?.nombre) || 'Item sin nombre';
                const precioUnitario = it.precio_unitario || it.unit_price || 0;
                const cantidad = it.qty || 0;
                const subtotal = it.line_total ?? (precioUnitario * cantidad);

                return (
                  <div
                    key={it.id || index}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b pb-3"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-800 truncate">{nombre}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        Tipo: {it.tipo || (it.product ? 'Producto' : (it.service ? 'Servicio' : 'N/A'))}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Precio unitario:{' '}
                        <span className="font-medium">
                          {Number(precioUnitario).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}
                        </span>
                      </div>
                    </div>

                    <div className="flex-shrink-0 text-right">
                      <div className="font-semibold text-gray-800">{cantidad} unid.</div>
                      <div className="text-sm text-gray-600 mt-1">
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

          {/* Footer (mobile total + actions) */}
          <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="sm:hidden bg-gray-50 p-3 rounded-lg w-full">
              <div className="text-sm text-gray-600">Total</div>
              <div className="text-lg font-bold text-indigo-700">
                {Number(total).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}
              </div>
            </div>

            <div className="flex gap-3 justify-end w-full sm:w-auto">
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2 rounded-lg border hover:bg-gray-50"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}