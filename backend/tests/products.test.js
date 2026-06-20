const request = require('supertest');
const { db, createTables, dropTables, closeDb } = require('./setup');
const app = require('../src/app');

let token;

beforeAll(async () => {
  await dropTables();
  await createTables();

  await db.query(`
    INSERT INTO categories (id, name, description) VALUES
      (1, 'Lumber', 'Wood products'),
      (2, 'Tools', 'Hand and power tools')
  `);

  await db.query(`
    INSERT INTO products (id, name, sku, category_id, price, quantity, low_stock_threshold, description) VALUES
      (1, '2x4 Lumber 8ft', 'LUM-2X4-8FT', 1, 5.98, 342, 50, 'Kiln-dried lumber'),
      (2, 'Plywood Sheet', 'LUM-PLY-3/4', 1, 52.99, 78, 20, 'Sanded pine plywood'),
      (3, 'Tape Measure 25ft', 'TLS-TAP-25', 2, 12.97, 2, 20, 'Heavy duty tape measure'),
      (4, 'Cordless Drill', 'TLS-DRL-20V', 2, 129.00, 0, 8, 'Brushless cordless drill')
  `);

  const res = await request(app)
    .post('/api/auth/register')
    .send({ email: 'admin@test.com', password: 'password123' });
  token = res.body.token;
});

afterAll(async () => {
  await dropTables();
  await closeDb();
});

describe('GET /api/products', () => {
  it('returns 200 and a paginated product list', async () => {
    const res = await request(app).get('/api/products');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.products)).toBe(true);
    expect(res.body.total).toBe(4);
    expect(res.body.products[0].category_name).toBeDefined();
  });

  it('filters by search term', async () => {
    const res = await request(app).get('/api/products?search=lumber');

    expect(res.status).toBe(200);
    expect(res.body.products.length).toBe(1);
    expect(res.body.products[0].name).toMatch(/lumber/i);
  });

  it('filters by low_stock', async () => {
    const res = await request(app).get('/api/products?low_stock=true');

    expect(res.status).toBe(200);
    res.body.products.forEach((p) => {
      expect(p.quantity).toBeLessThan(p.low_stock_threshold);
    });
    expect(res.body.products.length).toBe(2);
  });
});

describe('GET /api/products/stats/summary', () => {
  it('returns inventory summary stats', async () => {
    const res = await request(app).get('/api/products/stats/summary');

    expect(res.status).toBe(200);
    expect(res.body.total_products).toBe(4);
    expect(Number(res.body.total_inventory_value)).toBeGreaterThan(0);
    expect(res.body.low_stock_count).toBe(2);
    expect(res.body.out_of_stock_count).toBe(1);
  });
});

describe('GET /api/products/:id', () => {
  it('returns 200 and a product with valid id', async () => {
    const res = await request(app).get('/api/products/1');

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('2x4 Lumber 8ft');
    expect(res.body.category_name).toBe('Lumber');
  });

  it('returns 404 with invalid id', async () => {
    const res = await request(app).get('/api/products/9999');

    expect(res.status).toBe(404);
  });
});

describe('POST /api/products', () => {
  it('returns 401 without auth', async () => {
    const res = await request(app)
      .post('/api/products')
      .send({ name: 'Test', sku: 'TST-001', price: 9.99 });

    expect(res.status).toBe(401);
  });

  it('returns 201 with auth and valid body', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'New Product', sku: 'NEW-001', price: 19.99, quantity: 50 });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe('New Product');
    expect(res.body.sku).toBe('NEW-001');
  });

  it('returns 400 with missing name', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${token}`)
      .send({ sku: 'NO-NAME', price: 9.99 });

    expect(res.status).toBe(400);
  });
});

describe('PUT /api/products/:id', () => {
  it('updates the product and returns 200', async () => {
    const res = await request(app)
      .put('/api/products/1')
      .set('Authorization', `Bearer ${token}`)
      .send({ price: 6.99 });

    expect(res.status).toBe(200);
    expect(Number(res.body.price)).toBe(6.99);
    expect(res.body.name).toBe('2x4 Lumber 8ft');
  });

  it('returns 401 without auth', async () => {
    const res = await request(app)
      .put('/api/products/1')
      .send({ price: 6.99 });

    expect(res.status).toBe(401);
  });
});

describe('DELETE /api/products/:id', () => {
  it('returns 204 with auth', async () => {
    const res = await request(app)
      .delete('/api/products/4')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(204);
  });

  it('returns 404 for already deleted product', async () => {
    const res = await request(app)
      .delete('/api/products/4')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
  });

  it('returns 401 without auth', async () => {
    const res = await request(app).delete('/api/products/1');

    expect(res.status).toBe(401);
  });
});
