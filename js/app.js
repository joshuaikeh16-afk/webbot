const App = (() => {
  function parseUser(raw) {
    if (!raw) return null;
    const d = typeof raw.data === 'string' ? JSON.parse(raw.data) : (raw.data || {});
    return {
      id:          raw.id,
      name:        d.name || d.username || 'Unknown',
      phone:       d.phoneNumber || '',
      coins:       Number(d.primos || d.coins || d.balance || 0),
      bank:        Number(d.bank || 0),
      netWorth:    Number(d.primos || d.coins || d.balance || 0) + Number(d.bank || 0),
      primePoints: Number(d.primePoints || 0),
      ppHistory:   Array.isArray(d.ppHistory) ? d.ppHistory : [],
      cards:       Array.isArray(d.cards) ? d.cards : [],
      souvenirs:   Array.isArray(d.souvenirs) ? d.souvenirs : [],
      guild:       d.guild || null,
      role:        d.role || null,
      rank:        d.rank || null,
      avatar:      d.avatar || null,
      bio:         d.bio || null,
      joinedAt:    d.registeredAt || d.joinedAt || raw.created_at || null,
      updatedAt:   raw.updated_at || null,
      // Store raw data for update operations
      _raw:        d,
      _rowId:      raw.id,
    };
  }
 const sidebar = document.querySelector(".sidebar");
const overlay = document.querySelector(".sidebar-overlay");
const menuBtn = document.querySelector(".topbar-hamburger");

menuBtn.addEventListener("click", () => {
    sidebar.classList.toggle("open");
    overlay.classList.toggle("open");
});

overlay.addEventListener("click", () => {
    sidebar.classList.remove("open");
    overlay.classList.remove("open");
});
  function parseUsers(rows) {
    if (!rows) return [];
    return rows.map(parseUser).filter(Boolean);
  }
 
  function formatCoins(n) {
    n = Number(n) || 0;
    if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(2) + 'B';
    if (n >= 1_000_000)     return (n / 1_000_000).toFixed(2) + 'M';
    if (n >= 1_000)         return (n / 1_000).toFixed(1) + 'K';
    return n.toLocaleString();
  }
 
  function initials(name) {
    return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  }
 
  function avatarColor(name) {
    const colors = ['#7F77DD', '#1D9E75', '#D85A30', '#D4537E', '#378ADD', '#639922', '#BA7517'];
    let hash = 0;
    for (let c of name) hash = (hash * 31 + c.charCodeAt(0)) & 0xffffffff;
    return colors[Math.abs(hash) % colors.length];
  }
 
  function timeAgo(ts) {
    if (!ts) return '—';
    const date = typeof ts === 'number' ? new Date(ts) : new Date(ts);
    if (isNaN(date)) return '—';
    const diff = (Date.now() - date.getTime()) / 1000;
    if (diff < 60)    return 'just now';
    if (diff < 3600)  return Math.floor(diff / 60) + 'm ago';
    if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
    if (diff < 604800) return Math.floor(diff / 86400) + 'd ago';
    return date.toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' });
  }
 
  function renderAvatar(user, size = 40) {
    if (user.avatar) {
      return `<img src="${user.avatar}" width="${size}" height="${size}" style="border-radius:50%;object-fit:cover;" alt="${user.name}">`;
    }
    const bg = avatarColor(user.name);
    return `<div class="avatar" style="width:${size}px;height:${size}px;background:${bg};font-size:${Math.round(size * 0.35)}px;">${initials(user.name)}</div>`;
  }
 
  function setLoading(el, state) {
    if (!el) return;
    el.classList.toggle('loading', state);
  }
 
  function showToast(msg, type = 'info') {
    const t = document.createElement('div');
    t.className = `toast toast-${type}`;
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.classList.add('show'), 10);
    setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 3500);
  }
 
  function setActive(selector) {
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    const el = document.querySelector(selector);
    if (el) el.classList.add('active');
  }
 
  // Role badge renderer
  function roleBadge(role) {
    if (!role) return '';
    const map = {
      admin: { color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', label: '👑 Admin' },
      mod:   { color: '#60a5fa', bg: 'rgba(96,165,250,0.15)', label: '🛡 Mod' },
      vip:   { color: '#a78bfa', bg: 'rgba(167,139,250,0.15)', label: '⭐ VIP' },
    };
    const r = map[role.toLowerCase()] || { color: 'var(--text-2)', bg: 'var(--bg-3)', label: role };
    return `<span class="role-badge" style="background:${r.bg};color:${r.color};">${r.label}</span>`;
  }
 
  // PP history summary
  function ppStats(history) {
    if (!history || !history.length) return { wins: 0, losses: 0, games: 0, totalEarned: 0, totalSpent: 0 };
    const gameEntries = history.filter(h => !['ADMIN_GRANT','ADMIN_DEDUCT','CASHOUT'].includes(h.label));
    const wins    = gameEntries.filter(h => h.pts > 0).length;
    const losses  = gameEntries.filter(h => h.pts < 0).length;
    const earned  = history.filter(h => h.pts > 0).reduce((a, h) => a + h.pts, 0);
    const spent   = Math.abs(history.filter(h => h.pts < 0).reduce((a, h) => a + h.pts, 0));
    return { wins, losses, games: gameEntries.length, totalEarned: earned, totalSpent: spent };
  }
 
  return {
    parseUser,
    parseUsers,
    formatCoins,
    initials,
    avatarColor,
    renderAvatar,
    setLoading,
    showToast,
    setActive,
    timeAgo,
    roleBadge,
    ppStats,
  };
})();
 
