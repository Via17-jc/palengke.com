// ── Cart drawer ───────────────────────────────────────────────────────────────

function toggleCartDrawer(show) {
  const drawer = $('#cart-drawer');
  if (typeof show === 'boolean') {
    drawer.classList.toggle('hidden', !show);
  } else {
    drawer.classList.toggle('hidden');
  }
  renderCartDrawer();
}

function updateCartBadge() {
  const cnt = cart.reduce((s, i) => s + Number(i.quantity), 0);
  $('#cart-badge').textContent = cnt;
  save('cart', cart);
}

function renderCartDrawer() {
  const body = $('#cart-drawer-body');
  if (!body) return;

  if (cart.length === 0) {
    body.innerHTML = `<div class="text-center py-12 text-gray-500">Your cart is empty — add fresh products from the shop.</div>`;
    $('#cart-subtotal').textContent = formatPeso(0);
    updateCartBadge();
    icons();
    return;
  }

  const itemsHtml = cart.map(it => {
    const prod = products.find(p => p.id === it.productId) || {};
    return `
      <div class="flex items-center gap-3 py-3 border-b">
        <div class="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
          <img src="${prod.imgUrl || ''}" alt="${it.name}" class="object-cover w-full h-full">
        </div>
        <div class="flex-1">
          <div class="font-medium text-gray-800">${it.name}</div>
          <div class="text-sm text-gray-500">${it.quantity} x ${formatPeso(it.price)} / ${it.unit}</div>
        </div>
        <div class="text-right">
          <div class="font-semibold text-gray-800">${formatPeso(it.price * it.quantity)}</div>
          <div class="flex gap-1 mt-2 justify-end">
            <button onclick="changeCartItem(${it.productId}, ${it.quantity - 1})" class="px-2 py-1 rounded-md text-sm bg-gray-100">-</button>
            <button onclick="changeCartItem(${it.productId}, ${it.quantity + 1})" class="px-2 py-1 rounded-md text-sm bg-gray-100">+</button>
            <button onclick="removeCartItem(${it.productId})" class="px-2 py-1 rounded-md text-sm bg-red-50 text-red-600">Remove</button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  body.innerHTML = itemsHtml;
  const subtotal = cart.reduce((s, i) => s + (i.price * i.quantity), 0);
  $('#cart-subtotal').textContent = formatPeso(subtotal);
  updateCartBadge();
  icons();
}

// ── Add / pre-order ───────────────────────────────────────────────────────────

function addToCart(productId, qty = 1) {
  const p = products.find(x => x.id === productId);
  if (!p) return showModal('Error', 'Product not found',
    `<button onclick="hideModal()" class="px-4 py-2 bg-gray-200 rounded">OK</button>`);

  if (!currentUser) return showModal('Login required',
    'Please log in or create an account to add items to your cart.',
    `<button onclick="hideModal(); openAuth('login')" class="px-4 py-2 bg-lime-600 text-white rounded">Log in</button>
     <button onclick="hideModal(); openAuth('signup')" class="px-4 py-2 bg-white border rounded">Sign up</button>`);

  if (p.preorder) return showModal('Pre-Order Item',
    `${p.name} is currently on pre-order. Use the Pre-Order button to reserve it.`,
    `<button onclick="hideModal()" class="px-4 py-2 bg-gray-100 rounded">OK</button>`);

  if (p.quantity <= 0) return showModal('Out of stock', `${p.name} is out of stock.`,
    `<button onclick="hideModal()" class="px-4 py-2 bg-gray-200 rounded">OK</button>`);

  const idx = cart.findIndex(c => c.productId === productId && !c.preordered);
  if (idx >= 0) {
    if (p.quantity < qty) return showModal('Not enough stock',
      `Only ${p.quantity} ${p.unit} left in stock.`,
      `<button onclick="hideModal()" class="px-4 py-2 bg-gray-200 rounded">OK</button>`);
    cart[idx].quantity += qty;
  } else {
    cart.push({ productId: p.id, name: p.name, price: p.price, quantity: qty, unit: p.unit, preordered: false });
  }

  p.quantity = Math.max(0, p.quantity - qty);
  save('products', products);
  save('cart', cart);
  renderCartDrawer();
  toggleCartDrawer(true);
}

function preOrderItem(productId, qty = 1) {
  const p = products.find(x => x.id === productId);
  if (!p) return showModal('Error', 'Product not found',
    `<button onclick="hideModal()" class="px-4 py-2 bg-gray-200 rounded">OK</button>`);
  if (!p.preorder) return showModal('Not pre-order', 'This product is not marked as pre-order.',
    `<button onclick="hideModal()" class="px-4 py-2 bg-gray-100 rounded">OK</button>`);
  if (!currentUser) return showModal('Login required',
    'Please log in or create an account to pre-order.',
    `<button onclick="hideModal(); openAuth('login')" class="px-4 py-2 bg-lime-600 text-white rounded">Log in</button>`);

  const idx = cart.findIndex(c => c.productId === productId && c.preordered === true);
  if (idx >= 0) {
    cart[idx].quantity += qty;
  } else {
    cart.push({ productId: p.id, name: p.name, price: p.price, quantity: qty, unit: p.unit, preordered: true });
  }
  save('cart', cart);
  renderCartDrawer();
  toggleCartDrawer(true);
}

// ── Mutate cart items ─────────────────────────────────────────────────────────

function changeCartItem(pid, newQty) {
  const idx = cart.findIndex(c => c.productId === pid);
  if (idx === -1) return;
  if (newQty <= 0) return removeCartItem(pid);

  const oldQty   = cart[idx].quantity;
  const diff     = newQty - oldQty;
  const product  = products.find(p => p.id === pid);

  if (diff > 0 && product && product.quantity < diff) {
    return showModal('Not enough stock', `Only ${product.quantity} ${product.unit} left in stock.`,
      `<button onclick="hideModal()" class="px-4 py-2 bg-gray-100 rounded">OK</button>`);
  }

  if (product) product.quantity = Math.max(0, product.quantity - diff);
  cart[idx].quantity = newQty;
  save('cart', cart);
  save('products', products);
  renderCartDrawer();
  renderMain();
}

function removeCartItem(pid) {
  const idx = cart.findIndex(c => c.productId === pid);
  if (idx === -1) return;
  const item    = cart[idx];
  const product = products.find(p => p.id === pid);
  if (product) product.quantity += item.quantity;
  cart.splice(idx, 1);
  save('cart', cart);
  save('products', products);
  renderCartDrawer();
  renderMain();
}

// ── Checkout & place order ────────────────────────────────────────────────────

function checkout() {
  if (cart.length === 0) {
    return showModal('Cart is empty', 'Please add items to your cart first.',
      `<button onclick="hideModal()" class="px-4 py-2 bg-gray-100 rounded">OK</button>`);
  }
  if (!currentUser) {
    return showModal('Login required',
      'Please log in or create an account to place your order.',
      `<button onclick="hideModal(); openAuth('login')" class="px-4 py-2 bg-lime-600 text-white rounded">Log in</button>
       <button onclick="hideModal(); openAuth('signup')" class="px-4 py-2 bg-white border rounded">Sign up</button>`);
  }

  const subtotal    = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const userContact = (users.find(u => u.email === currentUser.email)?.contact) || '';

  showModal('Checkout', `
    <div>
      <div class="text-sm text-gray-600 mb-3">Order total: <span class="font-bold text-lime-700">${formatPeso(subtotal)}</span></div>
      <form id="checkout-form" class="grid gap-3">
        <input id="customer-name"    value="${currentUser.name}" required placeholder="Full name" class="p-2 border rounded" />
        <input id="customer-contact" value="${userContact}" required placeholder="Contact number (09XX-XXX-XXXX)" class="p-2 border rounded" />
        <textarea id="customer-address" required placeholder="unit number, building name, street, city, region, zip code" class="p-2 border rounded"></textarea>
        <div class="text-sm text-gray-500">Payment: Cash on Delivery (COD)</div>
      </form>
    </div>
  `, `
    <button onclick="hideModal()" class="px-4 py-2 bg-gray-100 rounded">Cancel</button>
    <button onclick="placeOrder()" class="px-4 py-2 bg-lime-600 text-white rounded">Place Order</button>
  `);
}

function placeOrder() {
  const name    = $('#customer-name').value?.trim();
  const contact = $('#customer-contact').value?.trim();
  const address = $('#customer-address').value?.trim();

  if (!name || !contact || !address) {
    return showModal('Missing info', 'Please fill all checkout fields',
      `<button onclick="hideModal()" class="px-4 py-2 bg-gray-100 rounded">OK</button>`);
  }

  const newId          = 'O-' + uid();
  const itemsCopy      = cart.map(i => ({ ...i }));
  const total          = itemsCopy.reduce((s, i) => s + i.price * i.quantity, 0);
  const isPreorderOrder = itemsCopy.some(it => it.preordered === true);

  const newOrder = {
    id: newId,
    items: itemsCopy,
    total,
    status: isPreorderOrder ? 'Pre-Order Received' : 'Preparing Order',
    type: isPreorderOrder ? 'pre-order' : 'regular',
    customer: name,
    email: currentUser.email,
    contact,
    address,
    date: new Date().toLocaleString()
  };

  orders.unshift(newOrder);
  save('orders', orders);

  cart = [];
  save('cart', cart);

  toggleCartDrawer(false);
  hideModal();
  showModal('Order Placed!',
    `<div class="text-gray-700">Thank you <b>${name}</b>! Your order <b>${newId}</b> for <b>${formatPeso(total)}</b> has been received.</div>`,
    `<button onclick="hideModal(); switchTo('orders'); renderMain();" class="px-4 py-2 bg-lime-600 text-white rounded">OK</button>`);
  renderMain();
}
