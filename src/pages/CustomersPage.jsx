// src/pages/CustomersPage.jsx
import React, { useEffect, useState } from 'react';
import axios from '../lib/axios';
import NavbarAdmin from '../component/NavbarAdmin';
import toast from 'react-hot-toast';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null); // {id, nombre, email, telefono}
  const [form, setForm] = useState({ nombre: '', email: '', telefono: '' });

  // UI: collapse form on mobile (purely visual)
  const [formOpen, setFormOpen] = useState(true);

  const authHeader = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/customers', authHeader);
      setCustomers(res.data || []);
    } catch (err) {
      console.error('Error cargando clientes', err);
      toast.error('No se pudieron cargar los clientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCustomers(); }, []); // mantener lógica

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nombre || form.nombre.trim() === '') return toast.error('Nombre requerido');
    try {
      if (editing) {
        await axios.put(`/api/customers/${editing.id}`, form, authHeader);
        toast.success('Cliente actualizado');
      } else {
        await axios.post('/api/customers', form, authHeader);
        toast.success('Cliente creado');
      }
      setForm({ nombre: '', email: '', telefono: '' });
      setEditing(null);
      fetchCustomers();
      // on mobile, collapse form after submit for convenience
      if (window.innerWidth < 640) setFormOpen(false);
    } catch (err) {
      console.error('Error guardando cliente', err);
      toast.error(err?.response?.data?.message || 'No se pudo guardar');
    }
  };

  const handleEdit = c => {
    setEditing(c);
    setForm({ nombre: c.nombre || '', email: c.email || '', telefono: c.telefono || '' });
    // ensure form visible on mobile when editing
    if (window.innerWidth < 640) setFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Eliminar cliente?')) return;
    try {
      await axios.delete(`/api/customers/${id}`, authHeader);
      toast.success('Cliente eliminado');
      fetchCustomers();
    } catch (err) {
      console.error('Error eliminando cliente', err);
      toast.error('No se pudo eliminar');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-indigo-100">
      <NavbarAdmin />
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800">Cuentas — Clientes</h1>
            <p className="text-sm text-gray-500 mt-1">Gestioná los clientes: crear, editar y ver cuentas.</p>
          </div>

          <div className="flex items-center gap-2">
            {/* Mobile toggle for form */}
            <button
              onClick={() => setFormOpen(s => !s)}
              className="sm:hidden px-3 py-2 bg-white border rounded-md shadow text-sm"
            >
              {formOpen ? 'Ocultar formulario' : 'Mostrar formulario'}
            </button>

            <button
              onClick={fetchCustomers}
              className="px-3 py-2 bg-indigo-600 text-white rounded-md shadow text-sm"
            >
              Actualizar
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form (colapsable en móvil) */}
          <div className={`${formOpen ? 'block' : 'hidden'} sm:block`}>
            <div className="bg-white p-5 sm:p-6 rounded-2xl shadow">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">{editing ? 'Editar cliente' : 'Crear cliente'}</h2>
                {editing && (
                  <button
                    onClick={() => { setEditing(null); setForm({ nombre:'', email:'', telefono:'' }); }}
                    className="text-sm text-gray-500 hover:underline"
                  >
                    Cancelar
                  </button>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <label className="block text-sm">
                  <span className="text-xs text-gray-600">Nombre</span>
                  <input name="nombre" value={form.nombre} onChange={handleChange} placeholder="Nombre"
                    className="w-full mt-1 p-3 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  />
                </label>

                <label className="block text-sm">
                  <span className="text-xs text-gray-600">Email</span>
                  <input name="email" value={form.email} onChange={handleChange} placeholder="Email"
                    className="w-full mt-1 p-3 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  />
                </label>

                <label className="block text-sm">
                  <span className="text-xs text-gray-600">Teléfono</span>
                  <input name="telefono" value={form.telefono} onChange={handleChange} placeholder="Teléfono"
                    className="w-full mt-1 p-3 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  />
                </label>

                <div className="flex gap-2">
                  <button type="submit" className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg font-medium shadow">
                    {editing ? 'Guardar' : 'Crear'}
                  </button>

                  {editing && (
                    <button
                      type="button"
                      onClick={() => { setEditing(null); setForm({ nombre:'', email:'', telefono:'' }); }}
                      className="px-4 py-3 bg-gray-100 rounded-lg"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* List */}
          <div className="lg:col-span-2">
            <div className="bg-white p-4 sm:p-6 rounded-2xl shadow">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Clientes</h2>
                <div className="text-sm text-gray-500">{loading ? 'Cargando...' : `${customers.length} clientes`}</div>
              </div>

              {loading ? (
                <div className="space-y-3">
                  {[1,2,3].map(i => (
                    <div key={i} className="animate-pulse p-3 bg-gray-100 rounded-md" />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {customers.length === 0 && <div className="text-gray-500 p-3">No hay clientes</div>}

                  {customers.map(c => (
                    <div key={c.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 border rounded-lg">
                      <div className="min-w-0">
                        <div className="font-medium text-gray-800">{c.nombre}</div>
                        <div className="text-xs text-gray-500 mt-1">{c.email || '—'} {c.telefono ? `· ${c.telefono}` : ''}</div>
                      </div>

                      <div className="flex items-center gap-2 mt-3 sm:mt-0">
                        <a
                          href={`/customer/${c.id}`}
                          className="text-indigo-600 text-sm px-3 py-2 rounded hover:underline"
                        >
                          Ver cuenta
                        </a>
                        <button
                          onClick={() => handleEdit(c)}
                          className="text-sm px-3 py-2 bg-yellow-50 rounded hover:bg-yellow-100"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="text-sm px-3 py-2 bg-red-50 rounded hover:bg-red-100"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}