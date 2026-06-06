// ==================================================
// STATE
// ==================================================
let token = localStorage.getItem('bank_token') || null;
let currentUser = localStorage.getItem('bank_user') || null;
let clients = [];
let activeSection = 'clients';

// ==================================================
// API
// ==================================================
const API = {
  async request(method, path, body = null, auth = false) {
    const headers = { 'Content-Type': 'application/json' };
    if (auth && token) headers['Authorization'] = `Bearer ${token}`;
    const opts = { method, headers };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(path, opts);
    if (res.status === 204) return null;
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || `Error ${res.status}`);
    return data;
  },
  register: (u, p)       => API.request('POST', '/register',              { username: u, password: p }),
  login:    (u, p)       => API.request('POST', '/login',                 { username: u, password: p }),
  getClients: ()         => API.request('GET',  '/clients',               null, true),
  createClient: (n, a)   => API.request('POST', '/clients',               { name: n, account_number: a }, true),
  updateClient: (a, n)   => API.request('PUT',  `/clients/${a}`,          { name: n }, true),
  deleteClient: (a)      => API.request('DELETE',`/clients/${a}`,         null, true),
  deposit:  (a, amt)     => API.request('POST', `/clients/${a}/deposit`,  { amount: amt }, true),
  withdraw: (a, amt)     => API.request('POST', `/clients/${a}/withdraw`, { amount: amt }, true),
  getTransactions: (a)   => API.request('GET',  `/clients/${a}/transactions`, null, true),
};

// ==================================================
// TOAST
// ==================================================
function toast(msg, type = 'info') {
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
  el.textContent = `${icons[type] || ''} ${msg}`;
  document.getElementById('toast-container').appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; el.style.transform = 'translateX(120%)'; el.style.transition = 'all 0.3s'; setTimeout(() => el.remove(), 300); }, 3500);
}

// ==================================================
// AUTH
// ==================================================
function showAuth() {
  document.getElementById('auth-page').style.display = 'flex';
  document.getElementById('dashboard-page').classList.remove('visible');
}

function showDashboard() {
  document.getElementById('auth-page').style.display = 'none';
  document.getElementById('dashboard-page').classList.add('visible');
  document.getElementById('user-name').textContent = currentUser;
  document.getElementById('user-avatar').textContent = currentUser.charAt(0).toUpperCase();
  document.getElementById('topbar-title').textContent = `Welcome back, ${currentUser} 👋`;
  loadDashboard();
}

