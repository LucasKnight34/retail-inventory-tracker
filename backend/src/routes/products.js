const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const createValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('sku').notEmpty().withMessage('SKU is required'),
  body('price').isFloat({ gt: 0 }).withMessage('Price must be a positive number'),
  body('quantity').optional().isInt({ min: 0 }).withMessage('Quantity must be >= 0'),
  body('category_id').optional({ values: 'null' }).isInt().withMessage('Category ID must be an integer'),
  validate,
];

const updateValidation = [
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('sku').optional().notEmpty().withMessage('SKU cannot be empty'),
  body('price').optional().isFloat({ gt: 0 }).withMessage('Price must be a positive number'),
  body('quantity').optional().isInt({ min: 0 }).withMessage('Quantity must be >= 0'),
  body('category_id').optional({ values: 'null' }).isInt().withMessage('Category ID must be an integer'),
  validate,
];

router.get('/stats/summary', async (req, res, next) => {
  try {
    const result = await db.query(`
      SELECT
        COUNT(*)::int AS total_products,
        COALESCE(SUM(price * quantity), 0) AS total_inventory_value,
        COUNT(*) FILTER (WHERE quantity < low_stock_threshold)::int AS low_stock_count,
        COUNT(*) FILTER (WHERE quantity = 0)::int AS out_of_stock_count
      FROM products
    `);
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const { search, category_id, low_stock, page = 1, limit = 20 } = req.query;
    const conditions = [];
    const params = [];
    let paramIndex = 1;

    if (search) {
      conditions.push(`p.name ILIKE $${paramIndex++}`);
      params.push(`%${search}%`);
    }

    if (category_id) {
      conditions.push(`p.category_id = $${paramIndex++}`);
      params.push(category_id);
    }

    if (low_stock === 'true') {
      conditions.push('p.quantity < p.low_stock_threshold');
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const countResult = await db.query(
      `SELECT COUNT(*)::int AS total FROM products p ${where}`,
      params
    );

    params.push(parseInt(limit));
    params.push(offset);

    const result = await db.query(
      `SELECT p.*, c.name AS category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       ${where}
       ORDER BY p.id
       LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
      params
    );

    res.json({
      products: result.rows,
      total: countResult.rows[0].total,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT p.*, c.name AS category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      const error = new Error('Product not found');
      error.status = 404;
      throw error;
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.post('/', auth, createValidation, async (req, res, next) => {
  try {
    const { name, sku, category_id, price, quantity = 0, low_stock_threshold = 10, description } = req.body;

    const existing = await db.query('SELECT id FROM products WHERE sku = $1', [sku]);
    if (existing.rows.length > 0) {
      const error = new Error('A product with this SKU already exists');
      error.status = 409;
      throw error;
    }

    const result = await db.query(
      `INSERT INTO products (name, sku, category_id, price, quantity, low_stock_threshold, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [name, sku, category_id || null, price, quantity, low_stock_threshold, description || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', auth, updateValidation, async (req, res, next) => {
  try {
    const { id } = req.params;
    const fields = ['name', 'sku', 'category_id', 'price', 'quantity', 'low_stock_threshold', 'description'];
    const updates = [];
    const params = [];
    let paramIndex = 1;

    for (const field of fields) {
      if (req.body[field] !== undefined) {
        updates.push(`${field} = $${paramIndex++}`);
        params.push(req.body[field]);
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    if (req.body.sku) {
      const existing = await db.query('SELECT id FROM products WHERE sku = $1 AND id != $2', [req.body.sku, id]);
      if (existing.rows.length > 0) {
        const error = new Error('A product with this SKU already exists');
        error.status = 409;
        throw error;
      }
    }

    params.push(id);
    const result = await db.query(
      `UPDATE products SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      params
    );

    if (result.rows.length === 0) {
      const error = new Error('Product not found');
      error.status = 404;
      throw error;
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', auth, async (req, res, next) => {
  try {
    const result = await db.query('DELETE FROM products WHERE id = $1 RETURNING id', [req.params.id]);

    if (result.rows.length === 0) {
      const error = new Error('Product not found');
      error.status = 404;
      throw error;
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
