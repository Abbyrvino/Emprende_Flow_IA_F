import { useState, useEffect } from 'react';
import api from '../../services/api';

const Catalogo = () => {
  const [catalogos, setCatalogos] = useState([]);
  const [generando, setGenerando] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [procesandoId, setProcesandoId] = useState(null);

  const cargar = async () => {
    try {
      const { data } = await api.get('/catalogos');
      setCatalogos(data.catalogos);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const handleGenerar = async () => {
    setGenerando(true);
    setError('');
    try {
      await api.post('/catalogos/generar');
      cargar();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al generar el catálogo.');
    } finally {
      setGenerando(false);
    }
  };

  const archivoCatalogo = (catalogo) => {
    const base = (catalogo.nombre || `catalogo-${catalogo.id}`)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase();
    return `${base || `catalogo-${catalogo.id}`}.pdf`;
  };

  const handleDescargar = async (catalogo) => {
    setProcesandoId(catalogo.id);
    setError('');

    try {
      const { data } = await api.get(`/catalogos/${catalogo.id}/descargar`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([data], { type: 'application/pdf' }));
      const link = document.createElement('a');

      link.href = url;
      link.download = archivoCatalogo(catalogo);

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err?.response?.data?.error || 'Error al descargar el catálogo.');
    } finally {
      setProcesandoId(null);
    }
  };

  const handleEliminar = async (catalogo) => {
    const confirmar = window.confirm(`¿Eliminar ${catalogo.nombre || `Catálogo #${catalogo.id}`}?`);
    if (!confirmar) return;

    setProcesandoId(catalogo.id);
    setError('');

    try {
      await api.delete(`/catalogos/${catalogo.id}`);
      setCatalogos((actuales) => actuales.filter((item) => item.id !== catalogo.id));
    } catch (err) {
      setError(err.response?.data?.error || 'Error al eliminar el catálogo.');
    } finally {
      setProcesandoId(null);
    }
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="dashboard-section">
      <div className="section-header">
        <h2>📄 Catálogos PDF</h2>
        <button
          className="btn btn--primary"
          onClick={handleGenerar}
          disabled={generando}
          id="generar-catalogo"
        >
          {generando ? '⏳ Generando PDF...' : '✨ Generar Catálogo'}
        </button>
      </div>

      {error && <div className="alert alert--error">{error}</div>}

      <div className="catalogo-info card">
        <p>
          El catálogo PDF se genera automáticamente con todos tus productos activos en una grilla de 2 columnas
          con imagen, nombre y precio. Se sube a la nube y puedes compartirlo con tus clientes.
        </p>
      </div>

      {catalogos.length === 0 ? (
        <div className="empty-state">
          <p>Aún no has generado catálogos. Presiona el botón para crear tu primer PDF.</p>
        </div>
      ) : (
        <div className="catalogos-list">
          {catalogos.map((c) => (
            <div key={c.id} className="catalogo-item">
              <div className="catalogo-item__info">
                <div className="catalogo-item__icon">📄</div>
                <div>
                  <strong>{c.nombre || `Catálogo #${c.id}`}</strong>
                  <br />
                  <small className="text-muted">
                    {new Date(c.createdAt).toLocaleString('es-BO')}
                  </small>
                </div>
              </div>
              <div className="catalogo-item__actions">
                <button
                  type="button"
                  className="btn btn--primary btn--sm"
                  id={`descargar-catalogo-${c.id}`}
                  onClick={() => handleDescargar(c)}
                  disabled={procesandoId === c.id}
                >
                  {procesandoId === c.id ? 'Procesando...' : '⬇️ Descargar PDF'}
                </button>

                <button
                  type="button"
                  className="btn btn--danger btn--sm"
                  onClick={() => handleEliminar(c)}
                  disabled={procesandoId === c.id}
                  aria-label={`Eliminar ${c.nombre || `catálogo ${c.id}`}`}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Catalogo;
