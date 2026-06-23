import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/layout/Navbar';

const Carrito = () => {
  const { grupos, totalItems, quitarProducto, actualizarCantidad, finalizarPedido } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState({});
  const [errores, setErrores] = useState({});
  const navigate = useNavigate();

  const calcularSubtotal = (productos) =>
    productos.reduce((sum, p) => sum + parseFloat(p.precio) * p.cantidad, 0).toFixed(2);

  const handleFinalizar = async (id_vendedor) => {
    setLoading((prev) => ({ ...prev, [id_vendedor]: true }));
    setErrores((prev) => ({ ...prev, [id_vendedor]: '' }));
    try {
      const datos_cliente = `${user.nombre} - ${user.whatsapp_number || user.email}`;
      await finalizarPedido(id_vendedor, datos_cliente);
    } catch (err) {
      setErrores((prev) => ({
        ...prev,
        [id_vendedor]: err.response?.data?.error || 'Error al procesar el pedido.',
      }));
    } finally {
      setLoading((prev) => ({ ...prev, [id_vendedor]: false }));
    }
  };

  if (totalItems === 0) {
    return (
      <div className="app-layout">
        <Navbar />
        <main className="page-content">
          <div className="empty-state">
            <div className="empty-icon">🛒</div>
            <h2>Tu carrito está vacío</h2>
            <p>Agrega productos desde el marketplace</p>
            <button className="btn btn--primary" onClick={() => navigate('/home')}>
              Explorar Marketplace
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Navbar />
      <main className="page-content">
        <h1 className="page-title">Tu Carrito</h1>

        <div className="cart-layout">
          <div className="cart-grupos">
            {grupos.map((grupo) => (
              <div key={grupo.id_vendedor} className="cart-grupo">
                <div className="cart-grupo__header">
                  <h3>🏪 {grupo.nombre_vendedor}</h3>
                </div>

                <div className="cart-grupo__items">
                  {grupo.productos.map((p) => (
                    <div key={p.id_producto} className="cart-item">
                      {p.imagen_url && (
                        <img src={p.imagen_url} alt={p.nombre} className="cart-item__img" />
                      )}
                      <div className="cart-item__info">
                        <span className="cart-item__nombre">{p.nombre}</span>
                        <span className="cart-item__precio">Bs. {parseFloat(p.precio).toFixed(2)}</span>
                      </div>
                      <div className="cart-item__qty">
                        <button
                          className="qty-btn"
                          onClick={() => actualizarCantidad(grupo.id_vendedor, p.id_producto, p.cantidad - 1)}
                        >−</button>
                        <span>{p.cantidad}</span>
                        <button
                          className="qty-btn"
                          onClick={() => actualizarCantidad(grupo.id_vendedor, p.id_producto, p.cantidad + 1)}
                        >+</button>
                      </div>
                      <span className="cart-item__subtotal">
                        Bs. {(parseFloat(p.precio) * p.cantidad).toFixed(2)}
                      </span>
                      <button
                        className="btn-remove"
                        onClick={() => quitarProducto(grupo.id_vendedor, p.id_producto)}
                        aria-label="Eliminar"
                      >✕</button>
                    </div>
                  ))}
                </div>

                <div className="cart-grupo__footer">
                  <div className="cart-subtotal">
                    Total: <strong>Bs. {calcularSubtotal(grupo.productos)}</strong>
                  </div>

                  {errores[grupo.id_vendedor] && (
                    <div className="alert alert--error">{errores[grupo.id_vendedor]}</div>
                  )}

                  <button
                    className="btn btn--whatsapp btn--full"
                    onClick={() => handleFinalizar(grupo.id_vendedor)}
                    disabled={loading[grupo.id_vendedor]}
                    id={`finalizar-${grupo.id_vendedor}`}
                  >
                    {loading[grupo.id_vendedor]
                      ? 'Procesando...'
                      : `📱 Finalizar Pedido con ${grupo.nombre_vendedor}`}
                  </button>
                  <p className="cart-grupo__hint">
                    Se abrirá WhatsApp con tu pedido pre-cargado
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Carrito;
