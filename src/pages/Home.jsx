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
  ChartBarSquareIcon // ← Icono corregido
} from "@heroicons/react/24/solid";
import { Link } from 'react-router-dom';

const Home = () => {
  const [mostrarBienvenida, setMostrarBienvenida] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMostrarBienvenida(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100 font-sans">
      {/* Intro animado */}
      {mostrarBienvenida && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
          <div className="text-center p-8 max-w-2xl animate-fade-in">
            <div className="flex justify-center space-x-4 mb-6">
              <span className="text-4xl animate-bounce" style={{ animationDelay: '0.1s' }}>🐾</span>
              <span className="text-4xl animate-bounce" style={{ animationDelay: '0.3s' }}>🐾</span>
              <span className="text-4xl animate-bounce" style={{ animationDelay: '0.5s' }}>🐾</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
              Clínica Veterinaria <span className="text-yellow-300">Tu Amigo Fiel</span>
            </h2>
            <p className="text-lg md:text-xl text-white/90 font-medium mb-6">
              Espacio de gestión local — Punto de venta & administración
            </p>
            <div className="w-64 mx-auto bg-white/30 rounded-full h-2 mt-2">
              <div className="bg-white h-2 rounded-full animate-[progress_3s_ease-in-out]" />
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md shadow-sm py-4 border-b border-gray-200 transition-all duration-300">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center">
            <img
              src={logo}
              alt="Logo Clínica Veterinaria"
              className="h-14 w-14 mr-4 object-cover rounded-full border-2 border-purple-200 shadow-sm"
            />
            <div>
              <h1 className="text-xl font-bold text-gray-800 font-serif leading-tight">
                <span className="text-purple-600">CLÍNICA</span>
                <span className="text-gray-600"> VETERINARIA</span>
              </h1>
              <div className="text-indigo-700 font-semibold text-sm">TU AMIGO FIEL </div>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-3">
            <span className="text-sm bg-purple-100 text-purple-800 px-3 py-1 rounded-full flex items-center">
              <PhoneIcon className="w-4 h-4 mr-1" />
              Urgencias 24h
            </span>
            <Link to="/login" className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">Acceso</Link>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-grow container mx-auto px-4 py-8">
        {/* Hero */}
        <section className="relative rounded-2xl overflow-hidden mb-10 group shadow-md">
          <div className="relative w-full h-auto aspect-video overflow-hidden rounded-2xl">
            <img
              src={image}
              alt="Mascotas felices en la clínica veterinaria"
              className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
              style={{ objectPosition: 'center 30%' }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/35 to-transparent"></div>
            <div className="absolute bottom-6 left-6 text-white">
              <h2 className="text-2xl md:text-3xl font-bold mb-1 font-serif">Cuidado profesional para tus mascotas</h2>
              <p className="text-sm md:text-base max-w-lg">Amor, dedicación y la mejor atención médica veterinaria — gestión y ventas en local.</p>
            </div>
          </div>
        </section>

        {/* Quick admin actions (en lugar de CTA cliente) */}
        <section className="mb-10">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Accesos rápidos (Local)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

            <Link to="/venta" className="group">
              <div className="bg-white p-4 rounded-2xl shadow hover:shadow-lg transition transform hover:-translate-y-1 border border-gray-100 flex items-center gap-3">
                <div className="p-3 rounded-lg bg-indigo-50">
                  <ShoppingCartIcon className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Punto de Venta</div>
                  <div className="font-medium text-gray-800">Ventas rápidas</div>
                </div>
              </div>
            </Link>

            <Link to="/Almacen" className="group">
              <div className="bg-white p-4 rounded-2xl shadow hover:shadow-lg transition transform hover:-translate-y-1 border border-gray-100 flex items-center gap-3">
                <div className="p-3 rounded-lg bg-green-50">
                  <ArchiveBoxIcon className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Inventario</div>
                  <div className="font-medium text-gray-800">Gestionar stock</div>
                </div>
              </div>
            </Link>

            <Link to="/cuentas" className="group">
              <div className="bg-white p-4 rounded-2xl shadow hover:shadow-lg transition transform hover:-translate-y-1 border border-gray-100 flex items-center gap-3">
                <div className="p-3 rounded-lg bg-yellow-50">
                  <UsersIcon className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Clientes</div>
                  <div className="font-medium text-gray-800">Cuentas y créditos</div>
                </div>
              </div>
            </Link>

            <Link to="/reports" className="group">
              <div className="bg-white p-4 rounded-2xl shadow hover:shadow-lg transition transform hover:-translate-y-1 border border-gray-100 flex items-center gap-3">
                <div className="p-3 rounded-lg bg-purple-50">
                  <ChartBarSquareIcon className="w-6 h-6 text-purple-600" /> {/* ← Icono corregido */}
                </div>
                <div>
                  <div className="text-sm text-gray-500">Reportes</div>
                  <div className="font-medium text-gray-800">Ganancias & movimientos</div>
                </div>
              </div>
            </Link>
          </div>
        </section>

        {/* Info blocks */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-6 rounded-xl shadow-lg transition-all duration-500 hover:-translate-y-2 border border-gray-100">
            <div className="flex items-center mb-4">
              <div className="bg-pink-100 p-3 rounded-xl mr-4">
                <HeartIcon className="w-6 h-6 text-pink-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Servicios</h3>
            </div>
            <ul className="text-gray-600 space-y-2 pl-2 text-sm">
              <li>Consultas y especialidades</li>
              <li>Vacunación y desparasitación</li>
              <li>Cirugías y hospitalización</li>
              <li>Peluquería canina</li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg transition-all duration-500 hover:-translate-y-2 border border-gray-100">
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 p-3 rounded-xl mr-4">
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

          <div className="bg-white p-6 rounded-xl shadow-lg transition-all duration-500 hover:-translate-y-2 border border-gray-100">
            <a
              href="https://www.instagram.com/tuamigofielcat?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <div className="flex items-center mb-4">
                <div className="bg-green-100 p-3 rounded-xl mr-4">
                  <PhoneIcon className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Contacto</h3>
              </div>
              <div className="text-sm text-gray-600 space-y-2">
                <div>Tel: 123 456 789</div>
                <div>Email: info@tuamigofiel.com</div>
                <div>Dirección: Calle Mascotas, 123</div>
                <div className="mt-3 text-green-600 font-medium">Síguenos en Instagram</div>
              </div>
            </a>
          </div>
        </section>
      </main>

      {/* Footer */}
     <footer className="bg-gray-900 text-white py-10">
  <div className="container mx-auto px-4">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
      <div>
        <h3 className="text-xl font-bold mb-4 font-serif">Tu Amigo Fiel</h3>
        <p className="text-gray-400">Cuidamos de tus mascotas como si fueran nuestras.</p>
      </div>

      <div>
        <h4 className="text-lg font-semibold mb-4">Servicios</h4>
        <ul className="space-y-2 text-gray-400">
          <li>Consultas</li>
          <li>Vacunación</li>
          <li>Cirugías</li>
          <li>Hospitalización</li>
        </ul>
      </div>

      <div>
        <h4 className="text-lg font-semibold mb-4">Contacto</h4>
        <address className="not-italic text-gray-400 space-y-2">
          <p>Calle Mascotas, 123</p>
          <p>123 456 789</p>
          <p>info@tuamigofiel.com</p>
          <p className="mt-4">Horario: L-V 9:00-20:00</p>
        </address>
      </div>
    </div>

    <div className="pt-6 border-t border-gray-800 text-center text-gray-400 text-sm">
      <p>© {new Date().getFullYear()} Clínica Veterinaria Tu Amigo Fiel. Todos los derechos reservados.</p>
    </div>
  </div>
</footer>
    </div>
  );
};

export default Home;