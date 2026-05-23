// ── Auth area (header) ────────────────────────────────────────────────────────

function updateAuthArea() {
  const container = $('#auth-area');
  const headerActions = $('#header-actions');
  if (!container || !headerActions) return;

  const cartBtn = $('#cart-btn');
  if (cartBtn) cartBtn.style.display = (currentUser && currentUser.role === 'admin') ? 'none' : '';

  if (currentUser) {
    container.innerHTML = `
      <div class="relative inline-block">
        <button id="user-menu-btn" class="px-3 py-2 rounded-lg bg-white border flex items-center gap-2">
          <i data-lucide="user" class="w-4 h-4 text-gray-700"></i>
          <span class="text-sm font-medium">${currentUser.name}</span>
          <i data-lucide="chevron-down" class="w-4 h-4 text-gray-500"></i>
        </button>
        <div id="user-menu" class="hidden absolute right-0 mt-2 w-56 bg-white rounded shadow p-2">
          ${currentUser.role === 'admin'
            ? `<button onclick="goAdmin()" class="w-full text-left px-2 py-2 rounded hover:bg-gray-50">Admin Dashboard</button>`
            : `<button onclick="switchTo('orders'); hideUserMenu();" class="w-full text-left px-2 py-2 rounded hover:bg-gray-50">My Orders</button>`
          }
          <button onclick="logoutUser()" class="w-full text-left px-2 py-2 mt-1 rounded bg-red-50 text-red-600 hover:bg-red-100">Logout</button>
        </div>
      </div>
    `;

    headerActions.innerHTML = `
      <button id="header-logout" onclick="logoutUser()" class="btn-ghost">Logout</button>
      ${currentUser.role === 'admin' && view === 'admin'
        ? `<button id="exit-admin-btn" onclick="exitAdmin()" class="btn-ghost">Exit Admin</button>`
        : ''}
    `;
  } else {
    container.innerHTML = `
      <div class="flex gap-2">
        <button onclick="openAuth('login')" class="px-3 py-2 rounded-lg bg-white border text-gray-700">Log in</button>
        <button onclick="openAuth('signup')" class="px-3 py-2 rounded-lg bg-lime-600 text-white">Sign up</button>
      </div>
    `;
    headerActions.innerHTML = '';
  }

  icons();

  const btn = document.getElementById('user-menu-btn');
  if (btn) {
    btn.addEventListener('click', () => {
      const menu = document.getElementById('user-menu');
      if (menu) menu.classList.toggle('hidden');
    });
  }
}

function hideUserMenu() {
  const menu = document.getElementById('user-menu');
  if (menu) menu.classList.add('hidden');
}

// ── Open auth modal ───────────────────────────────────────────────────────────

function openAuth(mode = 'login') {
  if (mode === 'login') {
    showModal('Log in', `
      <form id="login-form" class="grid gap-3">
        <input id="login-email" type="email" placeholder="Email or name" class="p-2 border rounded" required />
        <input id="login-password" type="password" placeholder="Password" class="p-2 border rounded" required />
      </form>
    `, `
      <button onclick="hideModal()" class="px-4 py-2 bg-gray-100 rounded">Cancel</button>
      <button onclick="loginUser()" class="px-4 py-2 bg-lime-600 text-white rounded">Log in</button>
    `);
  } else {
    showModal('Sign up (Customer)', `
      <form id="signup-form" class="grid gap-3">
        <input id="signup-name" placeholder="Full name" class="p-2 border rounded" required />
        <input id="signup-email" type="email" placeholder="Email" class="p-2 border rounded" required />
        <input id="signup-password" type="password" placeholder="Password" class="p-2 border rounded" required />
        <input id="signup-contact" placeholder="Contact number (optional)" class="p-2 border rounded" />
      </form>
    `, `
      <button onclick="hideModal()" class="px-4 py-2 bg-gray-100 rounded">Cancel</button>
      <button onclick="signupUser()" class="px-4 py-2 bg-lime-600 text-white rounded">Create account</button>
    `);
  }
}

// ── Sign up ───────────────────────────────────────────────────────────────────

