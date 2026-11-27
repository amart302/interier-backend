const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const { setTimeout: delay } = require('node:timers/promises');
const { test } = require('node:test');

const bcrypt = require('bcrypt');
const { PrismaPg } = require('@prisma/adapter-pg');

const { PrismaClient } = require('../dist/generated/prisma/client');

test('catalog API applies visibility and preserves product integrity', { timeout: 30_000 }, async (t) => {
  const connectionString = process.env.INTEGRATION_DATABASE_URL;
  assert.ok(connectionString, 'Set INTEGRATION_DATABASE_URL to a disposable, migrated database');
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
  t.after(() => prisma.$disconnect());

  const email = 'catalog-integration@example.com';
  const password = 'catalog-integration-password';
  await prisma.user.create({
    data: { email, password: await bcrypt.hash(password, 4), role: 'ADMIN' },
  });

  const port = process.env.INTEGRATION_API_PORT || '33019';
  const server = spawn(process.execPath, ['dist/main.js'], {
    env: {
      ...process.env,
      DATABASE_URL: connectionString,
      PORT: port,
      JWT_ACCESS_SECRET: 'catalog-integration-secret',
      JWT_ACCESS_EXPIRES_IN: '60',
      FRONTEND_URL: 'http://localhost:3000',
    },
    stdio: ['ignore', 'ignore', 'inherit'],
  });
  t.after(() => server.kill());

  const base = `http://127.0.0.1:${port}`;
  let ready = false;
  for (let attempt = 0; attempt < 30 && server.exitCode === null; attempt++) {
    ready = await fetch(`${base}/health`, { signal: AbortSignal.timeout(1000) })
      .then((response) => response.ok, () => false);
    if (ready) break;
    await delay(250);
  }
  assert.ok(ready, 'Expected healthy API and database');

  let token;
  async function request(method, path, status, body, authenticated = true) {
    const response = await fetch(base + path, {
      method,
      headers: {
        ...(body !== undefined && { 'Content-Type': 'application/json' }),
        ...(authenticated && token && { Authorization: `Bearer ${token}` }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(3000),
    });
    const result = await response.json();
    assert.equal(response.status, status, `${method} ${path}: ${JSON.stringify(result)}`);
    return result.data;
  }

  ({ accessToken: token } = await request('POST', '/auth/login', 200, { email, password }));
  await request('GET', '/admin/products', 401, undefined, false);
  const lights = await request('POST', '/categories', 201, { name: 'Свет', slug: 'svet' });
  const outlet = await request('POST', '/categories', 201, { name: 'Уценка', slug: 'utsenka' });
  const subcategory = await request('POST', '/categories/svet/subcategories', 201, {
    name: 'Люстры', slug: 'lyustry',
  });
  const product = await request('POST', '/products', 201, {
    name: 'Люстра', categoryId: lights.id, subcategoryId: subcategory.id,
    sourceUrl: 'https://example.com/lamp', price: 1500,
  });
  const discounted = await request('POST', '/products', 201, {
    name: 'Настольная лампа', categoryId: outlet.id, sourceUrl: 'https://example.com/outlet-lamp',
  });
  await request('PATCH', `/categories/${outlet.id}`, 200, { slug: 'outlet' });
  await request('GET', `/products/${discounted.id}`, 404);
  await request('GET', `/admin/products/${discounted.id}`, 200);
  await assert.rejects(
    prisma.product.update({ where: { id: product.id }, data: { categoryId: outlet.id } }),
    { code: 'P2003' },
  );

  const saved = await request('PATCH', `/admin/products/${product.id}`, 200, {
    price: 1350.25, oldPrice: 1500.5, description: 'Новая карточка',
  });
  assert.equal(saved.price, 1350.25);
  assert.equal(saved.oldPrice, 1500.5);
  assert.equal(saved.description, 'Новая карточка');
  await request('PATCH', `/admin/products/${product.id}`, 400, { price: 1600 });
  await request('PATCH', `/admin/products/${product.id}`, 400, { price: 1e-7 });
  assert.equal((await request('GET', `/products/${product.id}`, 200)).price, 1350.25);
  assert.equal((await request('GET', '/products?page=1&limit=1', 200)).meta.total, 1);
  await request('PATCH', `/admin/products/${product.id}`, 200, { isHidden: true });
  assert.equal((await request('GET', '/products?page=1&limit=1', 200)).meta.total, 0);
  assert.equal((await request('GET', '/admin/products?page=1&limit=1', 200)).meta.total, 2);
  await request('GET', `/products/${product.id}`, 404);
  await request('GET', '/products?page=1000000000000', 400);
  await request('GET', '/products/2147483648', 400);
});
