function ProductCard({ product, onEdit, onDelete }) {
  const isLowStock = product.quantity > 0 && product.quantity < product.low_stock_threshold;
  const isOutOfStock = product.quantity === 0;

  const handleDelete = () => {
    if (window.confirm(`Delete "${product.name}"? This cannot be undone.`)) {
      onDelete(product.id);
    }
  };

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>{product.name}</h3>
        <div style={{ display: 'flex', gap: '0.25rem', flexShrink: 0 }}>
          {isOutOfStock && <Badge label="Out of Stock" color="var(--danger)" />}
          {isLowStock && <Badge label="Low Stock" color="var(--warning)" />}
        </div>
      </div>

      <div style={{ fontSize: '0.8125rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
        {product.sku}
      </div>

      {product.category_name && (
        <span style={{
          display: 'inline-block',
          alignSelf: 'flex-start',
          padding: '0.125rem 0.5rem',
          fontSize: '0.75rem',
          fontWeight: 500,
          background: 'var(--bg)',
          border: '1px solid var(--border)',
          borderRadius: '9999px',
          color: 'var(--text-muted)',
        }}>{product.category_name}</span>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ fontSize: '1.125rem', fontWeight: 600 }}>
          {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(product.price)}
        </span>
        <span style={{
          fontSize: '0.875rem',
          color: isOutOfStock ? 'var(--danger)' : isLowStock ? 'var(--warning)' : 'var(--text-muted)',
          fontWeight: isOutOfStock || isLowStock ? 600 : 400,
        }}>
          Qty: {product.quantity}
        </span>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
        <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => onEdit(product)}>
          Edit
        </button>
        <button className="btn btn-danger" style={{ flex: 1 }} onClick={handleDelete}>
          Delete
        </button>
      </div>
    </div>
  );
}

function Badge({ label, color }) {
  return (
    <span style={{
      padding: '0.125rem 0.5rem',
      fontSize: '0.6875rem',
      fontWeight: 600,
      color: '#fff',
      background: color,
      borderRadius: '9999px',
      whiteSpace: 'nowrap',
    }}>{label}</span>
  );
}

export default ProductCard;
