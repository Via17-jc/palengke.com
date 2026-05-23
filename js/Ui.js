// ── DOM helpers ──────────────────────────────────────────────────────────────

function $(sel) { return document.querySelector(sel); }
function $all(sel) { return Array.from(document.querySelectorAll(sel)); }
function formatPeso(n) {
  return '₱' + Number(n).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function uid() { return Date.now().toString().slice(-8); }
function icons() { if (window.lucide) lucide.createIcons(); }

// ── Image upload preview ──────────────────────────────────────────────────────

function uploadImagePreview(fileInputId, previewImgId) {
  const fi = document.getElementById(fileInputId);
  const img = document.getElementById(previewImgId);
  if (!fi || !fi.files || fi.files.length === 0) return;
  const f = fi.files[0];
  const reader = new FileReader();
  reader.onload = function(e) {
    img.src = e.target.result;
    img.dataset.uploaded = '1';
  };
  reader.readAsDataURL(f);
}

// ── Modal ─────────────────────────────────────────────────────────────────────

function showModal(titleHtml, contentHtml, actionsHtml = '') {
  const overlay = $('#modal-overlay');
  const modal = $('#modal');
  modal.innerHTML = `
    <div class="p-5">
      <div class="flex items-start justify-between gap-4">
        <div class="flex-1">
          <h3 class="text-xl font-bold text-gray-800">${titleHtml}</h3>
        </div>
        <div>
          <button onclick="hideModal()" class="text-gray-500 hover:text-gray-700">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>
      </div>
      <div class="mt-4 text-gray-700">${contentHtml}</div>
    </div>
    <div class="bg-gray-50 p-4 flex justify-end gap-3">
      ${actionsHtml}
    </div>
  `;
  overlay.classList.remove('hidden');
  overlay.style.display = 'flex';
  icons();
}

function hideModal() {
  $('#modal-overlay').classList.add('hidden');
  $('#modal-overlay').style.display = 'none';
}

// ── How It Works ──────────────────────────────────────────────────────────────

function toggleHowItWorks() {
  showModal('How Palengke.com Works', `
    <ol class="list-decimal pl-5 text-gray-700">
      <li>Browse fresh products from local farmers &amp; fisherfolk.</li>
      <li>Add items to cart and proceed to checkout (COD).</li>
      <li>LGU Admin manages product listings and order statuses.</li>
    </ol>
  `, `<button onclick="hideModal()" class="px-4 py-2 bg-gray-100 rounded">Close</button>`);
}
