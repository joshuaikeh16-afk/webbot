// Shared sidebar HTML — injected by each page
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
    { id: 'index',       label: 'Overview',     href: 'index.html' },
    { id: 'leaderboard', label: 'Leaderboard',  href: 'leaderboard.html' },
    { id: 'profile',     label: 'User lookup',  href: 'profile.html' },
    { id: 'guilds',      label: 'Guilds',       href: 'guilds.html' },
    { id: 'games',       label: 'Games',        href: 'games.html' },
    { id: 'staff',       label: 'Staff',        href: 'staff.html' },
  ];

  document.getElementById('sidebar').innerHTML = `
    <div class="sidebar-brand">
      <div class="brand-name">${CONFIG.app.name}</div>
      <div class="brand-tag">${CONFIG.app.tagline}</div>
    </div>
    <nav class="nav-section">
      <div class="nav-label">Menu</div>
      ${pages.map(p => `
        <a href="${p.href}" class="nav-link ${activePage === p.id ? 'active' : ''}">
          ${navIcon[p.id]} ${p.label}
        </a>
      `).join('')}
      <div class="nav-label" style="margin-top:0.75rem;">Admin</div>
      <a href="admin.html" class="nav-link ${activePage === 'admin' ? 'active' : ''}" style="${activePage !== 'admin' ? 'color:var(--danger);opacity:0.8' : ''}">
        ${navIcon.admin} Admin Panel
      </a>
    </nav>
    <div class="sidebar-footer" style="display:flex;justify-content:space-between;align-items:center;">
      <span>v${CONFIG.app.version}</span>
      <button onclick="Auth.logout()" style="background:none;border:none;color:var(--text-3);font-size:11px;cursor:pointer;padding:0;" onmouseover="this.style.color='var(--text)'" onmouseout="this.style.color='var(--text-3)'">Sign out</button>
    </div>
  `;
}