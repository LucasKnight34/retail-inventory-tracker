const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../db');

const router = express.Router();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const categoryValidation = [
  body('name').notEmpty().withMessage('Category name is required'),
  validate,
];

router.get('/', async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT c.*,
        (SELECT COUNT(*)::int FROM products WHERE category_id = c.id) AS product_count
       FROM categories c
       ORDER BY c.name`
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const result = await db.query('SELECT * FROM categories WHERE id = $1', [req.params.id]);

    if (result.rows.length === 0) {
      const error = new Error('Category not found');
      error.status = 404;
      throw error;
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.post('/', categoryValidation, async (req, res, next) => {
  try {
    const { name, description } = req.body;

    const existing = await db.query('SELECT id FROM categories WHERE name = $1', [name]);
    if (existing.rows.length > 0) {
      const error = new Error('A category with this name already exists');
      error.status = 409;
      throw error;
    }

    const result = await db.query(
      'INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING *',
      [name, description || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', categoryValidation, async (req, res, next) => {
  try {
    const { name, description } = req.body;

    const existing = await db.query('SELECT id FROM categories WHERE name = $1 AND id != $2', [name, req.params.id]);
    if (existing.rows.length > 0) {
      const error = new Error('A category with this name already exists');
      error.status = 409;
      throw error;
    }

    const result = await db.query(
      'UPDATE categories SET name = $1, description = $2 WHERE id = $3 RETURNING *',
      [name, description || null, req.params.id]
    );

    if (result.rows.length === 0) {
      const error = new Error('Category not found');
      error.status = 404;
      throw error;
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const products = await db.query('SELECT COUNT(*)::int AS count FROM products WHERE category_id = $1', [req.params.id]);

    if (products.rows[0].count > 0) {
      const error = new Error('Cannot delete category with associated products');
      error.status = 409;
      throw error;
    }

    const result = await db.query('DELETE FROM categories WHERE id = $1 RETURNING id', [req.params.id]);

    if (result.rows.length === 0) {
      const error = new Error('Category not found');
      error.status = 404;
      throw error;
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
