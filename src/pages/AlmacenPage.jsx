// src/pages/AlmacenPage.jsx
import React, { useEffect, useState, useMemo } from 'react';
import axios from '../lib/axios';
import NavbarAdmin from '../component/NavbarAdmin';
import { format } from 'date-fns';
import ProductModal from '../component/ProductModal'; // asegurate que la ruta/coincida con tu estructura

// Groups mapping: keys son los nombres "visibles" (grupos) y valores las sub-categorías antiguas
const CATEGORIES_GROUPS = {
  'Alimento para Perro': ['Alimento para Perro'],
  'Alimento para Gato': ['Alimento para Gato'],
  'Snacks y Golosinas': ['Golosinas', 'Premios', 'Snack y Bocaditos'],
  'Estética y Aseo': ['Estética y Aseo'],
  'Medicamentos': ['Medicamentos'],
  'Accesorios y Juguetes': ['Correas', 'Collares', 'Pretales', 'Comederos', 'Juguetes'],
  'Ropa y Descanso': ['Ropita', 'Colchonetas', 'Cuchas y Mantas'],
};

const categorias = ['Todas', ...Object.keys(CATEGORIES_GROUPS)];

const daysBetween = (d1, d2) => {
  const msPerDay = 1000 * 60 * 60 * 24;
  const t1 = Date.UTC(d1.getFullYear(), d1.getMonth(), d1.getDate());
  const t2 = Date.UTC(d2.getFullYear(), d2.getMonth(), d2.getDate());
  return Math.round((t2 - t1) / msPerDay);
};

const formatCurrency = (v) => {
  if (v == null || v === '') return '-';
  return Number(v).toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 2 });
};

// Devuelve array de categorías válidas según la selección del usuario.
// Incluye el grupo y sus subcategorías; si la selección es una subcategoría histórica,
// intenta mapearla también al grupo correspondiente.
const getAllowedCategories = (selected) => {
  if (!selected || selected === 'Todas') return null; // null = permitir todas
  // Si selected es un grupo
  if (CATEGORIES_GROUPS.hasOwnProperty(selected)) {
    return [selected, ...CATEGORIES_GROUPS[selected]];
  }
  // Si selected es una sub-categoría, encontrar su grupo
  for (const [group, subs] of Object.entries(CATEGORIES_GROUPS)) {
    if (subs.includes(selected)) {
      return [group, ...subs];
    }
  }
  // Si no está en map, devolver solo el selected
  return [selected];
};

const handleDeleted = (deletedProductId) => {
  // Filtra el producto eliminado del estado
  setProductos(prev => prev.filter(p => p.id !== deletedProductId));
};

