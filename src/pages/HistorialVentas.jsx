import React, { useEffect, useState, useMemo } from 'react';
import axios from '../lib/axios';
import NavbarAdmin from '../component/NavbarAdmin';
import SaleDetailModal from '../component/SaleDetailModal';
import { format } from 'date-fns';

export default function HistorialVentas() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(''); // búsqueda por total o nombre
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
      (sale.items_names && sale.items_names.some(name => 
        name.toLowerCase().includes(term)
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-indigo-100">
      <NavbarAdmin />
      <div className="max-w-6xl mx-auto p-6">
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-800">
              <span className="text-purple-600">Historial</span> <span className="text-gray-600">— Ventas</span>
            </h1>
            <p className="text-sm text-gray-500 mt-1">Listado de ventas registradas — busca por total o nombre de producto/servicio.</p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Buscar por total o nombre..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="px-4 py-2 border rounded-lg w-64"
            />
          </div>
        </header>

        {loading && <div className="text-center py-8 text-gray-500">Cargando ventas…</div>}
        {error && <div className="p-3 bg-red-50 text-red-700 rounded mb-4">{error}</div>}

        <div className="bg-white rounded-2xl shadow p-4">
          {filtered.length === 0 ? (
            <div className="text-center text-gray-500 p-8">
              {searchTerm ? 'No hay ventas que coincidan con la búsqueda' : 'No hay ventas'}
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(sale => {
                // items_names es un array de strings que puso el backend (productos o servicios)
                const firstName = (sale.items_names && sale.items_names.length > 0) ? sale.items_names[0] : null;
                const remaining = Math.max(0, (sale.items_count || 0) - 1);

                return (
                  <div key={sale.id} className="flex items-center justify-between border-b py-3">
                    <div>
                      <div className="font-medium">Venta #{sale.id}</div>
                      <div className="text-xs text-gray-500">
                        Fecha: {sale.created_at ? format(new Date(sale.created_at), 'dd/MM/yyyy HH:mm') : '-'}
                      </div>
                      {firstName && (
                        <div className="text-sm text-gray-600 mt-1">
                          <span className="font-semibold">{firstName}</span>
                          {remaining > 0 && <span className="text-gray-400 ml-2">+{remaining} más</span>}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-indigo-700 font-semibold">
                        {Number(sale.total || 0).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}
                      </div>
                      <button onClick={() => openDetail(sale.id)} className="text-sm text-indigo-600 hover:underline">Ver</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {selected && <SaleDetailModal sale={selected} onClose={handleCloseDetail} />}
    </div>
  );
}