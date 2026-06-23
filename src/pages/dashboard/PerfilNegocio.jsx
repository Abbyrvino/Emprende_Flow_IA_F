import { useState, useEffect } from 'react';
import api from '../../services/api';

const PerfilNegocio = () => {
  const [negocio, setNegocio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ nombre: '', descripcion: '', whatsapp_number: '' });
  const [logoFile, setLogoFile] = useState(null);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

  useEffect(() => {
    fetchNegocio();
  }, []);

  const fetchNegocio = async () => {
    try {
      const res = await api.get('/negocios/mio');
      setNegocio(res.data.negocio);
      setFormData({
        nombre: res.data.negocio.nombre || '',
        descripcion: res.data.negocio.descripcion || '',
        whatsapp_number: res.data.negocio.usuario?.whatsapp_number || ''
      });
    } catch (error) {
      console.error(error);
      setMensaje({ tipo: 'error', texto: 'Error al cargar perfil.' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setLogoFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMensaje({ tipo: '', texto: '' });

    const data = new FormData();
    data.append('nombre', formData.nombre);
    data.append('descripcion', formData.descripcion);
    data.append('whatsapp_number', formData.whatsapp_number);
    if (logoFile) {
      data.append('logo', logoFile);
    }

    try {
      const res = await api.put('/negocios/mio', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setNegocio(res.data.negocio);
      setMensaje({ tipo: 'success', texto: 'Perfil actualizado exitosamente.' });
      setLogoFile(null); // Reset
    } catch (error) {
      console.error(error);
      setMensaje({ tipo: 'error', texto: error.response?.data?.error || 'Error al actualizar.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-section">
        <div className="loading-screen">
          <div className="spinner"></div>
          <p>Cargando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-section">
      <div className="section-header">
        <h2>Perfil del Negocio</h2>
      </div>

      <div className="card" style={{ maxWidth: '600px' }}>
        {mensaje.texto && (
          <div className={`alert alert--${mensaje.tipo}`} style={{ marginBottom: '1.5rem' }}>
            {mensaje.texto}
          </div>
        )}

        <form onSubmit={handleSubmit} className="form-group" style={{ gap: '1.5rem' }}>
          <div className="form-group">
            <label>Logo Actual</label>
            {negocio?.logo_url ? (
              <img src={negocio.logo_url} alt="Logo" style={{ width: '100px', height: '100px', borderRadius: '8px', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100px', height: '100px', borderRadius: '8px', background: 'var(--color-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '2rem' }}>🏪</span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="logo">Cambiar Logo</label>
            <input type="file" id="logo" accept="image/*" onChange={handleFileChange} className="input-file" />
          </div>

          <div className="form-group">
            <label htmlFor="nombre">Nombre del Negocio</label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              className="input"
              value={formData.nombre}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="whatsapp_number">Número de WhatsApp</label>
            <input
              type="text"
              id="whatsapp_number"
              name="whatsapp_number"
              className="input"
              value={formData.whatsapp_number}
              onChange={handleChange}
              placeholder="Ej: 71234567"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="descripcion">Descripción</label>
            <textarea
              id="descripcion"
              name="descripcion"
              className="input textarea"
              value={formData.descripcion}
              onChange={handleChange}
              rows={4}
            />
          </div>

          <div className="form-actions" style={{ marginTop: '1rem' }}>
            <button type="submit" className="btn btn--primary" disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PerfilNegocio;
