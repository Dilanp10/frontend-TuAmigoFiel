// src/component/CustomerSelect.jsx
import React, { useEffect, useRef, useState } from 'react';
import axios from '../lib/axios';

export default function CustomerSelect({ value, onChange, placeholder = 'Cliente (opcional)' }) {
  const [list, setList] = useState([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const authHeader = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const res = await axios.get('/api/customers', authHeader);
        if (!active) return;
        setList(res.data || []);
      } catch (err) {
        console.error('Error cargando clientes', err);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, []); // no cambié la lógica de carga

  // cerrar dropdown al hacer click fuera
  useEffect(() => {
    const onDocClick = (e) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  const filtered = list.filter(c => {
    if (!q) return true;
    const t = q.toLowerCase();
    return (c.nombre || '').toLowerCase().includes(t) || (c.email || '').toLowerCase().includes(t) || (c.telefono || '').toLowerCase().includes(t);
  });

  const handleSelect = (c) => {
    onChange && onChange(c);
    setQ('');
    setOpen(false);
  };

  const clearSelected = (e) => {
    e.stopPropagation();
    onChange && onChange(null);
    setQ('');
    setOpen(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Selected chip */}
      {value && (
        <div className="mb-2 flex items-center gap-2">
          <div className="flex-1 text-sm truncate bg-white border px-3 py-2 rounded-lg">
            <div className="font-medium">{value.nombre || value}</div>
            <div className="text-xs text-gray-500">{value.email ? `${value.email}${value.telefono ? ` · ${value.telefono}` : ''}` : (value.telefono || '')}</div>
          </div>
          <button
            onClick={clearSelected}
            className="px-3 py-2 bg-red-100 text-red-600 rounded-md text-sm"
            aria-label="Eliminar cliente seleccionado"
          >
            Limpiar
          </button>
        </div>
      )}

      <div className="flex">
        <input
          value={q}
          onChange={e => { setQ(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="flex-1 p-3 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 text-sm"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls="customer-select-list"
        />
        <button
          type="button"
          onClick={() => { setOpen(s => !s); }}
          className="px-3 py-3 bg-white border border-l-0 rounded-r-lg hover:bg-gray-50 text-sm"
          aria-label="Alternar lista de clientes"
        >
          {open ? '▲' : '▼'}
        </button>
      </div>

      {open && (
        <div
          id="customer-select-list"
          role="listbox"
          className="absolute z-20 left-0 right-0 mt-1 bg-white border rounded-b-lg max-h-56 overflow-auto shadow-sm"
        >
          {loading && <div className="p-3 text-sm text-gray-500">Cargando...</div>}

          {!loading && filtered.length === 0 && (
            <div className="p-3 text-sm text-gray-500">No hay clientes</div>
          )}

          {!loading && filtered.map(c => (
            <div
              key={c.id}
              onClick={() => handleSelect(c)}
              role="option"
              aria-selected={value && String(value.id || value) === String(c.id)}
              className="p-3 hover:bg-indigo-50 cursor-pointer flex flex-col sm:flex-row sm:justify-between"
            >
              <div className="min-w-0">
                <div className="font-medium text-sm truncate">{c.nombre}</div>
                <div className="text-xs text-gray-500 truncate">{c.email || '—'} {c.telefono ? `· ${c.telefono}` : ''}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* hidden input para compatibilidad si el form lo necesita */}
      {value && <input type="hidden" value={value.id || value} />}
    </div>
  );
}