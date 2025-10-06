// src/component/RequireAuth.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

/**
 * RequireAuth
 * Props:
 *  - children: componente a renderizar si autorizado
 *  - adminOnly: boolean (si true, exige también localStorage.isAdmin === 'true')
 */
export default function RequireAuth({ children, adminOnly = false }) {
  const token = localStorage.getItem('token');
  const isAdmin = localStorage.getItem('isAdmin') === 'true';
  const location = useLocation();

  if (!token) {
    // No hay token -> redirigir a login guardando la ruta solicitada
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (adminOnly && !isAdmin) {
    // Tiene token pero no es admin -> redirigir a home (o a login)
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}