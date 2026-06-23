import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

// Fix para los iconos de Leaflet con Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Centro FICCT-UAGRM
const FICCT_CENTER = [-17.7837, -63.1806];

const ClickHandler = ({ onMapClick }) => {
  useMapEvents({ click: (e) => onMapClick(e.latlng) });
  return null;
};

const PickupPoints = () => {
  const [puntos, setPuntos] = useState([]);
  const [form, setForm] = useState({ nombre: '', latitud: '', longitud: '', horario: '' });
  const [editando, setEditando] = useState(null);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const cargar = async () => {
    if (!user?.negocio?.id) return;
    try {
      const { data } = await api.get(`/pickup-points/negocio/${user.negocio.id}`);
      setPuntos(data.puntos);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const handleMapClick = ({ lat, lng }) => {
    setForm((prev) => ({ ...prev, latitud: lat.toFixed(6), longitud: lng.toFixed(6) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setError('');
    try {
      if (editando) {
        await api.put(`/pickup-points/${editando}`, form);
      } else {
        await api.post('/pickup-points', form);
      }
      setForm({ nombre: '', latitud: '', longitud: '', horario: '' });
      setEditando(null);
      cargar();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar.');
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Eliminar este punto?')) return;
    await api.delete(`/pickup-points/${id}`);
    cargar();
  };

  const handleEditar = (punto) => {
    setEditando(punto.id);
    setForm({
      nombre: punto.nombre,
      latitud: punto.latitud,
      longitud: punto.longitud,
      horario: punto.horario || '',
    });
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="dashboard-section">
      <div className="section-header">
        <h2>📍 Pick-up Points</h2>
      </div>

      <div className="pickup-layout">
        {/* Mapa */}
        <div className="map-container">
          <MapContainer center={FICCT_CENTER} zoom={15} style={{ height: 'calc(100vh - 160px)', minHeight: '500px', borderRadius: '12px' }}>
            <TileLayer
              attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <ClickHandler onMapClick={handleMapClick} />
            {puntos.map((p) => (
              <Marker key={p.id} position={[parseFloat(p.latitud), parseFloat(p.longitud)]}>
                <Popup>
                  <strong>{p.nombre}</strong>
                  {p.horario && <p>🕐 {p.horario}</p>}
                </Popup>
              </Marker>
            ))}
            {form.latitud && form.longitud && (
              <Marker position={[parseFloat(form.latitud), parseFloat(form.longitud)]}>
                <Popup>Nuevo punto (sin guardar)</Popup>
              </Marker>
            )}
          </MapContainer>
          <p className="map-hint">Haz clic en el mapa para seleccionar coordenadas</p>
        </div>

        {/* Formulario y lista */}
        <div className="pickup-sidebar">
          <form className="card pickup-form" onSubmit={handleSubmit}>
            <h3>{editando ? 'Editar Punto' : 'Agregar Punto'}</h3>
            {error && <div className="alert alert--error">{error}</div>}

            <div className="form-group">
              <label>Nombre del punto *</label>
              <input
                id="nombre-punto"
                className="input"
                name="nombre"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                placeholder="Ej: Lab. Sistemas 3er piso"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Latitud</label>
                <input className="input" value={form.latitud} readOnly placeholder="-17.7837" />
              </div>
              <div className="form-group">
                <label>Longitud</label>
                <input className="input" value={form.longitud} readOnly placeholder="-63.1806" />
              </div>
            </div>

            <div className="form-group">
              <label>Horario</label>
              <input
                className="input"
                name="horario"
                value={form.horario}
                onChange={(e) => setForm({ ...form, horario: e.target.value })}
                placeholder="Ej: Lun-Vie 10:00-12:00"
              />
            </div>

            <div className="form-actions">
              {editando && (
                <button type="button" className="btn btn--ghost" onClick={() => { setEditando(null); setForm({ nombre: '', latitud: '', longitud: '', horario: '' }); }}>
                  Cancelar
                </button>
              )}
              <button type="submit" className="btn btn--primary" disabled={guardando || !form.latitud}>
                {guardando ? 'Guardando...' : editando ? 'Actualizar' : 'Agregar Punto'}
              </button>
            </div>
          </form>

          {/* Lista de puntos */}
          <div className="pickup-list">
            {puntos.map((p) => (
              <div key={p.id} className="pickup-item">
                <div>
                  <strong>{p.nombre}</strong>
                  {p.horario && <span className="text-muted"> — {p.horario}</span>}
                  <br />
                  <small className="text-muted">{p.latitud}, {p.longitud}</small>
                </div>
                <div className="pickup-item__actions">
                  <button className="btn btn--ghost btn--sm" onClick={() => handleEditar(p)}>✏️</button>
                  <button className="btn btn--danger btn--sm" onClick={() => handleEliminar(p.id)}>🗑️</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PickupPoints;
