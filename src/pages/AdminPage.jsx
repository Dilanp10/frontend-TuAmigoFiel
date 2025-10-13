// src/pages/AdminPage.jsx
import React, { useState, useEffect } from 'react';
import axios from '../lib/axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import NavbarAdmin from '../component/NavbarAdmin';
import {
  TrashIcon,
  PencilIcon,
  PhotoIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/solid';

/**
 * Categorías agrupadas y mapeo
 */
const CATEGORIES_GROUPS = {
  'Alimento para Perro': ['Alimento para Perro'],
  'Alimento para Gato': ['Alimento para Gato'],
  'Snacks y Golosinas': ['Golosinas', 'Premios', 'Snack y Bocaditos'],
  'Estética y Aseo': ['Estética y Aseo'],
  'Medicamentos': ['Medicamentos'],
  'Accesorios y Juguetes': ['Correas', 'Collares', 'Pretales', 'Comederos', 'Juguetes'],
  'Ropa y Descanso': ['Ropita', 'Colchonetas', 'Cuchas y Mantas'],
};

const categorias = Object.keys(CATEGORIES_GROUPS);

export default function AdminPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    categoria: categorias[0],
    marca: '',
    productoId: '',
    nombre: '',
    descripcion: '',
    precio: '',
    imagen: '',
    vencimiento: '',
    stock: '',
    cost: '',
  });

  const [marcas, setMarcas] = useState([]);
  const [productos, setProductos] = useState([]); // productos filtrados por categoria+marca
  const [allProductsCache, setAllProductsCache] = useState([]); // cache global
  const [loadingMarcas, setLoadingMarcas] = useState(false);
  const [loadingProductos, setLoadingProductos] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [loadingDeleteId, setLoadingDeleteId] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showListMobile, setShowListMobile] = useState(false);

  // verificar token al montar
  useEffect(() => {
    if (!localStorage.getItem('token')) navigate('/login');
  }, [navigate]);

  const authHeader = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };

  // formatea fecha a yyyy-mm-dd
  const formatToInputDate = (val) => {
    if (!val) return '';
    try {
      const d = new Date(val);
      if (Number.isNaN(d.getTime())) return '';
      return d.toISOString().slice(0, 10);
    } catch {
      return '';
    }
  };

  // cargar cache global (productos)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await axios.get('/api/products', authHeader);
        if (!mounted) return;
        const data = res.data || [];
        setAllProductsCache(data);
      } catch (err) {
        console.error('[Admin] Error cargando productos globales:', err);
        toast.error('No se pudieron cargar los productos (ver consola)');
      }
    })();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // cargar marcas según categoria (filtrado local)
  useEffect(() => {
    const loadMarcas = async () => {
      setLoadingMarcas(true);
      try {
        const allowed = CATEGORIES_GROUPS[form.categoria] || [];
        const filtered = allProductsCache.filter(p => allowed.includes(p.categoria));
        const uniq = Array.from(new Set(filtered.map(p => p.marca).filter(Boolean)));
        setMarcas(uniq);
        // reset campos dependientes
        setForm(f => ({
          ...f,
          marca: '',
          productoId: '',
          nombre: '',
          descripcion: '',
          precio: '',
          imagen: '',
          vencimiento: '',
          stock: '',
          cost: '',
        }));
        setProductos([]);
      } catch (err) {
        console.error('[Admin] Error cargando marcas:', err);
        toast.error('Error cargando marcas');
      } finally {
        setLoadingMarcas(false);
      }
    };
    loadMarcas();
  }, [form.categoria, allProductsCache]);

  // cargar productos al cambiar marca (filtrado local)
  useEffect(() => {
    if (!form.marca) return;
    const loadProductos = async () => {
      setLoadingProductos(true);
      try {
        const allowed = CATEGORIES_GROUPS[form.categoria] || [];
        const filtered = allProductsCache.filter(p => allowed.includes(p.categoria) && p.marca === form.marca);
        setProductos(filtered);
        setForm(f => ({ ...f, productoId: '' }));
      } catch (err) {
        console.error('[Admin] Error cargando productos:', err);
        toast.error('Error cargando productos de la marca');
      } finally {
        setLoadingProductos(false);
      }
    };
    loadProductos();
  }, [form.marca, form.categoria, allProductsCache]);

  // precargar datos si selecciona producto existente
  useEffect(() => {
    if (!form.productoId) return;
    const prod = productos.find(p => String(p.id) === String(form.productoId));
    if (prod) {
      setForm(f => ({
        ...f,
        nombre: prod.nombre ?? '',
        descripcion: prod.descripcion ?? '',
        precio: prod.precio ?? '',
        imagen: prod.imagen ?? '',
        vencimiento: formatToInputDate(prod.vencimiento ?? prod.fecha_vencimiento ?? prod.expiry ?? ''),
        stock: prod.stock != null ? String(prod.stock) : '',
        cost: prod.cost != null ? String(prod.cost) : '',
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.productoId, productos]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoadingSubmit(true);

    // Validaciones simples
    if (!form.nombre || form.nombre.trim() === '') {
      setError('El nombre es requerido');
      setLoadingSubmit(false);
      return;
    }
    const precioNum = form.precio === '' ? null : parseFloat(form.precio);
    if (form.precio !== '' && Number.isNaN(precioNum)) {
      setError('Precio inválido');
      setLoadingSubmit(false);
      return;
    }
    const stockNum = form.stock === '' ? null : parseInt(form.stock, 10);
    if (form.stock !== '' && (Number.isNaN(stockNum) || stockNum < 0)) {
      setError('Stock inválido (debe ser 0 o mayor)');
      setLoadingSubmit(false);
      return;
    }
    const costNum = form.cost === '' ? null : parseFloat(form.cost);
    if (form.cost !== '' && Number.isNaN(costNum)) {
      setError('Costo inválido');
      setLoadingSubmit(false);
      return;
    }

    const payload = {
      nombre: form.nombre,
      marca: form.marca,
      descripcion: form.descripcion,
      precio: precioNum,
      categoria: form.categoria,
      imagen: form.imagen,
      vencimiento: form.vencimiento || null,
      stock: stockNum,
      cost: costNum,
    };

    try {
      if (form.productoId) {
        await axios.put(`/api/products/${form.productoId}`, payload, authHeader);
        toast.success('Producto actualizado');
      } else {
        await axios.post('/api/products', payload, authHeader);
        toast.success('Producto creado');
      }

      // recargar cache completa
      const res = await axios.get('/api/products', authHeader);
      const data = res.data || [];
      setAllProductsCache(data);

      setSuccess(true);
      setForm({
        categoria: categorias[0],
        marca: '',
        productoId: '',
        nombre: '',
        descripcion: '',
        precio: '',
        imagen: '',
        vencimiento: '',
        stock: '',
        cost: '',
      });
      setMarcas([]);
      setProductos([]);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('[Admin] Error guardando producto:', err);
      setError(err.response?.data?.message || 'Error al guardar el producto');
      toast.error('Error al guardar producto');
    } finally {
      setLoadingSubmit(false);
    }
  };

  const handleDelete = async (id) => {
    const ok = window.confirm('¿Eliminar este producto? Esta acción no se puede deshacer.');
    if (!ok) return;
    setLoadingDeleteId(id);
    try {
      await axios.delete(`/api/products/${id}`, authHeader);
      toast.success('Producto eliminado');
      // recargar cache
      const res = await axios.get('/api/products', authHeader);
      setAllProductsCache(res.data || []);
    } catch (err) {
      console.error('[Admin] Error eliminando:', err);
      toast.error('Error eliminando producto');
    } finally {
      setLoadingDeleteId(null);
    }
  };

  // Filtrar vista lateral según categoria seleccionada (y marca opcional)
  const sideFiltered = allProductsCache.filter(p => {
    const allowed = CATEGORIES_GROUPS[form.categoria] || [];
    if (!allowed.includes(p.categoria)) return false;
    if (form.marca && p.marca !== form.marca) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-indigo-100">
      <NavbarAdmin />

      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* FORM: ocupa 2/3 en lg */}
          <div className="lg:w-2/3 bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-extrabold text-gray-800">Panel Admin de Productos</h2>
              <div className="text-sm text-gray-500">Gestioná productos y stock</div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                  <select
                    name="categoria"
                    value={form.categoria}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-300"
                  >
                    {categorias.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Marca</label>
                  <input
                    name="marca"
                    list="marcasList"
                    value={form.marca}
                    onChange={handleChange}
                    placeholder={loadingMarcas ? 'Cargando marcas…' : 'Escribe o elige una marca'}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-300"
                  />
                  <datalist id="marcasList">
                    {marcas.map(m => <option key={m} value={m} />)}
                  </datalist>
                  <p className="text-xs text-gray-500 mt-1">No obligatorio — agrupa productos sin marca.</p>
                </div>
              </div>

              {marcas.includes(form.marca) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Producto (opcional)</label>
                  <select
                    name="productoId"
                    value={form.productoId}
                    onChange={handleChange}
                    disabled={loadingProductos}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-300"
                  >
                    <option value="">— Crear nuevo —</option>
                    {productos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                  </select>
                  {loadingProductos && <div className="text-xs text-gray-500 mt-1">Cargando productos…</div>}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  placeholder="Nombre del producto"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea
                  name="descripcion"
                  value={form.descripcion}
                  onChange={handleChange}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-300"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
                  <input
                    type="number"
                    step="0.01"
                    name="precio"
                    value={form.precio}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Costo (por unidad)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    name="cost"
                    value={form.cost}
                    onChange={handleChange}
                    placeholder="Costo (opcional)"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                  <input
                    type="number"
                    min="0"
                    name="stock"
                    value={form.stock}
                    onChange={handleChange}
                    placeholder="Cantidad"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de vencimiento (opcional)</label>
                  <input
                    type="date"
                    name="vencimiento"
                    value={form.vencimiento}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-300"
                  />
                  <p className="text-xs text-gray-500 mt-1">Dejar vacío si no aplica (ej. accesorios).</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL Imagen</label>
                  <input
                    name="imagen"
                    value={form.imagen}
                    onChange={handleChange}
                    placeholder="https://..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-300"
                  />
                </div>
              </div>

              {/* feedback */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="text-sm">
                  {error && <span className="text-red-600 font-medium">{error}</span>}
                  {success && <span className="text-green-600 font-medium">Guardado exitoso</span>}
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    type="submit"
                    disabled={loadingSubmit}
                    className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md disabled:opacity-60 transition"
                  >
                    {loadingSubmit ? 'Guardando...' : form.productoId ? 'Actualizar Producto' : 'Crear Producto'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setForm({
                        categoria: categorias[0],
                        marca: '',
                        productoId: '',
                        nombre: '',
                        descripcion: '',
                        precio: '',
                        imagen: '',
                        vencimiento: '',
                        stock: '',
                        cost: '',
                      });
                      setError(null);
                      setSuccess(false);
                    }}
                    className="w-full sm:w-auto border border-gray-300 py-2 px-4 rounded-lg bg-white"
                  >
                    Limpiar
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* SIDE: lista de productos - ocupa 1/3 en lg */}
          <aside className="lg:w-1/3">
            <div className="bg-white rounded-2xl shadow-md p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-800">Productos ({sideFiltered.length})</h3>
                <button
                  className="text-sm text-indigo-600 hidden lg:inline-flex items-center gap-1"
                  onClick={() => {
                    setForm(f => ({ ...f, marca: '', productoId: '' }));
                    // collapse/expand mobile list feedback
                    setShowListMobile(s => !s);
                  }}
                >
                  Limpiar filtros
                </button>
              </div>

              {/* Mobile toggle */}
              <div className="lg:hidden mb-3">
                <button
                  className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 rounded-md"
                  onClick={() => setShowListMobile(s => !s)}
                >
                  <span className="text-sm font-medium">Ver productos</span>
                  {showListMobile ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}
                </button>
              </div>

              <div className={`space-y-3 ${!showListMobile && 'hidden lg:block'}`}>
                {sideFiltered.length === 0 ? (
                  <div className="text-sm text-gray-500 p-3">No hay productos con los filtros actuales.</div>
                ) : (
                  sideFiltered.slice(0, 50).map(p => (
                    <div key={p.id} className="flex items-center gap-3 p-2 rounded-lg border hover:shadow-sm transition">
                      <div className="w-14 h-14 rounded-md bg-gray-100 flex items-center justify-center overflow-hidden">
                        {p.imagen ? (
                          // imagen pequeña
                          // eslint-disable-next-line jsx-a11y/img-redundant-alt
                          <img src={p.imagen} alt={`imagen ${p.nombre}`} className="w-full h-full object-cover" />
                        ) : (
                          <PhotoIcon className="w-6 h-6 text-gray-400" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-800 truncate">{p.nombre}</div>
                        <div className="text-xs text-gray-500 truncate">{p.marca ?? '—'}</div>
                        <div className="text-sm text-indigo-600 mt-1">{p.precio != null ? `$ ${p.precio}` : 'Sin precio'}</div>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <button
                          onClick={() => {
                            // cargar al form para editar
                            setForm(f => ({
                              ...f,
                              categoria: categorias.find(c => (CATEGORIES_GROUPS[c] || []).includes(p.categoria)) || f.categoria,
                              marca: p.marca || '',
                              productoId: p.id,
                              nombre: p.nombre ?? '',
                              descripcion: p.descripcion ?? '',
                              precio: p.precio ?? '',
                              imagen: p.imagen ?? '',
                              vencimiento: formatToInputDate(p.vencimiento ?? p.fecha_vencimiento ?? p.expiry ?? ''),
                              stock: p.stock != null ? String(p.stock) : '',
                              cost: p.cost != null ? String(p.cost) : '',
                            }));
                            // ensure marcas + productos state reflect change
                          }}
                          title="Editar"
                          className="p-2 rounded-md bg-yellow-50 hover:bg-yellow-100"
                        >
                          <PencilIcon className="w-4 h-4 text-yellow-600" />
                        </button>

                        <button
                          onClick={() => handleDelete(p.id)}
                          disabled={loadingDeleteId === p.id}
                          title="Eliminar"
                          className="p-2 rounded-md bg-red-50 hover:bg-red-100"
                        >
                          {loadingDeleteId === p.id ? (
                            <svg className="animate-spin h-4 w-4 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                            </svg>
                          ) : (
                            <TrashIcon className="w-4 h-4 text-red-600" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* "Ver más" / mobile hint */}
              {sideFiltered.length > 50 && (
                <div className="text-xs text-gray-500 mt-2">Mostrando 50 primeros resultados. Filtra por marca para ver menos.</div>
              )}
            </div>

            {/* Small stats card */}
            <div className="mt-4 bg-white rounded-2xl shadow-md p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-500">Total productos</div>
                  <div className="text-xl font-semibold text-gray-800">{allProductsCache.length}</div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-gray-500">Categorias</div>
                  <div className="text-xl font-semibold text-indigo-600">{categorias.length}</div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}