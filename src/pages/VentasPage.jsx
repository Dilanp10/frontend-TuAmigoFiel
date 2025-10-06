// src/pages/VentasPage.jsx
import React, { useEffect, useMemo, useState } from 'react';
import axios from '../lib/axios';
import NavbarAdmin from '../component/NavbarAdmin';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

/* ---------- Helpers ---------- */
const formatCurrency = (v) =>
  v == null || v === '' ? '-' : Number(v).toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 2 });

const LoadingCard = () => (
  <div className="animate-pulse bg-white rounded-2xl shadow-lg p-6 h-44" />
);

/* ---------- BrowseModal (Ver más) ---------- */
function BrowseModal({ type = 'product', open, onClose, onSelect }) {
  const [q, setQ] = useState('');
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const pageSize = 24;

  useEffect(() => {
    if (!open) return;
    setPage(0);
    fetchPage();
    // eslint-disable-next-line
  }, [open]);

  useEffect(() => {
    if (!open) return;
    fetchPage();
    // eslint-disable-next-line
  }, [page]);

  const fetchPage = async (search = q) => {
    setLoading(true);
    try {
      if (type === 'product') {
        const res = await axios.get('/api/products/search', { params: { q: search, limit: pageSize, offset: page * pageSize } });
        setItems(res.data || []);
      } else {
        const res = await axios.get('/api/services', { params: { q: search, limit: pageSize, offset: page * pageSize } });
        setItems(res.data || []);
      }
    } catch (err) {
      console.error('Browse fetch error', err);
      toast.error('Error buscando ítems');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(0);
    fetchPage(q);
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-6xl mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
            <div className="flex-1 flex gap-3">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder={`Buscar ${type === 'product' ? 'productos' : 'servicios'}`}
                className="flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
              <button onClick={handleSearch} className="px-4 py-2 bg-indigo-600 text-white rounded-lg">Buscar</button>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <button onClick={onClose} className="px-4 py-2 rounded-lg border">Cerrar</button>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => <div key={i} className="animate-pulse bg-gray-100 h-32 rounded-lg" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {items.length === 0 && <div className="col-span-full text-center text-gray-500 p-8">No se encontraron resultados</div>}
              {items.map((it) => (
                <div key={`${type}-${it.id}`} className="p-4 bg-white rounded-2xl shadow hover:shadow-lg transition-shadow border border-transparent hover:border-indigo-50 flex flex-col">
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">{it.nombre}</div>
                    <div className="text-xs text-gray-400 mt-1 line-clamp-2">{it.marca || it.descripcion || ''}</div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="text-indigo-700 font-semibold">{it.precio != null ? formatCurrency(it.precio) : '-'}</div>
                    <button onClick={() => onSelect(it)} className="px-3 py-1 bg-purple-600 text-white rounded-lg shadow-sm">Agregar</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-500">Página {page + 1}</div>
            <div className="flex gap-2">
              <button disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))} className="px-3 py-1 border rounded">Anterior</button>
              <button onClick={() => setPage((p) => p + 1)} className="px-3 py-1 border rounded">Siguiente</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- VentasPage (mejor distribuida + customers/onCredit) ---------- */
export default function VentasPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('product'); // product | service | both
  const [topProducts, setTopProducts] = useState([]);
  const [topServices, setTopServices] = useState([]);
  const [loadingTop, setLoadingTop] = useState(false);

  const [searchMode, setSearchMode] = useState('both'); // products | services | both
  const [q, setQ] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResultsProducts, setSearchResultsProducts] = useState([]);
  const [searchResultsServices, setSearchResultsServices] = useState([]);

  const [cart, setCart] = useState([]);
  const [showBrowse, setShowBrowse] = useState(false);

  // customers
  const [customers, setCustomers] = useState([]);
  const [customerId, setCustomerId] = useState(null);
  const [onCredit, setOnCredit] = useState(false);

  useEffect(() => { loadTop(); fetchCustomers(); }, []); // eslint-disable-line

  const loadTop = async () => {
    setLoadingTop(true);
    try {
      const pRes = await axios.get('/api/products/top', { params: { limit: 9 } });
      setTopProducts(pRes.data || []);
      const sRes = await axios.get('/api/services', { params: { limit: 9 } });
      setTopServices(sRes.data || []);
    } catch (err) {
      console.error('loadTop error', err);
      toast.error('Error cargando items');
    } finally {
      setLoadingTop(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get('/api/customers', { headers });
      setCustomers(res.data || []);
    } catch (err) {
      console.error('fetch customers error', err);
    }
  };

  /* ---------- Live search (debounce + abort) ---------- */
  useEffect(() => {
    const term = (q || '').trim();
    if (term === '') {
      setSearchResultsProducts([]);
      setSearchResultsServices([]);
      setSearching(false);
      return;
    }

    let mounted = true;
    setSearching(true);
    const controller = new AbortController();
    const handle = setTimeout(async () => {
      try {
        if (searchMode === 'products' || searchMode === 'both') {
          const resP = await axios.get('/api/products/search', { params: { q: term, limit: 40 }, signal: controller.signal });
          if (mounted) setSearchResultsProducts(resP.data || []);
        } else {
          setSearchResultsProducts([]);
        }

        if (searchMode === 'services' || searchMode === 'both') {
          const resS = await axios.get('/api/services', { params: { q: term, limit: 40 }, signal: controller.signal });
          if (mounted) setSearchResultsServices(resS.data || []);
        } else {
          setSearchResultsServices([]);
        }
      } catch (err) {
        if (err.name !== 'CanceledError' && err.name !== 'AbortError') {
          console.error('Search error', err);
          toast.error('Error al buscar');
        }
      } finally {
        if (mounted) setSearching(false);
      }
    }, 300);

    return () => {
      mounted = false;
      controller.abort();
      clearTimeout(handle);
    };
  }, [q, searchMode]);

  /* ---------- Derived list to render ---------- */
  const listItems = useMemo(() => {
    const query = (q || '').trim();
    if (!query) {
      if (mode === 'product') return topProducts.map(item => ({ ...item, __type: 'product' }));
      if (mode === 'service') return topServices.map(item => ({ ...item, __type: 'service' }));
      return [
        ...topProducts.map(item => ({ ...item, __type: 'product' })),
        ...topServices.map(item => ({ ...item, __type: 'service' }))
      ];
    }

    if (searchMode === 'products') return searchResultsProducts.map(item => ({ ...item, __type: 'product' }));
    if (searchMode === 'services') return searchResultsServices.map(item => ({ ...item, __type: 'service' }));
    return [
      ...(searchResultsProducts || []).map(item => ({ ...item, __type: 'product' })),
      ...(searchResultsServices || []).map(item => ({ ...item, __type: 'service' }))
    ];
  }, [q, mode, topProducts, topServices, searchResultsProducts, searchResultsServices, searchMode]);

  /* ---------- Cart logic ---------- */
  const addToCart = (item, qty = 1) => {
    const isProduct = Object.prototype.hasOwnProperty.call(item, 'stock');
    const stock = isProduct ? Number(item.stock || 0) : Infinity;
    if (isProduct && stock <= 0) {
      toast.error('Sin stock disponible');
      return;
    }
    setCart((prev) => {
      const key = `${isProduct ? 'p' : 's'}-${item.id}`;
      const existing = prev.find((i) => i.key === key);
      if (existing) {
        const newQty = Math.min(existing.qty + qty, stock === Infinity ? Infinity : stock);
        return prev.map((i) => (i.key === key ? { ...i, qty: newQty } : i));
      }
      return [...prev, {
        key,
        id: item.id,
        type: isProduct ? 'product' : 'service',
        nombre: item.nombre,
        precio: item.precio || 0,
        qty: qty,
        stock: stock,
      }];
    });
    toast.success('Agregado al carrito');
  };

  const updateCartQty = (key, qty) => {
    const n = Math.max(1, Number(qty || 1));
    setCart((prev) => prev.map((i) => (i.key === key ? { ...i, qty: n } : i)));
  };

  const removeFromCart = (key) => setCart((prev) => prev.filter((i) => i.key !== key));

  const subtotal = useMemo(() => cart.reduce((s, i) => s + (Number(i.precio || 0) * Number(i.qty || 0)), 0), [cart]);
  const itemsCount = useMemo(() => cart.reduce((s, i) => s + Number(i.qty || 0), 0), [cart]);

  /* ---------- Confirm sale ---------- */
  const confirmSale = async () => {
    if (cart.length === 0) { toast.error('El carrito está vacío'); return; }
    if (onCredit && !customerId) { toast.error('Seleccioná un cliente para anotar a cuenta'); return; }

    const confirmMsg = onCredit
      ? `Anotar a cuenta de cliente ${customers.find(c => String(c.id) === String(customerId))?.nombre || ''}: ${formatCurrency(subtotal)}`
      : `Confirmar venta de ${itemsCount} items por ${formatCurrency(subtotal)} ?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      const payloadCart = cart.map((i) => ({ id: i.id, qty: i.qty, precio: i.precio, type: i.type }));
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      // Enviamos customerId, onCredit y paid (backend espera estos nombres)
      const body = {
        cart: payloadCart,
        customerId: onCredit ? (isNaN(Number(customerId)) ? customerId : Number(customerId)) : null,
        onCredit: !!onCredit,
        paidAmount: onCredit ? 0 : subtotal // si es pago al contado, lo enviamos como pagado
      };
      await axios.post('/api/sales', body, { headers });
      toast.success(onCredit ? 'Venta anotada a cuenta (pendiente)' : 'Venta registrada (pagada)');
      setCart([]);
      setQ('');
      setOnCredit(false);
      setCustomerId(null);
      loadTop();
    } catch (err) {
      console.error('confirmSale error', err);
      const msg = err?.response?.data?.message || 'Error al procesar venta';
      toast.error(msg);
    }
  };

  /* ---------- Customer change handler: al seleccionar cliente -> marcar onCredit ---------- */
  const handleCustomerChange = (e) => {
    const val = e.target.value || null;
    setCustomerId(val);
    // Si se selecciona algún cliente, activamos la casilla "Anotar a cuenta"
    if (val) {
      setOnCredit(true);
    } else {
      // Si se deselecciona (value vacío), desmarcamos
      setOnCredit(false);
    }
  };

  /* ---------- Render ---------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-indigo-100 font-sans antialiased">
      <NavbarAdmin />
      <div className="max-w-7xl mx-auto p-8">
        {/* Header con botón de historial (SIN "Nuevo Cliente") */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">
              <span className="text-purple-600">Ventas</span>
              <span className="text-gray-600"> — Punto de Venta</span>
            </h1>
            
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigate('/historialVenta')}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow"
            >
              Ver Historial
            </button>
          </div>
        </div>

        {/* Controls bar */}
        <div className="mb-6 bg-white rounded-xl shadow p-4 flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center gap-3">
            <button onClick={() => setMode('product')} className={`px-4 py-2 rounded-lg ${mode === 'product' ? 'bg-indigo-100 text-indigo-800 font-semibold' : 'bg-transparent text-gray-600'}`}>Productos</button>
            <button onClick={() => setMode('service')} className={`px-4 py-2 rounded-lg ${mode === 'service' ? 'bg-indigo-100 text-indigo-800 font-semibold' : 'bg-transparent text-gray-600'}`}>Servicios</button>
            <button onClick={() => setMode('both')} className={`px-4 py-2 rounded-lg ${mode === 'both' ? 'bg-indigo-100 text-indigo-800 font-semibold' : 'bg-transparent text-gray-600'}`}>Ambos</button>
          </div>

          <div className="flex-1 flex items-center gap-3">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar en vivo... (nombre, marca, descripción)"
              className="flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />

            <div className="flex items-center gap-2 bg-white border rounded-lg px-3 py-2">
              <label className="text-xs text-gray-500 mr-2">Buscar en</label>
              <select value={searchMode} onChange={(e) => setSearchMode(e.target.value)} className="text-sm bg-transparent outline-none">
                <option value="both">Ambos</option>
                <option value="products">Productos</option>
                <option value="services">Servicios</option>
              </select>
            </div>

            <button onClick={() => setShowBrowse(true)} className="px-4 py-2 bg-purple-600 text-white rounded-lg shadow">Ver más</button>
          </div>
        </div>

        {/* Content area (main + sidebar) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main list */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {(!q || q.trim() === '') && loadingTop && Array.from({ length: 6 }).map((_, i) => <LoadingCard key={`loading-${i}`} />)}

              {!q || q.trim() === ''
                ? (mode === 'product' ? topProducts : (mode === 'service' ? topServices : [...topProducts, ...topServices])).map((it) => (
                  <div key={`${it.hasOwnProperty('stock') ? 'prod' : 'serv'}-${it.id}`} className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow p-5 flex flex-col">
                    <div className="flex gap-4">
                      <div className="w-28 h-28 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden border">
                        {it.imagen ? <img src={it.imagen} alt={it.nombre} className="w-full h-full object-cover" /> : <div className="text-sm text-gray-400 text-center px-2">{it.nombre.slice(0, 12)}</div>}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-800">{it.nombre}</h3>
                        <p className="text-xs text-gray-500 mt-2 line-clamp-2">{it.marca || it.descripcion || ''}</p>
                        <div className="mt-4 flex items-center gap-3">
                          <div className="text-indigo-700 font-bold text-lg">{it.precio != null ? formatCurrency(it.precio) : '-'}</div>
                          {it.stock != null && <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${it.stock <= 0 ? 'bg-red-100 text-red-700' : 'bg-green-50 text-green-700'}`}>{it.stock} u.</div>}
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-3 justify-end">
                      <input type="number" min="1" defaultValue={1} max={it.stock || 9999} className="w-20 px-3 py-2 border rounded-lg" />
                      <button aria-label={`Agregar ${it.nombre}`} onClick={(e) => { const v = Number(e.currentTarget.previousSibling.value || 1); if (it.stock != null && v > it.stock) { toast.error('Mayor al stock'); return; } addToCart(it, v); }} className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700">Agregar</button>
                    </div>
                  </div>
                ))
                : (listItems.length === 0 ? <div key="nores" className="col-span-full bg-white rounded-2xl shadow p-8 text-center text-gray-500">No se encontraron resultados</div>
                  : listItems.map((it) => (
                    <div key={`${it.__type}-${it.id}`} className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow p-5 flex flex-col">
                      <div className="flex gap-4">
                        <div className="w-28 h-28 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden border">
                          {it.imagen ? <img src={it.imagen} alt={it.nombre} className="w-full h-full object-cover" /> : <div className="text-sm text-gray-400 text-center px-2">{it.nombre.slice(0, 12)}</div>}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-800">{it.nombre}</h3>
                          <p className="text-xs text-gray-500 mt-2 line-clamp-2">{it.marca || it.descripcion || ''}</p>
                          <div className="mt-4 flex items-center gap-3">
                            <div className="text-indigo-700 font-bold text-lg">{it.precio != null ? formatCurrency(it.precio) : '-'}</div>
                            {it.stock != null && <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${it.stock <= 0 ? 'bg-red-100 text-red-700' : 'bg-green-50 text-green-700'}`}>{it.stock} u.</div>}
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center gap-3 justify-end">
                        <input type="number" min="1" defaultValue={1} max={it.stock || 9999} className="w-20 px-3 py-2 border rounded-lg" />
                        <button onClick={(e) => { const v = Number(e.currentTarget.previousSibling.value || 1); if (it.stock != null && v > it.stock) { toast.error('Mayor al stock'); return; } addToCart(it, v); }} className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700">Agregar</button>
                      </div>
                    </div>
                  ))
                )
              }
            </div>
          </div>

          {/* Sidebar carrito + opciones (diseño mejorado) */} 
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow p-6 sticky top-8 divide-y">
              <div className="pb-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">Carrito</h2>
                    <div className="text-xs text-gray-500 mt-1">{itemsCount} items</div>
                  </div>
                  <div className="text-lg font-bold text-indigo-700">{formatCurrency(subtotal)}</div>
                </div>

                {/* Customer select + onCredit */}
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
                  <select value={customerId || ''} onChange={handleCustomerChange} className="w-full px-3 py-2 border rounded-lg">
                    <option value="">— Cliente no seleccionado —</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.nombre} {c.telefono ? `— ${c.telefono}` : ''}</option>)}
                  </select>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <input id="onCredit" type="checkbox" checked={onCredit} onChange={(e) => setOnCredit(e.target.checked)} />
                  <label htmlFor="onCredit" className="text-sm text-gray-600">Anotar a cuenta (pagar después)</label>
                </div>

                <div className="mt-2">
                  {onCredit ? (
                    <div className="text-xs text-yellow-800 bg-yellow-50 p-2 rounded">Se registrará como <strong>PENDIENTE (no pagada)</strong> en la cuenta del cliente.</div>
                  ) : (
                    <div className="text-xs text-green-800 bg-green-50 p-2 rounded">Venta <strong>pagada</strong> al confirmar.</div>
                  )}
                </div>
              </div>

              <div className="max-h-64 overflow-auto py-4 space-y-3">
                {cart.length === 0 ? (
                  <div className="text-sm text-gray-500 p-4 text-center">Carrito vacío. Agregá productos o servicios.</div>
                ) : (
                  cart.map((i) => (
                    <div key={i.key} className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-400 overflow-hidden border">
                            {i.nombre.slice(0, 1)}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-gray-800 line-clamp-1">{i.nombre}</div>
                            <div className="text-xs text-gray-500">{i.type === 'service' ? 'Servicio' : 'Producto'}</div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <input type="number" min="1" value={i.qty} onChange={(e) => updateCartQty(i.key, e.target.value)} className="w-16 px-2 py-1 border rounded text-sm" />
                        <div className="text-sm text-indigo-700 font-semibold whitespace-nowrap">{formatCurrency(i.precio * i.qty)}</div>
                        <button onClick={() => removeFromCart(i.key)} className="text-red-600 text-xs">Eliminar</button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm text-gray-600">Total</div>
                  <div className="text-lg font-bold text-indigo-700">{formatCurrency(subtotal)}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setCart([])} className="flex-1 px-4 py-2 border rounded-lg">Vaciar</button>
                  <button onClick={confirmSale} disabled={cart.length === 0} className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg">Confirmar</button>
                </div>
              </div>

             
            </div>
          </aside>
        </div>
      </div>

      <BrowseModal
        type={mode === 'service' ? 'service' : 'product'}
        open={showBrowse}
        onClose={() => setShowBrowse(false)}
        onSelect={(it) => { addToCart(it, 1); setShowBrowse(false); }}
      />
    </div>
  );
}