import { useState, useEffect, useRef, useCallback } from 'react';
import * as api from '../services/api';
import ProductCard from '../components/ProductCard';
import ProductModal from '../components/ProductModal';

function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalProduct, setModalProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const debounceRef = useRef(null);

  const fetchProducts = useCallback((searchVal, catId) => {
    setLoading(true);
    const params = { limit: 100 };
    if (searchVal) params.search = searchVal;
    if (catId) params.category_id = catId;
    api.getProducts(params)
      .then((data) => setProducts(data.products))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    api.getCategories().then(setCategories);
    fetchProducts('', '');
  }, [fetchProducts]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchProducts(val, categoryId), 300);
  };

  const handleCategoryChange = (e) => {
    const val = e.target.value;
    setCategoryId(val);
    fetchProducts(search, val);
  };

  const handleDelete = async (id) => {
    await api.deleteProduct(id);
    fetchProducts(search, categoryId);
  };

  const openCreate = () => {
    setModalProduct(null);
    setShowModal(true);
  };

  const openEdit = (product) => {
    setModalProduct(product);
    setShowModal(true);
  };

  const handleModalSaved = () => {
    setShowModal(false);
    fetchProducts(search, categoryId);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{ margin: 0 }}>Products</h1>
        <button className="btn btn-primary" onClick={openCreate}>Add Product</button>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={handleSearchChange}
          style={{ maxWidth: 300 }}
        />
        <select value={categoryId} onChange={handleCategoryChange} style={{ maxWidth: 200 }}>
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Loading products...</p>
      ) : products.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem', color: 'var(--text-muted)' }}>
          {search || categoryId ? 'No products match your filters.' : 'No products yet. Add your first product to get started.'}
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1rem',
        }}>
          {products.map((p) => (
            <ProductCard key={p.id} product={p} onEdit={openEdit} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {showModal && (
        <ProductModal
          product={modalProduct}
          categories={categories}
          onClose={() => setShowModal(false)}
          onSaved={handleModalSaved}
        />
      )}
    </div>
  );
}

export default Products;
