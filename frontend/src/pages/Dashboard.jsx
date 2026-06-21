import { useState, useEffect } from 'react';
import * as api from '../services/api';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getProductStats(),
      api.getProducts({ low_stock: 'true', limit: 100 }),
    ])
      .then(([statsData, productsData]) => {
        setStats(statsData);
        setLowStock(productsData.products);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p style={{ color: 'var(--text-muted)' }}>Loading dashboard...</p>;
  }

  return (
    <div>
      <h1 style={{ marginBottom: '1.5rem' }}>Dashboard</h1>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem',
      }}>
        <StatCard label="Total Products" value={stats.total_products} />
        <StatCard
          label="Total Inventory Value"
          value={formatCurrency(stats.total_inventory_value)}
        />
        <StatCard
          label="Low Stock Items"
          value={stats.low_stock_count}
          color={stats.low_stock_count > 0 ? 'var(--warning)' : undefined}
        />
        <StatCard
          label="Out of Stock Items"
          value={stats.out_of_stock_count}
          color={stats.out_of_stock_count > 0 ? 'var(--danger)' : undefined}
        />
      </div>

      <div className="card">
        <h2 style={{ marginBottom: '1rem' }}>Low Stock Alerts</h2>
        {lowStock.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>All products are sufficiently stocked.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Product', 'SKU', 'Category', 'Quantity', 'Threshold'].map((h) => (
                    <th key={h} style={{
                      textAlign: 'left',
                      padding: '0.5rem 0.75rem',
                      borderBottom: '2px solid var(--border)',
                      fontSize: '0.8125rem',
                      color: 'var(--text-muted)',
                      fontWeight: 600,
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {lowStock.map((p) => (
                  <tr key={p.id}>
                    <td style={cellStyle}>{p.name}</td>
                    <td style={{ ...cellStyle, fontFamily: 'monospace', fontSize: '0.8125rem' }}>{p.sku}</td>
                    <td style={cellStyle}>{p.category_name || '—'}</td>
                    <td style={{
                      ...cellStyle,
                      color: p.quantity === 0 ? 'var(--danger)' : 'var(--warning)',
                      fontWeight: 600,
                    }}>{p.quantity}</td>
                    <td style={cellStyle}>{p.low_stock_threshold}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const cellStyle = {
  padding: '0.5rem 0.75rem',
  borderBottom: '1px solid var(--border)',
  fontSize: '0.875rem',
};

function StatCard({ label, value, color }) {
  return (
    <div className="card" style={{ textAlign: 'center' }}>
      <div style={{
        fontSize: '1.75rem',
        fontWeight: 700,
        color: color || 'var(--text)',
        marginBottom: '0.25rem',
      }}>{value}</div>
      <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{label}</div>
    </div>
  );
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

export default Dashboard;
