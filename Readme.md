# Palengke.com — Cainta Farm-to-Table Marketplace

A local government unit (LGU) demo marketplace connecting Cainta residents directly with local farmers and fisherfolk. Built as a plain HTML/CSS/JS single-page app — no build tools required.

## Quick start

Open `index.html` in any browser. No server or npm needed.

For a better local dev experience you can use any static file server, e.g.:

```bash
npx serve .
# or
python -m http.server 8080
```

## Demo credentials

| Role     | Email / name             | Password   |
|----------|--------------------------|------------|
| Admin    | `monic@palengke.com`     | `123`      |
| Customer | `juan@example.com`       | `password` |

All data is stored in `localStorage` under the key prefix `palengke_cainta_v4`.



### Script load order

Scripts must be loaded in this order (bottom of `index.html`):

1. `storage.js` — `save`/`load` available globally
2. `state.js` — shared `let` variables declared
3. `ui.js` — utilities needed by everything else
4. `auth.js` — depends on `ui.js` and `state.js`
5. `cart.js` — depends on `ui.js`, `state.js`, `auth.js`
6. `render.js` — depends on all of the above
7. `admin.js` — depends on `render.js`
8. `app.js` — entry point, calls `seed()` then `renderMain()`

## Features

- Browse fresh produce from local Cainta farms
- Product detail modals with farmer info and origin
- Pre-order system with configurable 7–14 day windows
- Cart with quantity controls and COD checkout
- Customer order tracking
- Admin dashboard — add/edit/delete products and orders, view deletion audit log
- Customer notifications when pre-order items become available
- All data persisted in `localStorage` (no backend required)

## Extending

To add a real backend, replace `save()` / `load()` in `storage.js` with `fetch()` calls to your API. Everything else stays the same.
