// src/pages/AdminPage.jsx
import React, { useState, useEffect } from 'react';
import axios from '../lib/axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import NavbarAdmin from '../component/NavbarAdmin';

/**
 * Definimos las categorías "visibles" (agrupadas) y el mapeo
 * a las categorías reales que pueden existir en la BD.
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
    cost: '', // <-- campo de costo agregado
  });
  const [marcas, setMarcas] = useState([]);
  const [productos, setProductos] = useState([]); // productos cargados según categoría+marca
  const [allProductsCache, setAllProductsCache] = useState([]); // cache local de todos los productos (para filtrar)
  const [loadingMarcas, setLoadingMarcas] = useState(false);
  const [loadingProductos, setLoadingProductos] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // verificar token al montar
  useEffect(() => {
    if (!localStorage.getItem('token')) navigate('/login');
  }, [navigate]);

  const authHeader = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };

  // Helper: formatea fecha (acepta ISO/Date) a yyyy-mm-dd para input[type=date]
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

  // Cargar (una vez) todos los productos en cache — lo usamos para filtrar por grupos sin tocar backend
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
      }
    })();
    return () => { mounted = false; };
  }, []); // solo al montar

  // Cargar marcas al cambiar categoría (filtramos usando el grupo)
  useEffect(() => {
    const loadMarcas = async () => {
      setLoadingMarcas(true);
      try {
        // Filtrar localmente según el grupo seleccionado
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
      } finally {
        setLoadingMarcas(false);
      }
    };
    loadMarcas();
  }, [form.categoria, allProductsCache]);

  // Cargar productos al cambiar marca (filtrado local por grupo + marca)
  useEffect(() => {
    if (!form.marca) return;
    const loadProductos = async () => {
      setLoadingProductos(true);
      try {
        const allowed = CATEGORIES_GROUPS[form.categoria] || [];
        // Usamos la cache completa y filtramos
        const filtered = allProductsCache.filter(p => allowed.includes(p.categoria) && p.marca === form.marca);
        setProductos(filtered);
        setForm(f => ({ ...f, productoId: '' }));
      } catch (err) {
        console.error('[Admin] Error cargando productos:', err);
      } finally {
        setLoadingProductos(false);
      }
    };
    loadProductos();
  }, [form.marca, form.categoria, allProductsCache]);

  // Precargar datos si selecciona producto existente
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
        cost: prod.cost != null ? String(prod.cost) : '', // <- precarga del costo
      }));
    }
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
    // costo
    const costNum = form.cost === '' ? null : parseFloat(form.cost);
    if (form.cost !== '' && Number.isNaN(costNum)) {
      setError('Costo inválido');
      setLoadingSubmit(false);
      return;
    }
    // vencimiento puede ser vacío o una fecha yyyy-mm-dd

    const payload = {
      nombre: form.nombre,
      marca: form.marca,
      descripcion: form.descripcion,
      precio: precioNum,
      categoria: form.categoria,
      imagen: form.imagen,
      vencimiento: form.vencimiento || null,
      stock: stockNum,
      cost: costNum, // <-- enviamos cost al backend
    };

    try {
      if (form.productoId) {
        await axios.put(`/api/products/${form.productoId}`, payload, authHeader);
        toast.success('Producto actualizado');
      } else {
        await axios.post('/api/products', payload, authHeader);
        toast.success('Producto creado');
      }

      // Actualizar cache local: recargar todos los productos desde backend para mantener consistencia
      const res = await axios.get('/api/products', authHeader);
      const data = res.data || [];
      setAllProductsCache(data);

      setSuccess(true);
      setForm({ categoria: categorias[0], marca: '', productoId: '', nombre: '', descripcion: '', precio: '', imagen: '', vencimiento: '', stock: '', cost: '' });
      setMarcas([]);
      setProductos([]);
    } catch (err) {
      console.error('[Admin] Error guardando producto:', err);
      setError(err.response?.data?.message || 'Error al guardar el producto');
    } finally {
      setLoadingSubmit(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-indigo-100">
      {/* Navbar */}
      <NavbarAdmin />
      {/* Contenido Principal */}
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-lg mt-8">
        <h2 className="text-3xl font-extrabold text-gray-800 mb-6">Panel Admin de Productos</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Categoría */}
          <div>
            <label className="block text-gray-800 font-medium mb-1">Categoría</label>
            <select name="categoria" value={form.categoria} onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-300">
              {categorias.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          {/* Marca */}
          <div>
            <label className="block text-gray-800 font-medium mb-1">Marca</label>
            <input name="marca" list="marcasList" value={form.marca} onChange={handleChange}
              placeholder={loadingMarcas ? 'Cargando marcas…' : 'Escribe o elige una marca'}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-300" />
            <datalist id="marcasList">
              {marcas.map(m => <option key={m} value={m} />)}
            </datalist>
             <p className="text-sm text-gray-500 mt-1">No es obligatorio, se agrupara con las que no tienen marcas</p>

          </div>

          {/* Producto existente */}
          {marcas.includes(form.marca) && (
            <div>
              <label className="block text-gray-800 font-medium mb-1">Producto (opcional)</label>
              <select name="productoId" value={form.productoId} onChange={handleChange}
                disabled={loadingProductos}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-300">
                <option value="">— Crear nuevo —</option>
                {productos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
              {loadingProductos && <p className="text-gray-500 mt-1">Cargando productos…</p>}
            </div>
          )}

          {/* Nombre */}
          <div>
            <label className="block text-gray-800 font-medium mb-1">Nombre</label>
            <input name="nombre" value={form.nombre} onChange={handleChange} placeholder="Nombre del producto"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-300" />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-gray-800 font-medium mb-1">Descripción</label>
            <textarea name="descripcion" value={form.descripcion} onChange={handleChange} rows={3}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-300" />
          </div>

          {/* Precio */}
          <div>
            <label className="block text-gray-800 font-medium mb-1">Precio</label>
            <input type="number" step="0.01" name="precio" value={form.precio} onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-300" />
          </div>

          {/* Costo */}
          <div>
            <label className="block text-gray-800 font-medium mb-1">Precio de Costo (por unidad)</label>
            <input type="number" step="0.01" min="0" name="cost" value={form.cost} onChange={handleChange}
              placeholder="Costo de adquisición por unidad (opcional)"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-300" />
            <p className="text-sm text-gray-500 mt-1">Este valor se usa para calcular la ganancia (COGS) en reportes. si no pones nada lo tomaremos como 0</p>
          </div>

          {/* Stock */}
          <div>
            <label className="block text-gray-800 font-medium mb-1">Stock</label>
            <input type="number" min="0" name="stock" value={form.stock} onChange={handleChange}
              placeholder="Cantidad en stock"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-300" />
          </div>

          {/* Fecha de vencimiento */}
          <div>
            <label className="block text-gray-800 font-medium mb-1">Fecha de vencimiento (opcional)</label>
            <input type="date" name="vencimiento" value={form.vencimiento} onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-300" />
            <p className="text-sm text-gray-500 mt-1">Dejar vacío si no aplica (ej. accesorios).</p>
          </div>

          {/* URL Imagen */}
          <div>
            <label className="block text-gray-800 font-medium mb-1">URL Imagen</label>
            <input name="imagen" value={form.imagen} onChange={handleChange} placeholder="https://..."
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-300" />
          </div>

          {/* Feedback */}
          {error && <p className="text-red-600 font-medium">{error}</p>}
          {success && <p className="text-green-600 font-medium">Guardado exitoso</p>}

          {/* Submit */}
          <button type="submit" disabled={loadingSubmit}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg shadow-md disabled:opacity-50 transition">
            {loadingSubmit ? 'Guardando...' : form.productoId ? 'Actualizar Producto' : 'Crear Producto'}
          </button>
        </form>
      </div>
    </div>
  );
}