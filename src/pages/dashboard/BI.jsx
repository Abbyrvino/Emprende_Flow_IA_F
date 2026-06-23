import { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import api from '../../services/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

const PERIODOS = [
  { value: 'semana', label: 'Esta semana' },
  { value: 'mes', label: 'Este mes' },
  { value: 'trimestre', label: 'Trimestre' },
  { value: 'todo', label: 'Todo' },
];

const FESTIVIDADES = [
  { value: '', label: 'Seleccionar Temporada/Evento...' },
  { value: 'carnaval', label: 'Carnaval (Feb-Mar)' },
  { value: 'dia_padre', label: 'Día del Padre (Marzo)' },
  { value: 'dia_madre', label: 'Día de la Madre (Mayo)' },
  { value: 'dia_maestro', label: 'Día del Maestro (Junio)' },
  { value: 'primavera_amor', label: 'Estudiante / Amor (Sept)' },
  { value: 'navidad', label: 'Navidad (Diciembre)' },
];

const BI = () => {
  const [periodo, setPeriodo] = useState('mes');
  const [resumen, setResumen] = useState(null);
  const [ventasPeriodo, setVentasPeriodo] = useState([]);
  const [topProductos, setTopProductos] = useState([]);
  const [loading, setLoading] = useState(true);

  const cargar = async () => {
    setLoading(true);
    try {
      const [resRes, ventRes, topRes] = await Promise.all([
        api.get(`/bi/resumen?periodo=${periodo}`),
        api.get(`/bi/ventas-por-periodo?periodo=${periodo}`),
        api.get(`/bi/top-productos?periodo=${periodo}`),
      ]);
      setResumen(resRes.data.resumen);
      setVentasPeriodo(ventRes.data.datos);
      setTopProductos(topRes.data.datos);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, [periodo]);

  const lineData = {
    labels: ventasPeriodo.map((d) => d.fecha),
    datasets: [
      {
        label: 'Ingresos (Bs.)',
        data: ventasPeriodo.map((d) => d.ingresos),
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99,102,241,0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Nº Ventas',
        data: ventasPeriodo.map((d) => d.total_ventas),
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245,158,11,0.1)',
        fill: false,
        tension: 0.4,
        yAxisID: 'y1',
      },
    ],
  };

  const barData = {
    labels: topProductos.map((d) => d.producto?.nombre || ''),
    datasets: [
      {
        label: 'Unidades vendidas',
        data: topProductos.map((d) => parseInt(d.total_vendido)),
        backgroundColor: 'rgba(99,102,241,0.8)',
        borderRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: { legend: { position: 'top' } },
    scales: {
      y: { beginAtZero: true },
    },
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="dashboard-section">
      <div className="section-header">
        <h2>📊 Analytics BI</h2>
        <div className="filtros-bi" style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="periodo-tabs">
            {PERIODOS.map((p) => (
              <button
                key={p.value}
                className={`tab ${periodo === p.value ? 'tab--active' : ''}`}
                onClick={() => setPeriodo(p.value)}
                id={`periodo-${p.value}`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <select 
            value={FESTIVIDADES.some(f => f.value === periodo) ? periodo : ''}
            onChange={(e) => {
              if (e.target.value) setPeriodo(e.target.value);
            }}
            style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', backgroundColor: '#fff', fontSize: '14px', color: '#333', cursor: 'pointer', outline: 'none' }}
          >
            {FESTIVIDADES.map(f => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tarjetas de resumen */}
      {resumen && (
        <div className="bi-cards">
          <div className="bi-card bi-card--green">
            <div className="bi-card__icon">✅</div>
            <div>
              <div className="bi-card__value">{resumen.total_ventas_confirmadas}</div>
              <div className="bi-card__label">Ventas Confirmadas</div>
            </div>
          </div>
          <div className="bi-card bi-card--blue">
            <div className="bi-card__icon">💰</div>
            <div>
              <div className="bi-card__value">Bs. {resumen.ingresos_totales.toFixed(2)}</div>
              <div className="bi-card__label">Ingresos Totales</div>
            </div>
          </div>
          <div className="bi-card bi-card--yellow">
            <div className="bi-card__icon">⏳</div>
            <div>
              <div className="bi-card__value">{resumen.ventas_pendientes}</div>
              <div className="bi-card__label">Pendientes</div>
            </div>
          </div>
        </div>
      )}

      {/* Gráfico de tendencia */}
      <div className="chart-card">
        <h3>Tendencia de Ventas</h3>
        {ventasPeriodo.length > 0 ? (
          <Line data={lineData} options={{ ...chartOptions, scales: { y: { beginAtZero: true }, y1: { position: 'right', beginAtZero: true } } }} />
        ) : (
          <div className="empty-state">Sin datos para este periodo.</div>
        )}
      </div>

      {/* Gráfico de top productos */}
      <div className="chart-card">
        <h3>Top 10 Productos Más Vendidos</h3>
        {topProductos.length > 0 ? (
          <Bar data={barData} options={chartOptions} />
        ) : (
          <div className="empty-state">Sin ventas confirmadas aún.</div>
        )}
      </div>
    </div>
  );
};

export default BI;
