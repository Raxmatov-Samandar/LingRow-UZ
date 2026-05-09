/* Shared sidebar + cosmos background renderer */

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', href: 'index.html', icon: 'home' },
  { key: 'lesson',    label: 'Lesson',    href: 'lesson.html', icon: 'play' },
  { key: 'reading',   label: 'Reading',   href: 'reading.html', icon: 'book' },
  { key: 'speaking',  label: 'Speaking',  href: 'speaking.html', icon: 'mic' },
  { key: 'writing',   label: 'Writing',   href: 'writing.html', icon: 'pen' },
  { key: 'stats',     label: 'Stats',     href: 'stats.html', icon: 'chart' },
];

const ICONS = {
  home: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/>',
  play: '<circle cx="12" cy="12" r="9"/><path d="M10 8.5v7l6-3.5z" fill="currentColor"/>',
  book: '<path d="M4 5a2 2 0 012-2h12v16H6a2 2 0 00-2 2V5z"/><path d="M4 19a2 2 0 002 2h12"/>',
  mic:  '<rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0014 0"/><path d="M12 18v3"/>',
  pen:  '<path d="M14 4l6 6-12 12H2v-6L14 4z"/><path d="M14 4l3-3 6 6-3 3"/>',
  chart:'<path d="M3 21h18"/><path d="M6 17V9"/><path d="M11 17V5"/><path d="M16 17v-7"/><path d="M21 17v-3"/>',
  apps: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  bell: '<path d="M6 8a6 6 0 1112 0c0 7 3 8 3 8H3s3-1 3-8z"/><path d="M10 21a2 2 0 004 0"/>',
  search:'<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
  logout:'<path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/>',
  cog:  '<path d="M12 15a3 3 0 100-6 3 3 0 000 6z"/><path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z"/>',
};

function svg(iconKey, w=20) {
  return `<svg viewBox="0 0 24 24" width="${w}" height="${w}" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${ICONS[iconKey]}</svg>`;
}

function renderSidebar(activeKey = 'dashboard') {
  const items = NAV_ITEMS.map(it => `
    <a href="${it.href}" class="nav-item ${it.key === activeKey ? 'active' : ''}">
      <span class="nav-icon">${svg(it.icon)}</span>
      <span>${it.label}</span>
      ${it.key === activeKey ? '<span class="active-spark"></span>' : ''}
    </a>
  `).join('');

  return `
    <aside class="sidebar glass">
      <div class="brand">
        <div class="brand-logo" aria-label="LingRow"></div>
        <h1 class="brand-name">LingRow</h1>
      </div>

      <nav class="nav-primary">${items}</nav>

      <div class="nav-divider"></div>

      <nav class="nav-secondary">
        <a href="#" class="nav-item">
          <span class="nav-icon">${svg('cog')}</span>
          <span>Settings</span>
        </a>
      </nav>

      <div class="sidebar-bottom">
        <a href="#" class="nav-item">
          <span class="nav-icon">${svg('logout')}</span>
          <span>Logout</span>
        </a>
      </div>
    </aside>
  `;
}

function renderCosmos() {
  return `
    <div class="cosmos">
      <div class="nebula nebula-purple"></div>
      <div class="nebula nebula-blue"></div>
      <div class="nebula nebula-teal"></div>
      <div class="stars" id="stars"></div>
      <div class="shooting-star"></div>
    </div>
  `;
}

function spawnStars(count = 320) {
  const layer = document.getElementById('stars');
  if (!layer) return;
  let html = '';
  for (let i = 0; i < count; i++) {
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    const size = Math.random() * 1.6 + 0.4;
    const delay = Math.random() * 6;
    const dur = 2.5 + Math.random() * 5;
    const opacity = 0.4 + Math.random() * 0.6;
    html += `<i style="left:${x}%;top:${y}%;width:${size}px;height:${size}px;animation-delay:${delay}s;animation-duration:${dur}s;opacity:${opacity}"></i>`;
  }
  layer.innerHTML = html;
}

/* Auto-mount: pages can include placeholder elements */
document.addEventListener('DOMContentLoaded', () => {
  const cosmosMount = document.getElementById('cosmos-mount');
  if (cosmosMount) cosmosMount.outerHTML = renderCosmos();

  const sbMount = document.getElementById('sidebar-mount');
  if (sbMount) {
    const active = sbMount.dataset.active || 'dashboard';
    sbMount.outerHTML = renderSidebar(active);
  }

  spawnStars();
});