// ── Sidebar (shared across all pages) ────────────────────────────────────
function renderSidebar(activePage) {
  const navIcon = {
    index:       `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>`,
    leaderboard: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
    profile:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>`,
    guilds:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
    games:       `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="6" width="20" height="12" rx="3"/><path d="M8 12h2m-1-1v2"/><circle cx="15" cy="11" r="0.8" fill="currentColor"/><circle cx="17" cy="13" r="0.8" fill="currentColor"/></svg>`,
    staff:       `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
    admin:       `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93A10 10 0 1 0 4.93 19.07 10 10 0 0 0 19.07 4.93Z"/></svg>`,
  };
 
  const pages = [
    { id: 'index',       label: 'Overview',    href: 'index.html' },
    { id: 'leaderboard', label: 'Leaderboard', href: 'leaderboard.html' },
    { id: 'profile',     label: 'User Lookup', href: 'profile.html' },
    { id: 'guilds',      label: 'Guilds',      href: 'guilds.html' },
    { id: 'games',       label: 'Games',       href: 'games.html' },
    { id: 'staff',       label: 'Staff',       href: 'staff.html' },
  ];
 
  const el = document.getElementById('sidebar');
  if (!el) return;
 
  const isLoggedIn = typeof Auth !== 'undefined' && Auth.isLoggedIn();
  const adminLink = isLoggedIn ? `
    <div class="nav-label" style="margin-top:0.75rem;">Admin</div>
    <a href="admin.html" class="nav-link ${activePage === 'admin' ? 'active' : ''}" style="${activePage !== 'admin' ? 'color:var(--danger);opacity:0.85' : ''}">
      ${navIcon.admin} Admin Panel
    </a>
  ` : '';
 
  const footerRight = isLoggedIn
    ? `<button onclick="Auth.logout()" style="background:none;border:none;color:var(--text-3);font-size:11px;cursor:pointer;padding:0;" onmouseover="this.style.color='var(--text)'" onmouseout="this.style.color='var(--text-3)'">Sign out</button>`
    : '';
 
  el.innerHTML = `
    <div class="sidebar-brand">
      <div class="brand-icon">🎴</div>
      <div>
        <div class="brand-name">${CONFIG.app.name}</div>
        <div class="brand-tag">${CONFIG.app.tagline}</div>
      </div>
    </div>
    <nav class="nav-section">
      <div class="nav-label">Menu</div>
      ${pages.map(p => `
        <a href="${p.href}" class="nav-link ${activePage === p.id ? 'active' : ''}">
          ${navIcon[p.id]} ${p.label}
        </a>
      `).join('')}
      ${adminLink}
    </nav>
    <div class="sidebar-footer">
      <span>v${CONFIG.app.version}</span>
      ${footerRight}
    </div>
  `;
}
 
// ── Global profile modal (used on index/leaderboard) ─────────────────────
async function openProfileModal(phoneOrId) {
  const overlay = document.getElementById('modal');
  const content = document.getElementById('modal-content');
  if (!overlay || !content) return;
 
  overlay.style.display = 'flex';
  content.innerHTML = `<div class="loader"><div class="spinner"></div> Loading profile...</div>`;
 
  let raw;
  if (phoneOrId && /^\d+$/.test(phoneOrId.replace(/\s+/g, ''))) {
    raw = await API.getUserByPhone(phoneOrId);
  } else {
    raw = await API.getUserById(phoneOrId);
  }
 
  const user = App.parseUser(raw?.[0]);
  if (!user) {
    content.innerHTML = `<div class="empty"><div class="empty-icon">🔍</div><div class="empty-text">Profile not found</div></div>`;
    return;
  }
 
  content.innerHTML = buildProfileHTML(user);
 
  overlay.onclick = e => { if (e.target === overlay) closeModal(); };
}
 
