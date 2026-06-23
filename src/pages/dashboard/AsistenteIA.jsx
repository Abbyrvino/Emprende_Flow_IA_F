import { useState } from 'react';
import api from '../../services/api';

const AsistenteIA = () => {
  const [form, setForm] = useState({ nombre: '', caracteristicas: '' });
  const [resultado, setResultado] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiado, setCopiado] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResultado('');
    try {
      const { data } = await api.post('/ia/descripcion', form);
      setResultado(data.descripcion);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al conectar con el asistente de IA.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopiar = () => {
    navigator.clipboard.writeText(resultado);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  return (
    <div className="dashboard-section">
      <div className="section-header">
        <h2>🤖 Asistente de Marketing IA</h2>
      </div>

      <div className="ia-layout">
        <div className="card ia-form-card">
          <h3>Genera una descripción persuasiva</h3>
          <p className="text-muted">
            Ingresa el nombre y características de tu producto. La IA generará una descripción
            optimizada para vender más entre estudiantes universitarios.
          </p>

          <form onSubmit={handleSubmit} className="ia-form">
            <div className="form-group">
              <label htmlFor="nombre-ia">Nombre del producto *</label>
              <input
                id="nombre-ia"
                className="input"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                placeholder="Ej: Empanadas de queso artesanales"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="caracteristicas-ia">Características *</label>
              <textarea
                id="caracteristicas-ia"
                className="input textarea"
                rows={4}
                value={form.caracteristicas}
                onChange={(e) => setForm({ ...form, caracteristicas: e.target.value })}
                placeholder="Ej: Hechas a mano, masa crujiente, relleno abundante, ideales para desayuno o snack, económicas"
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn--primary btn--full"
              disabled={loading}
              id="generar-descripcion"
            >
              {loading ? '✨ Generando descripción...' : '✨ Generar con IA'}
            </button>
          </form>
        </div>

        <div className="ia-resultado">
          {loading && (
            <div className="ia-loading">
              <div className="spinner spinner--lg" />
              <p>La IA está trabajando...</p>
              <p className="text-muted">Puede tomar hasta 8 segundos</p>
            </div>
          )}

          {error && !loading && (
            <div className="alert alert--error">{error}</div>
          )}

          {resultado && !loading && (
            <div className="card ia-output">
              <div className="ia-output__header">
                <h3>Descripción generada</h3>
                <button
                  className={`btn btn--sm ${copiado ? 'btn--success' : 'btn--ghost'}`}
                  onClick={handleCopiar}
                  id="copiar-descripcion"
                >
                  {copiado ? '✓ Copiado' : '📋 Copiar'}
                </button>
              </div>
              <p className="ia-output__text">{resultado}</p>
              <p className="ia-output__hint text-muted">
                Puedes copiar esta descripción y pegarla al crear o editar tu producto.
              </p>
            </div>
          )}

          {!loading && !resultado && !error && (
            <div className="ia-placeholder">
              <div className="ia-placeholder__icon">🤖</div>
              <p>Tu descripción aparecerá aquí</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AsistenteIA;
