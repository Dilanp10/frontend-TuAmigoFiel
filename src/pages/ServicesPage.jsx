import React, { useEffect, useMemo, useState } from 'react';
import axios from '../lib/axios';
import toast from 'react-hot-toast';
import NavbarAdmin from '../component/NavbarAdmin';
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ArrowsUpDownIcon,
} from '@heroicons/react/24/outline';

const ORDER_FIELDS = [
  { key: 'nombre', label: 'Nombre' },
  { key: 'precio', label: 'Precio' },
  { key: 'duracion_min', label: 'Duración' },
];

const DEFAULT_FORM = {
  nombre: '',
  descripcion: '',
  precio: '',
  duracion_min: '',
  categoria: '',
  activo: true,
};

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all|active|inactive
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [orderBy, setOrderBy] = useState('nombre');
  const [orderDir, setOrderDir] = useState('asc'); // asc|desc

  // Drawer (crear/editar)
  const [openDrawer, setOpenDrawer] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);

  // Para options de categorías
  const categories = useMemo(() => {
    const set = new Set();
    services.forEach(s => s.categoria && set.add(s.categoria));
    return Array.from(set);
  }, [services]);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/services');
      setServices(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('[Services] load error', err);
      toast.error('No se pudieron cargar los servicios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // Filtro + búsqueda + orden
  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    let list = [...services];

    if (statusFilter !== 'all') {
      const activeVal = statusFilter === 'active';
      list = list.filter(s => {
        const val = typeof s.activo === 'boolean' ? s.activo : Boolean(Number(s.activo));
        return val === activeVal;
      });
    }

    if (categoryFilter !== 'all') {
      list = list.filter(s => (s.categoria || '').toLowerCase() === categoryFilter.toLowerCase());
    }

    if (query) {
      list = list.filter(s => {
        const hay = [
          s.nombre,
          s.descripcion,
          s.categoria,
          String(s.precio ?? ''),
          String(s.duracion_min ?? ''),
        ]
          .filter(Boolean)
          .some(v => String(v).toLowerCase().includes(query));
        return hay;
      });
    }

    list.sort((a, b) => {
      const dir = orderDir === 'asc' ? 1 : -1;
      const av = a[orderBy];
      const bv = b[orderBy];
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;

      if (orderBy === 'nombre' || orderBy === 'categoria') {
        return String(av).localeCompare(String(bv), 'es') * dir;
      }
      // precio / duracion_min
      const na = Number(av);
      const nb = Number(bv);
      if (Number.isNaN(na) && Number.isNaN(nb)) return 0;
      if (Number.isNaN(na)) return 1;
      if (Number.isNaN(nb)) return -1;
      return (na - nb) * dir;
    });

    return list;
  }, [services, q, statusFilter, categoryFilter, orderBy, orderDir]);

  // Helpers
  const openCreate = () => {
    setEditingId(null);
    setForm(DEFAULT_FORM);
    setOpenDrawer(true);
  };

  const openEdit = (svc) => {
    setEditingId(svc.id);
    setForm({
      nombre: svc.nombre ?? '',
      descripcion: svc.descripcion ?? '',
      precio: svc.precio ?? '',
      duracion_min: svc.duracion_min ?? '',
      categoria: svc.categoria ?? '',
      activo: true, // Siempre activo al editar
    });
    setOpenDrawer(true);
  };

  const closeDrawer = () => {
    if (saving) return;
    setOpenDrawer(false);
    setTimeout(() => {
      setEditingId(null);
      setForm(DEFAULT_FORM);
    }, 200);
  };

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({
      ...f,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const validate = () => {
    if (!form.nombre || !form.nombre.trim()) return 'El nombre es requerido';
    if (form.precio !== '' && (Number.isNaN(Number(form.precio)) || Number(form.precio) < 0)) return 'Precio inválido';
    if (form.duracion_min !== '' && (!Number.isInteger(Number(form.duracion_min)) || Number(form.duracion_min) < 0)) return 'Duración inválida';
    return null;
    };

  const saveService = async () => {
    const errMsg = validate();
    if (errMsg) return toast.error(errMsg);
    setSaving(true);
    const payload = {
      nombre: form.nombre.trim(),
      descripcion: form.descripcion?.trim() || null,
      precio: form.precio === '' ? null : Number(form.precio),
      duracion_min: form.duracion_min === '' ? null : Number(form.duracion_min),
      categoria: form.categoria?.trim() || null,
      activo: true, // Siempre activo
    };

    try {
      if (editingId) {
        await axios.put(`/api/services/${editingId}`, payload);
        toast.success('Servicio actualizado');
      } else {
        await axios.post('/api/services', payload);
        toast.success('Servicio creado');
      }
      await fetchServices();
      closeDrawer();
    } catch (err) {
      console.error('[Services] save error', err);
      toast.error(err.response?.data?.message || 'No se pudo guardar');
    } finally {
      setSaving(false);
    }
  };

  const removeService = async (id) => {
    const ok = window.confirm('¿Eliminar este servicio? Esta acción no se puede deshacer.');
    if (!ok) return;
    try {
      await axios.delete(`/api/services/${id}`);
      setServices(prev => prev.filter(s => s.id !== id));
      toast.success('Servicio eliminado');
    } catch (err) {
      console.error('[Services] delete error', err);
      toast.error('No se pudo eliminar');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-indigo-100">
      <NavbarAdmin />

      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-800">Servicios</h1>
           
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow"
            >
              <PlusIcon className="w-5 h-5" />
              Nuevo servicio
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="bg-white rounded-2xl shadow p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-3 md:items-center">
            <div className="flex-1 flex items-center gap-2">
              <div className="relative flex items-center border border-gray-200 rounded-lg px-3 py-2 w-full md:w-96">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 mr-2" />
                <input
                  className="w-full outline-none text-sm"
                  placeholder="Buscar por nombre, descripción o categoría…"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2">
                <FunnelIcon className="w-5 h-5 text-gray-400" />
                <select
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">Todos</option>
                  <option value="active">Activos</option>
                  <option value="inactive">Inactivos</option>
                </select>

                <select
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="all">Todas las categorías</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <ArrowsUpDownIcon className="w-5 h-5 text-gray-400" />
              <select
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
                value={orderBy}
                onChange={(e) => setOrderBy(e.target.value)}
              >
                {ORDER_FIELDS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
              </select>
              <select
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
                value={orderDir}
                onChange={(e) => setOrderDir(e.target.value)}
              >
                <option value="asc">Asc</option>
                <option value="desc">Desc</option>
              </select>
            </div>
          </div>
        </div>

        {/* Listado */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="animate-pulse bg-white rounded-2xl p-5 shadow">
                <div className="h-5 w-1/2 bg-gray-200 rounded mb-3" />
                <div className="h-4 w-2/3 bg-gray-200 rounded mb-2" />
                <div className="h-4 w-1/3 bg-gray-200 rounded mb-4" />
                <div className="h-9 w-full bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(svc => {
              const active = typeof svc.activo === 'boolean' ? svc.activo : Boolean(Number(svc.activo));
              return (
                <div key={svc.id} className="bg-white rounded-2xl shadow p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">{svc.nombre}</h3>
                        {svc.categoria && <div className="mt-1 text-xs inline-block bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">{svc.categoria}</div>}
                      </div>
                      <div className="text-sm">
                        <span className={`px-2 py-1 rounded-full ${active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                          {active ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                    </div>

                    {svc.descripcion && <p className="text-gray-600 text-sm mt-3">{svc.descripcion}</p>}

                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      <div className="bg-gray-50 rounded-xl p-3">
                        <div className="text-gray-500">Precio</div>
                        <div className="font-semibold text-gray-800">${Number(svc.precio ?? 0).toFixed(2)}</div>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3">
                        <div className="text-gray-500">Duración</div>
                        <div className="font-semibold text-gray-800">{svc.duracion_min ? `${svc.duracion_min} min` : '—'}</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-end gap-2">
                    <button
                      onClick={() => openEdit(svc)}
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700"
                      title="Editar"
                    >
                      <PencilSquareIcon className="w-5 h-5" />
                      Editar
                    </button>
                    <button
                      onClick={() => removeService(svc.id)}
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white"
                      title="Eliminar"
                    >
                      <TrashIcon className="w-5 h-5" />
                      Eliminar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Drawer de creación / edición */}
        {openDrawer && (
          <div className="fixed inset-0 z-40">
            <div
              className="absolute inset-0 bg-black/30"
              onClick={closeDrawer}
            />
            <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl p-6 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  {editingId ? 'Editar servicio' : 'Nuevo servicio'}
                </h2>
                <button
                  onClick={closeDrawer}
                  className="px-3 py-1 rounded-lg border border-gray-200 hover:bg-gray-50"
                >
                  Cerrar
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nombre *</label>
                  <input
                    name="nombre"
                    value={form.nombre}
                    onChange={onChange}
                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-200 outline-none"
                    placeholder="Baño y corte, Paseo, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Descripción</label>
                  <textarea
                    name="descripcion"
                    value={form.descripcion}
                    onChange={onChange}
                    rows={3}
                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-200 outline-none"
                    placeholder="Detalle del servicio"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Precio</label>
                    <input
                      name="precio"
                      type="number"
                      step="0.01"
                      min="0"
                      value={form.precio}
                      onChange={onChange}
                      className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-200 outline-none"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Duración (min)</label>
                    <input
                      name="duracion_min"
                      type="number"
                      min="0"
                      value={form.duracion_min}
                      onChange={onChange}
                      className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-200 outline-none"
                      placeholder="Ej: 45"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Categoría</label>
                  <input
                    name="categoria"
                    list="servicesCategories"
                    value={form.categoria}
                    onChange={onChange}
                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-200 outline-none"
                    placeholder="Grooming, Paseos, Veterinaria, etc."
                  />
                  <datalist id="servicesCategories">
                    {categories.map(c => <option key={c} value={c} />)}
                  </datalist>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-2">
                <button
                  onClick={closeDrawer}
                  className="px-4 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50"
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button
                  onClick={saveService}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow disabled:opacity-60"
                  disabled={saving}
                >
                  {saving ? 'Guardando…' : (editingId ? 'Guardar cambios' : 'Crear servicio')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}