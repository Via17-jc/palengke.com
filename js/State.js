// Shared mutable state — all modules read/write these directly.
// storage.js must be loaded before this file.

let products = [];
let orders = [];
let cart = [];
let users = [];
let currentUser = null;
let view = 'shop';
