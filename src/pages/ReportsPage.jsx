// src/pages/ReportsPage.jsx
import React, { useEffect, useMemo, useState } from 'react';
import axios from '../lib/axios';
import NavbarAdmin from '../component/NavbarAdmin';
import { format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';

const todayISO = () => new Date().toISOString().slice(0, 10);
const sixMonthsAgoISO = () => {
  const now = new Date();
  const past = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  return past.toISOString().slice(0, 10);
};

const formatCurrency = (v) => {
  if (v == null || v === 0) return '$0';
  return Number(v).toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 2 });
};

const monthLabel = (m) => {
  if (!m) return '-';
  const parts = String(m).split('-');
  if (parts.length >= 2) {
    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, 1);
    return d.toLocaleString('es-AR', { month: 'long', year: 'numeric' });
  }
  try {
    const d = parseISO(m);
    return format(d, 'LLLL yyyy');
  } catch (e) {
    return m;
  }
};

export default function ReportsPage() {
  const [from, setFrom] = useState(sixMonthsAgoISO());
  const [to, setTo] = useState(todayISO());
  const [loading, setLoading] = useState(false);
  const [salesData, setSalesData] = useState([]);
  const [profitData, setProfitData] = useState([]);
  const [error, setError] = useState(null);

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const [salesRes, profitRes] = await Promise.all([
        axios.get('/api/reports/sales-by-month', { 
          params: { from, to }, 
          headers,
          timeout: 20000
        }),
        axios.get('/api/reports/profit-by-month', { 
          params: { from, to }, 
          headers,
          timeout: 20000
        })
      ]);
      
      const salesDataArray = Array.isArray(salesRes.data?.data) ? salesRes.data.data : [];
      const profitDataArray = Array.isArray(profitRes.data?.data) ? profitRes.data.data : [];
      
      setSalesData(salesDataArray);
      setProfitData(profitDataArray);

      if (salesDataArray.length === 0 && profitDataArray.length === 0) {
        toast.error('No se encontraron datos para el rango seleccionado');
      } else {
        toast.success('Reportes cargados correctamente');
      }

    } catch (err) {
      let errorMessage = 'Error cargando reportes';
      
      if (err.response) {
        errorMessage = err.response.data?.message || `Error ${err.response.status}`;
      } else if (err.request) {
        errorMessage = 'Error de conexión con el servidor';
      } else {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      toast.error('No se pudieron cargar los reportes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line
  }, []);

  const onApply = () => {
    if (!from || !to) return toast.error('Seleccioná rango válido');
    if (new Date(from) > new Date(to)) return toast.error('El rango "desde" no puede ser mayor que "hasta"');
    fetchReports();
  };

  const onReset = () => {
    setFrom(sixMonthsAgoISO());
    setTo(todayISO());
  };

  const totals = useMemo(() => {
    const totalSales = salesData.reduce((s, r) => s + Number(r.total_sales || 0), 0);
    const totalOrders = salesData.reduce((s, r) => s + Number(r.orders || 0), 0);
    const totalItems = salesData.reduce((s, r) => s + Number(r.total_items || 0), 0);
    const totalRevenue = profitData.reduce((s, r) => s + Number(r.revenue || 0), 0);
    const totalCogs = profitData.reduce((s, r) => s + Number(r.cogs || 0), 0);
    const totalProfit = profitData.reduce((s, r) => s + Number(r.profit || 0), 0);

    const avgPerMonth = salesData.length ? (totalSales / salesData.length) : 0;

    const bestMonth = salesData.length ? salesData.reduce((best, cur) => (Number(cur.total_sales || 0) > Number(best.total_sales || 0) ? cur : best), salesData[0]) : null;
    const worstMonth = salesData.length ? salesData.reduce((worst, cur) => (Number(cur.total_sales || 0) < Number(worst.total_sales || 0) ? cur : worst), salesData[0]) : null;

    return { totalSales, totalOrders, totalItems, totalRevenue, totalCogs, totalProfit, avgPerMonth, bestMonth, worstMonth };
  }, [salesData, profitData]);

  const withChange = (arr = [], valueKey) => {
    const copy = [...arr].sort((a, b) => (a.month > b.month ? 1 : -1));
    return copy.map((row, idx) => {
      const prev = idx > 0 ? Number(copy[idx - 1][valueKey] || 0) : null;
      const cur = Number(row[valueKey] || 0);
      const change = (prev === null || prev === 0) ? null : ((cur - prev) / Math.abs(prev)) * 100;
      return { ...row, _changePct: change };
    }).reverse();
  };

  const salesWithChange = useMemo(() => withChange(salesData, 'total_sales'), [salesData]);
  const profitWithChange = useMemo(() => withChange(profitData, 'profit'), [profitData]);

  const csvFor = (which) => {
    let rows = [];
    if (which === 'sales') {
      rows = salesData.map(r => ({ month: r.month, orders: r.orders, total_sales: r.total_sales, total_items: r.total_items }));
    } else {
      rows = profitData.map(r => ({ month: r.month, revenue: r.revenue, cogs: r.cogs, profit: r.profit }));
    }
    if (!rows.length) { toast('No hay datos para exportar'); return; }
    const header = Object.keys(rows[0]).join(',');
    const body = rows.map(r => Object.values(r).map(v => `"${String(v ?? '')}"`).join(',')).join('\n');
    const csv = header + '\n' + body;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report_${which}_${from}_to_${to}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-indigo-100">
      <NavbarAdmin />

      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
          <div className="w-full lg:flex-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800">
              <span className="text-purple-600">Reportes</span> <span className="text-gray-600">— Ventas y Ganancia</span>
            </h1>
            <p className="text-sm text-gray-500 mt-1">Seleccioná rango para ver un resumen claro y fácil de entender.</p>
          </div>

          <div className="w-full lg:w-auto flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
            <div className="flex items-center gap-2 bg-white p-2 rounded-lg shadow">
              <label className="text-xs text-gray-500 mr-1">Desde</label>
              <input 
                type="date" 
                value={from} 
                onChange={e => setFrom(e.target.value)} 
                className="px-2 py-2 border rounded-md"
              />
            </div>

            <div className="flex items-center gap-2 bg-white p-2 rounded-lg shadow">
              <label className="text-xs text-gray-500 mr-1">Hasta</label>
              <input 
                type="date" 
                value={to} 
                onChange={e => setTo(e.target.value)} 
                className="px-2 py-2 border rounded-md"
              />
            </div>

            <div className="flex gap-2 mt-2 sm:mt-0">
              <button 
                onClick={onApply} 
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? 'Cargando...' : 'Aplicar'}
              </button>
              <button 
                onClick={onReset}
                className="px-3 py-2 border rounded-lg hover:bg-gray-50"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {loading && (
          <div className="text-center py-8 text-gray-500">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <div className="mt-2">Cargando reportes…</div>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded mb-4">
            <strong>Error:</strong> {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-6 rounded-2xl shadow">
            <div className="text-xs text-gray-500">Ingresos totales</div>
            <div className="text-2xl font-bold text-indigo-700">{formatCurrency(totals.totalSales)}</div>
            <div className="text-sm text-gray-500 mt-2">
              Pedidos: <strong>{totals.totalOrders}</strong> · Ítems: <strong>{totals.totalItems}</strong>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow">
            <div className="text-xs text-gray-500">Profit total</div>
            <div className="text-2xl font-bold text-green-700">{formatCurrency(totals.totalProfit)}</div>
            <div className="text-sm text-gray-500 mt-2">
              COGS: <strong>{formatCurrency(totals.totalCogs)}</strong>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow">
            <div className="text-xs text-gray-500">Promedio mensual</div>
            <div className="text-2xl font-bold text-gray-800">{formatCurrency(totals.avgPerMonth)}</div>
            <div className="text-sm text-gray-500 mt-2">
              Mejor mes: <strong>{totals.bestMonth ? monthLabel(totals.bestMonth.month) : '-'}</strong>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-2xl shadow p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Ventas por mes</h3>
                <p className="text-sm text-gray-500">Incluye órdenes, ítems y total.</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => csvFor('sales')} 
                  className="px-3 py-1 border rounded text-sm hover:bg-gray-50"
                  disabled={salesData.length === 0}
                >
                  Exportar CSV
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-500">
                    <th className="py-2 pr-4">Mes</th>
                    <th className="py-2 pr-4">Órdenes</th>
                    <th className="py-2 pr-4">Ítems</th>
                    <th className="py-2 pr-4">Ingresos</th>
                    <th className="py-2 pr-4">Cambio</th>
                  </tr>
                </thead>
                <tbody>
                  {salesWithChange.length === 0 && (
                    <tr>
                      <td colSpan="5" className="py-6 text-center text-gray-400">
                        {loading ? 'Cargando...' : 'Sin datos de ventas'}
                      </td>
                    </tr>
                  )}
                  {salesWithChange.map(r => (
                    <tr key={r.month} className="border-t">
                      <td className="py-3 pr-4 font-medium">{monthLabel(r.month)}</td>
                      <td className="py-3 pr-4">{r.orders}</td>
                      <td className="py-3 pr-4">{r.total_items}</td>
                      <td className="py-3 pr-4 font-semibold text-indigo-700">
                        {formatCurrency(r.total_sales)}
                      </td>
                      <td className="py-3 pr-4">
                        {r._changePct == null ? (
                          <span className="text-xs text-gray-400">—</span>
                        ) : (
                          <span className={`text-sm ${r._changePct < 0 ? 'text-red-600' : 'text-green-700'}`}>
                            {r._changePct > 0 ? '↑' : '↓'} {Math.abs(r._changePct).toFixed(1)}%
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Ganancias por mes</h3>
                <p className="text-sm text-gray-500">Revenue, COGS y Profit.</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => csvFor('profit')} 
                  className="px-3 py-1 border rounded text-sm hover:bg-gray-50"
                  disabled={profitData.length === 0}
                >
                  Exportar CSV
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-500">
                    <th className="py-2 pr-4">Mes</th>
                    <th className="py-2 pr-4">Ingresos</th>
                    <th className="py-2 pr-4">COGS</th>
                    <th className="py-2 pr-4">Profit</th>
                    <th className="py-2 pr-4">Cambio</th>
                  </tr>
                </thead>
                <tbody>
                  {profitWithChange.length === 0 && (
                    <tr>
                      <td colSpan="5" className="py-6 text-center text-gray-400">
                        {loading ? 'Cargando...' : 'Sin datos de ganancias'}
                      </td>
                    </tr>
                  )}
                  {profitWithChange.map(r => (
                    <tr key={r.month} className="border-t">
                      <td className="py-3 pr-4 font-medium">{monthLabel(r.month)}</td>
                      <td className="py-3 pr-4">{formatCurrency(r.revenue)}</td>
                      <td className="py-3 pr-4">{formatCurrency(r.cogs)}</td>
                      <td className={`py-3 pr-4 font-semibold ${r.profit < 0 ? 'text-red-600' : 'text-green-700'}`}>
                        {formatCurrency(r.profit)}
                      </td>
                      <td className="py-3 pr-4">
                        {r._changePct == null ? (
                          <span className="text-xs text-gray-400">—</span>
                        ) : (
                          <span className={`text-sm ${r._changePct < 0 ? 'text-red-600' : 'text-green-700'}`}>
                            {r._changePct > 0 ? '↑' : '↓'} {Math.abs(r._changePct).toFixed(1)}%
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-white rounded-2xl shadow p-4 sm:p-6">
          <h4 className="text-md font-semibold mb-3 text-gray-700">Resumen del Período</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-indigo-50 rounded">
              <div className="text-xs text-gray-500">Ingresos totales</div>
              <div className="text-xl font-bold text-indigo-700">{formatCurrency(totals.totalSales)}</div>
            </div>
            <div className="p-4 bg-yellow-50 rounded">
              <div className="text-xs text-gray-500">COGS total</div>
              <div className="text-xl font-bold text-yellow-700">{formatCurrency(totals.totalCogs)}</div>
            </div>
            <div className="p-4 bg-green-50 rounded">
              <div className="text-xs text-gray-500">Profit total</div>
              <div className="text-xl font-bold text-green-700">{formatCurrency(totals.totalProfit)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}