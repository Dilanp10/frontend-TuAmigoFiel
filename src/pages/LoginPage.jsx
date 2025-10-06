// src/pages/LoginPage.jsx
import React, { useState, useEffect } from 'react';
import axios from '../lib/axios';
import { useNavigate, Link } from 'react-router-dom';
import { LockClosedIcon, UserIcon } from '@heroicons/react/24/solid';
import logo from '../imagen/logo.jpeg';

const LoginPage = () => {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Si ya hay token e isAdmin en localStorage, redirigimos al admin
    const token = localStorage.getItem('token');
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    if (token && isAdmin) {
      navigate('/AdminPage', { replace: true });
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post('/api/login', { user, pass });
      // Guardamos token y flag isAdmin (este login solo permite admin en tu backend actual)
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('isAdmin', 'true');
      setLoading(false);
      navigate('/AdminPage');
    } catch (err) {
      setLoading(false);
      const msg = err?.response?.data?.message || 'Error de conexión';
      setError(msg);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      {/* Encabezado con logo */}
      <div className="container mx-auto px-4 mb-8">
        <div className="flex items-center justify-center">
          <img
            src={logo}
            alt="Logo Clínica Veterinaria"
            className="h-14 w-14 mr-4 object-cover rounded-full border-2 border-purple-200 shadow-sm"
          />
          <h1 className="text-2xl font-bold text-gray-800 font-serif">
            <span className="text-purple-600">CLÍNICA</span>{' '}
            <span className="text-gray-600">VETERINARIA</span>
            <br />
            <span className="text-indigo-700">TU AMIGO FIEL</span>
          </h1>
        </div>
      </div>

      <div className="max-w-md mx-auto mb-4">
        <Link to="/" className="text-indigo-600 hover:underline mb-4 inline-block">
          ← Volver a clientes
        </Link>
      </div>

      {/* Formulario */}
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-3xl font-extrabold text-gray-800 font-serif text-center mb-6">
            <span className="text-indigo-600">Iniciar</span> Sesión
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Usuario"
                value={user}
                onChange={(e) => setUser(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
                autoComplete="username"
                aria-label="Usuario"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LockClosedIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                placeholder="Contraseña"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
                autoComplete="current-password"
                aria-label="Contraseña"
              />
            </div>

            <button
              type="submit"
              className="w-full group relative overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center"
              disabled={loading}
            >
              <span>{loading ? 'Ingresando...' : 'Acceder'}</span>
              <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
            </button>
          </form>
        </div>
      </div>

      {/* Pie */}
      <div className="mt-6 text-center text-sm text-gray-500">
        <p>
          Si sos administrador y no podés entrar, revisá las variables de entorno en el backend (ADMIN_USER, ADMIN_PASS_HASH, JWT_SECRET).
        </p>
      </div>
    </div>
  );
};

export default LoginPage;