'use strict';

const CONFIG = { url: 'https://zfqnomvcnxzkwfxasuij.supabase.co', key: 'sb_publishable_J7xVB3foL3WuWj2U0gD8bQ_rJD6eGKH' };
const sessionKey = 'optimind-admin-session';
let session = null, member = null, currentStore = null, categories = [], products = [], availableStores = [];
const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];

function note(message) { const element = $('[data-notice]'); element.hidden = !message; element.textContent = message || ''; }
function escapeHtml(value) { return String(value ?? '').replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character])); }
function headers(extra = {}) { return { apikey: CONFIG.key, Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json', Prefer: 'return=representation', ...extra }; }
function saveSession(value) { session = value; localStorage.setItem(sessionKey, JSON.stringify(value)); }
function slugify(value) { return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''); }

async function api(path, options = {}) {
  const response = await fetch(`${CONFIG.url}/rest/v1/${path}`, { ...options, headers: headers(options.headers) });
  if (!response.ok) throw new Error((await response.text()) || 'No se pudo completar la acción.');
  return response.status === 204 ? null : response.json();
}

async function login(email, password) {
  const response = await fetch(`${CONFIG.url}/auth/v1/token?grant_type=password`, {
    method: 'POST', headers: { apikey: CONFIG.key, 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password })
  });
  if (!response.ok) throw new Error('Email o contraseña incorrectos.');
  saveSession(await response.json());
}

async function getUser() {
  const response = await fetch(`${CONFIG.url}/auth/v1/user`, { headers: headers() });
  if (!response.ok) throw new Error('Tu sesión venció. Volvé a ingresar con tu contraseña.');
  return response.json();
}

async function loadMembership(user) {
  const rows = await api(`store_members?user_id=eq.${encodeURIComponent(user.id)}&select=store_id,role,stores(id,slug,name,plan,is_active)`);
  if (!rows.length) throw new Error('Tu cuenta existe, pero todavía no tiene acceso a una tienda.');
  member = rows.find(row => row.role === 'platform_admin') || rows[0];
  availableStores = rows.map(row => ({ ...row.stores, role: row.role }));
  if (member.role === 'platform_admin') availableStores = (await api('stores?is_active=eq.true&select=id,slug,name,plan,is_active&order=created_at.asc')).map(store => ({ ...store, role: 'platform_admin' }));
  currentStore = availableStores[0];
  const storeOptions = availableStores.map(store => `<option value="${store.id}">${escapeHtml(store.name)}</option>`).join('');
  const selector = $('[data-store-select]'); selector.innerHTML = storeOptions; selector.value = currentStore.id; selector.disabled = member.role !== 'platform_admin' || availableStores.length < 2;
  const memberStore = $('[data-member-store]'); if (memberStore) memberStore.innerHTML = storeOptions;
  $$('[data-admin-only]').forEach(element => { element.hidden = member.role !== 'platform_admin'; });
  $('[data-role-label]').textContent = member.role === 'platform_admin' ? 'Administración OptiMind' : 'Panel de tienda';
  $('[data-store-name]').textContent = currentStore.name;
}

async function loadData() {
  if (!currentStore) return;
  [categories, products] = await Promise.all([
    api(`categories?store_id=eq.${currentStore.id}&select=*&order=position.asc`),
    api(`products?store_id=eq.${currentStore.id}&select=*&order=position.asc`)
  ]);
  render();
}

function render() {
  const published = products.filter(product => product.is_published).length;
  $('[data-overview-title]').textContent = currentStore.name;
  $('[data-overview-copy]').textContent = `${products.length} productos administrados desde una única base segura.`;
  $('[data-metrics]').innerHTML = [['Productos', products.length], ['Publicados', published], ['Categorías', categories.length]].map(([label, count]) => `<article class="metric"><small>${label}</small><b>${count}</b></article>`).join('');
  $('[data-product-list]').innerHTML = products.length ? products.map(product => `<article class="product"><div><b>${escapeHtml(product.name)}</b><small>${product.is_published ? 'Publicado' : 'Borrador'} · ${product.category_id ? 'Con categoría' : 'Sin categoría'}</small></div><strong>$ ${Number(product.price).toLocaleString('es-AR')}</strong></article>`).join('') : '<p class="empty">Todavía no hay productos. Creá el primero a la derecha.</p>';
  $('[data-category-select]').innerHTML = `<option value="">Sin categoría</option>${categories.map(category => `<option value="${category.id}">${escapeHtml(category.name)}</option>`).join('')}`;
  loadOrders();
}

