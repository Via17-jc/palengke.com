const APP_KEY = 'palengke_cainta_v4';

function save(k, v) {
  localStorage.setItem(APP_KEY + '_' + k, JSON.stringify(v));
}

function load(k, fallback) {
  try {
    const d = localStorage.getItem(APP_KEY + '_' + k);
    return d ? JSON.parse(d) : fallback;
  } catch(e) {
    return fallback;
  }
}
