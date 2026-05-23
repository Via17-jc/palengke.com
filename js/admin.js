// ── Product CRUD ──────────────────────────────────────────────────────────────

function adminAddProduct() {
  if (!currentUser || currentUser.role !== 'admin') {
    return showModal('Forbidden', 'Admin access required.',
      `<button onclick="hideModal()" class="px-4 py-2 bg-gray-100 rounded">OK</button>`);
  }

  showModal('Add New Product', `
    <form id="product-form" class="grid gap-3">
      <input id="p-name" placeholder="Product name" class="p-2 border rounded" />
      <div class="grid grid-cols-3 gap-2">
        <input id="p-price" type="number" step="0.01" placeholder="Price (₱)" class="p-2 border rounded col-span-1" />
        <input id="p-qty"   type="number" placeholder="Quantity" class="p-2 border rounded" />
        <select id="p-unit" class="p-2 border rounded">
          <option value="kg">kg</option>
          <option value="pc">pc</option>
          <option value="bundle">Bundle</option>
        </select>
      </div>
      <input id="p-origin"  placeholder="Origin (Farm name)" class="p-2 border rounded" />
      <div class="grid grid-cols-2 gap-2">
        <input id="p-farmer"  placeholder="Farmer name"    class="p-2 border rounded" />
        <input id="p-contact" placeholder="Farmer contact" class="p-2 border rounded" />
      </div>
      <div class="flex items-center gap-3">
        <input id="p-img-file" type="file" accept="image/*" class="p-2" />
        <button type="button" onclick="uploadImagePreview('p-img-file','p-img-preview')" class="px-3 py-2 bg-white border rounded">Upload</button>
        <img id="p-img-preview" src="" alt="preview" class="w-20 h-14 object-cover rounded border" />
      </div>
      <div class="flex items-center gap-3">
        <label class="flex items-center gap-2">
          <input id="p-preorder" type="checkbox"/>
          <span class="text-sm">Pre-Order</span>
        </label>
        <input id="p-preorder-duration" type="number" min="7" max="14" placeholder="Duration (7-14 days)" class="p-2 border rounded w-48" />
      </div>
    </form>
  `, `
    <button onclick="hideModal()" class="px-4 py-2 bg-gray-100 rounded">Cancel</button>
    <button onclick="adminSaveProduct()" class="px-4 py-2 bg-lime-600 text-white rounded">Create</button>
  `);
}

function adminEditProduct(id) {
  if (!currentUser || currentUser.role !== 'admin') {
    return showModal('Forbidden', 'Admin access required.',
      `<button onclick="hideModal()" class="px-4 py-2 bg-gray-100 rounded">OK</button>`);
  }
  const p = products.find(x => x.id === id);
  if (!p) return;

  showModal('Edit Product', `
    <form id="product-form" class="grid gap-3">
      <input id="p-name" value="${p.name}" placeholder="Product name" class="p-2 border rounded" />
      <div class="grid grid-cols-3 gap-2">
        <input id="p-price" type="number" step="0.01" value="${p.price}" placeholder="Price (₱)" class="p-2 border rounded col-span-1" />
        <input id="p-qty"   type="number" value="${p.quantity}" placeholder="Quantity" class="p-2 border rounded" />
        <select id="p-unit" class="p-2 border rounded">
          <option value="kg"     ${p.unit === 'kg'     ? 'selected' : ''}>kg</option>
          <option value="pc"     ${p.unit === 'pc'     ? 'selected' : ''}>pc</option>
          <option value="bundle" ${p.unit === 'bundle' ? 'selected' : ''}>Bundle</option>
        </select>
      </div>
      <input id="p-origin"  value="${p.origin}"         placeholder="Origin (Farm name)" class="p-2 border rounded" />
      <div class="grid grid-cols-2 gap-2">
        <input id="p-farmer"  value="${p.farmer.name}"    placeholder="Farmer name"    class="p-2 border rounded" />
        <input id="p-contact" value="${p.farmer.contact}" placeholder="Farmer contact" class="p-2 border rounded" />
      </div>
      <div class="flex items-center gap-3">
        <input id="p-img-file" type="file" accept="image/*" class="p-2" />
        <button type="button" onclick="uploadImagePreview('p-img-file','p-img-preview')" class="px-3 py-2 bg-white border rounded">Upload</button>
        <img id="p-img-preview" src="${p.imgUrl || ''}" alt="preview" class="w-28 h-16 object-cover rounded border" />
      </div>
      <div class="flex items-center gap-3">
        <label class="flex items-center gap-2">
          <input id="p-preorder" type="checkbox" ${p.preorder ? 'checked' : ''}/>
          <span class="text-sm">Pre-Order</span>
        </label>
        <input id="p-preorder-duration" type="number" min="7" max="14" value="${p.preorderDuration || ''}" placeholder="Duration (7-14 days)" class="p-2 border rounded w-48" />
      </div>
    </form>
  `, `
    <button onclick="hideModal()" class="px-4 py-2 bg-gray-100 rounded">Cancel</button>
    <button onclick="adminSaveProduct(${id})" class="px-4 py-2 bg-lime-600 text-white rounded">Save</button>
  `);
}

