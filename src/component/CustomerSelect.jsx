import React, { useEffect, useState } from 'react';
import axios from '../lib/axios';

export default function CustomerSelect({ value, onChange, placeholder = 'Cliente (opcional)' }) {
  const [list, setList] = useState([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);

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
      } finally { if (active) setLoading(false); }
    };
    load();
    return () => { active = false; };
  }, []);

  const filtered = list.filter(c => {
    if (!q) return true;
    const t = q.toLowerCase();
    return (c.nombre || '').toLowerCase().includes(t) || (c.email || '').toLowerCase().includes(t) || (c.telefono || '').toLowerCase().includes(t);
  });

  return (
    <div className="relative">
      <input value={q} onChange={e => setQ(e.target.value)} placeholder={placeholder} className="w-full p-2 border rounded" />
      <div className="absolute z-20 left-0 right-0 mt-1 bg-white border rounded max-h-52 overflow-auto">
        {loading && <div className="p-2 text-sm text-gray-500">Cargando...</div>}
        {!loading && filtered.length === 0 && <div className="p-2 text-sm text-gray-500">No hay clientes</div>}
        {filtered.map(c => (
          <div key={c.id} onClick={() => { onChange(c); setQ(''); }} className="p-2 hover:bg-indigo-50 cursor-pointer">
            <div className="font-medium">{c.nombre}</div>
            <div className="text-xs text-gray-500">{c.email} · {c.telefono}</div>
          </div>
        ))}
      </div>
      {/* hidden input to store selected id if needed */}
      {value && <input type="hidden" value={value.id || value} />}
    </div>
  );
}