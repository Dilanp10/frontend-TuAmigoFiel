import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../imagen/logo.jpeg';

export default function NavbarAdmin() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className="bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          {/* Logo + Nombre (simplificado) */}
          <div className="flex items-center space-x-3">
            <img
              src={logo}
              alt="Logo Tu Amigo Fiel"
              className="h-12 w-12 object-cover rounded-full border-2 border-white shadow-md hover:scale-105 transition-transform"
            />
            <h1 className="text-2xl font-bold text-white font-sans">
              <span className="tracking-wide">TU AMIGO FIEL</span>
            </h1>
          </div>

          {/* Menú de navegación */}
          <div className="hidden md:flex space-x-1">
            <Link
              to="/AdminPage"
              className="px-4 py-2 rounded-md text-white hover:bg-indigo-700 hover:shadow-inner transition-colors font-medium"
            >
              Crear producto
            </Link>
            <Link
              to="/Almacen"
              className="px-4 py-2 rounded-md text-white hover:bg-indigo-700 hover:shadow-inner transition-colors font-medium"
            >
              Almacen
            </Link>
            <Link
              to="/venta"
              className="px-4 py-2 rounded-md text-white hover:bg-indigo-700 hover:shadow-inner transition-colors font-medium"
            >
              Venta
            </Link>
            
            <Link
              to="/alert"
              className="px-4 py-2 rounded-md text-white hover:bg-indigo-700 hover:shadow-inner transition-colors font-medium"
            >
              alertas
            </Link>
            <Link
              to="/reports"
              className="px-4 py-2 rounded-md text-white hover:bg-indigo-700 hover:shadow-inner transition-colors font-medium"
            >
              reportes
            </Link>
             <Link
              to="/servicios"
              className="px-4 py-2 rounded-md text-white hover:bg-indigo-700 hover:shadow-inner transition-colors font-medium"
            >
             servicios
            </Link>
             <Link
              to="/cuentas"
              className="px-4 py-2 rounded-md text-white hover:bg-indigo-700 hover:shadow-inner transition-colors font-medium"
            >
             cuentas
            </Link>


          </div>

          {/* Botón de cerrar sesión */}
          <button
            onClick={handleLogout}
            className="bg-pink-600 hover:bg-pink-700 px-5 py-2 rounded-md font-medium text-white shadow-md hover:shadow-lg transition-all"
          >
            Cerrar sesión
          </button>
          
        </div>
      </div>
    </nav>
  );
}