function adminSaveProduct(editId = null) {
  if (!currentUser || currentUser.role !== 'admin') {
    return showModal('Forbidden', 'Admin access required.',
      `<button onclick="hideModal()" class="px-4 py-2 bg-gray-100 rounded">OK</button>`);
  }

  const name    = $('#p-name').value?.trim();
  const price   = parseFloat($('#p-price').value);
  const qty     = parseInt($('#p-qty').value);
  const unit    = $('#p-unit').value?.trim();
  const origin  = $('#p-origin').value?.trim();
  const farmer  = $('#p-farmer').value?.trim();
  const contact = $('#p-contact').value?.trim();

  const preview = $('#p-img-preview');
  let img = (preview && preview.src && preview.src.length > 0) ? preview.src : '';
  if (!img) img = `https://placehold.co/600x360/4ade80/000?text=${encodeURIComponent(name || 'Product')}`;

  const isPre = $('#p-preorder')?.checked;
  const dur   = parseInt($('#p-preorder-duration')?.value) || null;

  if (!name || isNaN(price) || isNaN(qty) || !unit || !origin || !farmer || !contact) {
    return showModal('Missing fields', 'Please fill all product fields correctly.',
      `<button onclick="hideModal()" class="px-4 py-2 bg-gray-100 rounded">OK</button>`);
  }

  if (editId) {
    const idx = products.findIndex(p => p.id === editId);
    if (idx >= 0) {
      const prev = products[idx];
      products[idx] = { ...products[idx], name, price, quantity: qty, unit, origin, farmer: { name: farmer, contact }, imgUrl: img };

      if (isPre) {
        products[idx].preorder         = true;
        products[idx].preorderDuration = Math.min(14, Math.max(7, dur || 7));
        products[idx].preorderStart    = products[idx].preorderStart || Date.now();
      } else {
        if (prev.preorder) {
          // Notify customers whose pre-orders are now being fulfilled
          const notifications = load('notifications', []);
          const affected = orders.filter(o => o.items && o.items.some(it => it.productId === editId && it.preordered));
          for (const o of affected) {
            notifications.unshift({
              to: o.email,
              date: new Date().toLocaleString(),
              message: `Your pre-order items from order ${o.id} are now available: ${name}. Please expect fulfillment soon.`,
              orderId: o.id,
              productId: editId
            });
          }
          save('notifications', notifications);
        }
        delete products[idx].preorder;
        delete products[idx].preorderDuration;
        delete products[idx].preorderStart;
      }
    }
  } else {
    const newProd = { id: Date.now(), name, price, quantity: qty, unit, origin, farmer: { name: farmer, contact }, imgUrl: img };
    if (isPre) {
      newProd.preorder         = true;
      newProd.preorderDuration = Math.min(14, Math.max(7, dur || 7));
      newProd.preorderStart    = Date.now();
    }
    products.unshift(newProd);
  }

  save('products', products);
  hideModal();
  renderMain();
}

function adminDeleteProduct(id) {
  if (!currentUser || currentUser.role !== 'admin') {
    return showModal('Forbidden', 'Admin access required.',
      `<button onclick="hideModal()" class="px-4 py-2 bg-gray-100 rounded">OK</button>`);
  }
  showModal('Confirm delete', 'Are you sure you want to delete this product?', `
    <button onclick="hideModal()" class="px-4 py-2 bg-gray-100 rounded">Cancel</button>
    <button onclick="adminConfirmDelete(${id})" class="px-4 py-2 bg-red-600 text-white rounded">Delete</button>
  `);
}

function adminConfirmDelete(id) {
  const prodToDelete = products.find(p => p.id === id);
  const deleteLogs   = load('deleteLogs', []);
  deleteLogs.unshift({
    id: 'DEL-' + uid(),
    itemType: 'product',
    itemId: id,
    deletedBy: currentUser ? currentUser.email : 'unknown',
    date: new Date().toLocaleString(),
    snapshot: prodToDelete || null
  });
  save('deleteLogs', deleteLogs);

  products = products.filter(p => p.id !== id);
  save('products', products);
  hideModal();
  renderMain();
}

