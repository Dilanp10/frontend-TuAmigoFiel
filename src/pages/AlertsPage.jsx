// src/pages/AlertsPage.jsx
import React, { useEffect, useMemo, useState, useRef } from 'react';
import axios from '../lib/axios';
import NavbarAdmin from '../component/NavbarAdmin';
import toast from 'react-hot-toast';
import { format, differenceInCalendarDays, isValid, parseISO } from 'date-fns';
import { MagnifyingGlassIcon, ArrowPathIcon, BellAlertIcon } from '@heroicons/react/24/outline';

const FILTERS = [
  { key: 'all', label: 'Todas' },
  { key: 'expiring', label: 'Por vencer (<=30d)' },
  { key: 'expired', label: 'Vencidas' },
  { key: 'low_stock', label: 'Bajo stock' },
];

const TYPE_BADGE = {
  expiry: { label: 'Vencimiento', color: 'bg-yellow-50 text-yellow-800' },
  expired: { label: 'Vencido', color: 'bg-red-50 text-red-800' },
  stock: { label: 'Stock bajo', color: 'bg-indigo-50 text-indigo-800' },
  general: { label: 'General', color: 'bg-gray-100 text-gray-800' },
};

function parseMeta(meta) {
  if (!meta) return null;
  if (typeof meta === 'string') {
    try {
      return JSON.parse(meta);
    } catch {
      return meta;
    }
  }
  return meta;
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [q, setQ] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdatedAt, setLastUpdatedAt] = useState(null);
  const pollingRef = useRef();

  // UI: mobile filters panel toggle
  const [filtersOpen, setFiltersOpen] = useState(false);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/alerts');
      const data = Array.isArray(res.data) ? res.data : [];
      setAlerts(data);
      setLastUpdatedAt(new Date().toISOString());
    } catch (err) {
      console.error('Error cargando alertas', err);
      toast.error('No se pudieron cargar las alertas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();

    if (autoRefresh) {
      pollingRef.current = setInterval(fetchAlerts, 60000);
    }
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [autoRefresh]);

  const handleResolve = async (id) => {
    const ok = window.confirm('¿Marcar alerta como resuelta?');
    if (!ok) return;
    
    const previous = alerts;
    setAlerts(prev => prev.filter(a => a.id !== id));
    
    try {
      await axios.put(`/api/alerts/${id}/resolve`);
      toast.success('Alerta resuelta');
    } catch (err) {
      console.error('Error resolviendo alerta', err);
      toast.error('No se pudo resolver la alerta');
      setAlerts(previous);
    }
  };

  const counts = useMemo(() => {
    const c = { all: alerts.length, expiring: 0, expired: 0, low_stock: 0 };
    const today = new Date();
    
    alerts.forEach(a => {
      const meta = parseMeta(a.meta);
      if (a.type === 'expiry' || (meta && meta.vencimiento)) {
        const d = meta && meta.vencimiento ? parseISO(String(meta.vencimiento)) : null;
        if (d && isValid(d)) {
          const days = differenceInCalendarDays(d, today);
          if (days < 0) c.expired++;
          else if (days <= 30) c.expiring++;
        }
      }
      if (a.type === 'stock' || (meta && meta.stock_low)) c.low_stock++;
    });
    
    return c;
  }, [alerts]);

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return alerts.filter(a => {
      if (filter === 'expiring' || filter === 'expired') {
        const meta = parseMeta(a.meta);
        const dStr = (meta && meta.vencimiento) || a.vencimiento;
        if (!dStr) return false;
        const d = isValid(new Date(dStr)) ? new Date(dStr) : parseISO(String(dStr));
        if (!isValid(d)) return false;
        const days = differenceInCalendarDays(d, new Date());
        if (filter === 'expiring' && days > 30) return false;
        if (filter === 'expired' && days >= 0) return false;
      } else if (filter === 'low_stock') {
        const meta = parseMeta(a.meta);
        if (!(a.type === 'stock' || (meta && meta.stock_low))) return false;
      }
      
      if (!ql) return true;
      return a.message.toLowerCase().includes(ql);
    }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [alerts, q, filter]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-indigo-100">
      <NavbarAdmin />

      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <BellAlertIcon className="h-6 w-6 text-indigo-600" />
              Alertas — Inventario
            </h1>
            <p className="text-sm text-gray-500 mt-1">Revisa productos que necesitan atención: vencimientos, stock y otros.</p>

            <div className="mt-3 flex items-center gap-2 text-sm">
              <div className="text-gray-600">Actualizado:</div>
              <div className="font-medium text-gray-800">{lastUpdatedAt ? format(new Date(lastUpdatedAt), 'dd/MM/yyyy HH:mm:ss') : '—'}</div>
            </div>
          </div>

          {/* Controls: search + refresh + auto-refresh */}
          <div className="w-full sm:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex-1">
              <div className="relative flex items-center bg-white border border-gray-200 rounded-lg px-3 py-1 shadow-sm">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 mr-2" />
                <input
                  aria-label="Buscar alertas"
                  placeholder="Buscar alertas..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  className="w-full outline-none text-sm bg-transparent"
                />
                <button
                  title="Refrescar"
                  onClick={fetchAlerts}
                  className="ml-2 p-1 rounded hover:bg-gray-50"
                >
                  <ArrowPathIcon className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label className="inline-flex items-center text-sm text-gray-600">
                <input 
                  type="checkbox" 
                  className="mr-2"
                  checked={autoRefresh} 
                  onChange={e => setAutoRefresh(e.target.checked)} 
                />
                Auto-refresh
              </label>

              {/* mobile filters toggle */}
              <button
                onClick={() => setFiltersOpen(s => !s)}
                className="sm:hidden px-3 py-2 bg-white border rounded-md shadow text-sm"
                aria-expanded={filtersOpen}
              >
                {filtersOpen ? 'Ocultar filtros' : 'Filtros'}
              </button>
            </div>
          </div>
        </header>

        {/* Filters row (collapsible on mobile) */}
        <div className={`${filtersOpen ? 'block' : 'hidden'} sm:block mb-4`}>
          <div className="flex flex-wrap gap-2">
            {FILTERS.map(f => {
              const active = filter === f.key;
              const count = f.key === 'all' ? alerts.length : 
                           f.key === 'expiring' ? counts.expiring : 
                           f.key === 'expired' ? counts.expired : counts.low_stock;
              return (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium ${active ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 border border-gray-200'}`}
                >
                  {f.label} <span className="ml-2 text-xs font-normal bg-gray-100 px-2 py-0.5 rounded-full">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        <main>
          {loading && (
            <div className="grid grid-cols-1 gap-4">
              {[1,2,3].map(i => (
                <div key={i} className="animate-pulse bg-white rounded-lg p-4 shadow">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
                  <div className="h-3 bg-gray-200 rounded w-2/3 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/4" />
                </div>
              ))}
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="bg-white rounded-lg p-6 shadow text-center text-gray-500">
              <div className="text-lg font-semibold mb-2">Sin alertas</div>
              <div className="text-sm">No hay alertas que coincidan con ese filtro o búsqueda.</div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4">
            {!loading && filtered.map(a => {
              const meta = parseMeta(a.meta);
              let badge = TYPE_BADGE.general;
              
              if (a.type === 'expiry' || (meta && meta.vencimiento)) {
                const d = meta && meta.vencimiento ? parseISO(String(meta.vencimiento)) : null;
                if (d && isValid(d)) {
                  const days = differenceInCalendarDays(d, new Date());
                  badge = days < 0 ? TYPE_BADGE.expired : (days <= 30 ? TYPE_BADGE.expiry : TYPE_BADGE.general);
                }
              } else if (a.type === 'stock' || (meta && meta.stock_low)) {
                badge = TYPE_BADGE.stock;
              }

              const vencText = (() => {
                const dStr = (meta && meta.vencimiento) || a.vencimiento;
                if (!dStr) return null;
                try {
                  const d = isValid(new Date(dStr)) ? new Date(dStr) : parseISO(String(dStr));
                  if (!isValid(d)) return null;
                  return format(d, 'dd/MM/yyyy');
                } catch { return null; }
              })();

              return (
                <article key={a.id} className="bg-white rounded-lg p-4 shadow flex flex-col sm:flex-row justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div className="pr-2">
                        <div className={`inline-block px-2 py-1 rounded text-xs font-semibold ${badge.color}`}>
                          {badge.label}
                        </div>
                        <h3 className="mt-2 text-base sm:text-lg font-semibold text-gray-800">{a.message}</h3>
                        {a.extra && <div className="text-xs text-gray-500 mt-1">{String(a.extra).slice(0, 200)}</div>}
                      </div>

                      <div className="text-right text-sm text-gray-500 min-w-[120px]">
                        <div>{a.created_at ? format(new Date(a.created_at), 'dd/MM/yyyy HH:mm') : '-'}</div>
                        {vencText && <div className="mt-1 text-xs text-gray-400">Vence: {vencText}</div>}
                      </div>
                    </div>
                  </div>

                  <div className="flex-shrink-0 flex items-start sm:items-center gap-2">
                    <button
                      onClick={() => handleResolve(a.id)}
                      className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm"
                    >
                      Resolver
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}