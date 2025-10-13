// src/pages/HistorialVentas.jsx
import React, { useEffect, useState, useMemo } from 'react';
import axios from '../lib/axios';
import NavbarAdmin from '../component/NavbarAdmin';
import SaleDetailModal from '../component/SaleDetailModal';
import { format } from 'date-fns';

export default function HistorialVentas() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState(null);

  const fetchSales = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get('/api/sales');
      setSales(res.data || []);
    } catch (err) {
      console.error('Error cargando ventas', err);
      setError('No se pudieron cargar las ventas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSales(); }, []);

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return sales;
    
    return sales.filter(sale => 
      String(sale.total || '').includes(term) ||
      (sale.items && sale.items.some(item => 
        item.nombre && item.nombre.toLowerCase().includes(term)
      ))
    );
  }, [sales, searchTerm]);

  const openDetail = async (saleId) => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/sales/${saleId}`);
      setSelected(res.data);
    } catch (err) {
      console.error('Error fetching sale detail', err);
      setError('No se pudo cargar el detalle de la venta');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDetail = () => setSelected(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-indigo-100 font-sans antialiased">
      <NavbarAdmin />

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800">
              <span className="text-purple-600">Historial</span> <span className="text-gray-600">— Ventas</span>
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Listado de ventas registradas — busca por total o nombre de producto/servicio.
            </p>
          </div>

          <div className="w-full sm:w-auto">
            <div className="flex gap-2 items-center">
              <input
                type="text"
                placeholder="Buscar por total o nombre..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 text-sm"
                aria-label="Buscar ventas"
              />
              <button
                onClick={fetchSales}
                className="hidden sm:inline-flex ml-2 px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 text-sm"
              >
                Actualizar
              </button>
            </div>
            {/* Mobile action row */}
            <div className="flex sm:hidden mt-2 gap-2">
              <button onClick={fetchSales} className="flex-1 px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm">Actualizar</button>
            </div>
          </div>
        </header>

        {loading && (
          <div className="text-center py-8 text-gray-500">Cargando ventas…</div>
        )}

        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded mb-4">{error}</div>
        )}

        <section className="bg-white rounded-2xl shadow p-3 sm:p-4">
          {filtered.length === 0 ? (
            <div className="text-center text-gray-500 p-8">
              {searchTerm ? 'No hay ventas que coincidan con la búsqueda' : 'No hay ventas'}
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(sale => {
                // Obtener el primer item para mostrar
                const firstItem = sale.items && sale.items.length > 0 ? sale.items[0] : null;
                const firstName = firstItem ? firstItem.nombre : 'Sin nombre';
                const remaining = Math.max(0, (sale.items && sale.items.length) - 1);

                return (
                  <article
                    key={sale.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b last:border-b-0 pb-3"
                    aria-labelledby={`sale-${sale.id}`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-md bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-500 border">
                            #{String(sale.id).slice(-4)}
                          </div>
                        </div>

                        <div className="min-w-0">
                          <div id={`sale-${sale.id}`} className="font-medium text-gray-800 truncate">
                            Venta #{String(sale.id).slice(-6)}
                          </div>
                          <div className="text-xs text-gray-500">
                            Fecha: {sale.created_at ? format(new Date(sale.created_at), 'dd/MM/yyyy HH:mm') : '-'}
                          </div>

                          {firstItem && (
                            <div className="text-sm text-gray-600 mt-1 truncate">
                              <span className="font-semibold">{firstName}</span>
                              {remaining > 0 && <span className="text-gray-400 ml-2">+{remaining} más</span>}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mt-3 sm:mt-0">
                      <div className="text-indigo-700 font-semibold text-lg whitespace-nowrap">
                        {Number(sale.total || 0).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}
                      </div>

                      <button
                        onClick={() => openDetail(sale.id)}
                        className="px-3 py-2 bg-white border rounded-lg text-indigo-600 hover:bg-indigo-50 text-sm"
                        aria-label={`Ver detalle venta ${sale.id}`}
                      >
                        Ver
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {selected && <SaleDetailModal sale={selected} onClose={handleCloseDetail} />}
    </div>
  );
}