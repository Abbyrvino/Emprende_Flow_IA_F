import { useState, useEffect } from 'react';
import api from '../../services/api';

const FORM_INICIAL = {
  nombre: '', descripcion: '', precio: '', stock: '', id_categoria: '', imagen: null,
};

const Inventario = () => {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(FORM_INICIAL);
  const [preview, setPreview] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  const cargar = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        api.get('/negocios/mio'),
        api.get('/categorias'),
      ]);
      setProductos(prodRes.data.negocio?.productos || []);
      setCategorias(catRes.data.categorias);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const abrirModal = (producto = null) => {
    if (producto) {
      setEditando(producto.id);
      setForm({
        nombre: producto.nombre,
        descripcion: producto.descripcion || '',
        precio: producto.precio,
        stock: producto.stock,
        id_categoria: producto.id_categoria,
        imagen: null,
      });
      setPreview(producto.imagen_url || '');
    } else {
      setEditando(null);
      setForm(FORM_INICIAL);
      setPreview('');
    }
    setError('');
    setModal(true);
  };

  const handleChange = (e) => {
    if (e.target.name === 'imagen') {
      const file = e.target.files[0];
      setForm({ ...form, imagen: file });
      setPreview(file ? URL.createObjectURL(file) : '');
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setError('');
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v !== null && v !== '') fd.append(k, v); });

      if (editando) {
        await api.put(`/productos/${editando}`, fd);
      } else {
        await api.post('/productos', fd);
      }

      setModal(false);
      cargar();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar.');
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Eliminar este producto?')) return;
    try {
      await api.delete(`/productos/${id}`);
      cargar();
    } catch {
      alert('Error al eliminar.');
    }
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="dashboard-section">
      <div className="section-header">
        <h2>📦 Inventario</h2>
        <button className="btn btn--primary" onClick={() => abrirModal()} id="nuevo-producto">
          + Nuevo Producto
        </button>
      </div>

      {productos.length === 0 ? (
        <div className="empty-state">
          <p>Aún no tienes productos. ¡Agrega tu primero!</p>
        </div>
      ) : (
        <div className="inventario-grid">
          {productos.map((p) => (
            <div key={p.id} className="inventario-card">
              <div className="inventario-card__img-wrap">
                {p.imagen_url ? (
                  <img src={p.imagen_url} alt={p.nombre} className="inventario-card__img" />
                ) : (
                  <div className="inventario-card__img-placeholder">📦</div>
                )}
              </div>
              <div className="inventario-card__info">
                <h4>{p.nombre}</h4>
                <p className="text-muted">{p.categoria?.nombre}</p>
                <div className="inventario-card__stats">
                  <span className="precio">Bs. {parseFloat(p.precio).toFixed(2)}</span>
                  <span className={`stock ${p.stock <= 5 ? 'stock--low' : ''}`}>
                    Stock: {p.stock}
                  </span>
                </div>
              </div>
              <div className="inventario-card__actions">
                <button className="btn btn--ghost btn--sm" onClick={() => abrirModal(p)}>✏️ Editar</button>
                <button className="btn btn--danger btn--sm" onClick={() => handleEliminar(p.id)}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de producto */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editando ? 'Editar Producto' : 'Nuevo Producto'}</h3>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              {error && <div className="alert alert--error">{error}</div>}

              <div className="form-group">
                <label>Nombre *</label>
                <input name="nombre" className="input" value={form.nombre} onChange={handleChange} required />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Precio (Bs.) *</label>
                  <input name="precio" type="number" step="0.01" min="0" className="input" value={form.precio} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Stock *</label>
                  <input name="stock" type="number" min="0" className="input" value={form.stock} onChange={handleChange} required />
                </div>
              </div>

              <div className="form-group">
                <label>Categoría *</label>
                <select name="id_categoria" className="input" value={form.id_categoria} onChange={handleChange} required>
                  <option value="">Seleccionar...</option>
                  {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label>Descripción</label>
                <textarea name="descripcion" className="input textarea" rows={2} value={form.descripcion} onChange={handleChange} />
              </div>

              <div className="form-group">
                <label>Imagen del producto</label>
                <input id="imagen-producto" name="imagen" type="file" accept="image/*" className="input-file" onChange={handleChange} />
                {preview && <img src={preview} alt="preview" className="img-preview" />}
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn--ghost" onClick={() => setModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn--primary" disabled={guardando}>
                  {guardando ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventario;
