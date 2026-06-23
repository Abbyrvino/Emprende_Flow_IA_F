import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/layout/Navbar';

const WHATSAPP_REGEX = /^[0-9]{7,15}$/;

const NegocioSetup = () => {
  const [paso, setPaso] = useState(1);
  const [form, setForm] = useState({
    whatsapp_number: '',
    nombre_negocio: '',
    descripcion: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, actualizarUsuario } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!WHATSAPP_REGEX.test(form.whatsapp_number)) {
      return setError('Número de WhatsApp inválido. Solo dígitos, entre 7 y 15. Ej: 59171234567');
    }

    setLoading(true);
    try {
      const { data } = await api.post(`/usuarios/${user.id}/crear-negocio`, form);
      actualizarUsuario(data.usuario, data.token);
      navigate('/dashboard/inventario');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear el negocio.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-layout">
      <Navbar />
      <main className="page-content">
        <div className="setup-container">
          <div className="setup-header">
            <h1>🚀 Conviértete en Emprendedor</h1>
            <p>Crea tu negocio en EMPRENDE-FLOW IA y empieza a vender en el campus</p>
          </div>

          <div className="setup-steps">
            <div className={`step ${paso >= 1 ? 'step--active' : ''}`}>
              <div className="step-number">1</div>
              <span>WhatsApp</span>
            </div>
            <div className="step-line" />
            <div className={`step ${paso >= 2 ? 'step--active' : ''}`}>
              <div className="step-number">2</div>
              <span>Tu Negocio</span>
            </div>
          </div>

          <form className="setup-form card" onSubmit={handleSubmit}>
            {error && <div className="alert alert--error">{error}</div>}

            {paso === 1 && (
              <div className="setup-step-content">
                <h2>Número de WhatsApp</h2>
                <p>Los clientes te contactarán aquí para confirmar pedidos.</p>
                <div className="form-group">
                  <label htmlFor="whatsapp_number">Número (sin + ni espacios)</label>
                  <input
                    id="whatsapp_number"
                    type="text"
                    name="whatsapp_number"
                    className="input"
                    placeholder="Ej: 59171234567"
                    value={form.whatsapp_number}
                    onChange={handleChange}
                    required
                  />
                  <small>Incluye el código de país. Bolivia: 591</small>
                </div>
                <button
                  type="button"
                  className="btn btn--primary btn--full"
                  onClick={() => {
                    if (!WHATSAPP_REGEX.test(form.whatsapp_number)) {
                      return setError('Número inválido.');
                    }
                    setError('');
                    setPaso(2);
                  }}
                >
                  Continuar →
                </button>
              </div>
            )}

            {paso === 2 && (
              <div className="setup-step-content">
                <h2>Datos de tu Negocio</h2>
                <div className="form-group">
                  <label htmlFor="nombre_negocio">Nombre del negocio</label>
                  <input
                    id="nombre_negocio"
                    type="text"
                    name="nombre_negocio"
                    className="input"
                    placeholder="Ej: Artesanías Carla"
                    value={form.nombre_negocio}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="descripcion">Descripción (opcional)</label>
                  <textarea
                    id="descripcion"
                    name="descripcion"
                    className="input textarea"
                    placeholder="Cuéntales a tus clientes de qué trata tu negocio..."
                    value={form.descripcion}
                    onChange={handleChange}
                    rows={3}
                  />
                </div>
                <div className="setup-actions">
                  <button
                    type="button"
                    className="btn btn--ghost"
                    onClick={() => setPaso(1)}
                  >
                    ← Atrás
                  </button>
                  <button
                    type="submit"
                    className="btn btn--primary"
                    disabled={loading}
                  >
                    {loading ? 'Creando...' : '🚀 Crear mi Negocio'}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </main>
    </div>
  );
};

export default NegocioSetup;
