// src/pages/LoginPage.jsx
import React, { useState, useEffect } from 'react';
import axios from '../lib/axios';
import { useNavigate, Link } from 'react-router-dom';
import {
  LockClosedIcon,
  UserIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/solid';
import logo from '../imagen/logo.jpeg';

const LoginPage = () => {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);
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

      // Guardar opción "remember" (opcional)
      if (remember) {
        localStorage.setItem('rememberUser', user);
      } else {
        localStorage.removeItem('rememberUser');
      }

      setLoading(false);
      navigate('/AdminPage');
    } catch (err) {
      setLoading(false);
      const msg = err?.response?.data?.message || 'Error de conexión';
      setError(msg);
      // auto-hide error tras unos segundos
      setTimeout(() => setError(''), 6000);
    }
  };

  useEffect(() => {
    // Si estaba guardado el usuario (remember), precargarlo
    const saved = localStorage.getItem('rememberUser');
    if (saved) {
      setUser(saved);
      setRemember(true);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8 flex items-start sm:items-center">
      {/* Small component styles */}
      <style>{`
        .fade-up { transform: translateY(8px); opacity: 0; animation: fadeUp .45s ease forwards; }
        @keyframes fadeUp { to { transform: translateY(0); opacity: 1; } }
      `}</style>

      <div className="w-full max-w-md mx-auto">
        {/* Encabezado con logo (mobile-friendly) */}
        <div className="flex items-center justify-center mb-6 space-x-4">
          <img
            src={logo}
            alt="Logo Clínica Veterinaria"
            className="h-12 w-12 object-cover rounded-full border-2 border-purple-200 shadow-sm"
          />
          <div className="text-center">
            <h1 className="text-lg font-bold text-gray-800 font-serif leading-tight">
              <span className="text-purple-600">CLÍNICA</span>{' '}
              <span className="text-gray-600">VETERINARIA</span>
            </h1>
            <div className="text-indigo-700 font-semibold text-xs">TU AMIGO FIEL</div>
          </div>
        </div>

        {/* Volver (visible en mobile y desktop) */}
        <div className="mb-4 text-sm text-left">
          <Link to="/" className="text-indigo-600 hover:underline">
            ← Volver a clientes
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 fade-up">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-800 font-serif text-center mb-4">
            <span className="text-indigo-600">Iniciar</span> Sesión
          </h2>

          {/* Error */}
          {error && (
            <div
              role="alert"
              aria-live="assertive"
              className="mb-4 px-3 py-2 bg-red-50 text-red-600 rounded-lg text-sm text-center"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Usuario */}
            <label className="block">
              <span className="text-sm text-gray-600 mb-2 inline-block">Usuario</span>
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
            </label>

            {/* Contraseña con toggle */}
            <label className="block">
              <span className="text-sm text-gray-600 mb-2 inline-block">Contraseña</span>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-gray-400" />
                </div>

                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Contraseña"
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                  autoComplete="current-password"
                  aria-label="Contraseña"
                />

                <button
                  type="button"
                  aria-pressed={showPass}
                  onClick={() => setShowPass((s) => !s)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
                  title={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPass ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>
            </label>

            {/* Remember + forgot */}
            <div className="flex items-center justify-between text-sm">
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={() => setRemember((r) => !r)}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-gray-600">Recordarme</span>
              </label>

              <Link to="/forgot" className="text-indigo-600 hover:underline">
                ¿Olvidaste la contraseña?
              </Link>
            </div>

            {/* Submit */}
            <div>
              <button
                type="submit"
                className={`w-full relative overflow-hidden text-white font-bold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg flex items-center justify-center
                  ${loading ? 'bg-indigo-400 cursor-wait' : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'}
                `}
                disabled={loading}
                aria-busy={loading}
              >
                {loading ? (
                  <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                  </svg>
                ) : null}
                <span>{loading ? 'Ingresando...' : 'Acceder'}</span>

                {/* subtle hover overlay */}
                <span className="absolute inset-0 bg-white opacity-0 hover:opacity-5 transition-opacity duration-200" aria-hidden />
              </button>
            </div>
          </form>

          {/* Small helper / info */}
          <p className="mt-4 text-xs text-gray-500 text-center">
            Si sos administrador y no podés entrar, revisá las variables de entorno en el backend.
          </p>
        </div>

        {/* Bottom note */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            ¿No tenés cuenta? Contactá al administrador para crear un acceso.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;