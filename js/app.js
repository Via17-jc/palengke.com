// ── Seed data ─────────────────────────────────────────────────────────────────
// Runs once on load. Loads persisted data from localStorage, falling back to
// defaults so the app works out-of-the-box.

function seed() {
  products = load('products', [
    { id: 1, name: "Fresh Tilapia",            origin: "San Juan Fish Farm",           farmer: { name: "Mang Jose",       contact: "0917-234-5678" }, price: 150.00, quantity: 50,  unit: 'kg',   imgUrl: 'https://placehold.co/600x360/4ade80/000?text=Tilapia'  },
    { id: 2, name: "Native Chicken Eggs",      origin: "Brgy. San Andres Poultry",    farmer: { name: "Aling Nena",       contact: "0998-765-4321" }, price:   8.00, quantity: 200, unit: 'pc',   imgUrl: 'https://placehold.co/600x360/84cc16/000?text=Eggs'     },
    { id: 3, name: "Organic Lettuce",          origin: "Sta. Lucia Hydroponics",      farmer: { name: "Mr. Dela Cruz",    contact: "0920-111-2222" }, price:  65.00, quantity: 30,  unit: 'head', imgUrl: 'https://placehold.co/600x360/4ade80/000?text=Lettuce'  },
    { id: 4, name: "Ripe Bananas (Lakatan)",   origin: "Cainta Farm Cooperative",     farmer: { name: "Ate Sol",          contact: "0905-333-4444" }, price:  50.00, quantity: 80,  unit: 'kg',   imgUrl: 'https://placehold.co/600x360/84cc16/000?text=Bananas'  },
  ]);

  orders = load('orders', [
    { id: 'O-20240001', items: [{ productId: 1, name: "Fresh Tilapia", quantity: 2, price: 150, unit: 'kg' }], total: 300.00, status: 'Out for Delivery', customer: 'Juan Dela Cruz', email: 'juan@example.com', contact: '0917-000-0000', address: 'Cainta, Rizal', date: new Date().toLocaleString() }
  ]);

  users = load('users', [
    { email: 'monic@palengke.com', name: 'Monic',         password: '123',      role: 'admin'    },
    { email: 'juan@example.com',   name: 'Juan Dela Cruz', password: 'password', role: 'customer' },
  ]);

  cart        = load('cart', []);
  currentUser = load('currentUser', null);

  save('products',    products);
  save('orders',      orders);
  save('users',       users);
  save('cart',        cart);
  save('currentUser', currentUser);

  updatePreorderStatuses();
}

// ── Bootstrap ─────────────────────────────────────────────────────────────────

window.addEventListener('load', () => {
  seed();
  updateAuthArea();
  renderMain();
  icons();
});

// Close modal when clicking the overlay backdrop
document.getElementById('modal-overlay').addEventListener('click', (e) => {
  if (e.target === e.currentTarget) hideModal();
});

// Keyboard shortcuts
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    hideModal();
    document.getElementById('cart-drawer').classList.add('hidden');
  }
});
