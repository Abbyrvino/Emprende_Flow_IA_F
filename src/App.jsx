import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import PrivateRoute from './components/layout/PrivateRoute';
import DashboardLayout from './components/layout/DashboardLayout';

import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import ProductoDetalle from './pages/ProductoDetalle';
import Carrito from './pages/Carrito';
import NegocioSetup from './pages/NegocioSetup';

import Inventario from './pages/dashboard/Inventario';
import MisVentas from './pages/dashboard/MisVentas';
import PerfilNegocio from './pages/dashboard/PerfilNegocio';
import BI from './pages/dashboard/BI';
import PickupPoints from './pages/dashboard/PickupPoints';
import Catalogo from './pages/dashboard/Catalogo';
import AsistenteIA from './pages/dashboard/AsistenteIA';

const App = () => {
  return (
    <ThemeProvider>
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            {/* Rutas públicas */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Rutas protegidas — cualquier usuario autenticado */}
            <Route path="/home" element={
              <PrivateRoute><Home /></PrivateRoute>
            } />
            <Route path="/producto/:id" element={
              <PrivateRoute><ProductoDetalle /></PrivateRoute>
            } />
            <Route path="/carrito" element={
              <PrivateRoute><Carrito /></PrivateRoute>
            } />
            <Route path="/setup-negocio" element={
              <PrivateRoute><NegocioSetup /></PrivateRoute>
            } />

            {/* Dashboard — solo emprendedores */}
            <Route path="/dashboard" element={
              <PrivateRoute requiereEmprendedor><DashboardLayout /></PrivateRoute>
            }>
              <Route index element={<Navigate to="/dashboard/inventario" replace />} />
              <Route path="inventario" element={<Inventario />} />
              <Route path="ventas" element={<MisVentas />} />
              <Route path="perfil" element={<PerfilNegocio />} />
              <Route path="bi" element={<BI />} />
              <Route path="pickup-points" element={<PickupPoints />} />
              <Route path="catalogo" element={<Catalogo />} />
              <Route path="asistente-ia" element={<AsistenteIA />} />
            </Route>

            {/* Redirect raíz */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