// ── Order management ──────────────────────────────────────────────────────────

function adminViewOrder(id) {
  if (!currentUser || currentUser.role !== 'admin') {
    return showModal('Forbidden', 'Admin access required.',
      `<button onclick="hideModal()" class="px-4 py-2 bg-gray-100 rounded">OK</button>`);
  }
  const o = orders.find(x => x.id === id);
  if (!o) return;

  const items = o.items.map(it =>
    `<li class="flex justify-between"><span>${it.quantity} × ${it.name} (${it.unit})</span><span>${formatPeso(it.price * it.quantity)}</span></li>`
  ).join('');

  showModal(`Order ${o.id}`, `
    <div class="grid gap-2">
      <div><b>Customer:</b> ${o.customer}</div>
      <div><b>Email:</b> ${o.email || ''}</div>
      <div><b>Contact:</b> ${o.contact}</div>
      <div><b>Address:</b> ${o.address}</div>
      <div><b>Date:</b> ${o.date}</div>
      <div class="pt-2"><b>Items</b><ul class="mt-2">${items}</ul></div>
      <div class="pt-2"><b>Total:</b> ${formatPeso(o.total)}</div>
      <div class="pt-2"><b>Status:</b> <span class="badge bg-gray-100 text-gray-800 px-2 py-1 rounded">${o.status}</span></div>
    </div>
  `, `
    <button onclick="hideModal()" class="px-4 py-2 bg-gray-100 rounded">Close</button>
    <button onclick="adminEditOrder('${o.id}')" class="px-4 py-2 bg-lime-600 text-white rounded">Update Status</button>
  `);
}

function adminEditOrder(id) {
  if (!currentUser || currentUser.role !== 'admin') {
    return showModal('Forbidden', 'Admin access required.',
      `<button onclick="hideModal()" class="px-4 py-2 bg-gray-100 rounded">OK</button>`);
  }
  const o = orders.find(x => x.id === id);
  if (!o) return;

  const statuses = ['Preparing Order', 'Ready to Deliver', 'Out for Delivery', 'Delivered'];
  const options  = statuses.map(s => `<option value="${s}" ${s === o.status ? 'selected' : ''}>${s}</option>`).join('');

  showModal(`Update ${o.id}`, `
    <div>
      <div class="mb-2">Current status: <b>${o.status}</b></div>
      <select id="order-new-status" class="p-2 border rounded w-full">${options}</select>
    </div>
  `, `
    <button onclick="hideModal()" class="px-4 py-2 bg-gray-100 rounded">Cancel</button>
    <button onclick="adminSaveOrderStatus('${o.id}')" class="px-4 py-2 bg-lime-600 text-white rounded">Save</button>
  `);
}

function adminSaveOrderStatus(id) {
  if (!currentUser || currentUser.role !== 'admin') {
    return showModal('Forbidden', 'Admin access required.',
      `<button onclick="hideModal()" class="px-4 py-2 bg-gray-100 rounded">OK</button>`);
  }
  const newS = $('#order-new-status').value;
  const idx  = orders.findIndex(x => x.id === id);
  if (idx >= 0) {
    orders[idx].status = newS;
    save('orders', orders);
  }
  hideModal();
  renderMain();
}

function adminDeleteOrder(id) {
  if (!currentUser || currentUser.role !== 'admin') {
    return showModal('Forbidden', 'Admin access required.',
      `<button onclick="hideModal()" class="px-4 py-2 bg-gray-100 rounded">OK</button>`);
  }
  showModal('Confirm Delete',
    `Are you sure you want to delete this order <b>${id}</b>? This action cannot be undone.`, `
    <button onclick="hideModal()" class="px-4 py-2 bg-gray-100 rounded">Cancel</button>
    <button onclick="adminConfirmDeleteOrder('${id}')" class="px-4 py-2 bg-red-600 text-white rounded">Delete</button>
  `);
}

function adminConfirmDeleteOrder(id) {
  const orderToDelete = orders.find(o => o.id === id);
  const deleteLogs    = load('deleteLogs', []);
  deleteLogs.unshift({
    id: 'DEL-' + uid(),
    itemType: 'order',
    itemId: id,
    deletedBy: currentUser ? currentUser.email : 'unknown',
    date: new Date().toLocaleString(),
    snapshot: orderToDelete || null
  });
  save('deleteLogs', deleteLogs);

  orders = orders.filter(o => o.id !== id);
  save('orders', orders);
  hideModal();
  renderMain();
}

// ── Deletion logs ─────────────────────────────────────────────────────────────

