import React, { useEffect, useState } from 'react';
import axios from '../lib/axios';
import NavbarAdmin from '../component/NavbarAdmin';
import toast from 'react-hot-toast';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null); // {id, nombre, email, telefono}
  const [form, setForm] = useState({ nombre: '', email: '', telefono: '' });

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

  useEffect(() => { fetchCustomers(); }, []);

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
    } catch (err) {
      console.error('Error guardando cliente', err);
      toast.error(err?.response?.data?.message || 'No se pudo guardar');
    }
  };

  const handleEdit = c => {
    setEditing(c);
    setForm({ nombre: c.nombre || '', email: c.email || '', telefono: c.telefono || '' });
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
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Cuentas — Clientes</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="bg-white p-6 rounded-2xl shadow">
            <h2 className="text-lg font-semibold mb-3">{editing ? 'Editar cliente' : 'Crear cliente'}</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input name="nombre" value={form.nombre} onChange={handleChange} placeholder="Nombre" className="w-full p-2 border rounded" />
              <input name="email" value={form.email} onChange={handleChange} placeholder="Email" className="w-full p-2 border rounded" />
              <input name="telefono" value={form.telefono} onChange={handleChange} placeholder="Teléfono" className="w-full p-2 border rounded" />
              <div className="flex gap-2">
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded">
                  {editing ? 'Guardar' : 'Crear'}
                </button>
                {editing && <button type="button" onClick={() => { setEditing(null); setForm({ nombre:'', email:'', telefono:'' }); }} className="px-4 py-2 bg-gray-100 rounded">Cancelar</button>}
              </div>
            </form>
          </div>

          {/* Lista */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow">
            <h2 className="text-lg font-semibold mb-3">Clientes</h2>
            {loading ? (
              <div className="text-gray-500">Cargando...</div>
            ) : (
              <div className="space-y-3">
                {customers.length === 0 && <div className="text-gray-500">No hay clientes</div>}
                {customers.map(c => (
                  <div key={c.id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <div className="font-medium">{c.nombre}</div>
                      <div className="text-xs text-gray-500">{c.email} · {c.telefono}</div>
                    </div>
                    <div className="flex gap-2">
                      <a href={`/customer/${c.id}`} className="text-indigo-600 hover:underline">Ver cuenta</a>
                      <button onClick={() => handleEdit(c)} className="text-sm px-2 py-1 bg-yellow-100 rounded">Editar</button>
                      <button onClick={() => handleDelete(c.id)} className="text-sm px-2 py-1 bg-red-100 rounded">Eliminar</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
