import { NavLink, Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const DashboardLayout = () => {
  const navItems = [
    { to: '/dashboard/inventario', icon: '📦', label: 'Inventario' },
    { to: '/dashboard/ventas', icon: '💰', label: 'Mis Ventas' },
    { to: '/dashboard/perfil', icon: '🏪', label: 'Mi Perfil' },
    { to: '/dashboard/bi', icon: '📊', label: 'Analytics BI' },
    { to: '/dashboard/pickup-points', icon: '📍', label: 'Pick-up Points' },
    { to: '/dashboard/catalogo', icon: '📄', label: 'Catálogo PDF' },
    { to: '/dashboard/asistente-ia', icon: '🤖', label: 'Asistente IA' },
  ];

  return (
    <div className="app-layout">
      <Navbar />
      <div className="dashboard-wrapper">
        <aside className="dashboard-sidebar">
          <div className="sidebar-header">
            <h3>Panel Emprendedor</h3>
          </div>
          <nav className="sidebar-nav">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? 'sidebar-link--active' : ''}`
                }
              >
                <span className="sidebar-icon">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </aside>
        <main className="dashboard-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