function viewDeleteLogs() {
  if (!currentUser || currentUser.role !== 'admin') {
    return showModal('Forbidden', 'Admin access required.',
      `<button onclick="hideModal()" class="px-4 py-2 bg-gray-100 rounded">OK</button>`);
  }
  const logs = load('deleteLogs', []);
  if (!logs.length) {
    return showModal('Deletion Logs', '<div class="text-gray-600">No deletions recorded yet.</div>',
      `<button onclick="hideModal()" class="px-4 py-2 bg-lime-600 text-white rounded">Close</button>`);
  }

  const tableRows = logs.map(l => `
    <tr class="border-b">
      <td class="p-2">${l.id}</td>
      <td class="p-2">${l.itemType || ''}</td>
      <td class="p-2">${l.itemId || ''}</td>
      <td class="p-2">${l.deletedBy}</td>
      <td class="p-2">${l.date}</td>
    </tr>
  `).join('');

  showModal('Deletion Logs', `
    <div class="max-h-80 overflow-auto">
      <table class="w-full text-left text-sm">
        <thead class="bg-gray-100 text-gray-700 sticky top-0">
          <tr>
            <th class="p-2">Log ID</th>
            <th class="p-2">Type</th>
            <th class="p-2">Item ID</th>
            <th class="p-2">Deleted By</th>
            <th class="p-2">Date</th>
          </tr>
        </thead>
        <tbody>${tableRows}</tbody>
      </table>
    </div>
  `, `<button onclick="hideModal()" class="px-4 py-2 bg-lime-600 text-white rounded">Close</button>`);
}

// ── Admin dashboard renderer ──────────────────────────────────────────────────