function switchTab(tab) {
  document.querySelectorAll('.auth-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
  document.querySelectorAll('.auth-form').forEach(f => f.classList.toggle('hidden', f.id !== `${tab}-form`));
  document.getElementById('auth-error').classList.remove('show');
}

async function handleLogin() {
  const u = document.getElementById('login-username').value.trim();
  const p = document.getElementById('login-password').value;
  if (!u || !p) return toast('Please fill in all fields', 'warning');
  const btn = document.getElementById('login-btn');
  setLoading(btn, true);
  try {
    const data = await API.login(u, p);
    token = data.access_token;
    currentUser = u;
    localStorage.setItem('bank_token', token);
    localStorage.setItem('bank_user', u);
    toast(`Welcome back, ${u}!`, 'success');
    showDashboard();
  } catch (e) {
    showAuthError(e.message);
  } finally { setLoading(btn, false); }
}

async function handleRegister() {
  const u = document.getElementById('reg-username').value.trim();
  const p = document.getElementById('reg-password').value;
  if (!u || !p) return toast('Please fill in all fields', 'warning');
  if (u.length < 3) return showAuthError('Username must be at least 3 characters');
  if (p.length < 6) return showAuthError('Password must be at least 6 characters');
  const btn = document.getElementById('register-btn');
  setLoading(btn, true);
  try {
    await API.register(u, p);
    toast('Account created! Please log in.', 'success');
    switchTab('login');
    document.getElementById('login-username').value = u;
  } catch (e) {
    showAuthError(e.message);
  } finally { setLoading(btn, false); }
}

function showAuthError(msg) {
  const el = document.getElementById('auth-error');
  el.textContent = msg;
  el.classList.add('show');
}

function logout() {
  token = null; currentUser = null;
  localStorage.removeItem('bank_token');
  localStorage.removeItem('bank_user');
  showAuth();
  toast('Logged out successfully', 'info');
}

// ==================================================
// LOADING STATE
// ==================================================
function setLoading(btn, loading) {
  if (!btn) return;
  btn.disabled = loading;
  btn._text = btn._text || btn.innerHTML;
  btn.innerHTML = loading ? '<span class="spinner"></span>' : btn._text;
}

// ==================================================
// DASHBOARD
// ==================================================
async function loadDashboard() {
  await loadClients();
  updateStats();
}

async function loadClients() {
  try {
    clients = await API.getClients();
    renderClientsTable();
    updateStats();
  } catch (e) {
    toast('Failed to load clients: ' + e.message, 'error');
  }
}

function updateStats() {
  const totalBalance = clients.reduce((s, c) => s + c.balance, 0);
  document.getElementById('stat-clients').textContent = clients.length;
  document.getElementById('stat-balance').textContent = `$${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  document.getElementById('stat-active').textContent = clients.filter(c => c.balance > 0).length;
}

// ==================================================
// CLIENTS
// ==================================================
function renderClientsTable(filter = '') {
  const tbody = document.getElementById('clients-tbody');
  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(filter.toLowerCase()) ||
    c.account_number.toLowerCase().includes(filter.toLowerCase())
  );

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr><td colspan="5">
        <div class="empty-state">
          <div class="empty-icon">🏦</div>
          <p>${filter ? 'No clients match your search' : 'No clients yet. Add one above!'}</p>
        </div>
      </td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(c => `
    <tr>
      <td>${escHtml(c.name)}</td>
      <td><span class="account-badge">${escHtml(c.account_number)}</span></td>
      <td class="balance-cell">$${c.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
      <td>
        <div class="actions-cell">
          <button class="btn btn-success btn-sm" onclick="openTransactionModal('${escAttr(c.account_number)}', '${escAttr(c.name)}', 'deposit')">💰 Deposit</button>
          <button class="btn btn-warning btn-sm" onclick="openTransactionModal('${escAttr(c.account_number)}', '${escAttr(c.name)}', 'withdraw')">💸 Withdraw</button>
          <button class="btn btn-ghost btn-sm" onclick="openHistoryModal('${escAttr(c.account_number)}', '${escAttr(c.name)}')">📋 History</button>
          <button class="btn btn-ghost btn-sm" onclick="openEditModal('${escAttr(c.account_number)}', '${escAttr(c.name)}')">✏️</button>
          <button class="btn btn-danger btn-sm" onclick="confirmDelete('${escAttr(c.account_number)}', '${escAttr(c.name)}')">🗑️</button>
        </div>
      </td>
    </tr>`).join('');
}

async function createClient() {
  const name = document.getElementById('new-client-name').value.trim();
  const acct = document.getElementById('new-client-account').value.trim();
  if (!name || !acct) return toast('Please fill in all fields', 'warning');
  if (name.length < 3) return toast('Name must be at least 3 characters', 'warning');
  if (acct.length < 6) return toast('Account number must be at least 6 characters', 'warning');
  const btn = document.getElementById('create-client-btn');
  setLoading(btn, true);
  try {
    await API.createClient(name, acct);
    toast(`Client "${name}" created!`, 'success');
    document.getElementById('new-client-name').value = '';
    document.getElementById('new-client-account').value = '';
    await loadClients();
  } catch (e) {
    toast(e.message, 'error');
  } finally { setLoading(btn, false); }
}

// ==================================================
// EDIT MODAL
// ==================================================
function openEditModal(account, name) {
  document.getElementById('edit-account').value = account;
  document.getElementById('edit-name').value = name;
  document.getElementById('edit-modal-title').textContent = `Edit Client: ${name}`;
  openModal('edit-modal');
}

async function saveEdit() {
  const account = document.getElementById('edit-account').value;
  const name = document.getElementById('edit-name').value.trim();
  if (!name) return toast('Name cannot be empty', 'warning');
  const btn = document.getElementById('save-edit-btn');
  setLoading(btn, true);
  try {
    await API.updateClient(account, name);
    toast('Client updated!', 'success');
    closeModal('edit-modal');
    await loadClients();
  } catch (e) {
    toast(e.message, 'error');
  } finally { setLoading(btn, false); }
}

// ==================================================
// DELETE CONFIRM
// ==================================================
function confirmDelete(account, name) {
  document.getElementById('delete-client-name').textContent = name;
  document.getElementById('delete-account').value = account;
  openModal('delete-modal');
}

async function executeDelete() {
  const account = document.getElementById('delete-account').value;
  const btn = document.getElementById('confirm-delete-btn');
  setLoading(btn, true);
  try {
    await API.deleteClient(account);
    toast('Client deleted', 'success');
    closeModal('delete-modal');
    await loadClients();
  } catch (e) {
    toast(e.message, 'error');
  } finally { setLoading(btn, false); }
}

// ==================================================
// TRANSACTION MODAL
// ==================================================
function openTransactionModal(account, name, type) {
  document.getElementById('tx-modal-title').textContent = type === 'deposit' ? '💰 Deposit Funds' : '💸 Withdraw Funds';
  document.getElementById('tx-client-name').textContent = name;
  document.getElementById('tx-account-display').textContent = account;
  document.getElementById('tx-account').value = account;
  document.getElementById('tx-type').value = type;
  document.getElementById('tx-amount').value = '';
  const btn = document.getElementById('confirm-tx-btn');
  btn.className = `btn ${type === 'deposit' ? 'btn-success' : 'btn-warning'}`;
  btn.textContent = type === 'deposit' ? '✅ Confirm Deposit' : '✅ Confirm Withdraw';
  btn._text = btn.textContent;
  openModal('tx-modal');
}

async function executeTransaction() {
  const account = document.getElementById('tx-account').value;
  const type = document.getElementById('tx-type').value;
  const amount = parseFloat(document.getElementById('tx-amount').value);
  if (!amount || amount <= 0) return toast('Please enter a valid amount', 'warning');
  const btn = document.getElementById('confirm-tx-btn');
  setLoading(btn, true);
  try {
    const fn = type === 'deposit' ? API.deposit : API.withdraw;
    const result = await fn(account, amount);
    toast(`${type === 'deposit' ? 'Deposited' : 'Withdrawn'} $${amount.toFixed(2)} successfully!`, 'success');
    closeModal('tx-modal');
    await loadClients();
  } catch (e) {
    toast(e.message, 'error');
  } finally { setLoading(btn, false); }
}

// ==================================================
// HISTORY MODAL
// ==================================================
async function openHistoryModal(account, name) {
  document.getElementById('history-modal-title').textContent = `📋 Transaction History — ${name}`;
  document.getElementById('history-list').innerHTML = '<div style="text-align:center;padding:20px;color:var(--text-muted)"><span class="spinner"></span></div>';
  openModal('history-modal');
  try {
    const txs = await API.getTransactions(account);
    const list = document.getElementById('history-list');
    if (!txs || txs.length === 0) {
      list.innerHTML = '<div class="empty-state"><div class="empty-icon">📭</div><p>No transactions yet</p></div>';
      return;
    }
    list.innerHTML = `<div class="tx-list">${txs.map(tx => `
      <div class="tx-item">
        <div class="tx-icon ${tx.type}">
          ${tx.type === 'deposit' ? '💰' : '💸'}
        </div>
        <div class="tx-info">
          <div class="tx-type">${tx.type}</div>
          <div class="tx-account">${account}</div>
        </div>
        <div class="tx-amount ${tx.type}">
          ${tx.type === 'deposit' ? '+' : '-'}$${parseFloat(tx.amount).toFixed(2)}
        </div>
      </div>`).join('')}</div>`;
  } catch (e) {
    document.getElementById('history-list').innerHTML = `<p style="color:var(--danger);text-align:center">${e.message}</p>`;
  }
}

// ==================================================
// NAVIGATION
// ==================================================
function navigateTo(section) {
  activeSection = section;
  document.querySelectorAll('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.section === section));
  document.querySelectorAll('.section').forEach(s => s.classList.toggle('active', s.id === `${section}-section`));
  const titles = { clients: '👤 Client Management', transactions: '💳 All Transactions' };
  document.getElementById('page-subtitle').textContent = titles[section] || '';
  if (section === 'transactions') loadAllTransactions();
  closeMobileSidebar();
}

async function loadAllTransactions() {
  const container = document.getElementById('all-transactions-container');
  if (clients.length === 0) {
    container.innerHTML = '<div class="empty-state"><div class="empty-icon">📭</div><p>No clients to show transactions for</p></div>';
    return;
  }
  container.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-muted)"><span class="spinner" style="width:24px;height:24px;border-width:3px"></span></div>';
  try {
    const all = await Promise.all(clients.map(async c => {
      const txs = await API.getTransactions(c.account_number);
      return (txs || []).map(tx => ({ ...tx, clientName: c.name, accountNumber: c.account_number }));
    }));
    const flat = all.flat();
    if (flat.length === 0) {
      container.innerHTML = '<div class="empty-state"><div class="empty-icon">📭</div><p>No transactions recorded yet</p></div>';
      return;
    }
    container.innerHTML = `<div class="tx-list">${flat.map(tx => `
      <div class="tx-item">
        <div class="tx-icon ${tx.type}">${tx.type === 'deposit' ? '💰' : '💸'}</div>
        <div class="tx-info">
          <div class="tx-type">${tx.clientName}</div>
          <div class="tx-account">${tx.accountNumber} · ${tx.type}</div>
        </div>
        <div class="tx-amount ${tx.type}">
          ${tx.type === 'deposit' ? '+' : '-'}$${parseFloat(tx.amount).toFixed(2)}
        </div>
      </div>`).join('')}</div>`;
  } catch (e) {
    container.innerHTML = `<p style="color:var(--danger);text-align:center">${e.message}</p>`;
  }
}

// ==================================================
// MODAL HELPERS
// ==================================================
function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

// ==================================================
// MOBILE SIDEBAR
// ==================================================
function toggleMobileSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('mobile-overlay').classList.toggle('block');
}
function closeMobileSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('mobile-overlay').classList.remove('block');
}

// ==================================================
// THEME
// ==================================================
function toggleTheme() {
  const html = document.documentElement;
  const isDark = html.dataset.theme !== 'light';
  html.dataset.theme = isDark ? 'light' : 'dark';
  document.getElementById('theme-icon').textContent = isDark ? '🌙' : '☀️';
  localStorage.setItem('bank_theme', html.dataset.theme);
}

// ==================================================
// UTILS
// ==================================================
function escHtml(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function escAttr(str) {
  return String(str).replace(/'/g, "\\'");
}

// ==================================================
// INIT
// ==================================================
document.addEventListener('DOMContentLoaded', () => {
  // Restore theme
  const savedTheme = localStorage.getItem('bank_theme') || 'dark';
  document.documentElement.dataset.theme = savedTheme;
  const themeIcon = document.getElementById('theme-icon');
  if (themeIcon) themeIcon.textContent = savedTheme === 'light' ? '🌙' : '☀️';

  // Auth keyboard shortcuts
  document.getElementById('login-password')?.addEventListener('keydown', e => { if (e.key === 'Enter') handleLogin(); });
  document.getElementById('reg-password')?.addEventListener('keydown', e => { if (e.key === 'Enter') handleRegister(); });

  // Client search
  document.getElementById('client-search')?.addEventListener('input', e => renderClientsTable(e.target.value));

  // Close modals on overlay click
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) overlay.classList.remove('open');
    });
  });

  // Check existing session
  if (token && currentUser) {
    showDashboard();
  } else {
    showAuth();
  }
});
