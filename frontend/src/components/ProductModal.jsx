import { useState, useEffect } from 'react';
import * as api from '../services/api';

const initialForm = {
  name: '',
  sku: '',
  category_id: '',
  price: '',
  quantity: '',
  low_stock_threshold: '10',
  description: '',
};

function ProductModal({ product, categories, onClose, onSaved }) {
  const isEdit = Boolean(product);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name,
        sku: product.sku,
        category_id: product.category_id ?? '',
        price: product.price,
        quantity: product.quantity,
        low_stock_threshold: product.low_stock_threshold,
        description: product.description || '',
      });
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.sku.trim()) errs.sku = 'SKU is required';
    if (form.price === '' || Number(form.price) <= 0) errs.price = 'Price must be a positive number';
    if (form.quantity === '' || Number(form.quantity) < 0 || !Number.isInteger(Number(form.quantity)))
      errs.quantity = 'Quantity must be a non-negative integer';
    if (form.low_stock_threshold !== '' && (Number(form.low_stock_threshold) < 0 || !Number.isInteger(Number(form.low_stock_threshold))))
      errs.low_stock_threshold = 'Threshold must be a non-negative integer';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSubmitting(true);
    const payload = {
      name: form.name.trim(),
      sku: form.sku.trim(),
      category_id: form.category_id || null,
      price: Number(form.price),
      quantity: Number(form.quantity),
      low_stock_threshold: Number(form.low_stock_threshold) || 10,
      description: form.description.trim() || null,
    };

    try {
      if (isEdit) {
        await api.updateProduct(product.id, payload);
      } else {
        await api.createProduct(payload);
      }
      onSaved();
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Save failed';
      setErrors({ _form: msg });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div onClick={onClose} style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem',
    }}>
      <div onClick={(e) => e.stopPropagation()} className="card" style={{
        width: '100%',
        maxWidth: 500,
        maxHeight: '90vh',
        overflowY: 'auto',
      }}>
        <h2 style={{ marginBottom: '1.25rem' }}>{isEdit ? 'Edit Product' : 'Add Product'}</h2>

        {errors._form && (
          <p style={{ color: 'var(--danger)', marginBottom: '1rem', fontSize: '0.875rem' }}>{errors._form}</p>
        )}

        <form onSubmit={handleSubmit}>
          <Field label="Name" name="name" value={form.name} onChange={handleChange} error={errors.name} required />
          <Field label="SKU" name="sku" value={form.sku} onChange={handleChange} error={errors.sku} required />

          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="category_id">Category</label>
            <select id="category_id" name="category_id" value={form.category_id} onChange={handleChange}>
              <option value="">No category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Field label="Price" name="price" type="number" step="0.01" min="0" value={form.price} onChange={handleChange} error={errors.price} required />
            <Field label="Quantity" name="quantity" type="number" min="0" step="1" value={form.quantity} onChange={handleChange} error={errors.quantity} required />
          </div>

          <Field label="Low Stock Threshold" name="low_stock_threshold" type="number" min="0" step="1" value={form.low_stock_threshold} onChange={handleChange} error={errors.low_stock_threshold} />

          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="description">Description</label>
            <textarea id="description" name="description" value={form.description} onChange={handleChange} rows={3} />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : isEdit ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, name, error, ...props }) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <label htmlFor={name}>{label}</label>
      <input id={name} name={name} {...props} />
      {error && <p style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '0.25rem' }}>{error}</p>}
    </div>
  );
}

export default ProductModal;
