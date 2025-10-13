// src/component/ProductModal.jsx
import React, { useEffect, useState } from 'react';
import axios from '../lib/axios';
import toast from 'react-hot-toast';

const formatToInputDate = (val) => {
  if (!val) return '';
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().slice(0, 10);
  } catch {
    return '';
  }
};

export default function ProductModal({ product, onClose, onSaved, onDeleted }) {
  const [form, setForm] = useState({
    nombre: '',
    marca: '',
    descripcion: '',
    precio: '',
    imagen: '',
    vencimiento: '',
    stock: '',
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!product) return;
    setForm({
      nombre: product.nombre ?? '',
      marca: product.marca ?? '',
      descripcion: product.descripcion ?? '',
      precio: product.precio != null ? String(product.precio) : '',
      imagen: product.imagen ?? '',
      vencimiento: formatToInputDate(product.vencimiento ?? product.fecha_vencimiento),
      stock: product.stock != null ? String(product.stock) : '',
    });
    setError(null);
    setLoading(false);
  }, [product]);

  if (!product) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleClose = () => {
    if (saving || deleting) return;
    onClose();
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError(null);

    // Validaciones simples (sin alterar la lógica)
    if (!form.nombre || form.nombre.trim() === '') {
      setError('El nombre es requerido');
      return;
    }
    if (form.precio !== '' && isNaN(Number(form.precio))) {
      setError('Precio inválido');
      return;
    }
    if (form.stock !== '' && (!Number.isInteger(Number(form.stock)) || Number(form.stock) < 0)) {
      setError('Stock inválido');
      return;
    }

    const payload = {
      nombre: form.nombre,
      marca: form.marca,
      descripcion: form.descripcion,
      precio: form.precio === '' ? null : parseFloat(form.precio),
      imagen: form.imagen,
      vencimiento: form.vencimiento || null,
      stock: form.stock === '' ? null : parseInt(form.stock, 10),
    };

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.put(`/api/products/${product.id}`, payload, { headers });
      toast.success('Producto actualizado');
      onSaved && onSaved(res.data);
      onClose();
    } catch (err) {
      console.error('Error actualizando producto', err);
      const msg = err?.response?.data?.message || 'Error al actualizar';
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.delete(`/api/products/${product.id}`, { headers });
      toast.success('Producto eliminado');
      onDeleted && onDeleted(product.id);
      onClose();
    } catch (err) {
      console.error('Error eliminando producto', err);
      const msg = err?.response?.data?.message || 'Error al eliminar';
      setError(msg);
      toast.error(msg);
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const confirmDelete = () => {
    setShowDeleteConfirm(true);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={handleClose}
        aria-hidden
      />

      {/* modal */}
      <div className="relative w-full max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl overflow-auto max-h-[90vh]">
        <div className="p-4 sm:p-6">
          <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-800">{product.nombre || 'Detalle de producto'}</h3>
              <p className="text-sm text-gray-500">{product.marca || '—'}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleClose}
                className="text-gray-500 hover:text-gray-700 rounded-full p-2"
                aria-label="Cerrar"
                disabled={saving || deleting}
              >
                ✕
              </button>
            </div>
          </header>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <div className="w-full h-40 md:h-40 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden border">
                  {form.imagen ? (
                    <img src={form.imagen} alt={form.nombre} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-sm text-gray-400 px-2 text-center">Sin imagen</div>
                  )}
                </div>
                <input
                  name="imagen"
                  value={form.imagen}
                  onChange={handleChange}
                  placeholder="URL imagen"
                  className="mt-3 w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>

              <div className="md:col-span-2 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nombre</label>
                  <input
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Marca</label>
                    <input
                      name="marca"
                      value={form.marca}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Precio</label>
                    <input
                      name="precio"
                      value={form.precio}
                      onChange={handleChange}
                      type="number"
                      step="0.01"
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Stock</label>
                    <input
                      name="stock"
                      value={form.stock}
                      onChange={handleChange}
                      type="number"
                      min="0"
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Vencimiento</label>
                    <input
                      name="vencimiento"
                      value={form.vencimiento}
                      onChange={handleChange}
                      type="date"
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Descripción</label>
                  <textarea
                    name="descripcion"
                    value={form.descripcion}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>
            </div>

            {error && <div className="text-sm text-red-600">{error}</div>}

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
              <div className="flex-shrink-0">
                <button
                  type="button"
                  onClick={confirmDelete}
                  disabled={saving || deleting}
                  className="w-full sm:w-auto px-4 py-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50"
                >
                  {deleting ? 'Eliminando...' : 'Eliminar Producto'}
                </button>
              </div>

              <div className="flex-1 flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={saving || deleting}
                  className="flex-1 sm:flex-none px-4 py-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving || deleting}
                  className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
                >
                  {saving ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </div>
          </form>

          {/* Modal de confirmación de eliminación (responsive) */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/50" onClick={cancelDelete} />
              <div className="relative bg-white rounded-xl p-4 max-w-sm w-full mx-2">
                <h4 className="text-lg font-semibold mb-3">¿Estás seguro?</h4>
                <p className="text-sm text-gray-600 mb-5">
                  Esta acción eliminará el producto permanentemente. No se puede deshacer.
                </p>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={cancelDelete}
                    disabled={deleting}
                    className="px-3 py-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="px-3 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    {deleting ? 'Eliminando...' : 'Sí, eliminar'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}