function renderAdminDashboard() {
  if (!currentUser || currentUser.role !== 'admin') {
    return `<div class="bg-white rounded-xl p-6 border">Admin access required.</div>`;
  }

  const totalSales = orders.filter(o => o.status === 'Delivered').reduce((s, o) => s + Number(o.total), 0);
  const pending    = orders.filter(o => o.status !== 'Delivered').length;

  const regular     = products.filter(p => !p.preorder);
  const preorderList = products.filter(p => p.preorder);

  const regularRows = regular.map(p => `
    <tr class="hover:bg-gray-50">
      <td class="px-4 py-3">${p.name}</td>
      <td class="px-4 py-3">${p.origin}</td>
      <td class="px-4 py-3">${p.farmer.name} / ${p.farmer.contact}</td>
      <td class="px-4 py-3">${formatPeso(p.price)}</td>
      <td class="px-4 py-3">${p.quantity} ${p.unit}</td>
      <td class="px-4 py-3 text-right">
        <button onclick="adminEditProduct(${p.id})"   class="px-2 py-1 text-sm bg-white border rounded mr-2">Edit</button>
        <button onclick="adminDeleteProduct(${p.id})" class="px-2 py-1 text-sm bg-red-50 text-red-600 rounded">Delete</button>
      </td>
    </tr>
  `).join('');

  const preorderRows = preorderList.map(p => {
    const rem = computeRemainingDays(p);
    return `
      <tr class="hover:bg-gray-50">
        <td class="px-4 py-3">${p.name}</td>
        <td class="px-4 py-3">${p.origin}</td>
        <td class="px-4 py-3">${p.farmer.name} / ${p.farmer.contact}</td>
        <td class="px-4 py-3">${formatPeso(p.price)}</td>
        <td class="px-4 py-3">${p.quantity} ${p.unit}</td>
        <td class="px-4 py-3">${rem > 0 ? rem + ' days left' : 'Ending'}</td>
        <td class="px-4 py-3 text-right">
          <button onclick="adminEditProduct(${p.id})"   class="px-2 py-1 text-sm bg-white border rounded mr-2">Edit</button>
          <button onclick="adminDeleteProduct(${p.id})" class="px-2 py-1 text-sm bg-red-50 text-red-600 rounded">Delete</button>
        </td>
      </tr>
    `;
  }).join('');

  const regularOrders  = orders.filter(o => !o.type || o.type !== 'pre-order');
  const preorderOrders = orders.filter(o => o.type === 'pre-order');

  function orderRow(o) {
    return `
      <tr class="hover:bg-gray-50">
        <td class="px-4 py-3">${o.id}</td>
        <td class="px-4 py-3">${o.customer}</td>
        <td class="px-4 py-3">${formatPeso(o.total)}</td>
        <td class="px-4 py-3">${o.status}</td>
        <td class="px-4 py-3">${o.date}</td>
        <td class="px-4 py-3 text-right">
          <button onclick="adminViewOrder('${o.id}')"   class="px-2 py-1 text-sm bg-white border rounded mr-2">View</button>
          <button onclick="adminEditOrder('${o.id}')"   class="px-2 py-1 text-sm bg-lime-600 text-white rounded mr-2">Update</button>
          <button onclick="adminDeleteOrder('${o.id}')" class="px-2 py-1 text-sm bg-red-50 text-red-600 rounded">Delete</button>
        </td>
      </tr>
    `;
  }

  return `
    <section>
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-2xl font-bold">Admin Dashboard</h2>
        <div>
          <button onclick="adminAddProduct()" class="px-3 py-2 bg-lime-600 text-white rounded">Add Product</button>
          <button onclick="viewDeleteLogs()"  class="px-4 py-2 bg-white border text-gray-700 rounded hover:bg-gray-100 ml-2">View Deletion Logs</button>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div class="bg-white rounded-xl p-4 shadow-sm border">
          <div class="text-sm text-gray-500">Total Sales (Delivered)</div>
          <div class="text-xl font-bold text-lime-700 mt-2">${formatPeso(totalSales)}</div>
        </div>
        <div class="bg-white rounded-xl p-4 shadow-sm border">
          <div class="text-sm text-gray-500">Total Orders</div>
          <div class="text-xl font-bold mt-2">${orders.length}</div>
        </div>
        <div class="bg-white rounded-xl p-4 shadow-sm border">
          <div class="text-sm text-gray-500">Pending Orders</div>
          <div class="text-xl font-bold mt-2">${pending}</div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white rounded-xl p-4 border">
          <h3 class="font-semibold mb-3">Products — Regular</h3>
          <div class="overflow-x-auto">
            <table class="min-w-full text-left">
              <thead class="text-xs text-gray-500 uppercase">
                <tr><th class="px-4 py-3">Name</th><th class="px-4 py-3">Origin</th><th class="px-4 py-3">Farmer</th><th class="px-4 py-3">Price</th><th class="px-4 py-3">Stock</th><th class="px-4 py-3 text-right">Actions</th></tr>
              </thead>
              <tbody>${regularRows || '<tr><td class="px-4 py-6 text-center text-gray-500" colspan="6">No products</td></tr>'}</tbody>
            </table>
          </div>
        </div>
        <div class="bg-white rounded-xl p-4 border">
          <h3 class="font-semibold mb-3">Products — Pre-Order</h3>
          <div class="overflow-x-auto">
            <table class="min-w-full text-left">
              <thead class="text-xs text-gray-500 uppercase">
                <tr><th class="px-4 py-3">Name</th><th class="px-4 py-3">Origin</th><th class="px-4 py-3">Farmer</th><th class="px-4 py-3">Price</th><th class="px-4 py-3">Stock</th><th class="px-4 py-3">Remaining</th><th class="px-4 py-3 text-right">Actions</th></tr>
              </thead>
              <tbody>${preorderRows || '<tr><td class="px-4 py-6 text-center text-gray-500" colspan="7">No pre-order products</td></tr>'}</tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white rounded-xl p-4 border">
          <h3 class="font-semibold mb-3">Orders — Regular</h3>
          <div class="overflow-x-auto">
            <table class="min-w-full text-left">
              <thead class="text-xs text-gray-500 uppercase">
                <tr><th class="px-4 py-3">Order</th><th class="px-4 py-3">Customer</th><th class="px-4 py-3">Total</th><th class="px-4 py-3">Status</th><th class="px-4 py-3">Date</th><th class="px-4 py-3 text-right">Actions</th></tr>
              </thead>
              <tbody>${regularOrders.map(orderRow).join('') || '<tr><td class="px-4 py-6 text-center text-gray-500" colspan="6">No orders</td></tr>'}</tbody>
            </table>
          </div>
        </div>
        <div class="bg-white rounded-xl p-4 border">
          <h3 class="font-semibold mb-3">Orders — Pre-Order</h3>
          <div class="overflow-x-auto">
            <table class="min-w-full text-left">
              <thead class="text-xs text-gray-500 uppercase">
                <tr><th class="px-4 py-3">Order</th><th class="px-4 py-3">Customer</th><th class="px-4 py-3">Total</th><th class="px-4 py-3">Status</th><th class="px-4 py-3">Date</th><th class="px-4 py-3 text-right">Actions</th></tr>
              </thead>
              <tbody>${preorderOrders.map(orderRow).join('') || '<tr><td class="px-4 py-6 text-center text-gray-500" colspan="6">No pre-order orders</td></tr>'}</tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  `;
}