function signupUser() {
  const name    = $('#signup-name').value?.trim();
  const email   = $('#signup-email').value?.trim()?.toLowerCase();
  const pass    = $('#signup-password').value;
  const contact = $('#signup-contact').value?.trim() || '';

  if (!name || !email || !pass) {
    return showModal('Missing fields', 'Please fill all required signup fields.',
      `<button onclick="hideModal()" class="px-4 py-2 bg-gray-100 rounded">OK</button>`);
  }
  if (email === 'monic@palengke.com' || name.toLowerCase() === 'monic') {
    return showModal('Reserved', 'This account name/email is reserved for admin.',
      `<button onclick="hideModal()" class="px-4 py-2 bg-gray-100 rounded">OK</button>`);
  }
  if (users.find(u => u.email === email)) {
    return showModal('Account exists', 'An account with this email already exists. Try logging in.',
      `<button onclick="hideModal(); openAuth('login')" class="px-4 py-2 bg-lime-600 text-white rounded">Log in</button>`);
  }

  const newUser = { email, name, password: pass, role: 'customer', contact };
  users.push(newUser);
  save('users', users);

  currentUser = { email, name, role: 'customer' };
  save('currentUser', currentUser);

  hideModal();
  updateAuthArea();
  renderMain();
  showModal('Welcome!', `Account created and logged in as <b>${name}</b>.`,
    `<button onclick="hideModal(); renderMain()" class="px-4 py-2 bg-lime-600 text-white rounded">OK</button>`);
}

// ── Log in ────────────────────────────────────────────────────────────────────

function loginUser() {
  const emailOrName = $('#login-email').value?.trim();
  const pass        = $('#login-password').value;

  if (!emailOrName || !pass) {
    return showModal('Missing fields', 'Please fill both email/name and password.',
      `<button onclick="hideModal()" class="px-4 py-2 bg-gray-100 rounded">OK</button>`);
  }

  const lookup = emailOrName.toLowerCase();
  let found = null;
  for (const usr of users) {
    const matchesEmail = usr.email && usr.email.toLowerCase() === lookup;
    const matchesName  = usr.name  && usr.name.toLowerCase()  === lookup;
    if ((matchesEmail || matchesName) && usr.password === pass) { found = usr; break; }
  }

  if (!found) {
    return showModal('Invalid credentials', 'Email/name or password incorrect.',
      `<button onclick="hideModal()" class="px-4 py-2 bg-gray-100 rounded">OK</button>`);
  }

  currentUser = { email: found.email, name: found.name, role: found.role };
  save('currentUser', currentUser);
  hideModal();
  updateAuthArea();
  renderMain();

  // Show pending notifications
  const notifications = load('notifications', []);
  const myNotes = notifications.filter(n => n.to === currentUser.email);
  if (myNotes.length) {
    const msgs = myNotes.map(n => `<div class="py-2"><b>${n.date}</b><div>${n.message}</div></div>`).join('');
    save('notifications', notifications.filter(n => n.to !== currentUser.email));
    showModal('Notifications', `<div class="max-h-64 overflow-auto">${msgs}</div>`,
      `<button onclick="hideModal();" class="px-4 py-2 bg-lime-600 text-white rounded">OK</button>`);
  } else {
    showModal('Logged in', `Welcome back, <b>${currentUser.name}</b>!`,
      `<button onclick="hideModal(); renderMain()" class="px-4 py-2 bg-lime-600 text-white rounded">OK</button>`);
  }
}

// ── Log out ───────────────────────────────────────────────────────────────────

function logoutUser() {
  if (currentUser && currentUser.role === 'customer') {
    cart = [];
    save('cart', cart);
  }
  currentUser = null;
  save('currentUser', null);
  updateAuthArea();
  renderMain();
  showModal('Logged out', 'You have been logged out.',
    `<button onclick="hideModal()" class="px-4 py-2 bg-lime-600 text-white rounded">OK</button>`);
}

// ── Admin navigation ──────────────────────────────────────────────────────────

function goAdmin() {
  view = 'admin';
  renderMain();
  hideUserMenu();
}

function exitAdmin() {
  view = 'shop';
  renderMain();
  hideUserMenu();
}
