// ── Pre-order helpers ─────────────────────────────────────────────────────────

function computeRemainingDays(p) {
  if (!p || !p.preorder) return null;
  const end = (p.preorderStart || 0) + (p.preorderDuration || 0) * 24 * 60 * 60 * 1000;
  return Math.ceil((end - Date.now()) / (1000 * 60 * 60 * 24));
}

function updatePreorderStatuses() {
  let changed = false;
  for (const p of products) {
    if (p.preorder && computeRemainingDays(p) <= 0) {
      delete p.preorder;
      delete p.preorderDuration;
      delete p.preorderStart;
      changed = true;
    }
  }
  if (changed) save('products', products);
}

// ── Main router ───────────────────────────────────────────────────────────────

function renderMain() {
  const main = $('#main-content');
  updateAuthArea();

  const viewOrdersBtn = $('#view-orders');
  if (currentUser && currentUser.role === 'admin') {
    viewOrdersBtn.classList.remove('hidden');
    viewOrdersBtn.textContent = 'Orders (All)';
  } else if (currentUser) {
    viewOrdersBtn.classList.remove('hidden');
    viewOrdersBtn.textContent = 'My Orders';
  } else {
    viewOrdersBtn.classList.add('hidden');
  }

  updatePreorderStatuses();

  if (currentUser && currentUser.role === 'admin' && view === 'admin') {
    main.innerHTML = renderAdminDashboard();
  } else {
    main.innerHTML = (view === 'shop') ? renderShop() : renderOrdersPublic();
  }

  icons();
  updateCartBadge();
  renderCartDrawer();
}

function switchTo(v) {
  view = v;
  renderMain();
}

// ── Shop ──────────────────────────────────────────────────────────────────────

