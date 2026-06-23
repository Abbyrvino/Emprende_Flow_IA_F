import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import Navbar from '../components/layout/Navbar';

const ProductoDetalle = () => {
  const { id } = useParams();
  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [agregado, setAgregado] = useState(false);
  const { agregarProducto } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/productos/${id}`)
      .then(({ data }) => setProducto(data.producto))
      .catch(() => navigate('/home'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAgregar = () => {
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
    setAgregado(true);
    setTimeout(() => setAgregado(false), 2000);
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (!producto) return null;

  return (
    <div className="app-layout">
      <Navbar />
      <main className="page-content">
        <div className="product-detail">
          <div className="product-detail__gallery">
            {producto.imagen_url ? (
              <img src={producto.imagen_url} alt={producto.nombre} className="product-detail__image" />
            ) : (
              <div className="product-detail__placeholder">📦</div>
            )}
          </div>

          <div className="product-detail__info">
            <span className="badge badge--categoria">{producto.categoria?.nombre}</span>
            <h1 className="product-detail__nombre">{producto.nombre}</h1>
            <p className="product-detail__negocio">
              Vendido por <strong>{producto.negocio?.nombre}</strong>
            </p>

            {producto.descripcion && (
              <p className="product-detail__descripcion">{producto.descripcion}</p>
            )}

            <div className="product-detail__precio-row">
              <span className="product-detail__precio">Bs. {parseFloat(producto.precio).toFixed(2)}</span>
              <span className={`stock-badge ${producto.stock > 0 ? 'stock-badge--ok' : 'stock-badge--agotado'}`}>
                {producto.stock > 0 ? `${producto.stock} disponibles` : 'Agotado'}
              </span>
            </div>

            <div className="product-detail__actions">
              <button
                className={`btn btn--lg ${agregado ? 'btn--success' : 'btn--primary'}`}
                onClick={handleAgregar}
                disabled={producto.stock === 0}
                id={`agregar-detalle-${producto.id}`}
              >
                {agregado ? '✓ Agregado al carrito' : '🛒 Agregar al carrito'}
              </button>
              <button className="btn btn--ghost btn--lg" onClick={() => navigate('/home')}>
                ← Volver
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductoDetalle;