async function loadOrders() {
  try {
    const orders = await api(`orders?store_id=eq.${currentStore.id}&select=order_number,status,total,created_at&order=created_at.desc&limit=12`);
    $('[data-orders]').innerHTML = orders.length ? orders.map(order => `<article class="order"><div><b>Pedido #${escapeHtml(order.order_number)}</b><small>${new Date(order.created_at).toLocaleString('es-AR')} · ${escapeHtml(order.status)}</small></div><strong>$ ${Number(order.total || 0).toLocaleString('es-AR')}</strong></article>`).join('') : '<p class="empty">Los tickets enviados a WhatsApp aparecerán acá.</p>';
  } catch { $('[data-orders]').innerHTML = '<p class="empty">Todavía no hay pedidos para esta tienda.</p>'; }
}

async function createAccount(payload) {
  const response = await fetch(`${CONFIG.url}/functions/v1/manage-accounts`, { method: 'POST', headers: headers(), body: JSON.stringify(payload) });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'No se pudo crear el acceso.');
  return data;
}

function showWorkspace() { $('#auth-view').hidden = true; $('#workspace').hidden = false; }
async function start() {
  try {
    session = JSON.parse(localStorage.getItem(sessionKey) || 'null');
    if (!session) throw new Error('');
    await loadMembership(await getUser()); showWorkspace(); await loadData();
  } catch { session = null; localStorage.removeItem(sessionKey); $('#auth-view').hidden = false; $('#workspace').hidden = true; }
}

$('[data-login-form]').addEventListener('submit', async event => {
  event.preventDefault(); const form = event.currentTarget, button = $('button', form), data = new FormData(form); button.disabled = true;
  try { await login(data.get('email'), data.get('password')); $('[data-auth-note]').textContent = 'Accediendo…'; await start(); }
  catch (error) { $('[data-auth-note]').textContent = error.message; }
  finally { button.disabled = false; }
});

$$('.nav').forEach(button => button.addEventListener('click', () => {
  $$('.nav').forEach(item => item.classList.toggle('is-active', item === button));
  $$('[data-panel]').forEach(panel => { panel.hidden = panel.dataset.panel !== button.dataset.tab; });
  $('[data-heading]').textContent = button.textContent;
}));

$('[data-store-select]').addEventListener('change', async event => { const nextStore = availableStores.find(store => store.id === event.target.value); if (!nextStore) return; currentStore = nextStore; $('[data-store-name]').textContent = currentStore.name; await loadData(); });
$$('[data-refresh]').forEach(button => button.addEventListener('click', () => loadData().catch(error => note(error.message))));
$('[data-category-form]').addEventListener('submit', async event => { event.preventDefault(); try { const name = new FormData(event.currentTarget).get('name').trim(); await api('categories', { method: 'POST', body: JSON.stringify({ store_id: currentStore.id, name, slug: slugify(name), position: categories.length * 10, is_visible: true }) }); event.currentTarget.reset(); await loadData(); note('Categoría creada.'); } catch (error) { note(error.message); } });
$('[data-product-form]').addEventListener('submit', async event => { event.preventDefault(); try { const data = new FormData(event.currentTarget), name = data.get('name').trim(); await api('products', { method: 'POST', body: JSON.stringify({ store_id: currentStore.id, category_id: data.get('category_id') || null, name, slug: slugify(name), price: Number(data.get('price')), is_published: data.get('is_published') === 'on', position: products.length * 10, metadata: { stock_status: 'in_stock' } }) }); event.currentTarget.reset(); await loadData(); note('Producto creado.'); } catch (error) { note(error.message); } });
$('[data-member-form]').addEventListener('submit', async event => { event.preventDefault(); const form = event.currentTarget, button = $('button', form), data = new FormData(form); button.disabled = true; try { if (member.role !== 'platform_admin') throw new Error('No tenés permiso para crear accesos.'); await createAccount({ email: data.get('email'), password: data.get('password'), store_id: data.get('store_id'), role: data.get('role') }); form.reset(); note('Acceso creado. Compartile la contraseña temporal por un canal privado.'); } catch (error) { note(error.message); } finally { button.disabled = false; } });
$('[data-signout]').addEventListener('click', () => { localStorage.removeItem(sessionKey); location.reload(); });
start();