function renderShop() {
  const isAdmin = currentUser && currentUser.role === 'admin';

  const grid = products.length ? products.map(p => {
    const lowStock = p.quantity <= 5;
    const isPre    = !!p.preorder;
    const rem      = isPre ? computeRemainingDays(p) : null;
    const badgeHtml = isPre
      ? `<div class="badge bg-yellow-100 text-yellow-700">🟡 Pre-Order • ${rem > 0 ? rem + ' days left' : 'Ending'}</div>`
      : '';

    let addButton;
    if (isAdmin) {
      addButton = isPre
        ? `<button class="px-3 py-1.5 rounded-md bg-yellow-200 text-yellow-800 text-sm cursor-not-allowed" disabled>View only</button>`
        : `<button class="px-3 py-1.5 rounded-md bg-lime-200 text-lime-800 text-sm cursor-not-allowed" disabled>View only</button>`;
    } else {
      addButton = isPre
        ? `<button onclick="preOrderItem(${p.id},1)" class="px-3 py-1.5 rounded-md bg-yellow-400 text-white text-sm">Pre-Order</button>`
        : `<button onclick="addToCart(${p.id},1)" class="px-3 py-1.5 rounded-md bg-lime-600 text-white text-sm">Add</button>`;
    }

    return `
      <div class="card bg-white rounded-xl border p-3 flex flex-col">
        <div class="h-40 w-full rounded-md overflow-hidden bg-gray-50 relative">
          <img src="${p.imgUrl}" alt="${p.name}" class="w-full h-full object-cover">
          <div class="absolute top-3 left-3">${badgeHtml}</div>
        </div>
        <div class="mt-3 flex-1">
          <div class="flex items-start justify-between gap-3">
            <div>
              <h3 class="font-semibold text-lg text-gray-800">${p.name}</h3>
              <div class="text-sm text-gray-500">${p.origin} • <span class="font-medium">${p.farmer.name}</span></div>
            </div>
            <div class="text-right">
              <div class="text-lime-700 font-extrabold text-lg">${formatPeso(p.price)}</div>
              <div class="text-xs text-gray-500 text-right">${p.unit}</div>
            </div>
          </div>
          <div class="mt-3 flex items-center justify-between">
            <div class="text-sm ${lowStock ? 'text-red-500' : 'text-gray-500'}">${p.quantity} ${p.unit}${p.quantity > 1 ? 's' : ''} available</div>
            <div class="flex items-center gap-2">
              ${addButton}
              <button onclick="showProduct(${p.id})" class="px-3 py-1.5 rounded-md bg-white border text-sm">Details</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('') : `<div class="col-span-full text-center py-12 text-gray-500">No products available.</div>`;

  return `
    <section>
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-2xl font-bold text-gray-800">Marketplace</h2>
        <div class="text-sm text-gray-500">Fresh products from local farms</div>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        ${grid}
      </div>
    </section>
  `;
}

// ── Product detail modal ──────────────────────────────────────────────────────

function showProduct(id) {
  const p = products.find(x => x.id === id);
  if (!p) return;

  const lowStock  = p.quantity <= 5;
  const isPre     = !!p.preorder;
  const rem       = isPre ? computeRemainingDays(p) : null;
  const badgeHtml = isPre
    ? `<div class="badge bg-yellow-100 text-yellow-700 mb-2">🟡 Pre-Order • ${rem > 0 ? rem + ' days left' : 'Ending'}</div>`
    : '';

  const isAdmin = currentUser && currentUser.role === 'admin';
  let actionButton = '';
  if (!isAdmin) {
    actionButton = isPre
      ? `<button onclick="preOrderItem(${p.id},1)" class="px-4 py-2 bg-yellow-400 text-white rounded">Pre-Order</button>`
      : `<button onclick="addToCart(${p.id},1)" class="px-4 py-2 bg-lime-600 text-white rounded">Add to Cart</button>`;
  }

  showModal(p.name, `
    <div class="grid gap-4">
      <div class="rounded overflow-hidden">
        <img src="${p.imgUrl}" alt="${p.name}" class="w-full h-48 object-cover rounded">
      </div>
      <div>
        ${badgeHtml}
        <div class="text-gray-700 text-sm mb-1">${p.origin}</div>
        <div class="text-gray-500 text-sm mb-1">Farmer: <b>${p.farmer.name}</b> (${p.farmer.contact})</div>
        <div class="text-gray-700 text-sm mb-1">Price: <b>${formatPeso(p.price)}</b> / ${p.unit}</div>
        <div class="text-gray-700 text-sm mb-1">Stock: <b class="${lowStock ? 'text-red-500' : ''}">${p.quantity}</b> ${p.unit}${p.quantity > 1 ? 's' : ''}</div>
        ${isPre ? `<div class="text-yellow-600 text-sm">Pre-Order available in ${rem > 0 ? rem : 0} day(s)</div>` : ''}
      </div>
    </div>
  `, `
    <button onclick="hideModal()" class="px-4 py-2 bg-gray-100 rounded">Close</button>
    ${actionButton}
  `);
}

// ── Orders (customer & admin list view) ───────────────────────────────────────

function renderOrdersPublic() {
  if (!currentUser) {
    return `
      <section>
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-2xl font-bold">Orders</h2>
          <div class="text-sm text-gray-500">Log in to see your orders</div>
        </div>
        <div class="bg-white rounded-xl p-6 border text-gray-600">
          Please <button onclick="openAuth('login')" class="underline">log in</button>
          or <button onclick="openAuth('signup')" class="underline">sign up</button> to view and track your orders.
        </div>
      </section>
    `;
  }

  const list = (currentUser.role === 'admin') ? orders : orders.filter(o => o.email === currentUser.email);

  if (currentUser.role === 'customer') {
    const html = list.length ? list.map(o => {
      const itemsHtml = o.items.map(it =>
        `<li class="flex justify-between py-1"><span>${it.quantity} × ${it.name} (${it.unit})</span><span>${formatPeso(it.price * it.quantity)}</span></li>`
      ).join('');
      return `
        <div class="bg-white rounded-xl p-4 border mb-3">
          <div class="flex items-center justify-between">
            <div><b>${o.id}</b> • ${o.customer}</div>
            <div class="text-lime-700 font-semibold">${formatPeso(o.total)}</div>
          </div>
          <div class="mt-2 text-sm text-gray-500">Date: ${o.date}</div>
          <div class="mt-3">
            <div class="font-medium">Items</div>
            <ul class="mt-2 border rounded p-3 bg-gray-50">${itemsHtml}</ul>
          </div>
          <div class="mt-3 grid grid-cols-2 gap-3 text-sm">
            <div><b>Contact</b><br>${o.contact}</div>
            <div><b>Address</b><br>${o.address}</div>
          </div>
          <div class="mt-3">
            <div class="inline-flex items-center gap-3">
              <div class="px-3 py-1 rounded bg-gray-100 text-gray-800">${o.status}</div>
              <button onclick="viewOrderDetail('${o.id}')" class="px-3 py-1 rounded bg-white border text-sm">View</button>
            </div>
          </div>
        </div>
      `;
    }).join('') : `<div class="text-gray-500">You have no orders yet.</div>`;

    return `
      <section>
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-2xl font-bold">My Orders</h2>
          <div class="text-sm text-gray-500">Order history &amp; tracking</div>
        </div>
        ${html}
      </section>
    `;
  }

  // Admin order list
  const html = list.length ? list.map(o => `
    <div class="bg-white rounded-xl p-4 border mb-3">
      <div class="flex items-center justify-between">
        <div><b>${o.id}</b> • ${o.customer}</div>
        <div class="text-lime-700 font-semibold">${formatPeso(o.total)}</div>
      </div>
      <div class="text-sm text-gray-500 mt-2">Status: <span class="px-2 py-1 rounded bg-gray-100 text-gray-800">${o.status}</span></div>
      <div class="mt-2 text-sm">
        <button onclick="viewOrderDetail('${o.id}')" class="px-3 py-1 rounded bg-white border text-sm">View</button>
        <button onclick="adminEditOrder('${o.id}')" class="px-3 py-1 rounded bg-lime-600 text-white text-sm ml-2">Update</button>
      </div>
    </div>
  `).join('') : `<div class="text-gray-500">No orders to display.</div>`;

  return `
    <section>
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-2xl font-bold">Orders</h2>
        <div class="text-sm text-gray-500">Order history</div>
      </div>
      ${html}
    </section>
  `;
}

// ── Order detail modal ────────────────────────────────────────────────────────

function viewOrderDetail(id) {
  const o = orders.find(x => x.id === id);
  if (!o) return;
  const items = o.items.map(it =>
    `<li class="flex justify-between py-1"><span>${it.quantity} × ${it.name} (${it.unit})</span><span>${formatPeso(it.price * it.quantity)}</span></li>`
  ).join('');
  const actions = (currentUser && currentUser.role === 'admin')
    ? `<button onclick="adminEditOrder('${o.id}')" class="px-4 py-2 bg-lime-600 text-white rounded">Update Status</button>`
    : '';

  showModal(`Order ${o.id}`, `
    <div class="grid gap-2">
      <div><b>Customer:</b> ${o.customer}</div>
      <div><b>Contact:</b> ${o.contact}</div>
      <div><b>Address:</b> ${o.address}</div>
      <div><b>Date:</b> ${o.date}</div>
      <div class="pt-2"><b>Items</b><ul class="mt-2">${items}</ul></div>
      <div class="pt-2"><b>Total:</b> ${formatPeso(o.total)}</div>
      <div class="pt-2"><b>Status:</b> <span class="badge bg-gray-100 text-gray-800 px-2 py-1 rounded">${o.status}</span></div>
    </div>
  `, `<button onclick="hideModal()" class="px-4 py-2 bg-gray-100 rounded">Close</button>${actions}`);
}
