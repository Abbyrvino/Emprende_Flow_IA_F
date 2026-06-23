import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import Navbar from '../components/layout/Navbar';

const Home = () => {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [filtros, setFiltros] = useState({ q: '', categoria: '' });
  const [loading, setLoading] = useState(true);
  const [agregados, setAgregados] = useState({});
  const { agregarProducto } = useCart();

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          api.get('/productos'),
          api.get('/categorias'),
        ]);
        setProductos(prodRes.data.productos);
        setCategorias(catRes.data.categorias);
      } catch {
        // Silenciar error de carga inicial
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, []);

  const buscar = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filtros.q) params.append('q', filtros.q);
      if (filtros.categoria) params.append('categoria', filtros.categoria);
      const { data } = await api.get(`/productos?${params}`);
      setProductos(data.productos);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(buscar, 400);
    return () => clearTimeout(timer);
  }, [filtros]);

  const handleAgregar = (producto) => {
    agregarProducto(
      producto.negocio.id,
      producto.negocio.nombre,
      {
        id_producto: producto.id,
        nombre: producto.nombre,
        precio: producto.precio,
        imagen_url: producto.imagen_url,
      }
    );
    setAgregados((prev) => ({ ...prev, [producto.id]: true }));
    setTimeout(() => setAgregados((prev) => ({ ...prev, [producto.id]: false })), 1500);
  };

  return (
    <div className="app-layout">
      <Navbar />
      <main className="page-content">
        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <div className="marketplace-hero">
          <h1>Marketplace FICCT</h1>
          <p>Compra y apoya a los emprendedores de tu universidad</p>
        </div>

        {/* ── Filtros ───────────────────────────────────────────────────── */}
        <div className="filters-bar">
          <input
            id="buscar-producto"
            type="text"
            className="input input--search"
            placeholder="🔍 Buscar productos..."
            value={filtros.q}
            onChange={(e) => setFiltros({ ...filtros, q: e.target.value })}
          />
          <select
            id="filtro-categoria"
            className="input input--select"
            value={filtros.categoria}
            onChange={(e) => setFiltros({ ...filtros, categoria: e.target.value })}
          >
            <option value="">Todas las categorías</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
        </div>

        {/* ── Grid de productos ─────────────────────────────────────────── */}
        {loading ? (
          <div className="loading-grid">
            {[...Array(8)].map((_, i) => <div key={i} className="product-card skeleton" />)}
          </div>
        ) : productos.length === 0 ? (
          <div className="empty-state">
            <p>No se encontraron productos.</p>
          </div>
        ) : (
          <div className="products-grid">
            {productos.map((producto) => (
              <div key={producto.id} className="product-card">
                <Link to={`/producto/${producto.id}`} className="product-card__image-link">
                  {producto.imagen_url ? (
                    <img
                      src={producto.imagen_url}
                      alt={producto.nombre}
                      className="product-card__image"
                      loading="lazy"
                    />
                  ) : (
                    <div className="product-card__image-placeholder">📦</div>
                  )}
                  {producto.stock === 0 && (
                    <span className="badge badge--agotado">Agotado</span>
                  )}
                </Link>

                <div className="product-card__body">
                  <span className="product-card__categoria">{producto.categoria?.nombre}</span>
                  <h3 className="product-card__nombre">
                    <Link to={`/producto/${producto.id}`}>{producto.nombre}</Link>
                  </h3>
                  <p className="product-card__negocio">por {producto.negocio?.nombre}</p>
                  <div className="product-card__footer">
                    <span className="product-card__precio">Bs. {parseFloat(producto.precio).toFixed(2)}</span>
                    <button
                      className={`btn btn--sm ${agregados[producto.id] ? 'btn--success' : 'btn--primary'}`}
                      onClick={() => handleAgregar(producto)}
                      disabled={producto.stock === 0}
                      id={`agregar-${producto.id}`}
                    >
                      {agregados[producto.id] ? '✓ Agregado' : '+ Carrito'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