export default function AlmacenPage() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState('');
  const [categoria, setCategoria] = useState('Todas');
  const [onlyStockZero, setOnlyStockZero] = useState(false);
  const [error, setError] = useState(null);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // UI: mobile filters collapsed
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get('/api/products');
      setProductos(res.data || []);
    } catch (err) {
      console.error('Error cargando productos', err);
      setError('No se pudieron cargar los productos');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (prod) => {
    setSelectedProduct(prod);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedProduct(null);
  };

  const handleSaved = (updated) => {
    // actualizar producto en la lista
    setProductos(prev => prev.map(p => (p.id === updated.id ? updated : p)));
  };

  // --- Filtered list (sin tocar la lógica) ---
  const filtered = useMemo(() => {
    const qLower = q.trim().toLowerCase();
    const allowed = getAllowedCategories(categoria); // null => todas
    return productos.filter(p => {
      if (allowed) {
        const prodCat = p.categoria || '';
        if (!allowed.includes(prodCat)) return false;
      }
      if (onlyStockZero && Number(p.stock || 0) > 0) return false;
      if (!qLower) return true;
      const hay = [
        p.nombre,
        p.marca,
        p.descripcion,
        p.categoria
      ].filter(Boolean).some(s => String(s).toLowerCase().includes(qLower));
      return hay;
    });
  }, [productos, q, categoria, onlyStockZero]);

  const getVencimientoState = (vencimiento) => {
    if (!vencimiento) return { label: 'Sin venc.', color: 'bg-gray-200 text-gray-700' };
    const date = new Date(String(vencimiento).trim());
    if (isNaN(date.getTime())) return { label: 'Fecha inválida', color: 'bg-gray-200 text-gray-700' };

    const today = new Date();
    const days = daysBetween(today, date);
    if (days < 0) return { label: `Vencido (${Math.abs(days)}d)`, color: 'bg-red-100 text-red-700' };
    if (days <= 30) return { label: `Por vencer (${days}d)`, color: 'bg-yellow-100 text-yellow-800' };
    return { label: `VTO (${days}d)`, color: 'bg-green-100 text-green-700' };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-indigo-100">
      <NavbarAdmin />
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header + mobile filter toggle */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800">
              <span className="text-purple-600">Almacén</span> <span className="text-gray-600">— Productos</span>
            </h1>
            <p className="text-sm text-gray-500 mt-1">Lista completa de productos — busca, filtra y revisa stock / vencimientos.</p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setFiltersOpen(s => !s)}
              className="sm:hidden px-3 py-2 bg-white border rounded-md shadow text-sm"
              aria-expanded={filtersOpen}
              aria-controls="filters-panel"
            >
              {filtersOpen ? 'Ocultar filtros' : 'Mostrar filtros'}
            </button>

            <div className="hidden sm:block">
              <button
                onClick={fetchProducts}
                className="px-3 py-2 bg-indigo-600 text-white rounded-md text-sm shadow"
              >
                Actualizar
              </button>
            </div>
          </div>
        </header>

        {/* Filters panel: responsive */}
        <div id="filters-panel" className={`${filtersOpen ? 'block' : 'hidden'} sm:block mb-4`}>
          <div className="bg-white rounded-xl shadow p-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <input
              type="search"
              placeholder="Buscar producto, marca o descripción..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full sm:w-80 px-4 py-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-300 text-sm"
              aria-label="Buscar productos"
            />

            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-300 text-sm"
              aria-label="Filtrar por categoría"
            >
              {categorias.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>

            <label className="inline-flex items-center text-sm text-gray-700 gap-2">
              <input type="checkbox" className="h-4 w-4" checked={onlyStockZero} onChange={e => setOnlyStockZero(e.target.checked)} />
              Sin stock
            </label>

            <div className="ml-auto flex gap-2">
              <button onClick={() => { setQ(''); setCategoria('Todas'); setOnlyStockZero(false); }} className="px-3 py-2 border rounded-md text-sm">Limpiar</button>
              <button onClick={fetchProducts} className="px-3 py-2 bg-indigo-600 text-white rounded-md text-sm">Actualizar</button>
            </div>
          </div>
        </div>

        {loading && (
          <div className="text-center py-12 text-gray-500">Cargando productos…</div>
        )}

        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-md mb-4">{error}</div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="p-6 bg-white rounded-xl shadow text-center text-gray-500">No hay productos que coincidan.</div>
        )}

        <main className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
          {filtered.map(prod => {
            const venc = getVencimientoState(prod.vencimiento || prod.fecha_vencimiento || prod.expiry);
            return (
              <article key={prod.id} className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition p-4 flex flex-col">
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <div className="w-full sm:w-24 h-40 sm:h-24 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden border">
                    {prod.imagen ? (
                      <img src={prod.imagen} alt={prod.nombre} className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-sm text-gray-400 px-2 text-center">Sin imagen</div>
                    )}
                  </div>

                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800">{prod.nombre}</h3>
                    <p className="text-sm text-gray-500">{prod.marca || '—'}</p>

                    <div className="mt-3 flex items-center gap-2 flex-wrap">
                      <div className="text-indigo-700 font-bold text-lg">{formatCurrency(prod.precio)}</div>
                      <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${venc.color}`}>{venc.label}</div>
                    </div>

                    <p className="text-sm text-gray-500 mt-2 line-clamp-3">{prod.descripcion || ''}</p>
                  </div>
                </div>

                <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium text-gray-800">Categoría:</span> {prod.categoria || '—'}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-sm">
                      <span className={`font-semibold ${Number(prod.stock || 0) === 0 ? 'text-red-600' : 'text-gray-800'}`}>
                        {prod.stock != null ? prod.stock : '—'}
                      </span>
                      <span className="text-gray-400 ml-1">unid.</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button onClick={() => openModal(prod)} className="text-sm text-indigo-600 hover:underline">Ver detalle</button>
                      <div className="text-xs text-gray-400">
                        {prod.created_at ? `Ingresado: ${format(new Date(prod.created_at), 'dd/MM/yyyy')}` : ''}
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </main>
      </div>

      {showModal && selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={handleCloseModal}
          onSaved={handleSaved}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  );
}