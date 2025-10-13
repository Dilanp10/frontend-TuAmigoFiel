// src/component/NavbarAdmin.jsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../imagen/logo.jpeg';

export default function NavbarAdmin() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Bloquear scroll cuando el panel móvil está abierto
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <nav className="bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          {/* Logo + Nombre */}
          <div className="flex items-center space-x-3">
            <Link to="/AdminPage" className="flex items-center gap-3">
              <img
                src={logo}
                alt="Logo Tu Amigo Fiel"
                className="h-12 w-12 object-cover rounded-full border-2 border-white shadow-md transform transition-transform hover:scale-105"
              />
              <h1 className="text-lg sm:text-2xl font-bold text-white font-sans">
                <span className="tracking-wide">TU AMIGO FIEL</span>
              </h1>
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-2">
            <Link to="/AdminPage" className="px-3 py-2 rounded-md text-white hover:bg-indigo-700 hover:shadow-inner transition-colors font-medium text-sm">
              Crear producto
            </Link>
            <Link to="/Almacen" className="px-3 py-2 rounded-md text-white hover:bg-indigo-700 hover:shadow-inner transition-colors font-medium text-sm">
              Almacen
            </Link>
            <Link to="/venta" className="px-3 py-2 rounded-md text-white hover:bg-indigo-700 hover:shadow-inner transition-colors font-medium text-sm">
              Venta
            </Link>
            <Link to="/alert" className="px-3 py-2 rounded-md text-white hover:bg-indigo-700 hover:shadow-inner transition-colors font-medium text-sm">
              Alertas
            </Link>
            <Link to="/reports" className="px-3 py-2 rounded-md text-white hover:bg-indigo-700 hover:shadow-inner transition-colors font-medium text-sm">
              Reportes
            </Link>
            <Link to="/servicios" className="px-3 py-2 rounded-md text-white hover:bg-indigo-700 hover:shadow-inner transition-colors font-medium text-sm">
              Servicios
            </Link>
            <Link to="/cuentas" className="px-3 py-2 rounded-md text-white hover:bg-indigo-700 hover:shadow-inner transition-colors font-medium text-sm">
              Cuentas
            </Link>
          </div>

          {/* Actions: logout + mobile toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleLogout}
              className="hidden sm:inline-flex bg-pink-600 hover:bg-pink-700 px-4 py-2 rounded-md font-medium text-white shadow-md hover:shadow-lg transition-all text-sm"
            >
              Cerrar sesión
            </button>

            {/* Mobile hamburger */}
            <button
              onClick={() => setOpen(true)}
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-indigo-700/80 focus:outline-none focus:ring-2 focus:ring-white"
              aria-label="Abrir menú"
              aria-expanded={open}
            >
              {/* simple hamburger icon */}
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile slide-over panel */}
      {open && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />

          {/* Panel */}
          <div className="absolute right-0 top-0 h-full w-full max-w-xs bg-white shadow-xl transform transition-transform">
            <div className="p-4 h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <img src={logo} alt="logo" className="h-10 w-10 rounded-full border" />
                  <div>
                    <div className="font-semibold text-gray-800 text-sm">TU AMIGO FIEL</div>
                    <div className="text-xs text-gray-500">Panel admin</div>
                  </div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
                  aria-label="Cerrar menú"
                >
                  {/* close icon */}
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 8.586L15.657 2.93l1.414 1.414L11.414 10l5.657 5.657-1.414 1.414L10 11.414l-5.657 5.657-1.414-1.414L8.586 10 2.93 4.343 4.343 2.93 10 8.586z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              <nav className="flex-1 overflow-auto">
                <ul className="space-y-1">
                  <li>
                    <Link to="/AdminPage" onClick={() => setOpen(false)} className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100">
                      Crear producto
                    </Link>
                  </li>
                  <li>
                    <Link to="/Almacen" onClick={() => setOpen(false)} className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100">
                      Almacen
                    </Link>
                  </li>
                  <li>
                    <Link to="/venta" onClick={() => setOpen(false)} className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100">
                      Venta
                    </Link>
                  </li>
                  <li>
                    <Link to="/alert" onClick={() => setOpen(false)} className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100">
                      Alertas
                    </Link>
                  </li>
                  <li>
                    <Link to="/reports" onClick={() => setOpen(false)} className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100">
                      Reportes
                    </Link>
                  </li>
                  <li>
                    <Link to="/servicios" onClick={() => setOpen(false)} className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100">
                      Servicios
                    </Link>
                  </li>
                  <li>
                    <Link to="/cuentas" onClick={() => setOpen(false)} className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100">
                      Cuentas
                    </Link>
                  </li>
                </ul>
              </nav>

              <div className="mt-4">
                <button
                  onClick={() => { setOpen(false); handleLogout(); }}
                  className="w-full px-4 py-2 bg-pink-600 text-white rounded-md shadow hover:bg-pink-700"
                >
                  Cerrar sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}