function closeModal() {
  const overlay = document.getElementById('modal');
  if (overlay) overlay.style.display = 'none';
}
 
function buildProfileHTML(u) {
  const stats = App.ppStats(u.ppHistory);
  const winRate = stats.games > 0 ? Math.round((stats.wins / stats.games) * 100) : 0;
 
  const cardItems = u.cards.length
    ? u.cards.map(c => `<div class="inv-item"><span>🃏</span><span>${c.name || c}</span></div>`).join('')
    : `<div class="inv-empty">No cards</div>`;
 
  const souvItems = u.souvenirs.length
    ? u.souvenirs.map(s => `<div class="inv-item"><span>🎁</span><span>${s.name || s}</span></div>`).join('')
    : `<div class="inv-empty">No souvenirs</div>`;
 
  const recentPP = u.ppHistory.slice(-5).reverse().map(h => `
    <div class="pp-entry ${h.pts > 0 ? 'pp-gain' : 'pp-loss'}">
      <span>${h.label || 'Game'}</span>
      <span>${h.pts > 0 ? '+' : ''}${h.pts} ◈</span>
    </div>
  `).join('') || '<div class="inv-empty">No activity yet</div>';
 
  return `
    <div class="modal-close" onclick="closeModal()">✕</div>
 
    <div class="modal-hero">
      ${App.renderAvatar(u, 64)}
      <div class="modal-hero-info">
        <div class="modal-hero-name">${u.name}</div>
        <div class="modal-hero-meta">
          ${u.phone || u.id}
          ${u.role ? App.roleBadge(u.role) : ''}
        </div>
        ${u.guild ? `<div class="modal-guild">⚔️ ${u.guild}</div>` : ''}
        ${u.bio ? `<div class="modal-bio">${u.bio}</div>` : ''}
      </div>
    </div>
 
    <div class="modal-stats-row">
      <div class="mstat">
        <div class="mstat-val gold">${App.formatCoins(u.netWorth)}</div>
        <div class="mstat-label">Net Worth</div>
      </div>
      <div class="mstat">
        <div class="mstat-val purple">◈ ${u.primePoints.toLocaleString()}</div>
        <div class="mstat-label">Prime Points</div>
      </div>
      <div class="mstat">
        <div class="mstat-val">${u.cards.length}</div>
        <div class="mstat-label">Cards</div>
      </div>
      <div class="mstat">
        <div class="mstat-val green">${winRate}%</div>
        <div class="mstat-label">Win Rate</div>
      </div>
    </div>
 
    <div class="modal-two-col">
      <div>
        <div class="modal-section-title">💰 Balance</div>
        <div class="balance-row"><span>Wallet</span><strong>${App.formatCoins(u.coins)}</strong></div>
        <div class="balance-row"><span>Bank</span><strong>${App.formatCoins(u.bank)}</strong></div>
        <div class="balance-row total"><span>Net Worth</span><strong class="gold">${App.formatCoins(u.netWorth)}</strong></div>
 
        <div class="modal-section-title" style="margin-top:1rem;">◈ Prime Points</div>
        <div class="balance-row"><span>Balance</span><strong class="purple">◈ ${u.primePoints.toLocaleString()}</strong></div>
        <div class="balance-row"><span>Total Earned</span><strong>◈ ${stats.totalEarned.toLocaleString()}</strong></div>
        <div class="balance-row"><span>Games Played</span><strong>${stats.games}</strong></div>
        <div class="balance-row"><span>Record</span><strong>${stats.wins}W / ${stats.losses}L</strong></div>
      </div>
      <div>
        <div class="modal-section-title">📋 Recent PP Activity</div>
        <div class="pp-history">${recentPP}</div>
      </div>
    </div>
 
    <div class="modal-inv-row">
      <div>
        <div class="modal-section-title">🃏 Cards (${u.cards.length})</div>
        <div class="inv-grid">${cardItems}</div>
      </div>
      <div>
        <div class="modal-section-title">🎁 Souvenirs (${u.souvenirs.length})</div>
        <div class="inv-grid">${souvItems}</div>
      </div>
    </div>
 
    ${u.joinedAt ? `<div class="modal-footer-meta">Joined ${App.timeAgo(u.joinedAt)}</div>` : ''}
  `;
}
 
// Legacy alias
const openProfile = openProfileModal;
 
