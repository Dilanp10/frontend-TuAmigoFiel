import React, { useEffect, useState } from 'react';
import logo from '../imagen/logo.jpeg';
import image from '../imagen/ime.png';
import {
  HeartIcon,
  ClockIcon,
  PhoneIcon,
  ShoppingCartIcon,
  ArchiveBoxIcon,
  UsersIcon,
  ChartBarSquareIcon
} from "@heroicons/react/24/solid";
import { Link } from 'react-router-dom';

const Home = () => {
  const [mostrarBienvenida, setMostrarBienvenida] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMostrarBienvenida(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100 font-sans text-gray-900">
      {/* Global small styles for micro-anim */}
      <style>{`
        @keyframes fadeInFast { from { opacity: 0; transform: translateY(8px); } to { opacity:1; transform: translateY(0);} }
        .animate-fade-in { animation: fadeInFast .5s ease forwards; }
        .animate-progress { animation: progress 3s linear forwards; }
        @keyframes progress { from { width: 0%; } to { width: 100%; } }
      `}</style>

      {/* Intro animado (overlay) */}
      {mostrarBienvenida && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
          <div className="text-center p-6 max-w-lg animate-fade-in">
            <div className="flex justify-center space-x-3 mb-4">
              <span className="text-4xl animate-[bounce_1s_infinite]">🐾</span>
              <span className="text-4xl animate-[bounce_1s_infinite] delay-200">🐾</span>
              <span className="text-4xl animate-[bounce_1s_infinite] delay-400">🐾</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-3 tracking-tight">
              Clínica Veterinaria <span className="text-yellow-300">Tu Amigo Fiel</span>
            </h2>
            <p className="text-base md:text-lg text-white/95 font-medium mb-5">
              Espacio de gestión local — Punto de venta & administración
            </p>
            <div className="w-56 mx-auto bg-white/30 rounded-full h-2 overflow-hidden">
              <div className="bg-white h-2 rounded-full animate-progress" />
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md shadow-sm py-3 border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={logo}
              alt="Logo Clínica Veterinaria"
              className="h-12 w-12 object-cover rounded-full border-2 border-purple-200 shadow-sm"
            />
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-gray-800 leading-tight">
                <span className="text-purple-600">CLÍNICA</span>
                <span className="text-gray-600"> VETERINARIA</span>
              </h1>
              <div className="text-indigo-700 font-semibold text-xs sm:text-sm">TU AMIGO FIEL</div>
            </div>
          </div>

          {/* Desktop actions */}
          <nav className="hidden sm:flex items-center gap-3">
            <span className="text-sm bg-purple-100 text-purple-800 px-3 py-1 rounded-full flex items-center gap-2">
              <PhoneIcon className="w-4 h-4" />
              Urgencias 24h
            </span>
            <Link to="/login" className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">Acceso</Link>
          </nav>

          {/* Mobile menu button */}
          <div className="sm:hidden">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Abrir menú"
              aria-expanded={mobileOpen}
              className="p-2 rounded-md bg-gray-100 inline-flex items-center justify-center"
            >
              <span className="sr-only">Abrir menú</span>
              {mobileOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile nav panel */}
        {mobileOpen && (
          <div className="sm:hidden bg-white border-t border-gray-200">
            <div className="px-4 py-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={logo} alt="logo" className="h-10 w-10 rounded-full object-cover" />
                  <div>
                    <div className="font-semibold">Tu Amigo Fiel</div>
                    <div className="text-xs text-gray-500">Clínica Veterinaria</div>
                  </div>
                </div>
                <div className="text-sm text-gray-600">Horario: 9:00 - 20:00</div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Link to="/venta" className="px-3 py-2 rounded-md bg-indigo-600 text-white text-center">Ventas</Link>
                <Link to="/Almacen" className="px-3 py-2 rounded-md bg-gray-100 text-center">Stock</Link>
                <Link to="/cuentas" className="px-3 py-2 rounded-md bg-gray-100 text-center">Cuentas</Link>
                <Link to="/reports" className="px-3 py-2 rounded-md bg-gray-100 text-center">Reportes</Link>
              </div>

              <div className="pt-2">
                <Link to="/login" className="block w-full text-center px-4 py-2 rounded-md bg-indigo-600 text-white font-medium">Acceso</Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main */}
      <main className="flex-grow max-w-6xl mx-auto px-4 py-6">
        {/* Hero */}
        <section className="relative rounded-2xl overflow-hidden mb-8">
          <div className="w-full h-[42vh] md:h-[52vh] lg:h-[60vh] rounded-2xl overflow-hidden relative shadow-sm">
            <img
              src={image}
              alt="Mascotas felices en la clínica veterinaria"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              style={{ objectPosition: 'center 30%' }}
              loading="lazy"
            />
            {/* overlay gradient for readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/50 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-end p-5 md:p-8">
              <div className="max-w-xl text-white">
                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 drop-shadow-md">Cuidado profesional para tus mascotas</h2>
                <p className="text-sm sm:text-base md:text-lg text-white/90">Amor, dedicación y la mejor atención médica veterinaria — gestión y ventas en local.</p>

                {/* CTA group responsive */}
                <div className="mt-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                  <Link to="#reserva" className="inline-flex items-center px-4 py-2 rounded-lg font-semibold bg-yellow-300 text-purple-800 shadow-sm text-sm sm:text-base">Reservar cita</Link>
                  <a href="tel:123456789" className="inline-flex items-center px-4 py-2 rounded-lg bg-white text-purple-700 text-sm sm:text-base">📞 Llamar</a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick admin actions */}
        <section className="mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Accesos rápidos (Local)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link to="/venta" className="group">
              <div className="bg-white p-4 rounded-2xl shadow hover:shadow-lg transition transform hover:-translate-y-1 border border-gray-100 flex items-center gap-3">
                <div className="p-3 rounded-lg bg-indigo-50">
                  <ShoppingCartIcon className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-gray-500">Punto de Venta</div>
                  <div className="font-medium text-gray-800 truncate">Ventas rápidas</div>
                </div>
              </div>
            </Link>

            <Link to="/Almacen" className="group">
              <div className="bg-white p-4 rounded-2xl shadow hover:shadow-lg transition transform hover:-translate-y-1 border border-gray-100 flex items-center gap-3">
                <div className="p-3 rounded-lg bg-green-50">
                  <ArchiveBoxIcon className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-gray-500">Inventario</div>
                  <div className="font-medium text-gray-800 truncate">Gestionar stock</div>
                </div>
              </div>
            </Link>

            <Link to="/cuentas" className="group">
              <div className="bg-white p-4 rounded-2xl shadow hover:shadow-lg transition transform hover:-translate-y-1 border border-gray-100 flex items-center gap-3">
                <div className="p-3 rounded-lg bg-yellow-50">
                  <UsersIcon className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-gray-500">Clientes</div>
                  <div className="font-medium text-gray-800 truncate">Cuentas y créditos</div>
                </div>
              </div>
            </Link>

            <Link to="/reports" className="group">
              <div className="bg-white p-4 rounded-2xl shadow hover:shadow-lg transition transform hover:-translate-y-1 border border-gray-100 flex items-center gap-3">
                <div className="p-3 rounded-lg bg-purple-50">
                  <ChartBarSquareIcon className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-gray-500">Reportes</div>
                  <div className="font-medium text-gray-800 truncate">Ganancias & movimientos</div>
                </div>
              </div>
            </Link>
          </div>
        </section>

        {/* Info blocks */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-5 rounded-xl shadow hover:-translate-y-1 transition-transform border border-gray-100">
            <div className="flex items-center mb-3">
              <div className="bg-pink-100 p-3 rounded-xl mr-3">
                <HeartIcon className="w-6 h-6 text-pink-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Servicios</h3>
            </div>
            <ul className="text-gray-600 space-y-2 text-sm">
              <li>Consultas y especialidades</li>
              <li>Vacunación y desparasitación</li>
              <li>Cirugías y hospitalización</li>
              <li>Peluquería canina</li>
            </ul>
          </div>

          <div className="bg-white p-5 rounded-xl shadow hover:-translate-y-1 transition-transform border border-gray-100">
            <div className="flex items-center mb-3">
              <div className="bg-blue-100 p-3 rounded-xl mr-3">
                <ClockIcon className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Horario</h3>
            </div>
            <div className="text-sm text-gray-600 space-y-3">
              <div className="flex justify-between"><span>Lun - Vie</span><span className="font-medium text-gray-800">9:00 - 20:00</span></div>
              <div className="flex justify-between"><span>Sábados</span><span className="font-medium text-gray-800">10:00 - 14:00</span></div>
              <div className="flex justify-between"><span>Urgencias</span><span className="font-medium text-blue-600">24 horas</span></div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl shadow hover:-translate-y-1 transition-transform border border-gray-100">
            <a
              href="https://www.instagram.com/tuamigofielcat"
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <div className="flex items-center mb-3">
                <div className="bg-green-100 p-3 rounded-xl mr-3">
                  <PhoneIcon className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Contacto</h3>
              </div>
              <div className="text-sm text-gray-600 space-y-2">
                <div>Tel: 123 456 789</div>
                <div>Email: info@tuamigofiel.com</div>
                <div>Dirección: Calle Mascotas, 123</div>
                <div className="mt-2 text-green-600 font-medium">Síguenos en Instagram</div>
              </div>
            </a>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
            <div>
              <h3 className="text-xl font-bold mb-2">Tu Amigo Fiel</h3>
              <p className="text-gray-400 text-sm">Cuidamos de tus mascotas como si fueran nuestras.</p>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-2">Servicios</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>Consultas</li>
                <li>Vacunación</li>
                <li>Cirugías</li>
                <li>Hospitalización</li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-2">Contacto</h4>
              <address className="not-italic text-gray-400 space-y-1 text-sm">
                <div>Calle Mascotas, 123</div>
                <div>123 456 789</div>
                <div>info@tuamigofiel.com</div>
                <div className="mt-2">Horario: L-V 9:00-20:00</div>
              </address>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-800 text-center text-gray-400 text-sm">
            <p>© {new Date().getFullYear()} Clínica Veterinaria Tu Amigo Fiel. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp (mobile & desktop) */}
      <a
        href="https://wa.me/5491123456789?text=Hola%20Tu%20Amigo%20Fiel"
        target="_blank"
        rel="noreferrer"
        className="fixed right-4 bottom-4 z-50 shadow-lg rounded-full p-3 bg-green-500 text-white lg:right-8 lg:bottom-8"
        aria-label="Abrir WhatsApp"
      >
        <span className="sr-only">Abrir WhatsApp</span>
        💬
      </a>
    </div>
  );
};

export default Home;