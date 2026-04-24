const API_URL = "https://bfhl-hierarchy-api.vercel.app/";

const edgeInput = document.getElementById('edge-input');
const submitBtn = document.getElementById('submit-btn');
const clearBtn = document.getElementById('clear-btn');
const errorBanner = document.getElementById('error-banner');
const resultsSection = document.getElementById('results-section');
const statTrees = document.getElementById('stat-trees');
const statCycles = document.getElementById('stat-cycles');
const statLargest = document.getElementById('stat-largest');
const hierarchiesGrid = document.getElementById('hierarchies-grid');

submitBtn.addEventListener('click', handleSubmit);
edgeInput.addEventListener('keydown', e => {
  if (e.ctrlKey && e.key === 'Enter') handleSubmit();
});
clearBtn.addEventListener('click', () => {
  edgeInput.value = '';
  hideError();
  hideResults();
  edgeInput.focus();
});

async function handleSubmit() {
  const raw = edgeInput.value.trim();
  if (!raw) {
    showError('Please enter at least one edge (e.g. A->B)');
    return;
  }
  const data = parseInput(raw);
  if (data === null) {
    showError('Could not parse input. Use one edge per line, comma-separated, or a JSON array like ["A->B","B->C"]');
    return;
  }
  setLoading(true);
  hideError();
  hideResults();
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Server responded with ${res.status}`);
    }
    const json = await res.json();
    renderResults(json);
  } catch (err) {
    showError(`Request failed: ${err.message}. Make sure the backend is running on port 3000.`);
  } finally {
    setLoading(false);
  }
}

function parseInput(raw) {
  if (raw.startsWith('[')) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.map(s => String(s));
    } catch (_) { }
    return null;
  }
  if (raw.includes(',') && !raw.includes('\n')) {
    return raw.split(',').map(s => s.trim()).filter(Boolean);
  }
  return raw.split('\n').map(s => s.trim()).filter(Boolean);
}

function renderResults(data) {
  const { hierarchies = [], summary = {} } = data;
  statTrees.textContent = summary.total_trees ?? 0;
  statCycles.textContent = summary.total_cycles ?? 0;
  statLargest.textContent = summary.largest_tree_root ?? '—';
  hierarchiesGrid.innerHTML = '';
  if (hierarchies.length === 0) {
    hierarchiesGrid.innerHTML = `<p style="color:var(--text-muted);font-size:0.88rem;padding:8px 0;">No hierarchies found. Check your input for valid edges.</p>`;
  } else {
    hierarchies.forEach(h => hierarchiesGrid.appendChild(buildHierarchyCard(h)));
  }
  showResults();
}

function buildHierarchyCard(h) {
  const card = document.createElement('div');
  card.className = `h-card ${h.has_cycle ? 'is-cycle' : 'is-tree'}`;
  const typeBadge = h.has_cycle
    ? `<span class="type-badge cycle">⟳ Cycle</span>`
    : `<span class="type-badge tree">✓ Tree</span>`;
  card.innerHTML = `
    <div class="h-card-header">
      <div class="root-pill">
        <div class="root-dot">${h.root}</div>
        <div>
          <div class="root-info-label">Root</div>
          <div class="root-info-name">${h.root}</div>
        </div>
      </div>
      ${typeBadge}
    </div>
    ${!h.has_cycle ? `<div class="depth-info">Depth: ${h.depth}</div>` : ''}
    <div class="tree-body"></div>
  `;
  const treeBody = card.querySelector('.tree-body');
  if (h.has_cycle) {
    treeBody.innerHTML = `<div class="cycle-msg">⟳ Circular dependency — no tree structure available</div>`;
  } else {
    treeBody.appendChild(buildTreeList(h.root, h.tree));
  }
  return card;
}

function buildTreeList(name, subtree) {
  const ul = document.createElement('ul');
  ul.className = 'tree-ul';
  const li = document.createElement('li');
  li.className = 'tree-li';
  const children = Object.keys(subtree).sort();
  const isLeaf = children.length === 0;
  const node = document.createElement('div');
  node.className = 'tree-node';
  node.innerHTML = `
    <span class="node-char ${isLeaf ? 'leaf' : ''}">${name}</span>
    <span class="node-label">${name}${isLeaf ? ' <span class="leaf-tag">(leaf)</span>' : ''}</span>
  `;
  li.appendChild(node);
  children.forEach(child => li.appendChild(buildTreeList(child, subtree[child])));
  ul.appendChild(li);
  return ul;
}

function setLoading(on) {
  submitBtn.disabled = on;
  submitBtn.textContent = on ? 'Processing…' : '⚡ Process';
}
function showError(msg) {
  errorBanner.textContent = `⚠ ${msg}`;
  errorBanner.style.display = 'block';
}
function hideError() {
  errorBanner.style.display = 'none';
}
function showResults() {
  resultsSection.style.display = 'flex';
  resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function hideResults() {
  resultsSection.style.display = 'none';
}
