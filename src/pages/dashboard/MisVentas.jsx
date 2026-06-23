import { useState, useEffect } from 'react';
import api from '../../services/api';

const ESTADOS = {
  Pendiente_WhatsApp: { label: 'Pendiente WhatsApp', color: 'badge--warning' },
  Confirmado: { label: 'Confirmado', color: 'badge--success' },
  Cancelado: { label: 'Cancelado', color: 'badge--danger' },
};

const MisVentas = () => {
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actualizando, setActualizando] = useState({});

  const cargar = async () => {
    try {
      const { data } = await api.get('/ventas/recibidas');
      setVentas(data.ventas);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const cambiarEstado = async (id, estado) => {
    setActualizando((prev) => ({ ...prev, [id]: true }));
    try {
      await api.put(`/ventas/${id}/estado`, { estado });
      cargar();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al actualizar.');
    } finally {
      setActualizando((prev) => ({ ...prev, [id]: false }));
    }
  };

  const calcularTotal = (detalles) =>
    detalles.reduce((sum, d) => sum + parseFloat(d.precio_unitario) * d.cantidad, 0).toFixed(2);

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="dashboard-section">
      <div className="section-header">
        <h2>💰 Pedidos Recibidos</h2>
        <button className="btn btn--ghost btn--sm" onClick={cargar}>↻ Actualizar</button>
      </div>

      {ventas.length === 0 ? (
        <div className="empty-state"><p>Aún no has recibido pedidos.</p></div>
      ) : (
        <div className="ventas-list">
          {ventas.map((venta) => {
            const estadoInfo = ESTADOS[venta.estado];
            return (
              <div key={venta.id} className={`venta-card venta-card--${venta.estado.toLowerCase()}`}>
                <div className="venta-card__header">
                  <div>
                    <h4>Pedido #{venta.id}</h4>
                    <span className="text-muted">{new Date(venta.createdAt).toLocaleString('es-BO')}</span>
                  </div>
                  <span className={`badge ${estadoInfo.color}`}>{estadoInfo.label}</span>
                </div>

                {venta.comprador && (
                  <p className="venta-card__cliente">
                    👤 {venta.comprador.nombre} — {venta.datos_cliente}
                  </p>
                )}

                <div className="venta-card__items">
                  {venta.detalles.map((d) => (
                    <div key={d.id} className="venta-item">
                      {d.producto?.imagen_url && (
                        <img src={d.producto.imagen_url} alt={d.producto.nombre} className="venta-item__img" />
                      )}
                      <span className="venta-item__nombre">{d.producto?.nombre}</span>
                      <span className="venta-item__qty">x{d.cantidad}</span>
                      <span className="venta-item__precio">
                        Bs. {(parseFloat(d.precio_unitario) * d.cantidad).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="venta-card__footer">
                  <span className="venta-total">
                    Total: <strong>Bs. {calcularTotal(venta.detalles)}</strong>
                  </span>

                  {venta.estado === 'Pendiente_WhatsApp' && (
                    <div className="venta-card__actions">
                      <button
                        className="btn btn--success btn--sm"
                        onClick={() => cambiarEstado(venta.id, 'Confirmado')}
                        disabled={actualizando[venta.id]}
                        id={`confirmar-${venta.id}`}
                      >
                        ✓ Confirmar
                      </button>
                      <button
                        className="btn btn--danger btn--sm"
                        onClick={() => cambiarEstado(venta.id, 'Cancelado')}
                        disabled={actualizando[venta.id]}
                        id={`cancelar-${venta.id}`}
                      >
                        ✕ Cancelar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MisVentas;
