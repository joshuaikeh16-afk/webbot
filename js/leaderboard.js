document.addEventListener('DOMContentLoaded', () => {
  renderSidebar('leaderboard');
  loadLeaderboard();
  loadPPLeaderboard();
});
 
async function loadLeaderboard() {
  const tbody   = document.getElementById('lb-body');
  const countEl = document.getElementById('lb-count');
 
  tbody.innerHTML = `<tr><td colspan="5"><div class="loader"><div class="spinner"></div> Loading...</div></td></tr>`;
 
  try {
    const raw   = await API.getLeaderboard(50);
    const users = App.parseUsers(raw);
 
    if (!users || !users.length) {
      tbody.innerHTML = `<tr><td colspan="5"><div class="empty"><div class="empty-icon">🎴</div><div class="empty-text">No players yet</div></div></td></tr>`;
      return;
    }
 
    if (countEl) countEl.textContent = users.length;
 
    const medals = { 1: '🥇', 2: '🥈', 3: '🥉' };
    users.sort((a, b) => b.netWorth - a.netWorth);
 
    tbody.innerHTML = users.map((user, i) => {
      const rank      = i + 1;
      const rankClass = rank <= 3 ? `top${rank}` : '';
      const medal     = medals[rank] || '';
      const phone     = user.phone || user.id || 'N/A';
 
      return `
        <tr onclick="openProfileModal('${phone}')" style="cursor:pointer">
          <td><span class="rank-num ${rankClass}">${medal || rank}</span></td>
          <td>
            <div class="user-cell">
              ${App.renderAvatar(user, 34)}
              <div class="user-cell-info">
                <div class="user-cell-name">${user.name}${user.role ? App.roleBadge(user.role) : ''}</div>
                <div class="user-cell-phone">${phone}${user.guild ? ` · ⚔️ ${user.guild}` : ''}</div>
              </div>
            </div>
          </td>
          <td style="font-family:var(--font-display);font-weight:600;color:var(--gold)">${App.formatCoins(user.netWorth)}</td>
          <td><span class="badge badge-purple">${user.cards.length} cards</span></td>
          <td><span class="badge badge-pp">${user.primePoints > 0 ? '◈ ' + user.primePoints.toLocaleString() : '—'}</span></td>
        </tr>
      `;
    }).join('');
 
  } catch (error) {
    console.error('Leaderboard Render Error:', error);
    tbody.innerHTML = `<tr><td colspan="5"><div class="empty"><div class="empty-icon">❌</div><div class="empty-text">Failed to load leaderboard</div></div></td></tr>`;
  }
}
 
async function loadPPLeaderboard() {
  const el = document.getElementById('pp-lb-body');
  if (!el) return;
 
  el.innerHTML = `<tr><td colspan="4"><div class="loader"><div class="spinner"></div> Loading...</div></td></tr>`;
 
  try {
    const raw   = await API.getPPLeaderboard(50);
    const users = App.parseUsers(raw).filter(u => u.primePoints > 0);
 
    const countEl = document.getElementById('pp-lb-count');
    if (countEl) countEl.textContent = users.length;
 
    if (!users.length) {
      el.innerHTML = `<tr><td colspan="4"><div class="empty"><div class="empty-icon">◈</div><div class="empty-text">No Prime Points earned yet — win games to appear here!</div></div></td></tr>`;
      return;
    }
 
    const medals = { 1: '🥇', 2: '🥈', 3: '🥉' };
    el.innerHTML = users.map((user, i) => {
      const rank      = i + 1;
      const rankClass = rank <= 3 ? `top${rank}` : '';
      const medal     = medals[rank] || '';
      const stats     = App.ppStats(user.ppHistory);
      const winRate   = stats.games > 0 ? Math.round((stats.wins / stats.games) * 100) : 0;
 
      return `
        <tr onclick="openProfileModal('${user.phone}')" style="cursor:pointer">
          <td><span class="rank-num ${rankClass}">${medal || rank}</span></td>
          <td>
            <div class="user-cell">
              ${App.renderAvatar(user, 34)}
              <div class="user-cell-info">
                <div class="user-cell-name">${user.name}</div>
                <div class="user-cell-phone">${user.phone} · ${stats.wins}W / ${stats.games}G (${winRate}%)</div>
              </div>
            </div>
          </td>
          <td style="font-family:var(--font-display);font-weight:700;color:#a78bfa">◈ ${user.primePoints.toLocaleString()}</td>
          <td><span class="badge badge-green">${winRate}% WR</span></td>
        </tr>
      `;
    }).join('');
 
  } catch (error) {
    console.error('PP Leaderboard Error:', error);
    el.innerHTML = `<tr><td colspan="4"><div class="empty"><div class="empty-icon">❌</div><div class="empty-text">Failed to load</div></div></td></tr>`;
  }
}
 