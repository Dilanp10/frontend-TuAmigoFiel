// src/routes/Routes.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import LoginPage from '../pages/LoginPage';
import AdminPage from '../pages/AdminPage';
import AlmacenPage from '../pages/AlmacenPage';
import VentasPage from '../pages/VentasPage';
import HistorialVentas from '../pages/HistorialVentas';
import AlertsPage from '../pages/AlertsPage';
import ReportsPage from '../pages/ReportsPage';
import ServicesPage from '../pages/ServicesPage';
import Cuentas from '../pages/CustomersPage';
import CustomerAccountPage from '../pages/CustomerAccountPage';
import RequireAuth from '../component/RequireAuth';

const AppRoutes = () => (
  <Routes>
    {/* Rutas públicas */}
    <Route path="/" element={<Home />} />
    <Route path="/login" element={<LoginPage />} />

    {/* Rutas protegidas (cualquier usuario con token) */}
    <Route path="/venta" element={
      <RequireAuth><VentasPage /></RequireAuth>
    }/>
    <Route path="/historialVenta" element={
      <RequireAuth><HistorialVentas /></RequireAuth>
    }/>
    <Route path="/alert" element={
      <RequireAuth><AlertsPage /></RequireAuth>
    }/>
    <Route path="/reports" element={
      <RequireAuth><ReportsPage /></RequireAuth>
    }/>
    <Route path="/servicios" element={
      <RequireAuth><ServicesPage /></RequireAuth>
    }/>
    <Route path="/cuentas" element={
      <RequireAuth><Cuentas /></RequireAuth>
    }/>
    <Route path="/customer/:id" element={
      <RequireAuth><CustomerAccountPage /></RequireAuth>
    }/>
    <Route path="/Almacen" element={
      <RequireAuth><AlmacenPage /></RequireAuth>
    }/>

    {/* Ruta solo para admin (token + isAdmin=true) */}
    <Route path="/AdminPage" element={
      <RequireAuth adminOnly={true}><AdminPage /></RequireAuth>
    }/>
  </Routes>
);

export default AppRoutes;